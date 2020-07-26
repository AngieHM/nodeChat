var mongoose = require('mongoose');
var schema = mongoose.Schema({
    message: String,
    to: String,
    from: String,
    time: String,
});
var Message = mongoose.model("Message", schema, "messages");

function connectDb() {
    mongoose.connect('mongodb://localhost:27017/messages', {poolSize:100});

    var db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once("open", ()=>{
        console.log("Connection succesful");
    } );
}

function insertInDb(messageObject, to) {
    var doc1 = new Message({message: messageObject.text, to: to, from: messageObject.username, time: messageObject.time});
        
        doc1.save((err, doc)=>{
            console.log("Document inserted succesfully");
        })
}

function getAllMEssages() {
    return Message.find().exec();
}

function deleteAll() {
    Message.remove({}, err=>{
        if(err) {
            console.log("error")
        }
        else {
            console.log("deletion successful")
        }
    })
}

module.exports = {connectDb, insertInDb, getAllMEssages, deleteAll};


