import { WebSocket } from "ws";
import { EVENTS, WSMessage } from "../types/common";
import { Handler } from "./Handler";

export class Connect extends Handler {
    type = EVENTS.connect;

    handle(socket: WebSocket, message: WSMessage): void {
        this.send(socket, message.id, {
            message: "you are connected",
            payload: message.payload
        })
    }
}