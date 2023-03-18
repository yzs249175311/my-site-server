import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
let Mock = require("mockjs")

@WebSocketGateway(3001, { cors: { origin: "*", } })
export class CounterScoreGateway implements OnGatewayConnection, OnGatewayDisconnect {

	// 处理客户端连接
	@WebSocketServer()
	server: Server;

	handleConnection(@ConnectedSocket() client: Socket) {
		console.log("client count:" + this.server.engine.clientsCount)
		if (this.server.engine.clientsCount > 4) {
			client.disconnect()
			console.log('Client refuced:', client.id);
			return
		}

		// new or unrecoverable session
		Reflect.defineProperty(client, "name", {
			value: Mock.mock("@cname"),
			writable: true,
		})

		client.emit('user', {
			id: client.id,
			name: Reflect.get(client, "name")
		})
		//初始化名字
	}

	// 处理客户端断开
	handleDisconnect(@ConnectedSocket() client: Socket) {
		this.handlePlayers()
		console.log('Client disconnected:', client.id);
	}


	@SubscribeMessage('init')
	handleInit(@ConnectedSocket() client: Socket, @MessageBody() payload: number) {
		this.server.emit("init", payload)
	}

	@SubscribeMessage('paymoney')
	handlePayMoney(@ConnectedSocket() client: Socket, @MessageBody() payload: { id: string, money: number }) {
		if (payload.id) {
			this.server.to(payload.id).emit("add", { id: client.id, name: Reflect.get(client, "name"), money: payload.money })
		}
	}

	@SubscribeMessage('players')
	async handlePlayers() {
		let playlist = []
		let sockets = await this.server.fetchSockets()
		sockets.forEach((socket) => {
			let id = socket.id
			let name = Reflect.get(socket, "name")
			playlist.push({
				id,
				name
			})
		})
		this.server.emit('players', playlist)
	}

	@SubscribeMessage('changeName')
	handleChangeName(@ConnectedSocket() client: Socket, @MessageBody() name: string) {
		if (name) {
			Reflect.set(client, "name", name)
			this.handlePlayers()
		}

		client.emit('user', {
			id: client.id,
			name: name,
		})
	}
}
