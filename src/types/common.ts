export enum EVENTS {
    connect = "connect",
    createRoom = "create room",
    joinRoom = "join room"
}

export type eventNames = keyof typeof EVENTS

export type WSMessage<T> = {
    type:string,
    id_user:string,
    payload:T
}

export type User = {
    id:string,
    name:string,
}

export type Player = User & {
    score:number,
    ready:boolean,
    turn:boolean
}