const socket = io();

const userList = document.querySelector('.chatList');
const inputField = document.querySelector('#msgInput');
const msgForm = document.querySelector('#msgForm');
const msgList = document.querySelector('.msgList');
const fallback = document.querySelector('.userInfo');
const msgDiv = document.querySelector('.message');

let username = '';
let color = '';
//! USER
const newUserConnected = (user) => {
  username = user || `User${Math.floor(Math.random() * 1000)}`;
  color = getColor();
  socket.emit('new user', { username: username, color: color });
  addUser(username, color);
}

const addUser = (username, color) => {
  if (!!document.querySelector(`.${username}-list`)) return;

  const userBox = `
  <div class="desc ${username}-list">
    <h5 style="color: ${color}">${username}</h5>
    <small>Online</small>
  </div>
  `;
  userList.innerHTML += userBox;
}

newUserConnected();

//! MESSAGES

const addNewMessage = ({ user, message, color}) => {
  const time = new Date();
  const formattedTime = time.toLocaleTimeString('pt-BR', { hour: 'numeric', minute: 'numeric' });

  const receivedMsg = `
  <li class="msg-left">
    <div class="msg-left-sub">
      <div class="msg-desc">
        <div class="username" style="color: ${color}">${user}</div>  
          <span>${message}</span>
      </div>
    <small>${formattedTime}</small>
    </div>
  </li>
  `

  const myMsg = `
    <li class="msg-right">
      <div class="msg-left-sub">
        <div class="msg-desc">${message}</div>
        <small>${formattedTime}</small>
      </div>
    </li>
  `

  msgList.innerHTML += user === username ? myMsg : receivedMsg;
};

msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!inputField.value) return;

  socket.emit('chat message', {
    message: inputField.value,
    nick: username,
    color: color
  });

  
  inputField.value = '';
});

inputField.addEventListener('keyup', () => {
  socket.emit('typing', {
    isTyping: inputField.value.length > 0,
    nick: username,
  });
});

socket.on('typing', (data) => {
  const { isTyping, nick } = data;
  if (!isTyping) {
    fallback.innerHTML = 'Online';
    return;
  }

  fallback.innerHTML = `${nick} is typing...`;
})

socket.on('chat message', (data) => {
  addNewMessage({ user: data.nick, message: data.message, color: data.color });
  msgDiv.scrollTop = msgDiv.scrollHeight;
});


socket.on('new user', (data) => {
  data.map((x) => addUser(x.username, x.color));
});

socket.on('user disconnected', (username) => {
  document.querySelector(`.${username}-list`).remove();
});

function getColor(){ 
  return "hsl(" + 360 * Math.random() + ',' + '50%,' + '80%)'
}