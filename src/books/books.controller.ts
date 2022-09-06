import { JiumoService} from './service/jiumo.service';
import { Controller, Get, Query } from '@nestjs/common';


@Controller('books')
export class BooksController {
    constructor(
        private readonly jiumoService:JiumoService){}

    @Get("search")
    searchBooks(@Query("bookName") bookName:string){
        return this.jiumoService.searchBooks(bookName)
    }

}
