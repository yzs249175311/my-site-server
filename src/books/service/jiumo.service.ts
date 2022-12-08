import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Book } from '../interface/book.interface';

@Injectable()
export class JiumoService {
	private baseUrl = 'https://www.jiumodiary.com/';
	constructor() {}

	async searchBooks(bookName: string) {
		let booklist: Book[] = [];
		try {
			let { data } = await axios({
				method: 'post',
				baseURL: this.baseUrl,
				url: 'init_hubs.php',
				headers: {
					'Content-type': 'application/x-www-form-urlencoded',
				},
				params: {
					q: bookName,
				},
			});

			let { data: data1 } = await axios({
				method: 'post',
				baseURL: this.baseUrl,
				url: 'ajax_fetch_hubs.php',
				params: {
					id: data.id,
					set: 0,
				},
			});

			data1?.sources.forEach((element) => {
				element.details?.data?.forEach((item) => {
					if (!item.link) return;
					booklist.push({
						title: item.title,
						desc: item.des || "无",
						link: item.link,
						from: '鸠摩',
					});
				});
			});
		} catch (err) {
			console.log(err)
		} 
		return booklist.length == 0 ? { error: -1 } : booklist;
		// return data1;
	}
}
