import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Book } from '../interface/book.interface';
import * as cheerio from 'cheerio';

@Injectable()
export class ZlibService {
  private baseUrl = 'https://zh.b-ok.asia';
  constructor() {}

  async searchBooks(bookName: string) {
    let booklist: Book[] = [];
    bookName = encodeURI(bookName);
    try {
      let { data } = await axios({
        method: 'get',
        baseURL: this.baseUrl,
        url: `s/${bookName}?`,
        headers: {
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'accept-encoding': 'gzip, deflate, br',
          // "cookie":`domains-availability={"books":"zh.b-ok.asia","articles":"zh.booksc.org","redirector":"zh.1lib.domains","singlelogin":"zh.singlelogin.me"}`,
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.27',
        },
      });

      if (data.match(/html/)) {
        booklist = this.handleData(this.loadData(data));
      }

      return  booklist.length == 0 ? "":booklist ;

    } catch (error) {
      console.log("zlib search error");
    }
  }

  loadData(str: string):Book[] {
    let $ = cheerio.load(str);
    let list:Book[]=[];
    $('#searchResultBox .resItemBox.resItemBoxBooks.exactMatch').each(function () {
      let book:Book = {
        title:"",
        desc:"",
        link:""
      }
      book.title = $(this).find("table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > h3 > a").text()
      book.desc = $(this).find("table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > div:nth-child(2) > a").text()
      book.link = $(this).find("table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > h3 > a").attr("href")
      book.from = "zlibrary"
      list.push(book)
    });

    return list
  }

  handleData(list:Book[]):Book[]{
    if(list?.length){
      return list.map(item => {
          item.link = this.baseUrl + item.link
          return item
      })
    }

    return []
  }
}
