import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
let Mock = require("mockjs")

interface Player {
	id: string,
	name: string,
	money: number,
	roomid: string,
}

function getTime() {
	let date = new Date()
	return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
}

@WebSocketGateway(3001, { cors: { origin: "*", } })
export class CounterScoreGateway implements OnGatewayConnection, OnGatewayDisconnect {

	// 处理客户端连接
	@WebSocketServer()
	server: Server;

	rooms = ["room1", "room2", "room3", "room4"]

	handleConnection(@ConnectedSocket() client: Socket) {

		let name: string = "";
		let money: number = 0;

		if (client.handshake.query.name) {
			name = client.handshake.query.name as string
		}

		if (client.handshake.query.money) {
			money = parseInt(client.handshake.query.money as string)
		}

		// new or unrecoverable session
		Reflect.defineProperty(client, "name", {
			value: name,
			writable: true,
		})

		Reflect.defineProperty(client, "money", {
			value: money,
			writable: true,
		})

		Reflect.defineProperty(client, "roomid", {
			value: "",
			writable: true,
		})

		client.emit('rooms', this.rooms)
	}

	// 处理客户端断开
	handleDisconnect(@ConnectedSocket() client: Socket) {
		this.handlePlayers(client)
		console.log('Client disconnected:', client.id);
	}


	@SubscribeMessage('init')
	async handleInit(@ConnectedSocket() client: Socket, @MessageBody() payload: number) {
		let sockets = await this.server.to(Reflect.get(client, "roomid")).fetchSockets()
		sockets.forEach((socket) => {
			Reflect.set(socket, "money", payload)
			socket.emit("init",payload)
		})

		await this.handlePlayers(client)
	}

	@SubscribeMessage('paymoney')
	async handlePayMoney(@ConnectedSocket() client: Socket, @MessageBody() payload: { id: string, name: string, money: number }) {
		if (payload.id) {
			client.to(payload.id).emit("add", { id: client.id, name: Reflect.get(client, "name"), money: payload.money })
			this.handleMessage(client, `<${Reflect.get(client, "name")}> 向 <${payload.name}> 支付了 ${payload.money} 分`)
		}
	}

	@SubscribeMessage('players')
	async handlePlayers(@ConnectedSocket() client: Socket) {
		let playlist = []
		let sockets = await this.server.to(Reflect.get(client, "roomid")).fetchSockets()
		sockets.forEach(socket => {
			let id = socket.id
			let name = Reflect.get(socket, "name")
			let money = Reflect.get(socket, "money")

			playlist.push({
				id,
				name,
				money,
			})
		})

		this.server.to(Reflect.get(client, "roomid")).emit('players', playlist)
	}

	@SubscribeMessage('message')
	handleMessage(@ConnectedSocket() client: Socket, @MessageBody() msg: string) {
		this.server.to(Reflect.get(client, "roomid")).emit("message", getTime() + " " + msg)
	}

	//进入房间
	@SubscribeMessage('roomJoin')
	async handleRoomJoin(@ConnectedSocket() client: Socket) {
		if (Reflect.get(client, "roomid") === "") {
			return
		}
		client.join(Reflect.get(client, "roomid"))
		this.handleMessage(client, `<${Reflect.get(client, "name")}> 进入房间 ${Reflect.get(client,"roomid")}`)
		await this.handlePlayers(client)
	}

	//离开房间
	@SubscribeMessage('roomLeave')
	async handleRoomLeave(@ConnectedSocket() client: Socket) {
		this.handleMessage(client, `<${Reflect.get(client, "name")}> 离开房间 ${Reflect.get(client,"roomid")}`)
		client.leave(Reflect.get(client, "roomid"))
		await this.handlePlayers(client)
	}

	@SubscribeMessage('update')
	async handleUpdate(@ConnectedSocket() client: Socket,@MessageBody() player: Player) {
		for (let [key, value] of Object.entries(player)) {
			if (value === Reflect.get(client, key)) {
				continue
			} else {
				if (key === "roomid") {
					await this.handleRoomLeave(client)
					Reflect.set(client, key, value)
					await this.handleRoomJoin(client)
				}

				Reflect.set(client, key, value)
			}
		}
		this.handlePlayers(client)
	}
}
