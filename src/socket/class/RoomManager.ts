import { Message, MessageType } from "./Message";
import { Player } from "./Player";
import { IRoom, Room, RoomOption, RoomType, RoomInfo } from "./Room";

export class RoomManager {
	private _roomMap: Map<string, Room>

	constructor() {
		this._roomMap = new Map<string, Room>()
	}

	createRoom(roomOption: RoomOption, player?: Player) {
		if (this.hasRoom(roomOption.id)) {
			let count = 1
			while (count < 10) {
				if (!this.hasRoom(roomOption.id + "-" + count)) {
					return
				}
				count++
			}
			roomOption.id = roomOption.id + "-" + count
		}

		if (!this.hasRoom(roomOption.id)) {
			let room = new Room(roomOption, this)
			this._roomMap.set(room.id, room)
			if (player) {
				room.owner = player
				player.roomJoin(room, roomOption.passwd)
			}
		} else {
			player.selfGetMessage(new Message({
				type:MessageType.FAIL,
				content:"创建房间失败"
			}))
		}

	}

	getRoom(roomid: string) {
		return this._roomMap.get(roomid)
	}

	hasRoom(roomid: string): boolean {
		return this._roomMap.has(roomid)
	}

	deleteRoom(roomid: string) {
		this._roomMap.delete(roomid)
	}

	getInfo(): Array<RoomInfo> {
		let arr: Array<RoomInfo> = []

		for (let room of this._roomMap.values()) {
			arr.push(room.getInfo())
		}

		return arr
	}
}
