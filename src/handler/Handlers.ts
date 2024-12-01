import { WebSocket } from "ws"
import { WSMessage } from "../types/common"
import { Handler } from "./Handler"

type allHandlers = {
    [key:string] : Handler
}

export class Handlers {
  handlers: allHandlers
  constructor(handlers:allHandlers) {
    this.handlers = handlers
  }

  handle(socket:WebSocket ,message:WSMessage) {
    if (!this.handlers[message.type]) {
      // throw new Error('No handler for message')
      console.log("no handler for message")
    }

    this.handlers[message.type].handle(socket, message)
  }
}
