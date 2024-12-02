import { WebSocket } from "ws"
import { WSMessage } from "../types/common"
import { Handler } from "./Handler"

type allHandlers = {
    [key:string]: typeof Handler
}

export class Handlers {
  handlers: allHandlers
  constructor(handlers:allHandlers) {
    this.handlers = handlers
  }

  handle(ws:WebSocket ,message:WSMessage) {
    if (!this.handlers[message.type]) {
      // throw new Error('No handler for message')
      console.log("no handler for message")
    }

    const handler = new this.handlers[message.type](ws);

    handler.handle(message);
  }
}
