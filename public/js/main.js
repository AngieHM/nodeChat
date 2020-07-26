const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const userSelect = document.getElementById('users-select')

//get username and romm from URL

const {username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});


const socket = io();

//join chatroom

socket.emit('joinRoom', {username, room})

//get Room and users

socket.on('roomUsers', ({room, users, messages})=>{
  outputRoomName(room);
  outputusers(users);
});

socket.on('setup', ({messages, username})=>{
  messages.forEach(element => {
    outputMessage({text:element.message, username: element.from, time:element.time})
  });
});

//message from server
socket.on('message', message=>{
  console.log(message);

  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;

});

socket.on('private', message=>{

  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;

});

//Message submit

chatForm.addEventListener('submit', (e)=>{
  e.preventDefault();

  //get message text

  const msg = e.target.elements.msg.value;

  //emit a message to the server

  selectedUser = userSelect.options[userSelect.selectedIndex].value;
  if(selectedUser==="everyone") {
    socket.emit('chatMessage', msg);
  }
  else {
    socket.emit('private', {msg:msg,selectedUser:selectedUser});
  }
  
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();

})

function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta"> ${message.username}<span> ${message.time}</span><p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room; 
}


function outputusers(users) {
  userList.innerHTML = `
    ${users.map(user=> `<li>${user.username}</li>`).join('')}
  `;


  userSelect.innerHTML = `
    <option value="everyone">everyone</option>
    ${users.map(user=> `<option value="${user.username}">${user.username}</option>`).join('')}
  `;
}
