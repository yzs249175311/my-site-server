import { Controller, Get, Query} from '@nestjs/common';

@Controller('music')
export class MusicController {
    constructor(){}
    @Get("search")
    getMusic(@Query("musicName") musicName:string){
        
    }
}
