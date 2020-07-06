
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');

const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server);

const formatMessage = require('./utils/messages');

const { userJoin, getCurrent, userLeave, getRoomUsers, getUserByUsername } = require('./utils/users');

var mongoose = require('mongoose');

//Connection to database and trying to save

mongoose.connect('mongodb://localhost:27017/messages');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once("open", ()=>{
    console.log("Connection succesful");
    var schema = mongoose.Schema({
        message: String,
        to: String,
        from: String
    });
    
    var Message = mongoose.model("Message", schema, "messages");
    
    var doc1 = new Message({message: "message 1", to: "Brad", from: "Ama"});
    
    doc1.save((err, doc)=>{
        console.log("Document inserted succesfully");
    })

    Message.find((err, messages)=>{
        if (err) return console.error(err);
        console.log(messages);
      })
})

// End DB stuff
app.use(express.static(path.join(__dirname, 'public')))
const PORT = 3000;

const botName = "Chat bot";

server.listen(PORT, ()=>{
    console.log(`server running on ${PORT}`)
})

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

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });

    //Listen for new messages

    //Send a message to everyone who is connected

    socket.on('chatMessage', (message)=>{

        const user = getCurrent(socket.id);
        io.emit('message', formatMessage(user.username, message));
        
    });

    //Send messages to a private user

    socket.on('private', data=>{
        const user = getCurrent(socket.id);
        if(data.selectedUser) {
            io.sockets.sockets[getUserByUsername(data.selectedUser).id].emit('private', formatMessage(user.username, data.msg))
            io.sockets.sockets[user.id].emit('private', formatMessage(user.username, data.msg))
        }
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