import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { createClient } from 'redis';
import { auth } from './auth';
import { EVENTS, WSMessage } from './types/common';
import { Handlers } from './handler/Handlers';
import { Connect } from './handler/Connect';

const PORT = process.env.PORT || 3001
const REDIS_PORT = process.env.PORT || 6379
const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

export const redisClient = createClient( {
    url: `redis://redis:${REDIS_PORT}`,
    socket :{
        connectTimeout: 10*60*1000
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
    [EVENTS.connect]: new Connect()
})

const connections = new Map<string, WebSocket>();

const rooms = []

wss.on('connection', async (ws: WebSocket) => {
    try {
        ws.on('message', async (data: any) => {
            const message:WSMessage = JSON.parse(data);
            //log the received message and send it back to the client
            // give uuid if no uuid provided
            const giveId = await auth(message);
            if (giveId) {
                connections.set(giveId, ws);
                message.id = giveId;
            }
            handlers.handle(ws, message);
        });

        //send immediatly a feedback to the incoming connection    
        ws.send('Hi there, I am a WebSocket server');        
    } catch (error) {
        ws.send("Error server");
    }

});

wss.on("error", (err) => {
    console.log("Error server : ", err.message);
})

//start our server
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});