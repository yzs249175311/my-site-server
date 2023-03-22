import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { IPlayer, Player } from './class/Player';
import { PlayerMap } from './class/PlayerMap';
import { RoomManager } from './class/RoomManager';

let Mock = require("mockjs")

function getTime() {
	let date = new Date()
	return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds().toString().padStart(2, "0")
}

@WebSocketGateway(3001, { cors: { origin: "*", } })
export class CounterScoreGateway implements OnGatewayConnection, OnGatewayDisconnect {

	// 处理客户端连接
	@WebSocketServer()
	server: Server;
	playerMap: PlayerMap
	roomManager: RoomManager;

	constructor() {
		this.playerMap = new PlayerMap()
		this.playerMap.enableTrashPlayerTimer(60 * 1000)
		this.roomManager = new RoomManager(1)
	}

	handleConnection(@ConnectedSocket() client: Socket) {
		let player: Player | null = null;
		let uid = client.handshake.query.uid

		if (uid && uid !== "" && (typeof uid === "string") && this.playerMap.hasPlayer(uid)) {
			player = this.playerMap.getPlayer(uid)
			player.id = client.id
			player.client = client
			player.roomJoin(player.currentRoom)
		} else {
			player = new Player(client.id, client.id, Mock.mock("@cname"), {
				server: this.server,
				client: client
			})
			this.playerMap.pushPlayer(player)
		}

		this.handleFetchUser(client)
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

		let fromPlayer = this.getClientPlayer(client)
		let toPlayer = this.playerMap.getPlayer(payload.to.uid)

		if (fromPlayer.currentRoom === toPlayer.currentRoom) {
			fromPlayer.payMoney(toPlayer, payload.money)
		} else {
			client.emit("message", "找不到这个人！")
		}
	}

	@SubscribeMessage('fetchUser')
	handleFetchUser(@ConnectedSocket() client: Socket) {
		let player = this.getClientPlayer(client)
		if (player) {
			client.emit("updateUser", player.getInfo())
		}

	}

	//获取当前房间的信息
	@SubscribeMessage('fetchRoomInfo')
	async handleFetchRoomInfo(@ConnectedSocket() client: Socket) {
		let player = this.getClientPlayer(client)
		if (player && player.currentRoom) {
			client.emit('updateRoomInfo', player.currentRoom.getInfo())
		}
	}

	@SubscribeMessage('fetchRooms')
	async handleRooms(@ConnectedSocket() client: Socket) {
		this.server.to(client.id).emit('updateRooms', this.roomManager.getInfo())
	}


	@SubscribeMessage('updateUser')
	handleUpdatePlayer(@ConnectedSocket() client: Socket, @MessageBody() newPlayer: IPlayer) {
		let player = this.getClientPlayer(client)
		if (player) {
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
		let room = this.roomManager.getRoom(toRoomid)

		if (player && room) {
			player.roomJoin(room)
		}
	}

	//离开房间
	@SubscribeMessage('roomLeave')
	async handleRoomLeave(@ConnectedSocket() client: Socket) {
		let player = this.getClientPlayer(client)
		player.roomLeave()
	}

	handleFetchAll(roomid: string) {
		this.server.to(roomid).emit("fetchAll")
	}

	getClientUid(client: Socket): string {
		return Reflect.get(client, "uid")
	}

	getClientPlayer(client: Socket): Player {
		return this.playerMap.getPlayer(this.getClientUid(client))
	}
}
