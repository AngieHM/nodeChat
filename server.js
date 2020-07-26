
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');

const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server);

const formatMessage = require('./utils/messages');

const { userJoin, getCurrent, userLeave, getRoomUsers, getUserByUsername } = require('./utils/users');
const {connectDb, insertInDb, getAllMEssages, deleteAll} = require('./utils/db');
const { Socket } = require('dgram');


app.use(express.static(path.join(__dirname, 'public')))
const PORT = 3000;

const botName = "Chat bot";

server.listen(PORT, ()=>{
    console.log(`server running on ${PORT}`)
})

connectDb();

io.on('connection', socket=>{

    socket.on('joinRoom', ({username, room})=>{

        const user = userJoin(socket.id, username, room);

        socket.join(user.room)

        //Welcome current user

        socket.emit('message', formatMessage(botName, 'Welcome to this chat'));

        //Broadcast when a user connects

        socket.broadcast
        .to(user.room)
        .emit('message', formatMessage(botName, `${user.username} just joined the chat`));


        //send users and room info
        //deleteAll();
        getAllMEssages().then(messages=>{
            if(messages) {
                filteredMessages = messages.filter(message=>(message.to===username || message.to ==="everyone" || message.from===username))
            socket.emit('setup', {messages:filteredMessages, user: username})
            }
        })

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
        })
        
    });

    //Listen for new messages

    //Send a message to everyone who is connected

    socket.on('chatMessage', (message)=>{

        const user = getCurrent(socket.id);
        io.emit('message', formatMessage(user.username, message));
        insertInDb(formatMessage(user.username, message), "everyone");
    });

    //Send messages to a private user

    socket.on('private', data=>{
        const user = getCurrent(socket.id);
        if(data.selectedUser) {
            io.sockets.sockets[getUserByUsername(data.selectedUser).id].emit('private', formatMessage(user.username, data.msg))
            io.sockets.sockets[user.id].emit('private', formatMessage(user.username, data.msg))
        }
        insertInDb(formatMessage(user.username, data.msg), data.selectedUser);
    });

    //runs when a user disconnects 

    socket.on('disconnect', ()=>{

        const user = userLeave(socket.id);
        if(user) {
            io
            .to(user.room)
            .emit('message', formatMessage(botName, `${user.username} has just left`));
            
            //send users and room info

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})