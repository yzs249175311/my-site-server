import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { IPlayer, Player } from './Player';
import { PlayerMap } from './PlayerMap';

let Mock = require("mockjs")

function getTime() {
	let date = new Date()
	return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
}

@WebSocketGateway(3001, { cors: { origin: "*", } })
export class CounterScoreGateway implements OnGatewayConnection, OnGatewayDisconnect {

	// 处理客户端连接
	@WebSocketServer()
	server: Server;
	playerMap: PlayerMap
	rooms = ["room1", "room2", "room3", "room4"]

	constructor() {
		this.playerMap = new PlayerMap()
		this.playerMap.enableTrashPlayerTimer(5 * 1000)
	}

	handleConnection(@ConnectedSocket() client: Socket) {
		let player: Player | null = null;
		let uid = client.handshake.query.uid

		if (uid && uid !== "" && (typeof uid === "string") && this.playerMap.hasPlayer(uid as string)) {
			player = this.playerMap.getPlayer(uid)
			player.id = client.id
			player.connected = true
			Reflect.defineProperty(client, "uid", {
				value: uid,
			})
		} else {
			this.playerMap.pushPlayer(new Player(client.id, client.id, Mock.mock("@cname")))
			Reflect.defineProperty(client, "uid", {
				value: client.id,
			})
		}

		this.handleFetchPlayer(client)
		this.handleRoomJoin(client)
		client.emit('rooms', this.rooms)
	}

	// 处理客户端断开
	handleDisconnect(@ConnectedSocket() client: Socket) {
		let uid = this.getClientUid(client)
		if (this.playerMap.hasPlayer(uid)) {
			this.playerMap.getPlayer(uid).connected = false
		}
		this.handlePlayerList(this.getClientRoomid(client))
	}

	@SubscribeMessage('paymoney')
	handlePayMoney(@ConnectedSocket() client: Socket, @MessageBody() payload: { from: IPlayer, to: IPlayer, money: number }) {
		if (this.playerMap.hasPlayer(payload.from.uid) && this.playerMap.hasPlayer(payload.to.uid)) {
			let fromPlayer = this.playerMap.getPlayer(payload.from.uid)
			let toPlayer = this.playerMap.getPlayer(payload.to.uid)

			if(fromPlayer.money < payload.money){
				client.emit("message","你的分数不够支付")
				return
			}

			if(fromPlayer.roomid !== toPlayer.roomid){
				client.emit("message","你们不在一个房间")
				return
			}

			fromPlayer.money -=  payload.money
			toPlayer.money +=  payload.money

			this.server.to(fromPlayer.roomid).emit("fetchUser")
			this.handleMessage(client, `<${fromPlayer.name}> 向 <${toPlayer.name}> 支付了 ${payload.money} 分`)
			this.handlePlayerList(fromPlayer.roomid)
		}else{
			client.emit("message","找不到这个人！")
		}
	}

	@SubscribeMessage('fetchUser')
	handleFetchPlayer(@ConnectedSocket() client: Socket) {
		client.emit("pushUser", this.getClientPlayer(client).getInfo())
	}

	@SubscribeMessage('message')
	handleMessage(@ConnectedSocket() client: Socket, @MessageBody() msg: string) {
		this.server.to(this.getClientPlayer(client).roomid).emit("message", getTime() + " " + msg)
	}

	//进入房间
	@SubscribeMessage('roomJoin')
	async handleRoomJoin(@ConnectedSocket() client: Socket) {
		let player = this.getClientPlayer(client)
		let roomid = player.roomid
		if (roomid === "") {
			return
		}
		let name = player.name
		client.join(roomid)
		player.roomid = roomid
		this.handleMessage(client, `<${name}> 进入房间 ${roomid}`)
		await this.handlePlayerList(roomid)
	}

	//离开房间
	@SubscribeMessage('roomLeave')
	async handleRoomLeave(@ConnectedSocket() client: Socket) {
		let player = this.getClientPlayer(client)
		let roomid = player.roomid
		let name = player.name
		this.handleMessage(client, `<${name}> 离开房间 ${roomid}`)
		client.leave(roomid)
		player.roomid = ""
		await this.handlePlayerList(roomid)
	}

	//广播当前房间的成员
	@SubscribeMessage('playerList')
	async handlePlayerList(roomid: string) {
		let playerlist = this.playerMap.filterByRoomid(roomid)
		this.server.to(roomid).emit('playerList', playerlist)
	}

	//客户端数据发生变化后，更新服务器数据 
	@SubscribeMessage('update')
	async handleUpdate(@ConnectedSocket() client: Socket, @MessageBody() player: IPlayer) {
		console.log("updata " + client.id + "数据 " + player.name)
		let oldplayer: Player = this.getClientPlayer(client)
		for (let [key, value] of Object.entries(player)) {
			if (value === oldplayer[key] || key === "lastActive") {
				continue
			} else {
				if (key === "roomid") {
					await this.handleRoomLeave(client)
					oldplayer.roomid = value
					await this.handleRoomJoin(client)
				}
				oldplayer[key] = value
			}
		}
		this.handlePlayerList(this.getClientRoomid(client))
	}

	getClientUid(client: Socket): string {
		return Reflect.get(client, "uid")
	}

	getClientRoomid(client: Socket): string {
		return this.playerMap.getPlayer(this.getClientUid(client)).roomid
	}

	getClientPlayer(client: Socket): Player {
		return this.playerMap.getPlayer(this.getClientUid(client))
	}
}
