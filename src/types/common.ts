export enum EVENTS {
    connect = "connect"
}

export type eventNames = keyof typeof EVENTS

export type WSMessage = {
    type:string,
    id:string,
    payload:any
}