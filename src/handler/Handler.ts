import { WebSocket } from "ws";
import { eventNames, WSMessage } from "../types/common";

export abstract class Handler {
    type?:eventNames

    handle(socket:WebSocket, message:WSMessage) {}

    protected send(socket:WebSocket, id:string, payload:any) {
        const type = this.type || "connect"
        const message:WSMessage = {
            type : type,
            id: id,
            payload:payload
        }
        socket.send(JSON.stringify(message))
    }

}