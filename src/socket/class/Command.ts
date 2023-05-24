import { Player } from "./Player";
import { openAIBot, OpenAIBot } from "./OpenAIBot"
import { Message, MessageType } from "./Message";
import { CommandHandler } from "./CommandHandle";

abstract class AbstractBotCommand {
	protected openAIBot: OpenAIBot

	constructor() {
		this.openAIBot = openAIBot
	}

	public abstract exec(player: Player, msg: string): void
}

//和机器人文本交流
export class TalkBotCommand extends AbstractBotCommand {
	constructor() {
		super();
	}

	public exec(player: Player, msg: string): void {
		if (player.messages.length >= 10) {
			player.selfGetMessage(new Message({
				type: MessageType.FAIL,
				content: "对话超过10次，开启新对话！"
			}))
			player.messages = []
		}

		this.openAIBot.createChat([...player.messages, { role: 'user', content: msg }]).then(res => {
			player.messages.push(res)
			player.otherGetMessage(new Message({
				type: MessageType.BOT,
				to: player.getInfo(),
				content: res.content,
			}))
		}).catch(() => {
			console.error("createChat:请求对话失败")
			player.selfGetMessage(new Message({
				type: MessageType.FAIL,
				content: "机器人出现了一点问题，请稍后再试！"
			}))
		})
	}
}

//生成图片并成为自己的头像
export class ImageBotCommand extends AbstractBotCommand {
	public exec(player: Player, msg: string): void {
		console.log("生成图片")
		this.openAIBot.createImage(msg).then(res => {
			if (res && res.b64_json) {
				player.icon = "data:image/png;base64," + res.b64_json
				player.notifyOtherUpdateIcon()
			}
		}).catch(() => {
			player.selfGetMessage(new Message({
				type: MessageType.FAIL,
				content: "机器人出现了一点问题，请稍后再试！"
			}))
			console.error("createImage:请求生成图片失败")
		})
	}
}
