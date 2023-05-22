import { Player, PlayerInfo } from "./Player";
import { getTime } from "./dateUtil"

export enum MessageType {
	TALK=1,
	PAY,
	SYSTEM,
	SUCCESS,
	FAIL,
}


export interface IMessage {
	type: MessageType;
	content: string;
	time: string
	from?: PlayerInfo;
}

export class Message {
	public type: MessageType;
	public content: string;
	public time: string;
	public from?: PlayerInfo;

	constructor(message: Omit<IMessage, "time">) {
		this.type = message.type
		this.content = message.content
		this.time = getTime()
		this.from = message.from
	}

	handleTo(player: Player) {
		switch (this.type) {
			case MessageType.TALK: this.handleTalk(player); break;
			case MessageType.PAY: this.handlePay(player); break;
			case MessageType.SYSTEM: this.handleSystem(player); break;
			case MessageType.SUCCESS: this.handleSuccess(player); break;
			case MessageType.FAIL: this.handleFail(player); break;
		}

		player.selfGetNotify(this)
	}

	private handleTalk(player: Player) {
		player.records.unshift(this.time + " " + this.from?.name + "说:" + this.content)
	}

	private handlePay(player: Player) {
		player.records.unshift(this.time + " " + "<" + this.from?.name + ">" + " 向你支付了" + this.content + "分")
	}

	private handleSystem(player: Player) {
		player.records.unshift(this.time + " " + "系统信息:" + this.content)
	}

	private handleSuccess(player: Player) {
		player.records.unshift(this.time + " " + "成功:" + this.content)
	}

	private handleFail(player: Player) {
		player.records.unshift(this.time + " " + "失败:" + this.content)
	}

}
