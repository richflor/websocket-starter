import { Room } from "../Room";
import { redisClient, rooms } from "../server";
import { EVENTS, User, WSMessage } from "../types/common";
import { Handler } from "./Handler";

export class CreateRoom extends Handler {
    type = EVENTS.createRoom

    async handle(message: WSMessage<User>): Promise<void> {
        const user:User = {
            name:message.payload.name,
            id:message.id_user
        }
        const users = {
            [user.id]:user.name
        }
        const room = new Room(users);
        await redisClient.hSet(room.id, user.id, user.name);
        await redisClient.publish(room.id, "create room");
        rooms.set(room.id, room);
        room.subscriber();

        this.send(message.id_user, {
            room:room.id,
        })
    }
}