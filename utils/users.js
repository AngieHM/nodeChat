const users = [];

//Join user to chat

function userJoin(id, username, room) {
    const user = {id, username, room};

    users.push(user);

    return user
}

//get the current user

function getCurrent(id) {
    return users.find(user=> user.id == id)
}


//User leaves chat

function userLeave(id) {
    const index = users.findIndex(user => user.id===id);

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

//Get room users


function getRoomUsers(room) {
    return users.filter(user => user.room = room);
}

function getUserByUsername(username) {
    return users.find(user=> user.username == username)
}

module.exports = {
    userJoin,
    getCurrent,
    userLeave,
    getRoomUsers,
    getUserByUsername
}
