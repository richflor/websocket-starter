import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { createClient } from 'redis';
import { auth } from './auth';
import { EVENTS, WSMessage } from './types/common';
import { Handlers } from './handler/Handlers';
import { Connect } from './handler/Connect';

const PORT = process.env.PORT || 3001
const REDIS_PORT = process.env.REDIS_PORT || 6379
const WS_TIMEOUT = process.env.WS_TIMEOUT || 10*60*1000
const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

export const redisClient = createClient( {
    url: `redis://redis:${REDIS_PORT}`,
    socket :{
        connectTimeout: Number(WS_TIMEOUT)
    } 
});

redisClient
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

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
    [EVENTS.connect]: Connect
})

const connections = new Map<string, WebSocket>();

type ExtWebSocket = WebSocket & {
    isAlive:boolean
}

const rooms = []
//to add
//reconnection
wss.on('connection', async (ws: ExtWebSocket) => {
    try {
        ws.isAlive = true;

        ws.on('error', (err) => {
            throw err
        });

        ws.on('pong', () => {
 	        ws.isAlive = true;
 	    })

        ws.on('message', async (data: any) => {
            const message:WSMessage = JSON.parse(data);
            //log the received message and send it back to the client
            // give uuid if no uuid provided
            const giveId = await auth(message);
            if (giveId) {
                connections.set(giveId, ws);
                message.id_user = giveId;
            }
            handlers.handle(ws, message);
        });

        ws.on("close", (code) => {
            console.log("Client disconnected : ", code)
        })

        //send immediatly a feedback to the incoming connection    
        ws.send('Hi there, I am a WebSocket server');
    } catch (error) {
        console.log(error)
        ws.send("Error server");
    }

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