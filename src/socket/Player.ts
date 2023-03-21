import { Server, Socket } from 'socket.io';

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

export interface IPlayerClient {
	client: Socket
}

export class Player implements IPlayer, IPlayerServer, IPlayerClient {
	private _id: string
	private _uid: string
	private _name: string
	private _money: number
	private _roomid: string
	private _connected: boolean
	private _lastActive: number
	private _server: Server
	private _client: Socket

	constructor(id: string, uid: string, name: string, option: { server: Server, client: Socket }) {
		this._id = id
		this._uid = uid
		this._name = name
		this._money = 0
		this._roomid = ""
		this._connected = true
		this._lastActive = Date.now()
		this._server = option.server
		this._client = option.client
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
		if (this._name == name) return
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
		if (this._roomid === roomid) return;

		this.active()
		let oldRoomid = this._roomid

		if (roomid === "") {
			this._roomid = roomid
			this.client.leave(oldRoomid)
		}

		this.client.leave(oldRoomid)
		this._roomid = roomid
		this.client.join(roomid)

		this.notifyOther(oldRoomid)
		this.notifyOther()
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
		if(this.client === client){
			return
		}

		if (this.connected) {
			this.logoutUnExpect()
		}

		this._client = client
	}

	public connect() {
		this._connected = true
		this.active(true)
		this.notifyOther()
	}

	public disconnect() {
		this.active()
		this._connected = false
		this.notifyOther()
		this.client.disconnect()
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

	notifyOther(roomid?: string) {
		if (roomid) {
			this.server.to(roomid).emit("fetchAll")
			return
		}
		this.server.to(this._roomid).to(this.id).emit("fetchAll")
	}

	getMoney(money:number){
		this.money += money
	}

	payMoney(toPlayer:Player,money:number){
		this.getMoney(-money)
		toPlayer.getMoney(money)
	}

	selfGetMessage(msg: string){
		this.client.emit("message",msg)
	}

	otherGetMessage(msg: string){
		this.client.to(this.roomid).emit("message",msg)
	}

	logoutUnExpect(){
		this.selfGetMessage( "你在另一个客户端上线了")
		this.disconnect()
	}
}
