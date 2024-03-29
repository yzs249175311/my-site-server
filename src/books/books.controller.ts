import { ZlibService } from './service/zlib.service';
import { JiumoService } from './service/jiumo.service';
import { Controller, Get, Query } from '@nestjs/common';
import { Book } from './interface/book.interface';

@Controller('books')
export class BooksController {
	constructor(
		private readonly jiumoService: JiumoService,
		private readonly zlibService: ZlibService,
	) {}

	@Get('search')
	async searchBooks(@Query('bookName') bookName: string) {
		let result: Array<PromiseSettledResult<Book[] | {}>> = await Promise.allSettled([
			this.jiumoService.searchBooks(bookName),
			this.zlibService.searchBooks(bookName),
		]);

		let data = result.reduce(function (oldval, newval) {
			console.log(newval)
			if (newval.status == "fulfilled" && Array.prototype.isPrototypeOf(newval.value)) {
				return Array.prototype.concat(oldval, newval.value);
			}
			return oldval;
		}, []);
		return data;
	}
}
