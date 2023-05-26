import { IMessage, Message, MessageType } from "./Message";
import { IPlayer, Player, PlayerBaseInfo, PlayerInfo } from "./Player";
import { RoomManager } from "./RoomManager";

export enum RoomType {
	PRIVATE = 1,
	PUBLIC,
	ALWAYS
}

export interface IRoom {
	id: string,
	name: string,
	passwd: string | null,
	owner: Player | null,
	roomType: RoomType,
	readonly playerCount: number,
	readonly playerList: Array<PlayerInfo>
}

export type RoomInfo = Omit<IRoom, "owner"> & { owner: PlayerBaseInfo }


export type RoomOption = Pick<IRoom, "id" | "name" | "roomType"> & Partial<Pick<IRoom, "passwd" | "owner">>


export class Room implements IRoom {
	private _id: string;
	private _name: string;
	private _passwd: string | null;
	private _owner: Player | null;
	private _roomType: RoomType;
	private _playerSet: Set<Player>;
	private _roomManager: RoomManager;

	constructor(roomOption: RoomOption, roomManager: RoomManager) {
		this._id = roomOption.id
		this._name = roomOption.name
		this._passwd = roomOption.passwd || null
		this._owner = roomOption.owner || null
		this._roomType = roomOption.roomType || RoomType.PUBLIC
		this._playerSet = new Set<Player>()
		this._roomManager = roomManager
	}

	public get id() {
		return this._id;
	}
	public set id(id: string) {
		this._id = id
	}
	public get name() {
		return this._name;
	}
	public set name(name: string) {
		this._name = name;
	}
	public get passwd() {
		return this._passwd;
	}
	public set passwd(passwd: string) {
		this._passwd = passwd
	}
	public get owner() {
		return this._owner;
	}
	public set owner(owner: Player) {
		this._owner = owner
	}
	public get roomType() {
		return this._roomType;
	}
	public set roomType(roomType: RoomType) {
		this._roomType = roomType
	}

	public get playerCount() {
		return this._playerSet.size;
	}

	public get playerList(): Array<PlayerInfo> {
		let arr: Array<PlayerInfo> = new Array<PlayerInfo>();
		for (let player of this._playerSet.values()) {
			arr.push(player.getInfo())
		}
		return arr;
	}

	public playerJoinRoom(player: Player, passwd?: string) {
		if (!this.passwd) {
			if (!this._playerSet.has(player)) {
				player.roomLeave()
			}
			this.registerPlayer(player)
			player.notifyOther()
			player.notifyOtherUpdateIcon()
			// player.selfGetMessage(`你进入房间 ${this.name}`)
			// player.otherGetMessage(`<${player.name}> 进入房间 ${this.name}`)
		} else if (this._playerSet.has(player) && !player.client.rooms.has(this.id)) {
			player.client.join(this.id)
			player.notifyOtherUpdateIcon()
		} else if (passwd) {
			if (passwd === this.passwd) {
				player.roomLeave()
				this.registerPlayer(player)
				player.notifyOther()
				player.notifyOtherUpdateIcon()
				// player.selfGetMessage(`你进入房间 ${this.name}`)
				// player.otherGetMessage(`<${player.name}> 进入房间 ${this.name}`)
			} else {
				player.selfGetMessage(new Message({
					type: MessageType.FAIL,
					content: "密码错误",
				}))
			}
		} else {
			player.selfGetMessage(new Message({
				type: MessageType.FAIL,
				content: "进入房间错误",
			}))
		}
	}

	public playerLeaveRoom(player: Player) {
		if (this._playerSet.has(player)) {
			// player.selfGetMessage(`你离开房间 ${this.name}`)
			// player.otherGetMessage(`<${player.name}> 离开房间 ${this.name}`)
			this.logoutPlayer(player)
			player.notifyOther(this.id)
		}
	}

	private registerPlayer(player: Player) {
		this._playerSet.add(player)
		player.currentRoom = this
		player.client.join(this.id);
	}

	private logoutPlayer(player: Player) {
		this._playerSet.delete(player)
		player.currentRoom = null
		player.client.leave(this.id);

		this.tryDestory()
	}

	//房间里的成员获取信息
	public playersGetMessage(msg: Message, expect?: Player) {
		for (let player of this._playerSet.values()) {
			if (expect && player.id === expect.id) {
				continue
			}
			player.selfGetMessage(msg);
		}
	}

	private tryDestory() {
		if (this.playerCount <= 0 && this.roomType !== RoomType.ALWAYS) {
			this._roomManager.deleteRoom(this.id)
		}
	}

	//单独获取头像的列表
	public getIconInfo() {
		let res = []
		for (let player of this._playerSet.values()) {
			res.push({
				uid: player.uid,
				icon: player.icon,
			})
		}
		return res;
	}

	public getInfo(): RoomInfo {
		return {
			id: this.id,
			name: this.name,
			passwd: this.passwd,
			owner: this.owner?.getBaseInfo(),
			roomType: this.roomType,
			playerCount: this.playerCount,
			playerList: this.playerList,
		}
	}
}
