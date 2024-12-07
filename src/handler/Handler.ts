import { WebSocket } from "ws";
import { WSMessage } from "../types/common";

// abstract class
export class Handler {
    type?:string
    ws:WebSocket
    constructor(ws:WebSocket) {
        this.ws = ws;
    }

    async handle(message:WSMessage<any>) {}

    protected send(id_user:string, payload:any) {
        const type = this.type || "default"
        const message:WSMessage<any> = {
            type : type,
            id_user: id_user,
            payload:payload
        }
        this.ws.send(JSON.stringify(message))
    }

}