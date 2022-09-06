import {Injectable} from "@nestjs/common"

@Injectable()
export class TestService {
    getGreeting(){
        return "greeting"
    }
}
