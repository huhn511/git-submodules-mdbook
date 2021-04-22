package transaction

import "github.com/iotaledger/goshimmer/packages/ledgerstate"

// GetAliasOutput return output or nil if not found
func GetAliasOutput(tx *ledgerstate.Transaction, aliasAddr ledgerstate.Address) *ledgerstate.AliasOutput {
	for _, o := range tx.Essence().Outputs() {
		if out, ok := o.(*ledgerstate.AliasOutput); ok {
			out1 := out.UpdateMintingColor().(*ledgerstate.AliasOutput)
			if out1.GetAliasAddress().Equals(aliasAddr) {
				return out1
			}
		}
	}
	return nil
}
