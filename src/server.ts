import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { createClient } from 'redis';
import { EVENTS, WSMessage } from './types/common';
import { Handlers } from './handler/Handlers';
import { Connect } from './handler/Connect';
import { Room } from './Room';
import { CreateRoom } from './handler/CreateRoom';
import { JoinRoom } from './handler/JoinRoom';

const PORT = process.env.PORT || 3001
const REDIS_PORT = process.env.REDIS_PORT || 6379
const WS_TIMEOUT = process.env.WS_TIMEOUT || 10*60*1000
const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

// WHY DO THE CONNECTION TIMEOUT ? WHAT HAPPEN THEN ?
export const redisClient = createClient( {
    url: `redis://redis:${REDIS_PORT}`,
    socket :{
        connectTimeout: Number(WS_TIMEOUT)
    } 
});

export const subscriber = createClient( {
    url: `redis://redis:${REDIS_PORT}`,
    socket :{
        connectTimeout: Number(WS_TIMEOUT)
    } 
});

redisClient
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

subscriber.connect();

const checkRedisHealth:Promise<boolean> = new Promise( async (resolve, reject) => {
    try {
        await redisClient.set('health', 'ok');
        const reply = await redisClient.get('health');
        resolve(reply === 'ok');
    } catch (error) {
        console.error('Redis Health Check Failed:', error);
        reject(false)
    }
});

checkRedisHealth.then((conn) => {
    if (conn) console.log("Connected to redis database")
})

const handlers = new Handlers({
    [EVENTS.connect]: Connect,
    [EVENTS.createRoom]: CreateRoom,
    [EVENTS.joinRoom]: JoinRoom
})

export const connections = new Map<string, WebSocket>();

type ExtWebSocket = WebSocket & {
    isAlive:boolean;
}

const parse = (data:any) => {
    try {
        console.log("parsing")
        const message:WSMessage<any> = JSON.parse(data);
        return message;
    } catch (error) {
        console.log("parsing error handled")
        return null
    }
}

export const rooms = new Map<string, Room>()
//to add
//RECONNECTION
//DATA VALIDATION
wss.on('connection', async (ws: ExtWebSocket) => {
    ws.isAlive = true;

    const errorHandler = (message:string) => {
        ws.send(JSON.stringify({
            error:message
        }))
    }    

    ws.on('error', (err) => {
        console.log(err);
        errorHandler("Error on WS protocol");
    });

    ws.on('pong', () => {
        ws.isAlive = true;
    })

    ws.on('message', async (data: any) => {
        const message:WSMessage<any> | null = parse(data);
        if(!message) {
            errorHandler("Invalid Json");
            return;
        }
        if(!message.type) {
            errorHandler("No event type specified");
        }
        try {
            handlers.handle(ws, message);          
        } catch (error) {
            console.log(error);
            errorHandler("Error Server");
        }
    });

    ws.on("close", (code) => {
        console.log("Client disconnected : ", code)
    })

    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');

});

wss.on("error", (err) => {
    console.log("Error server : ", err.message);
})

setInterval(() => {
    wss.clients.forEach((ws) => {

        const wso = ws as ExtWebSocket;
    
        // if pong was not answered we close the connection
        if (!wso.isAlive) return wso.terminate();
    
        wso.isAlive = false;
        // set isAlive to false and ping to have response
        ws.ping(null, false);
    });
}, 20*1000);

//start our server
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});