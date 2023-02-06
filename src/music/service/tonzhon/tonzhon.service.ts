import { Injectable } from '@nestjs/common';
import { Music, TonZhonMusic } from '../../interface/music.interface'
import axios from 'axios';

@Injectable()
export class TonzhonService {
	private baseUrl = "https://tonzhon.com/"
	private baseUrl1 = "https://music-api.tonzhon.com/"
	private sourceUrl = "https://music-api.tonzhon.com/song_source/"

	constructor() {}

	createSearchPromise(baseURL: string, url: string, musicName: string, platform: string = null) {
		return platform ? axios({
			baseURL,
			url,
			params: {
				keyword: musicName,
				platform: platform
			},
			headers: {
				userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
			},
		}) : axios({
			baseURL,
			url,
			params: {
				keyword: musicName,
			},
			headers: {
				userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
			},
		})
	}

	//处理数据
	handleData(musicList: TonZhonMusic[]): Music[] {
		let res: Music[] = musicList.filter(item => item).map((item: TonZhonMusic) => {
			return {
				name: item.name,
				author: item.artists[0]?.name,
				link: "",
				platform: "tonzhon",
				other: {
					requestlink: item.platform + "/" + item.originalId,
					platform: item.platform,
					originalId: item.originalId
				},
			}
		})

		return res
	}

	//获取音乐链接
	async getSource(link: string) {
		console.log(link)
		let res = await axios({
			baseURL:this.sourceUrl,
			url:link,
			headers: {
				userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
			}
		}).catch(() => null)

		return res ? res.data : { error: -1 }
	}

	//获取音乐列表
	async searchMusic(musicName: string) {
		let musiclist: TonZhonMusic[] = []
		let res = [
			await this.createSearchPromise(this.baseUrl,"/api/exact_search", musicName),
			await this.createSearchPromise(this.baseUrl,"/api/fuzzy_search", musicName),
			await this.createSearchPromise(this.baseUrl1,"/search", musicName, "qq"),
			await this.createSearchPromise(this.baseUrl1,"/search", musicName, "netease"),
			await this.createSearchPromise(this.baseUrl1,"/search", musicName, "kuwo"),
		]

		res && res.forEach(item => {
			if (item.data?.success) {
				if(item.data.data){
					musiclist = musiclist.concat(item.data.data.songs as TonZhonMusic[])
				}else{
					musiclist = musiclist.concat(item.data.songs as TonZhonMusic[])
				}
			}
		})

		let result: Music[] = this.handleData(musiclist)

		return !result.length ? { error: -1 } : result
	}
}
