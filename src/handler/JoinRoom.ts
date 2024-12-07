import { Room } from "../Room";
import { redisClient, rooms } from "../server";
import { EVENTS, User, WSMessage } from "../types/common";
import { Handler } from "./Handler";

type Payload = {
    id_room:string;
    name:string;
}

export class JoinRoom extends Handler {
    type = EVENTS.joinRoom;

    async handle(message: WSMessage<Payload>): Promise<void> {
        const roomId = message.payload.id_room;
        // if not aware of room
        if(!rooms.has(roomId)) {
            const roomExist = await redisClient.hGetAll(roomId);
            const data = Object.keys(roomExist);
            // if room not exist
            if (data.length <= 0) {
                this.send(message.id_user, {
                    error: "No Room found"
                })
                return
            }
            // if room exist, must add it
            const newRoom = new Room(roomExist);
            rooms.set(roomId, newRoom);
            newRoom.subscriber();
        }

        //get room and add User
        const room = rooms.get(roomId);
        if(room) {
            const user:User = {
                name:message.payload.name,
                id:message.id_user
            }
            room.publishing = true;
            await room.addUser(user);
            this.send(message.id_user, {
                roomId: room.id,
                users: room.Users
            })            
        }
    }
}