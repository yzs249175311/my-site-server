import { Controller, Get, Query } from '@nestjs/common';
import { QingkeyunService} from './qingkeyun/qingkeyun.service';

@Controller('chat')
export class ChatController {
	constructor(
		private readonly qingkeyunservice: QingkeyunService,
	) {}

	@Get("api")
	async getReply(@Query("msg") msg:string) {
		let res = await Promise.allSettled([
			this.qingkeyunservice.getReply(msg),
		])

		let result = res.map(item => {
			if(item.status == "fulfilled"){
				return item.value
			}
		})
		return result
	}
}
