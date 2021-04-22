package statemgr

import (
	"bytes"
	"github.com/iotaledger/goshimmer/packages/ledgerstate"
	"github.com/iotaledger/wasp/packages/coretypes"
	"time"

	"github.com/iotaledger/wasp/packages/chain"
	"github.com/iotaledger/wasp/packages/hashing"
	"github.com/iotaledger/wasp/packages/state"
	"github.com/iotaledger/wasp/packages/util"
)

func (sm *stateManager) isSynced() bool {
	if sm.stateOutput == nil || sm.solidState == nil {
		return false
	}
	return bytes.Equal(sm.solidState.Hash().Bytes(), sm.stateOutput.GetStateData())
}

// returns block if it is known and flag if it is approved by some output
func (sm *stateManager) syncBlock(blockIndex uint32) (state.Block, bool) {
	if _, already := sm.syncingBlocks[blockIndex]; !already {
		sm.log.Debugf("start syncing block $%d", blockIndex)
		sm.syncingBlocks[blockIndex] = &syncingBlock{}
	}
	blk := sm.syncingBlocks[blockIndex]
	if blk.approved {
		return blk.block, true
	}
	if blk.block != nil {
		if time.Now().After(blk.pullDeadline) {
			// approval didnt come in time, probably does not exist (prunned)
			return blk.block, false
		}
		// will wait for some time more for the approval
		return nil, false
	}
	// blk.block == nil
	if time.Now().Before(blk.pullDeadline) {
		// still waiting
		return nil, false
	}
	// have to pull
	data := util.MustBytes(&chain.GetBlockMsg{
		BlockIndex: blockIndex,
	})
	// send messages until first without error
	// TODO optimize
	sm.peers.SendToAllUntilFirstError(chain.MsgGetBlock, data)
	blk.pullDeadline = time.Now().Add(periodBetweenSyncMessages)
	return nil, false
}

func (sm *stateManager) blockArrived(block state.Block) {
	syncBlk, ok := sm.syncingBlocks[block.StateIndex()]
	if !ok {
		// not asked
		return
	}
	if syncBlk.block != nil {
		// already have block. Check consistency. If inconsistent, start from scratch
		if syncBlk.block.ApprovingOutputID() != block.ApprovingOutputID() {
			sm.log.Errorf("conflicting block arrived. Block index: %d, present approving outputID: %s, arrived approving outputID: %s",
				block.StateIndex(), coretypes.OID(syncBlk.block.ApprovingOutputID()), coretypes.OID(block.ApprovingOutputID()))
			syncBlk.block = nil
			return
		}
		if syncBlk.block.EssenceHash() != block.EssenceHash() {
			sm.log.Errorf("conflicting block arrived. Block index: %d, present state hash: %s, arrived state hash: %s",
				block.StateIndex(), syncBlk.block.EssenceHash().String(), block.EssenceHash().String())
			syncBlk.block = nil
			return
		}
		return
	}
	// new block
	// ask for approving output
	sm.nodeConn.PullConfirmedOutput(sm.chain.ID().AsAddress(), block.ApprovingOutputID())
	syncBlk.block = block
	syncBlk.pullDeadline = time.Now().Add(periodBetweenSyncMessages * 2)
}

func (sm *stateManager) chainOutputArrived(chainOutput *ledgerstate.AliasOutput) {
	syncBlk, ok := sm.syncingBlocks[chainOutput.GetStateIndex()]
	if !ok {
		// not interested
		return
	}
	if syncBlk.block == nil || syncBlk.approved {
		// no need yet or too late
		return
	}
	if syncBlk.block.IsApprovedBy(chainOutput) {
		finalHash, err := hashing.HashValueFromBytes(chainOutput.GetStateData())
		if err != nil {
			return
		}
		syncBlk.finalHash = finalHash
		syncBlk.approvingOutputID = chainOutput.ID()
		syncBlk.approved = true
	}
}

func (sm *stateManager) doSyncActionIfNeeded() {
	if sm.stateOutput == nil {
		return
	}
	currentIndex := uint32(0)
	if sm.solidState != nil {
		currentIndex = sm.solidState.BlockIndex()
	}
	switch {
	case currentIndex == sm.stateOutput.GetStateIndex():
		// synced
		return
	case currentIndex > sm.stateOutput.GetStateIndex():
		sm.log.Panicf("inconsistency: solid state index is larger than state output index")
	}
	// not synced
	if currentIndex+1 >= sm.stateOutput.GetStateIndex() {
		return
	}
	for i := currentIndex + 1; i < sm.stateOutput.GetStateIndex(); i++ {
		block, approved := sm.syncBlock(i)
		if block == nil {
			// some block are still unknown. Can't sync
			return
		}
		if approved {
			blocks := make([]state.Block, 0)
			for j := currentIndex + 1; j <= i; j++ {
				b, _ := sm.syncBlock(j)
				blocks = append(blocks, b)
			}
			sm.mustCommitSynced(blocks, sm.syncingBlocks[i].finalHash, sm.syncingBlocks[i].approvingOutputID)
			return
		}
	}
	// nothing is approved but all blocks are here
	blocks := make([]state.Block, 0)
	for i := currentIndex + 1; i < sm.stateOutput.GetStateIndex(); i++ {
		blocks = append(blocks, sm.syncingBlocks[i].block)
	}
	finalHash, err := hashing.HashValueFromBytes(sm.stateOutput.GetStateData())
	if err != nil {
		return
	}
	sm.mustCommitSynced(blocks, finalHash, sm.stateOutput.ID())
}

// assumes all synced already
func (sm *stateManager) mustCommitSynced(blocks []state.Block, finalHash hashing.HashValue, outputID ledgerstate.OutputID) {
	if len(blocks) == 0 {
		// shouldn't be here
		sm.log.Panicf("len(blocks) == 0")
	}
	var tentativeState state.VirtualState
	if sm.solidState != nil {
		tentativeState = sm.solidState.Clone()
	} else {
		tentativeState = state.NewZeroVirtualState(sm.dbp.GetPartition(sm.chain.ID()))
	}
	for _, block := range blocks {
		if err := tentativeState.ApplyBlock(block); err != nil {
			sm.log.Errorf("failed to apply synced block index #%d. Error: %v", block.StateIndex(), err)
			return
		}
	}
	// state hashes must be equal
	tentativeHash := tentativeState.Hash()
	if tentativeHash != finalHash {
		sm.log.Errorf("state hashes mismatch: expected final hash: %s, tentative hash: %s", finalHash, tentativeHash)
		return
	}
	// again applying blocks, this time seriously
	if sm.solidState == nil {
		sm.solidState = state.NewZeroVirtualState(sm.dbp.GetPartition(sm.chain.ID()))
	}
	stateIndex := uint32(0)
	for _, block := range blocks {
		stateIndex = block.StateIndex()
		if err := sm.solidState.CommitToDb(block); err != nil {
			sm.log.Errorf("failed to commit synced changes into DB. Restart syncing")
			sm.syncingBlocks = make(map[uint32]*syncingBlock)
			return
		}
		delete(sm.syncingBlocks, stateIndex)
	}
	go sm.chain.Events().StateSynced().Trigger(outputID, stateIndex)
}
