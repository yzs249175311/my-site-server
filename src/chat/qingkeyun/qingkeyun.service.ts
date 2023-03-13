import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ReplyMessage } from '../interface/chat.interface';

@Injectable()
export class QingkeyunService {
	base_url =`http://api.qingyunke.com/api.php?key=free&appid=0&msg=` 
	from = "青客云"
	constructor() {}

	async getReply(msg: string):Promise<ReplyMessage> {
		let url = encodeURI(this.base_url+msg)
		let res = await axios.get(url)
			.catch(res => {
				return {status:-1,data:{}}
			})

		if (res.status && res.status == 200) {
			let data = res.data
			return {
				content: data.content,
				from: this.from
			}
		}
		return {from: "null",content:""}
	}
}
