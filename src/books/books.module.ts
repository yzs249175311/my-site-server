import { ZlibService } from './service/zlib.service';
import {  JiumoService } from './service/jiumo.service';
import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  controllers: [BooksController],
  providers: [BooksService,JiumoService,ZlibService]
})
export class BooksModule {}
