import { EVENTS, WSMessage } from "../types/common";
import { Handler } from "./Handler";
import * as os from "os";
import { v4 as uuid } from "uuid"
import { connections, redisClient } from "../server";

export class Connect extends Handler {
    type = EVENTS.connect;

    async handle(message: WSMessage<any>) {
        console.log("New connection : ", message.id_user);
        // give uuid if no uuid provided
        const giveId = await this.auth(message);
        if (giveId) {
            connections.set(giveId, this.ws);
            message.id_user = giveId;
        }
        this.send(message.id_user, {
            message: "you are connected",
            payload_received: message.payload,
            payload: {
                "hostname": os.hostname(),
            }
        })
    }

    private async auth(message:WSMessage<any>) {
        if (!message.id_user && message.type === EVENTS.connect) {
            const id = uuid();
            await redisClient.hSet(id, "name", message.payload.name || "name");
            // expire after one hour
            await redisClient.expire(id, 60*60)
            return id;
        }
        return null;
    }
}