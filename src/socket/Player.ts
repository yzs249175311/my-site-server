import { Server } from 'socket.io';

export interface IPlayer {
	id: string,
	uid: string,
	name: string,
	money: number,
	roomid: string,
	connected: boolean
	readonly lastActive: number
}

export interface IPlayerServer {
	server: Server
}

export class Player implements IPlayer, IPlayerServer {
	private _id: string
	private _uid: string
	private _name: string
	private _money: number
	private _roomid: string
	private _connected: boolean
	private _lastActive: number
	private _server: Server

	constructor(id: string, uid: string, name: string, server: Server) {
		this._id = id
		this._uid = uid
		this._name = name
		this._server = server
		this._money = 0
		this._roomid = ""
		this._connected = true
		this._lastActive = Date.now()
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
		return this._roomid
	}

	public set roomid(roomid) {
		this.active()
		this.notifyOther()
		this._roomid = roomid
		this.notifyOther()
	}

	public get connected() {
		return this._connected
	}
	public set connected(connected) {
		this._connected = connected
		this.notifyOther()
	}

	public get lastActive() {
		return this._lastActive
	}

	public get server() {
		return this._server 
	}

	public set server(server:Server) {
		 this._server = server
		this.notifyOther()
	}

	public connect() {
		this._connected = false
		this.active(true)
		this.notifyOther()
	}

	public disconnect() {
		this.active()
		this._connected = false
		this.notifyOther()
	}

	getInfo(): IPlayer {
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

	notifyOther(){
		this.server.to(this.roomid).to(this.id).emit("fetchAll")
	}
}
