import { PlayerMap } from "../PlayerMap";
import { Player} from "../Player";

describe("Player",()=>{
	it("PlayerMap",()=>{
		let playerMap = new PlayerMap()
		playerMap.pushPlayer(new Player("uid", "uid", "name"))
		expect(playerMap.hasPlayer("uid")).toBeTruthy()
	})
})
