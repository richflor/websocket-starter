import { WebSocket } from "ws";
import { eventNames, WSMessage } from "../types/common";

// abstract class
export class Handler {
    type?:eventNames
    ws:WebSocket
    constructor(ws:WebSocket) {
        this.ws = ws;
    }

    handle(message:WSMessage) {}

    protected send(id:string, payload:any) {
        const type = this.type || "connect"
        const message:WSMessage = {
            type : type,
            id: id,
            payload:payload
        }
        this.ws.send(JSON.stringify(message))
    }

}