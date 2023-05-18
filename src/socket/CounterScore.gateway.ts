import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { IPlayer, Player } from './class/Player';
import { PlayerMap } from './class/PlayerMap';
import { RoomManager } from './class/RoomManager';
import { IRoom, RoomType } from './class/Room';

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
		this.roomManager = new RoomManager()
		this.roomManager.createRoom({
			id: "main-1",
			name: "main-1",
			roomType: RoomType.ALWAYS
		})

		this.roomManager.createRoom({
			id: "private-2",
			name: "private-2",
			passwd: "123456",
			roomType: RoomType.ALWAYS
		})
	}

	handleConnection(@ConnectedSocket() client: Socket) {
		let player: Player | null = null;
		let uid = client.handshake.query.uid

		if (uid && uid !== "" && (typeof uid === "string") && this.playerMap.hasPlayer(uid)) {
			player = this.playerMap.getPlayer(uid)
			player.id = client.id
			player.client = client
			if (player.currentRoom) {
				player.roomJoin(this.roomManager.getRoom(player.currentRoom.id))
			}
		} else {
			player = new Player(client.id, client.id, Mock.mock("@cname"), {
				server: this.server,
				client: client,
				roomManager: this.roomManager,
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

		if (toPlayer && fromPlayer && fromPlayer.currentRoom === toPlayer.currentRoom) {
			fromPlayer.payMoney(toPlayer, payload.money)
		} else {
			client.emit("msgFail", "找不到这个人！");
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
		}else{
			client.emit('updateRoomInfo', null)
		}
	}

	@SubscribeMessage('fetchRooms')
	async handleRooms(@ConnectedSocket() client: Socket) {

		client.emit('updateRooms', this.roomManager.getInfo())
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
		this.getClientPlayer(client)?.currentRoom.playersGetMessage(msg)
	}

	@SubscribeMessage('clearRecord')
	handleClearRecord(@ConnectedSocket() client: Socket) {
		this.getClientPlayer(client).clearRecord()
	}

	@SubscribeMessage('roomCreate')
	handleRoomCreate(@ConnectedSocket() client: Socket, @MessageBody() roomOption: { roomName: string, roomPasswd: string, roomType: RoomType }) {
		let player = this.getClientPlayer(client)
		player && player.roomCreate({
			id:player.id+"-"+1,
			name:roomOption.roomName,
			roomType:roomOption.roomType,
			passwd:roomOption.roomPasswd,
		})
	}

	//进入房间
	@SubscribeMessage('roomJoin')
	async handleRoomJoin(@ConnectedSocket() client: Socket, @MessageBody() toRoom: IRoom) {
		let player = this.getClientPlayer(client)
		let room = this.roomManager.getRoom(toRoom.id)

		player.roomJoin(room, toRoom.passwd)
	}

	//离开房间
	@SubscribeMessage('roomLeave')
	async handleRoomLeave(@ConnectedSocket() client: Socket) {
		let player = this.getClientPlayer(client)
		player.roomLeave()
	}

	//踢出房间
	@SubscribeMessage('playerOut')
	async handlePlyaerOut(@MessageBody() uid: string) {
		let player = this.playerMap.getPlayer(uid);
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
