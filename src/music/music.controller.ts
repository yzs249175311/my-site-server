import { Controller, Get, Query} from '@nestjs/common';
import { TonzhonService } from './service/tonzhon/tonzhon.service'
@Controller('music')
export class MusicController {
    constructor(
		private readonly tonZhonService: TonzhonService,
	){}
    @Get("search")
    async getMusic(@Query("musicName") musicName:string){
        let res = await Promise.all([
			this.tonZhonService.searchMusic(musicName),
		]).catch(()=>{
			return null
		})
		return !res?[{error:1}]:res
    }
}
