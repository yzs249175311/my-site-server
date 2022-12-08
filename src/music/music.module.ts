import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { TonzhonService } from './service/tonzhon/tonzhon.service';

@Module({
  controllers: [MusicController],
	providers: [MusicService ,TonzhonService]
})
export class MusicModule {}
