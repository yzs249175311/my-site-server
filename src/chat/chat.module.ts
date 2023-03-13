import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { QingkeyunService } from './qingkeyun/qingkeyun.service';

@Module({
  controllers: [ChatController],
  providers: [QingkeyunService]
})
export class ChatModule {}
