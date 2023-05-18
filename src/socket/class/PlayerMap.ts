import { Player} from "./Player"

export class PlayerMap {
	playerMap: Map<string, Player> = new Map()
	leaveRoomTime = 1000 * 60 * 60
	deleteTime = 1000 * 60 * 60 *24
	trashTimer = null

	pushPlayer(player: Player) {
		if (!this.hasPlayer(player.uid)) {
			this.playerMap.set(player.uid, player)
			return true
		}
		return false
	}

	delete(uid: string): void {
		this.playerMap.delete(uid)
	}

	hasPlayer(uid: string): boolean {
		return this.playerMap.has(uid)
	}

	getPlayer(uid: string): Player | undefined {
		return this.playerMap.get(uid)
	}

	//检查玩家离线的时间是否过长，删除或者提出房间
	validTrashPlayer(): void {
		try{
			let tmp: number
			for (let [key,player] of this.playerMap.entries()) {
				tmp = Date.now() - player.lastActive
				if (tmp > this.deleteTime) {
					player.selfGetMessage(`你长时间不在线或无操作，被删除!`)
					player.roomLeave()
					this.playerMap.delete(key)
					player.disconnect()
				} else if (tmp > this.leaveRoomTime && player.currentRoom) {
					player.selfGetMessage(`你长时间不在线或无操作，被踢出房间!`)
					player.otherGetMessage(`<${player.name}>长时间不在线或无操作，被踢出房间!`)
					player.roomLeave()
				}
			}
		} catch (e) {
			console.log("validTrashPlayer:" + e)
		}
	}

	enableTrashPlayerTimer(time: number): void {
		if (this.trashTimer) {
			clearInterval(this.trashTimer)
		}
		this.trashTimer = setInterval(this.validTrashPlayer.bind(this), time)
	}

	disableTrashPlayerTimer(): void {
		if (this.trashTimer) {
			clearInterval(this.trashTimer)
			this.trashTimer = null
		}
	}

	setLeaveRoomTime(time: number) {
		this.leaveRoomTime = time
	}

	setDeleteTime(time: number) {
		this.deleteTime = time
	}
}
