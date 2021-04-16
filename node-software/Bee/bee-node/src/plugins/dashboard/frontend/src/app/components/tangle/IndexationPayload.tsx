import { Converter } from "@iota/iota.js";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ClipboardHelper } from "../../../utils/clipboardHelper";
import MessageButton from "../../components/layout/MessageButton";
import { IndexationPayloadProps } from "./IndexationPayloadProps";
import { IndexationPayloadState } from "./IndexationPayloadState";

/**
 * Component which will display a indexation payload.
 */
class IndexationPayload extends Component<IndexationPayloadProps, IndexationPayloadState> {
    /**
     * Create a new instance of IndexationPayload.
     * @param props The props.
     */
    constructor(props: IndexationPayloadProps) {
        super(props);

        const utf8Index = Converter.hexToUtf8(props.payload.index);
        const matchHexIndex = props.payload.index.match(/.{1,2}/g);
        const hexIndex = matchHexIndex ? matchHexIndex.join(" ") : props.payload.index;

        let hexData;
        let utf8Data;
        let jsonData;

        if (props.payload.data) {
            const matchHexData = props.payload.data.match(/.{1,2}/g);

            hexData = matchHexData ? matchHexData.join(" ") : props.payload.data;
            utf8Data = Converter.hexToUtf8(props.payload.data);

            try {
                jsonData = JSON.stringify(JSON.parse(utf8Data), undefined, "  ");
            } catch {}
        }

        this.state = {
            utf8Index,
            hexIndex,
            indexLengthBytes: props.payload.index.length / 2,
            utf8Data,
            hexData,
            jsonData,
            dataLengthBytes: props.payload.data ? props.payload.data.length / 2 : 0
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="indexation-payload">
                <h2>Indexation Payload</h2>
                <div className="card--label row middle">
                    <span className="margin-r-t">Index UTF8 [{this.state.indexLengthBytes}]</span>
                    <MessageButton
                        onClick={() => ClipboardHelper.copy(
                            this.state.utf8Index
                        )}
                        buttonType="copy"
                        labelPosition="right"
                    />
                </div>
                <div className="card--value row">
                    <Link
                        to={
                            `/explorer/indexed/${this.props.payload.index}`
                        }
                    >
                        {this.state.utf8Index}
                    </Link>
                </div>
                <div className="card--label row middle">
                    <span className="margin-r-t">Index Hex [{this.state.indexLengthBytes}]</span>
                    <MessageButton
                        onClick={() => ClipboardHelper.copy(
                            this.state.hexIndex.replace(/ /g, "")
                        )}
                        buttonType="copy"
                        labelPosition="right"
                    />
                </div>
                <div className="card--value card--value-textarea card--value-textarea__hex card--value-textarea__fit">
                    {this.state.hexIndex}
                </div>
                {!this.state.jsonData && this.state.utf8Data && (
                    <React.Fragment>
                        <div className="card--label row bottom spread">
                            <span className="margin-r-t">Data UTF8 [{this.state.dataLengthBytes}]</span>
                            <MessageButton
                                onClick={() => ClipboardHelper.copy(
                                    this.state.utf8Data
                                )}
                                buttonType="copy"
                                labelPosition="top"
                            />
                        </div>
                        <div className="card--value card--value-textarea card--value-textarea__utf8">
                            {this.state.utf8Data}
                        </div>
                    </React.Fragment>
                )}
                {this.state.jsonData && (
                    <React.Fragment>
                        <div className="card--label row bottom spread">
                            Data JSON
                            <MessageButton
                                onClick={() => ClipboardHelper.copy(
                                    this.state.jsonData
                                )}
                                buttonType="copy"
                                labelPosition="top"
                            />
                        </div>
                        <div className="card--value card--value-textarea card--value-textarea__json">
                            {this.state.jsonData}
                        </div>
                    </React.Fragment>
                )}
                {this.state.hexData && (
                    <React.Fragment>
                        <div className="card--label row middle">
                            <span className="margin-r-t">Data Hex [{this.state.dataLengthBytes}]</span>
                            <MessageButton
                                onClick={() => ClipboardHelper.copy(
                                    this.state.hexData?.replace(/ /g, "")
                                )}
                                buttonType="copy"
                                labelPosition="right"
                            />
                        </div>
                        <div className="card--value card--value-textarea card--value-textarea__hex">
                            {this.state.hexData}
                        </div>
                    </React.Fragment>
                )}
            </div>
        );
    }
}

export default IndexationPayload;
