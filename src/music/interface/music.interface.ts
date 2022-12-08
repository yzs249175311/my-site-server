export type musicProvider = "tonzhon" | string

export interface Music {
	name: string,
	author: string,
	link: string,
	platform: musicProvider,
	image?: string,
	other?: {
		requestlink?: string,
		platform?: string,
	}
}

export interface TonZhonMusic{
	[key:string]:string | object | number,
	originalId: string,
	name: string,
	artists: [{
		name:string
		id:string
	}],
	platform: "qq" | "netease" | "kuwo",
}
