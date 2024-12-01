import { v4 as uuid } from "uuid"
import { redisClient } from "./server";
import { EVENTS, WSMessage } from "./types/common";

export const auth = async (message:WSMessage) => {
    if (!message.id && message.type === EVENTS.connect) {
        const id = uuid();
        await redisClient.hSet(id, "name", message.payload.name || "name");
        // expire after one hour
        await redisClient.expire(id, 60*60)
        return id;
    }
    return null;
}