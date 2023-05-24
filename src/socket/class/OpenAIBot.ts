import axios, { AxiosRequestConfig } from "openai/node_modules/axios";
import { ChatCompletionRequestMessage, Configuration, ImagesResponseDataInner, OpenAIApi } from "openai";

let apiKey = process.env.OPENAI_API_KEY

const configuration = new Configuration({
	apiKey: apiKey,
});

let axiosConfig: AxiosRequestConfig<any> = {
	baseURL: "https://api.openai-proxy.com",
	headers: {
		"Authorization": "Bearer " + apiKey,
		"Content-Type": "application/json"
	},
	// 	proxy: {
	// 		host: "127.0.0.1",
	// 		port: 7890,
	// 	}
}

export class OpenAIBot {
	private openai: OpenAIApi
	model = "gpt-3.5-turbo"
	temperature = 0.8

	constructor() {
		this.openai = new OpenAIApi(configuration, "v1", axios.create(axiosConfig));
	}

	async createChat(msg: Array<ChatCompletionRequestMessage>): Promise<ChatCompletionRequestMessage> {
		return await this.openai.createChatCompletion({
			model: this.model,
			temperature: this.temperature,
			n: 1,
			messages: msg,
		}).then(res => {
			return res.data.choices[0].message
		})
	}

	async createImage(prompt: string): Promise<ImagesResponseDataInner> {
		return await this.openai.createImage({
			prompt: prompt,
			n: 1,
			size: "256x256",
			response_format: "b64_json",
		}).then(res => {
			return res.data.data[0]
		})
	}
}

export let openAIBot = new OpenAIBot()
