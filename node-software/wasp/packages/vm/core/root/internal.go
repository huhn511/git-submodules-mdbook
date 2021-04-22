package root

import (
	"fmt"
	"github.com/iotaledger/goshimmer/packages/ledgerstate"
	"github.com/iotaledger/wasp/packages/coretypes"
	"github.com/iotaledger/wasp/packages/kv"
	"github.com/iotaledger/wasp/packages/kv/codec"
	"github.com/iotaledger/wasp/packages/kv/collections"
	"github.com/iotaledger/wasp/packages/kv/dict"
	"github.com/iotaledger/wasp/packages/kv/kvdecoder"
	"github.com/iotaledger/wasp/packages/vm/core/_default"
)

// FindContract is an internal utility function which finds a contract in the KVStore
// It is called from within the 'root' contract as well as VMContext and viewcontext objects
// It is not directly exposed to the sandbox
// If contract is not found by the given hname, the default contract is returned
func FindContract(state kv.KVStoreReader, hname coretypes.Hname) (*ContractRecord, error) {
	contractRegistry := collections.NewMapReadOnly(state, VarContractRegistry)
	retBin := contractRegistry.MustGetAt(hname.Bytes())
	var ret *ContractRecord
	var err error
	if retBin != nil {
		if ret, err = DecodeContractRecord(retBin); err != nil {
			return nil, fmt.Errorf("root: %v", err)
		}
	} else {
		// not founc in registry
		if hname == Interface.Hname() {
			// if not found and it is root, it means it is chain init --> return empty root record
			ret = NewContractRecord(Interface, &coretypes.AgentID{})
		} else {
			// return default contract
			ret = NewContractRecord(_default.Interface, &coretypes.AgentID{})
		}
	}
	return ret, nil
}

// MustGetChainInfo return global variables of the chain
func MustGetChainInfo(state kv.KVStoreReader) ChainInfo {
	d := kvdecoder.New(state)
	ret := ChainInfo{
		ChainID:             *d.MustGetChainID(VarChainID),
		ChainOwnerID:        *d.MustGetAgentID(VarChainOwnerID),
		Description:         d.MustGetString(VarDescription, ""),
		FeeColor:            d.MustGetColor(VarFeeColor, ledgerstate.ColorIOTA),
		DefaultOwnerFee:     d.MustGetInt64(VarDefaultOwnerFee, 0),
		DefaultValidatorFee: d.MustGetInt64(VarDefaultValidatorFee, 0),
	}
	return ret
}

// GetFeeInfo is an internal utility function which returns fee info for the contract
// It is called from within the 'root' contract as well as VMContext and viewcontext objects
// It is not exposed to the sandbox
func GetFeeInfo(state kv.KVStoreReader, hname coretypes.Hname) (ledgerstate.Color, uint64, uint64) {
	//returns nil of contract not found
	rec, err := FindContract(state, hname)
	if err != nil {
		if err != ErrContractNotFound {
			panic(err)
		} else {
			rec = nil
		}
	}
	return GetFeeInfoByContractRecord(state, rec)
}

func GetFeeInfoByContractRecord(state kv.KVStoreReader, rec *ContractRecord) (ledgerstate.Color, uint64, uint64) {
	var ownerFee, validatorFee uint64
	if rec != nil {
		ownerFee = rec.OwnerFee
		validatorFee = rec.ValidatorFee
	}
	feeColor, defaultOwnerFee, defaultValidatorFee, err := GetDefaultFeeInfo(state)
	if err != nil {
		panic(err)
	}
	if ownerFee == 0 {
		ownerFee = defaultOwnerFee
	}
	if validatorFee == 0 {
		validatorFee = defaultValidatorFee
	}
	return feeColor, ownerFee, validatorFee
}

func GetDefaultFeeInfo(state kv.KVStoreReader) (ledgerstate.Color, uint64, uint64, error) {
	feeColor, ok, err := codec.DecodeColor(state.MustGet(VarFeeColor))
	if err != nil {
		panic(err)
	}
	if !ok {
		feeColor = ledgerstate.ColorIOTA
	}
	defaultOwnerFee, _, err := codec.DecodeUint64(state.MustGet(VarDefaultOwnerFee))
	if err != nil {
		return ledgerstate.Color{}, 0, 0, err
	}
	defaultValidatorFee, _, err := codec.DecodeUint64(state.MustGet(VarDefaultValidatorFee))
	if err != nil {
		return ledgerstate.Color{}, 0, 0, err
	}
	return feeColor, defaultOwnerFee, defaultValidatorFee, nil
}

// DecodeContractRegistry encodes the whole contract registry from the map into a Go map.
func DecodeContractRegistry(contractRegistry *collections.ImmutableMap) (map[coretypes.Hname]*ContractRecord, error) {
	ret := make(map[coretypes.Hname]*ContractRecord)
	var err error
	contractRegistry.MustIterate(func(k []byte, v []byte) bool {
		var deploymentHash coretypes.Hname
		deploymentHash, err = coretypes.HnameFromBytes(k)
		if err != nil {
			return false
		}

		var cr *ContractRecord
		cr, err = DecodeContractRecord(v)
		if err != nil {
			return false
		}

		ret[deploymentHash] = cr
		return true
	})
	return ret, err
}

func CheckAuthorizationByChainOwner(state kv.KVStore, agentID *coretypes.AgentID) bool {
	currentOwner, _, err := codec.DecodeAgentID(state.MustGet(VarChainOwnerID))
	if err != nil {
		panic(err)
	}
	return currentOwner.Equals(agentID)
}

// storeAndInitContract internal utility function
func storeAndInitContract(ctx coretypes.Sandbox, rec *ContractRecord, initParams dict.Dict) error {
	hname := coretypes.Hn(rec.Name)
	contractRegistry := collections.NewMap(ctx.State(), VarContractRegistry)
	if contractRegistry.MustHasAt(hname.Bytes()) {
		return fmt.Errorf("contract '%s'/%s already exist", rec.Name, hname.String())
	}
	contractRegistry.MustSetAt(hname.Bytes(), EncodeContractRecord(rec))
	_, err := ctx.Call(coretypes.Hn(rec.Name), coretypes.EntryPointInit, initParams, nil)
	if err != nil {
		// call to 'init' failed: delete record
		contractRegistry.MustDelAt(hname.Bytes())
		err = fmt.Errorf("contract '%s'/%s: calling 'init': %v", rec.Name, hname.String(), err)
	}
	return err
}

// isAuthorizedToDeploy checks if caller is authorized to deploy smart contract
func isAuthorizedToDeploy(ctx coretypes.Sandbox) bool {
	caller := ctx.Caller()
	if caller.Equals(ctx.ChainOwnerID()) {
		// chain owner is always authorized
		return true
	}
	if caller.Address().Equals(ctx.ChainID().AsAddress()) {
		// smart contract from the same chain is always authorize
		return true
	}

	return collections.NewMap(ctx.State(), VarDeployPermissions).MustHasAt(caller.Bytes())
}
