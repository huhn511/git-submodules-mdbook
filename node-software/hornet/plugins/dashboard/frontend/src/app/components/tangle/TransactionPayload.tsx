/* eslint-disable max-len */
import { Converter, Ed25519Address, IReferenceUnlockBlock, ISignatureUnlockBlock, REFERENCE_UNLOCK_BLOCK_TYPE, SIGNATURE_UNLOCK_BLOCK_TYPE, SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE, SIG_LOCKED_SINGLE_OUTPUT_TYPE, UnitsHelper, UTXO_INPUT_TYPE } from "@iota/iota.js";
import React, { Component, ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IBech32AddressDetails } from "../../../models/IBech32AddressDetails";
import { NodeConfigService } from "../../../services/nodeConfigService";
import { Bech32AddressHelper } from "../../../utils/bech32AddressHelper";
import { NameHelper } from "../../../utils/nameHelper";
import Bech32Address from "./Bech32Address";
import { TransactionPayloadProps } from "./TransactionPayloadProps";
import { TransactionPayloadState } from "./TransactionPayloadState";

/**
 * Component which will display a transaction payload.
 */
class TransactionPayload extends Component<TransactionPayloadProps, TransactionPayloadState> {
    /**
     * The bech32 hrp from the node.
     */
    private readonly _bech32Hrp: string;

    /**
     * Create a new instance of TransactionPayload.
     * @param props The props.
     */
    constructor(props: TransactionPayloadProps) {
        super(props);

        const nodeConfigService = ServiceFactory.get<NodeConfigService>("node-config");
        this._bech32Hrp = nodeConfigService.getBech32Hrp();

        const signatureBlocks: ISignatureUnlockBlock[] = [];
        for (let i = 0; i < props.payload.unlockBlocks.length; i++) {
            if (props.payload.unlockBlocks[i].type === SIGNATURE_UNLOCK_BLOCK_TYPE) {
                const sigUnlockBlock = props.payload.unlockBlocks[i] as ISignatureUnlockBlock;
                signatureBlocks.push(sigUnlockBlock);
            } else if (props.payload.unlockBlocks[i].type === REFERENCE_UNLOCK_BLOCK_TYPE) {
                const refUnlockBlock = props.payload.unlockBlocks[i] as IReferenceUnlockBlock;
                signatureBlocks.push(props.payload.unlockBlocks[refUnlockBlock.reference] as ISignatureUnlockBlock);
            }
        }

        const unlockAddresses: IBech32AddressDetails[] = [];
        for (let i = 0; i < signatureBlocks.length; i++) {
            unlockAddresses.push(
                Bech32AddressHelper.buildAddress(
                    Converter.bytesToHex(
                        new Ed25519Address(Converter.hexToBytes(signatureBlocks[i].signature.publicKey))
                            .toAddress()
                    ),
                    this._bech32Hrp
                )
            );
        }

        this.state = {
            formatFull: false,
            unlockAddresses
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="transaction-payload">
                <div className="card margin-t-m padding-l">
                    <h2 className="margin-b-s">Inputs</h2>
                    {this.props.payload.essence.inputs.map((input, idx) => (
                        <div
                            key={idx}
                            className="margin-b-s"
                        >
                            <h3 className="margin-b-t">{NameHelper.getInputTypeName(input.type)} {idx}</h3>
                            {input.type === UTXO_INPUT_TYPE && (
                                <React.Fragment>
                                    <Bech32Address
                                        activeLinks={true}
                                        addressDetails={this.state.unlockAddresses[idx]}
                                    />
                                    <div className="card--label">
                                        Transaction Id
                                    </div>
                                    <div className="card--value card--value__mono">
                                        {input.transactionId === "0".repeat(64) && (
                                            <span>Genesis</span>
                                        )}
                                        {input.transactionId !== "0".repeat(64) && input.transactionId}
                                    </div>
                                    <div className="card--label">
                                        Transaction Output Index
                                    </div>
                                    <div className="card--value">
                                        {input.transactionOutputIndex}
                                    </div>
                                </React.Fragment>
                            )}
                        </div>
                    ))}
                </div>

                <div className="card margin-t-m padding-l">
                    <h2 className="margin-b-s">Outputs</h2>
                    {this.props.payload.essence.outputs.map((output, idx) => (
                        <div
                            key={idx}
                            className="margin-b-s"
                        >
                            <h3 className="margin-b-t">{NameHelper.getOutputTypeName(output.type)} {idx}</h3>
                            {(output.type === SIG_LOCKED_SINGLE_OUTPUT_TYPE ||
                                output.type === SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE) && (
                                    <React.Fragment>
                                        <Bech32Address
                                            activeLinks={true}
                                            addressDetails={Bech32AddressHelper.buildAddress(output.address.address, this._bech32Hrp)}
                                        />

                                        <div className="card--label">
                                            Amount
                                        </div>
                                        <div className="card--value card--value__mono">
                                            <button
                                                className="card--value--button"
                                                type="button"
                                                onClick={() => this.setState(
                                                    {
                                                        formatFull: !this.state.formatFull
                                                    }
                                                )}
                                            >
                                                {this.state.formatFull
                                                    ? `${output.amount} i`
                                                    : UnitsHelper.formatBest(output.amount)}
                                            </button>
                                        </div>
                                    </React.Fragment>
                                )}
                        </div>
                    ))}
                </div>

                <div className="card margin-t-m padding-l">
                    <h2 className="margin-b-s">Unlock Blocks</h2>
                    {this.props.payload.unlockBlocks.map((unlockBlock, idx) => (
                        <div
                            key={idx}
                            className="margin-b-s"
                        >
                            <h3 className="margin-b-t">{NameHelper.getUnlockBlockTypeName(unlockBlock.type)} {idx}</h3>
                            {unlockBlock.type === SIGNATURE_UNLOCK_BLOCK_TYPE && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Public Key
                                    </div>
                                    <div className="card--value card--value__mono">
                                        {unlockBlock.signature.publicKey}
                                    </div>
                                    <div className="card--label">
                                        Signature
                                    </div>
                                    <div className="card--value card--value__mono">
                                        {unlockBlock.signature.signature}
                                    </div>
                                </React.Fragment>
                            )}
                            {unlockBlock.type === REFERENCE_UNLOCK_BLOCK_TYPE && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Reference
                                    </div>
                                    <div className="card--value">
                                        {unlockBlock.reference}
                                    </div>
                                </React.Fragment>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default TransactionPayload;
