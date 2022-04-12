// calling friends
import { createServer } from 'http';
import express from 'express';

//init app
const app = express();

// init analytics
let usercount = 0;
let userlist = [];

// init port
function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}

const port = normalizePort('8001');

// error handler
function errorHandler(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

// configure server
const server = createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log(`Currently istening on ${bind}. Lessgo!`);
});

// configure socket.io
import { Server } from "socket.io";
const io = new Server({
    cors: {
        origin: '*',
    }
});

io.on('connection', (socket) => {
    console.log(`Client ${socket.id} connected. Total clients: ${io.engine.clientsCount}. Total users: ${usercount}. Users: ${userlist}`);

    socket.on('joining msg', (username) => {
        socket.nickname = username;
        userlist.push(username);
        usercount++;
        io.emit('chat message', `---${socket.nickname} joined the chat---`);
        io.emit('chat message', `There are ${usercount} users in the chat`);
        // io.emit('chat message', `Users: ${userlist}`);
    });
    
    socket.on('disconnect', () => {
        if (!socket.nickname) return;
        userlist.splice(userlist.indexOf(socket.nickname), 1);
        usercount--;
        // console.log(`Client ${socket.id} disconnected`);
        io.emit('chat message', `---${socket.nickname} left the chat---`);
        io.emit('chat message', `There are ${usercount} users in the chat`);  
    });

    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', msg);
    });

    socket.on('typing', () => {
        socket.broadcast.emit(`${socket.nickname} is typing...`);
    });
});

 // engines up
server.listen(port);