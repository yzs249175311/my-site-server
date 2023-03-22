import { Server, Socket } from 'socket.io';
import { Room, IRoom } from './Room';

export interface IPlayer {
	id: string,
	uid: string | null,
	name: string,
	money: number,
	readonly roomid: string | null,
	connected: boolean
	currentRoom: null | Room
	readonly lastActive: number
}

export interface IPlayerServer {
	server: Server
}

export interface IPlayerClient {
	client: Socket
}

export type PlayerInfo = Omit<IPlayer, "currentRoom">

export class Player implements IPlayer, IPlayerServer, IPlayerClient {
	private _id: string
	private _uid: string
	private _name: string
	private _money: number
	private _connected: boolean
	private _lastActive: number
	private _server: Server
	private _client: Socket
	private _currentRoom: Room

	constructor(id: string, uid: string, name: string, option: IPlayerServer & IPlayerClient) {
		this._id = id
		this._uid = uid
		this._name = name
		this._money = 0
		this._connected = true
		this._lastActive = Date.now()
		this._server = option.server
		this.client = option.client
	}

	active(flag?: boolean) {
		if (flag) {
			this._lastActive = Date.now()
			return
		}

		if (!this._connected) {
			return
		}

		this._lastActive = Date.now()
	}

	public get id() {
		return this._id
	}
	public set id(id) {
		this.active()
		this._id = id
		this.notifyOther()
	}

	public get uid() {
		return this._uid
	}
	public set uid(uid) {
		this.active()
		this._uid = uid
		this.notifyOther()
	}

	public get name() {
		return this._name
	}

	public set name(name) {
		this.active()
		if (this._name == name) return
		this._name = name
		this.notifyOther()
	}

	public get money() {
		return this._money
	}
	public set money(money) {
		this.active()
		this._money = money
		this.notifyOther()
	}

	public get roomid() {
		if (this._currentRoom) {
			return this._currentRoom.id
		}
		return null
	}

	public get connected() {
		return this._connected
	}

	public set connected(connected: boolean) {
		if (this._connected === connected) return;
		this._connected = connected
		this.notifyOther()
	}

	public get lastActive() {
		return this._lastActive
	}

	public get currentRoom() {
		return this._currentRoom
	}

	public set currentRoom(room: Room) {
		this._currentRoom = room
	}

	public get server() {
		return this._server
	}

	public set server(server: Server) {
		this._server = server
	}

	public get client() {
		return this._client
	}

	public set client(client: Socket) {
		if (this.client) {
			if (this.client === client) {
				return
			}

			if (this.connected) {
				this.logoutUnExpect()
			}

			this._client = client
			this.connect()
		} else {
			this._client = client
		}

		Reflect.defineProperty(this._client, "uid", {
			value: this.uid,
		})
	}

	public connect() {
		this._connected = true
		this.active(true)
		this.notifyOther()
	}

	public disconnect() {
		this._connected = false
		this.notifyOther()
		this.client.disconnect()
	}

	getInfo(): PlayerInfo {
		return {
			id: this.id,
			uid: this.uid,
			name: this.name,
			roomid: this.roomid,
			money: this.money,
			connected: this.connected,
			lastActive: this.lastActive,
		}
	}

	setInfo(player: IPlayer) {
		this._name = player.name
		this._money = player.money
		this.notifyOther()
	}

	notifyOther(roomid?: string) {
		if (roomid) {
			this.server.to(roomid).to(this.id).emit("fetchAll")
			return
		}
		this.server.to(this.roomid).to(this.id).emit("fetchAll")
	}

	getMoney(fromPlayer:Player ,money: number) {
		this.selfGetMessage(`<${fromPlayer.name}> 向 你 支付了 ${money} 分`)
		this.money += money
	}

	payMoney(toPlayer: Player, money: number) {
		this.active()
		if (this.money < money) {
			this.selfGetMessage("你的分数不够支付!")
			return
		}
		if (!this.currentRoom || this.currentRoom !== toPlayer.currentRoom) {
			this.selfGetMessage("你们不在一个房间!")
			return
		}

		this.selfGetMessage(`你 向 <${toPlayer.name}> 支付了 ${money} 分`)
		toPlayer.getMoney(this,money)
		this.money -= money

		this.server.to(this.roomid).except(this.id).except(toPlayer.id)
			.emit("message", `<${this.name}> 向 <${toPlayer.name}> 支付了 ${money} 分`)

	}

	selfGetMessage(msg: string) {
		this.client.emit("message", msg)
	}

	otherGetMessage(msg: string) {
		this.client.to(this.roomid).emit("message", msg)
	}

	logoutUnExpect() {
		this.selfGetMessage("你在另一个客户端上线了")
		this.disconnect()
	}

	roomJoin(room: Room, passwd?: string) {
		this.active()
		room.playerJoinRoom(this,passwd)
	}

	roomLeave() {
		if (this.currentRoom) {
			this.currentRoom.playerLeaveRoom(this)
		}
	}
}
