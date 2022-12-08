import { Injectable } from '@nestjs/common';
import { Music, TonZhonMusic } from '../../interface/music.interface'
import axios from 'axios';
import { platform } from 'os';

@Injectable()
export class TonzhonService {
	private baseUrl = "https://tonzhon.com"
	private sourceUrl = "https://tonzhon.com/secondhand_api/song_source/"

	constructor() {}

	createSearchPromise(url: string, musicName: string, platform: string = null) {
		return platform ? axios({
			baseURL: this.baseUrl,
			url,
			params: {
				keyword: musicName,
				platform: platform
			},
			headers: {
				userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
			},
		}) : axios({
			baseURL: this.baseUrl,
			url,
			params: {
				keyword: musicName,
			},
			headers: {
				userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
			},
		})
	}

	handleData(musicList: TonZhonMusic[]): Music[] {
		let res: Music[] = musicList.filter(item => item).map((item: TonZhonMusic) => {
			return {
				name: item.name,
				author: item.artists[0]?.name,
				link: "",
				platform: "tonzhon",
				other: {
					requestlink: this.sourceUrl + item.platform + "/" + item.originalId,
					platform: item.platform
				},
			}
		})

		return res
	}

	async searchMusic(musicName: string) {
		let musiclist: TonZhonMusic[] = []
		let res = await Promise.all([
			this.createSearchPromise("/api/exact_search", musicName),
			this.createSearchPromise("/api/fuzzy_search", musicName),
			this.createSearchPromise("/secondhand_api/search", musicName, "qq"),
			this.createSearchPromise("/secondhand_api/search", musicName, "netease"),
			this.createSearchPromise("/secondhand_api/search", musicName, "kuwo"),
		]).catch(()=>{
			return null
		})

		res && res.forEach(item => {
			if (item.data?.success) {
				musiclist = musiclist.concat(item.data?.data?.songs as TonZhonMusic[])
			}
		})

		let result: Music[] = this.handleData(musiclist)

		return !result.length?{error:-1}:result
	}
}
