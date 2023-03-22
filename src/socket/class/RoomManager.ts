import { Player } from "./Player";
import { IRoom, Room, RoomOption, RoomType } from "./Room";

export class RoomManager {
	private _roomMap: Map<string, Room>

	constructor(num: number) {
		this._roomMap = new Map<string, Room>()

		while (num > 0) {
			this._roomMap.set("main-" + num, new Room({
				id:"main-"+num,
				name:"main-"+num,
				roomType:RoomType.ALWAYS
			},this))
			num--
		}
	}

	createRoom(roomOption: RoomOption,player?:Player) {
		let room = new Room(roomOption,this)

		if(player){
			room.owner=player
		}

		this._roomMap.set(room.id, room)
	}

	getRoom(roomid: string) {
		return this._roomMap.get(roomid)
	}

	deleteRoom(roomid: string){
		this._roomMap.delete(roomid)
	}

	getInfo(): Array<IRoom> {
		let arr: Array<IRoom> = []

		for (let room of this._roomMap.values()) {
			arr.push(room.getInfo())
		}

		return arr
	}
}
