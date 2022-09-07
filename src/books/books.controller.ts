import { ZlibService } from './service/zlib.service';
import { JiumoService} from './service/jiumo.service';
import { Controller, Get, Query } from '@nestjs/common';


@Controller('books')
export class BooksController {
    constructor(
        private readonly jiumoService:JiumoService,
        private readonly zlibService:ZlibService
        ){}

    @Get("search")
    searchBooks(@Query("bookName") bookName:string){
        return this.jiumoService.searchBooks(bookName)
    }

    @Get("test")
    test(@Query("bookName") bookName:string){
        console.log(bookName)
        return this.zlibService.searchBooks(bookName)
    }

}
