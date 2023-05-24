import { ImageBotCommand, TalkBotCommand } from "./Command"
import { Player } from "./Player"

export class CommandHandler {
	commandObj = {
		"bot": new TalkBotCommand(),
		"icon": new ImageBotCommand()
	}

	handle(player: Player, msg: string) {
		msg = msg.trim()
		let command = msg.split(" ")[0]

		if (command && command[0] == "@") {
			this.commandObj[command.substring(1)]?.exec(player, msg.substring(command.length))
		}
	}
}


export let commandHander = new CommandHandler()
