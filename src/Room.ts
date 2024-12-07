import { redisClient, subscriber } from "./server";
import { User } from "./types/common";
import { v4 as uuid } from "uuid";

export class Room {
    id:string
    Users:{ [x: User["id"]]: User["name"] }
    publishing:boolean = false;

    constructor(users: { [x: string]: string }) {
        this.id = uuid();
        this.Users = users;
        console.log("Room created : ",this.id)
    }

    async addUser(user:User) {
        this.Users[user.id] = user.name;
        if(this.publishing) {
            await redisClient.hSet(this.id, user.id, user.name);
            await redisClient.publish(this.id, "join room:" + user.id + ":" + user.name);            
        }
        console.log("Added user to room : ", this.id)
        console.log(this.Users);
    }

    async deleteUser(user:User) {
        delete this.Users[user.id];
        await redisClient.hDel(this.id, user.id);
    }

    subscriber() {
        subscriber.subscribe(this.id, (message) => {
            if(!this.publishing) {
                const array =  message.split(":");
                if(array[0] === "join room") {
                    const user = {
                        id:array[1],
                        name:array[2]
                    }
                    this.addUser(user);
                }
                return
            }
            this.publishing = false;
        })
    }
}