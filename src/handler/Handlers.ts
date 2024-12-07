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

  handle(ws:WebSocket ,message:WSMessage<any>) {
    if (!this.handlers[message.type]) {
      console.log("No handler for message")
      return;
    }

    const handler = new this.handlers[message.type](ws);

    handler.handle(message);
  }
}
