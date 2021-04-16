import { SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE, SIG_LOCKED_SINGLE_OUTPUT_TYPE, UnitsHelper } from "@iota/iota.js";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ClipboardHelper } from "../../../utils/clipboardHelper";
import { NameHelper } from "../../../utils/nameHelper";
import MessageButton from "../layout/MessageButton";
import { OutputProps } from "./OutputProps";
import { OutputState } from "./OutputState";

/**
 * Component which will display an output.
 */
class Output extends Component<OutputProps, OutputState> {
    /**
     * Create a new instance of Output.
     * @param props The props.
     */
    constructor(props: OutputProps) {
        super(props);

        this.state = {
            formatFull: false,
            isGenesis: props.output.messageId === "0".repeat(64)
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="output">
                <h2>{NameHelper.getOutputTypeName(this.props.output.output.type)} {this.props.index}</h2>
                <div className="card--label">
                    Message Id
                </div>
                <div className="card--value row">
                    {this.state.isGenesis && (
                        <span>Genesis</span>
                    )}
                    {!this.state.isGenesis && (
                        <React.Fragment>
                            <Link
                                to={
                                    `/explorer/message/${this.props.output.messageId}`
                                }
                                className="margin-r-t"
                            >
                                {this.props.output.messageId}
                            </Link>
                            <MessageButton
                                onClick={() => ClipboardHelper.copy(
                                    this.props.output.messageId
                                )}
                                buttonType="copy"
                                labelPosition="top"
                            />
                        </React.Fragment>
                    )}
                </div>
                <div className="card--label">
                    Transaction Id
                </div>
                <div className="card--value row">
                    {this.state.isGenesis && (
                        <span>Genesis</span>
                    )}
                    {!this.state.isGenesis && (
                        <React.Fragment>
                            <span className="margin-r-t">
                                {this.props.output.transactionId}
                            </span>
                            <MessageButton
                                onClick={() => ClipboardHelper.copy(
                                    this.props.output.transactionId
                                )}
                                buttonType="copy"
                                labelPosition="top"
                            />
                        </React.Fragment>
                    )}
                </div>
                <div className="card--label">
                    Index
                </div>
                <div className="card--value">
                    {this.props.output.outputIndex}
                </div>
                <div className="card--label">
                    Is Spent
                </div>
                <div className="card--value">
                    {this.props.output.isSpent ? "Yes" : "No"}
                </div>
                {(this.props.output.output.type === SIG_LOCKED_SINGLE_OUTPUT_TYPE ||
                    this.props.output.output.type === SIG_LOCKED_DUST_ALLOWANCE_OUTPUT_TYPE) && (
                        <React.Fragment>
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
                                        ? `${this.props.output.output.amount} i`
                                        : UnitsHelper.formatBest(this.props.output.output.amount)}
                                </button>
                            </div>
                        </React.Fragment>
                    )}
            </div>
        );
    }
}

export default Output;
