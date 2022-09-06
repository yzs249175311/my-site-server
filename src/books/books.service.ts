import { Injectable ,Inject} from '@nestjs/common';

@Injectable()
export class BooksService {
  constructor() {
  }

  async searchBooks(bookName: string) {
   return null
  }
}
