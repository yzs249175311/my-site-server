
export interface IPlayer {
	id: string,
	uid: string,
	name: string,
	money: number,
	roomid: string,
	connected: boolean
	readonly lastActive: number
}

export class Player implements IPlayer {
	private _id: string
	private _uid: string
	private _name: string
	private _money: number
	private _roomid: string
	private _connected: boolean
	private _lastActive: number

	constructor(id: string, uid: string, name: string) {
		this._id = id
		this._uid = uid
		this._name = name
		this._money = 0
		this._roomid = ""
		this._connected = true
		this._lastActive = Date.now()
	}

	active(flag?:boolean) {
		if(flag){
			this._lastActive = Date.now()
			return
		}

		if(!this._connected){
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
	}

	public get uid() {
		return this._uid
	}
	public set uid(uid) {
		this.active()
		this._uid = uid
	}

	public get name() {
		return this._name
	}

	public set name(name) {
		this.active()
		this._name = name
	}

	public get money() {
		return this._money
	}
	public set money(money) {
		this.active()
		this._money = money
	}

	public get roomid() {
		return this._roomid
	}

	public set roomid(roomid) {
		this.active()
		this._roomid = roomid
	}

	public get connected() {
		return this._connected
	}
	public set connected(connected) {
		this._connected = connected
	}

	public get lastActive() {
		return this._lastActive
	}

	public connect() {
		this._connected = false
		this.active(true)
	}

	public disconnect() {
		this.active()
		this._connected = false
	}

	getInfo():IPlayer{
		return {
			id:this.id,
			uid:this.uid,
			name:this.name,
			roomid:this.roomid,
			connected:this.connected,
			money:this.money,
			lastActive:this.lastActive,
		}
	}

}
