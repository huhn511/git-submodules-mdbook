package state

import (
	"fmt"
	"io"

	"github.com/iotaledger/goshimmer/packages/ledgerstate"
	"github.com/iotaledger/wasp/packages/coretypes"
	"github.com/iotaledger/wasp/packages/kv/buffered"
	"github.com/iotaledger/wasp/packages/util"
)

type stateUpdate struct {
	requestID coretypes.RequestID
	timestamp int64
	mutations *buffered.Mutations
}

func NewStateUpdate(reqid coretypes.RequestID) StateUpdate {
	return &stateUpdate{
		requestID: reqid,
		mutations: buffered.NewMutations(),
	}
}

func NewStateUpdateRead(r io.Reader) (StateUpdate, error) {
	ret := NewStateUpdate(coretypes.RequestID{}).(*stateUpdate)
	return ret, ret.Read(r)
}

// StateUpdate

func (su *stateUpdate) Clone() StateUpdate {
	ret := *su
	ret.mutations = su.mutations.Clone()
	return &ret
}

func (su *stateUpdate) String() string {
	ret := fmt.Sprintf("reqid: %s, ts: %d, muts: [%s]", su.requestID.String(), su.Timestamp(), su.mutations)
	return ret
}

func (su *stateUpdate) Timestamp() int64 {
	return su.timestamp
}

func (su *stateUpdate) WithTimestamp(ts int64) StateUpdate {
	su.timestamp = ts
	return su
}

func (su *stateUpdate) RequestID() coretypes.RequestID {
	return su.requestID
}

func (su *stateUpdate) Mutations() *buffered.Mutations {
	return su.mutations
}

func (su *stateUpdate) Write(w io.Writer) error {
	if _, err := w.Write(su.requestID[:]); err != nil {
		return err
	}
	if err := su.mutations.Write(w); err != nil {
		return err
	}
	return util.WriteUint64(w, uint64(su.timestamp))
}

func (su *stateUpdate) Read(r io.Reader) error {
	if n, err := r.Read(su.requestID[:]); err != nil || n != ledgerstate.OutputIDLength {
		return err
	}
	if err := su.mutations.Read(r); err != nil {
		return err
	}
	var ts uint64
	if err := util.ReadUint64(r, &ts); err != nil {
		return err
	}
	su.timestamp = int64(ts)
	return nil
}
