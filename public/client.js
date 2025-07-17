let socket;
let username = "";

const loginPage = document.getElementById('loginPage');
const chatPage = document.getElementById('chatPage');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const usernameInput = document.getElementById('usernameInput');

const input = document.getElementById('input');
const sendButton = document.getElementById('sendButton');
const messagesDiv = document.getElementById('messages');

const gifSearchButton = document.getElementById('gifSearchButton');
const gifResults = document.getElementById('gifResults');

const GIPHY_API_KEY = 'DfnhVND6PidyM3Baf8CpIjz3xKgFl72t'; // replace with your actual Giphy key

loginButton.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    loginPage.classList.remove('active');
    chatPage.classList.add('active');

    socket = io();

    socket.on('loadMessages', (messages) => {
      messagesDiv.innerHTML = "";
      messages.forEach(addMessage);
    });

    socket.on('message', (message) => {
      addMessage(message);
    });
  }
});

logoutButton.addEventListener('click', () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  username = "";
  chatPage.classList.remove('active');
  loginPage.classList.add('active');
  usernameInput.value = "";
  messagesDiv.innerHTML = "";
});

sendButton.addEventListener('click', () => {
  if (input.value && username && socket) {
    const msgData = {
      name: username,
      text: input.value
    };
    socket.emit('chatMessage', msgData);
    input.value = '';
  }
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendButton.click();
  }
});

gifSearchButton.addEventListener('click', () => {
  const query = prompt("Enter GIF keyword:");
  if (query) {
    fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=5`)
      .then(response => response.json())
      .then(data => {
        gifResults.innerHTML = '';
        data.data.forEach(gif => {
          const img = document.createElement('img');
          img.src = gif.images.fixed_height_small.url;
          img.addEventListener('click', () => {
            sendGifMessage(gif.images.fixed_height.url);
            gifResults.innerHTML = '';
          });
          gifResults.appendChild(img);
        });
      })
      .catch(err => console.log(err));
  }
});

function sendGifMessage(gifUrl) {
  if (username && socket) {
    const msgData = {
      name: username,
      text: `<img src="${gifUrl}" alt="GIF" style="max-width:100%; border-radius:10px;" />`
    };
    socket.emit('chatMessage', msgData);
  }
}

function addMessage(message) {
  const item = document.createElement('div');
  item.innerHTML = `<strong>${message.name}</strong> [${message.createdAt}] : ${message.text}`;
  messagesDiv.appendChild(item);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
