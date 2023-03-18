import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { MusicModule } from './music/music.module';
import { ChatModule } from './chat/chat.module';
import { CounterScoreGateway } from "./socket/CounterScore.gateway"

@Module({
	imports: [BooksModule, MusicModule, ChatModule],
	controllers: [AppController],
	providers: [AppService, CounterScoreGateway],
})
export class AppModule {}
