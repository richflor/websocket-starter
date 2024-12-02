import { EVENTS, WSMessage } from "../types/common";
import { Handler } from "./Handler";

export class Connect extends Handler {
    type = EVENTS.connect;

    handle(message: WSMessage): void {
        this.send(message.id, {
            message: "you are connected",
            payload: message.payload
        })
    }
}