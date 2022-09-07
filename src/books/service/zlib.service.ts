import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Book } from '../interface/book.interface';

@Injectable()
export class ZlibService {
  private baseUrl = 'https://zh.b-ok.asia/s/';
  constructor() {}
  
  async searchBooks(bookName: string) {
    let booklist: Book[] = [];
    try {
    let  data  = await axios({
      method: 'get',
      baseURL: this.baseUrl,
      url: `${bookName}?`,
      headers:{
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "cookie":`domains-availability={"books":"zh.b-ok.asia","articles":"zh.booksc.org","redirector":"zh.1lib.domains","singlelogin":"zh.singlelogin.me"}`,
        "referer":`https://zh.b-ok.asia/s/hello?`
      }
    });
      return data ? data : "no result"
    } catch (error) {
     console.log("axios error") 
    }
    return "search error"
  }
}
