import classNames from "classnames";
import React, { ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { TangleService } from "../../../services/tangleService";
import { FormatHelper } from "../../../utils/formatHelper";
import AsyncComponent from "../layout/AsyncComponent";
import "./MessageTangleState.scss";
import { MessageTangleStateProps } from "./MessageTangleStateProps";
import { MessageTangleStateState } from "./MessageTangleStateState";

/**
 * Component which will display a message tangle state.
 */
class MessageTangleState extends AsyncComponent<MessageTangleStateProps, MessageTangleStateState> {
    /**
     * Service for tangle requests.
     */
    private readonly _tangleService: TangleService;

    /**
     * Create a new instance of Milestone.
     * @param props The props.
     */
    constructor(props: MessageTangleStateProps) {
        super(props);

        this._tangleService = ServiceFactory.get<TangleService>("tangle");

        this.state = {};
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        await this.updateMilestone();
    }

    /**
     * The component was updated.
     * @param prevProps The previous properties.
     */
    public async componentDidUpdate(prevProps: MessageTangleStateProps): Promise<void> {
        if (this.props.milestoneIndex !== prevProps.milestoneIndex) {
            await this.updateMilestone();
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div
                onClick={this.props.onClick}
                className={
                    classNames(
                        "message-tangle-state",
                        { "message-tangle-state__no-click": !this.props.onClick },
                        { "message-tangle-state__referenced": this.props.status === "referenced" },
                        { "message-tangle-state__milestone": this.props.status === "milestone" },
                        { "message-tangle-state__pending": this.props.status === "pending" },
                        { "message-tangle-state__unknown": this.props.status === "unknown" }
                    )
                }
            >
                {this.props.status === "unknown" && ("Unknown")}
                {this.props.status === "referenced" &&
                    (`Referenced${this.props.milestoneIndex !== undefined && this.props.milestoneIndex > 1
                        ? ` by MS ${this.props.milestoneIndex}` : ""}`)}
                {this.props.status === "milestone" &&
                    (`MS${this.props.milestoneIndex !== undefined ? ` ${this.props.milestoneIndex}` : ""}`)}
                {this.props.status === "pending" && ("Pending")}

                {this.state.timestamp}
            </div>
        );
    }

    /**
     * Update the milestone info.
     */
    private async updateMilestone(): Promise<void> {
        if (this.props.milestoneIndex) {
            const result = await this._tangleService.milestoneDetails(this.props.milestoneIndex);
            if (result) {
                this.setState({
                    timestamp: result.timestamp
                        ? ` at ${FormatHelper.dateShort(result.timestamp)}`
                        : undefined
                });
            }
        }
    }
}

export default MessageTangleState;
