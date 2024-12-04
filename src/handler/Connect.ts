import { EVENTS, WSMessage } from "../types/common";
import { Handler } from "./Handler";
import * as os from "os"

export class Connect extends Handler {
    type = EVENTS.connect;

    handle(message: WSMessage): void {
        console.log("New connection : ", message.id_user)
        this.send(message.id_user, {
            message: "you are connected",
            payload_received: message.payload,
            payload: {
                "hostname": os.hostname(),
            }
        })
    }
}