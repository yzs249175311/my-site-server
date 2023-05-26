import { Player, PlayerBaseInfo, PlayerInfo } from "./Player";
import { getTime } from "./dateUtil"

export enum MessageType {
	TALK = 1,
	PAY,
	SYSTEM,
	SUCCESS,
	FAIL,
	BOT,
}


export interface IMessage {
	type: MessageType,
	content: string,
	time: string,
	from?: PlayerBaseInfo,
	to?: PlayerBaseInfo,
}

export class Message implements IMessage {
	public type: MessageType;
	public content: string;
	public time: string;
	public from?: PlayerBaseInfo;
	public to?: PlayerBaseInfo;

	constructor(message: Omit<IMessage, "time">) {
		this.type = message.type
		this.content = message.content
		this.time = getTime()
		this.from = message.from
		this.to = message.to
	}

	handleTo(player: Player) {
		switch (this.type) {
			case MessageType.TALK: this.handleTalk(player); break;
			case MessageType.PAY: this.handlePay(player); break;
			case MessageType.SYSTEM: this.handleSystem(player); break;
			case MessageType.SUCCESS: this.handleSuccess(player); break;
			case MessageType.FAIL: this.handleFail(player); break;
			case MessageType.BOT: this.handleBot(player); break;
		}
		//获得通知
		player.selfGetNotify(this)
	}

	private handleTalk(player: Player) {
		player.records.unshift(this)
	}

	private handlePay(player: Player) {
		player.records.unshift(this)
	}

	private handleSystem(player: Player) {
		player.records.unshift(this)
	}

	private handleSuccess(player: Player) {
		player.records.unshift(this)
	}

	private handleFail(player: Player) {
		player.records.unshift(this)
	}

	private handleBot(player: Player) {
		player.records.unshift(this)
	}
}
