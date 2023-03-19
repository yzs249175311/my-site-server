import { Player,IPlayer } from "./Player"

export class PlayerMap {
	playerMap: Map<string, Player> = new Map()
	leaveRoomTime = 1000 * 60 * 10
	deleteTime = 1000 * 60 * 30
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

	filterByRoomid(roomid: string): Array<IPlayer> {
		if (roomid == "") {
			return []
		}

		let plist: Array<IPlayer> = []
		for (let player of this.playerMap.values()) {
			player.roomid == roomid && plist.push(player.getInfo())
		}
		return plist
	}

	//检查玩家离线的时间是否过长，删除或者提出房间
	validTrashPlayer(): void {
		let tmp: number
		for (let player of this.playerMap.values()) {
			tmp = Date.now() - player.lastActive
			if (tmp > this.deleteTime) {
				this.playerMap.delete(player.uid)
			} else if (tmp > this.leaveRoomTime) {
				this.playerMap.get(player.uid).roomid = ""
			}
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
