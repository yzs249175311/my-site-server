import {Controller, Get} from "@nestjs/common"
import {TestService} from "./test.service"

@Controller("test")
export class TestController{

    constructor(private readonly testService:TestService){}

    @Get("greeting")
    getGreeting(){
        return this.testService.getGreeting()
    }
    @Get()
    getIndex(){
        return "index"
    }
}