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
		this.playerMap.enableTrashPlayerTimer(60 * 1000)
	}

	handleConnection(@ConnectedSocket() client: Socket) {
		let player: Player | null = null;
		let uid = client.handshake.query.uid
		if (uid && uid !== "" && (typeof uid === "string") && this.playerMap.hasPlayer(uid)) {
			player = this.playerMap.getPlayer(uid)
			player.id = client.id
			player.client = client
			player.connect()
			Reflect.defineProperty(client, "uid", {
				value: uid,
			})
			this.handleRoomJoin(client,player.roomid)
		} else {
			player = new Player (client.id, client.id, Mock.mock("@cname"),{
				server:this.server,
				client:client
			})

			this.playerMap.pushPlayer(player)
			Reflect.defineProperty(client, "uid", {
				value: client.id,
			})
		}
	}

	// 处理客户端断开
	handleDisconnect(@ConnectedSocket() client: Socket) {
		let player = this.getClientPlayer(client)
		if (player) {
			player.disconnect()
		}
	}

	@SubscribeMessage('paymoney')
	handlePayMoney(@ConnectedSocket() client: Socket, @MessageBody() payload: { from: IPlayer, to: IPlayer, money: number }) {
		if (this.playerMap.hasPlayer(payload.from.uid) && this.playerMap.hasPlayer(payload.to.uid)) {
			let fromPlayer = this.getClientPlayer(client)
			let toPlayer = this.playerMap.getPlayer(payload.to.uid)

			if (fromPlayer.money < payload.money) {
				fromPlayer.selfGetMessage("你的分数不够支付")
				return
			}

			if (fromPlayer.roomid !== toPlayer.roomid) {
				fromPlayer.selfGetMessage("你们不在一个房间")
				return
			}

			fromPlayer.payMoney(toPlayer,payload.money)

			fromPlayer.selfGetMessage(`你 向 <${toPlayer.name}> 支付了 ${payload.money} 分`)
			toPlayer.selfGetMessage(`<${fromPlayer.name}> 向 你 支付了 ${payload.money} 分`)
			this.server.to(fromPlayer.roomid).except(fromPlayer.id).except(toPlayer.id)
				.emit("message",`<${fromPlayer.name}> 向 <${toPlayer.name}> 支付了 ${payload.money} 分`)
		} else {
			client.emit("message", "找不到这个人！")
		}
	}

	@SubscribeMessage('fetchUser')
	handleFetchPlayer(@ConnectedSocket() client: Socket) {
		client.emit("updateUser", this.getClientPlayer(client).getInfo())
	}


	@SubscribeMessage('updateUser')
	handleUpdatePlayer(@ConnectedSocket() client: Socket,@MessageBody() newPlayer:IPlayer) {
		let player = this.getClientPlayer(client)
		if(player){
			player.setInfo(newPlayer)
		}
	}

	@SubscribeMessage('message')
	handleMessage(@ConnectedSocket() client: Socket, @MessageBody() msg: string) {
		this.server.to(this.getClientPlayer(client).roomid).to(client.id).emit("message", getTime() + " " + msg)
	}

	//进入房间
	@SubscribeMessage('roomJoin')
	async handleRoomJoin(@ConnectedSocket() client: Socket, @MessageBody() toRoomid: string) {
		let player = this.getClientPlayer(client)

		if(toRoomid === player.roomid) return

		if(player.roomid !== ""){
			player.selfGetMessage(`你离开房间 ${player.roomid}`)
			player.otherGetMessage(`<${player.name}> 离开房间 ${player.roomid}`)
		}

		player.roomid = toRoomid
		player.selfGetMessage(`你进入房间 ${player.roomid}`)
		player.otherGetMessage(`<${player.name}> 进入房间 ${player.roomid}`)
	}

	//离开房间
	@SubscribeMessage('roomLeave')
	async handleRoomLeave(@ConnectedSocket() client: Socket) {
		let player = this.getClientPlayer(client)
		this.handleMessage(client, `<${player.name}> 离开房间 ${player.roomid}`)
		player.selfGetMessage(`你离开房间 ${player.roomid}`)
		player.otherGetMessage(`<${player.name}> 离开房间 ${player.roomid}`)
		player.roomid = ""
	}
	
	//广播当前房间的成员
	@SubscribeMessage('fetchPlayerList')
	async handlePlayerList(@ConnectedSocket() client:Socket) {
		let player = this.getClientPlayer(client)
		let playerlist = this.playerMap.filterByRoomid(player.roomid)
		client.emit('updatePlayerList', playerlist)
	}

	@SubscribeMessage('fetchRooms')
	async handleRooms(@ConnectedSocket() client: Socket) {
		this.server.to(client.id).emit('updateRooms', this.rooms)
	}

	handleFetchAll(roomid:string ){
		this.server.to(roomid).emit("fetchAll")
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
