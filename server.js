const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const moment = require('moment');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

let messages = [];
let usersCount = 0;

io.on('connection', (socket) => {
  console.log('🟢 A user connected');
  usersCount++;

  // Send existing messages to new user
  socket.emit('loadMessages', messages);

  // Receive and broadcast chat messages
  socket.on('chatMessage', (msgData) => {
    const message = {
      name: msgData.name,
      text: msgData.text,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
    };
    messages.push(message);
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
    usersCount--;

    // Reset messages if no users are connected
    if (usersCount === 0) {
      messages = [];
      console.log('💾 All users disconnected. Chat reset.');
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Open http://localhost:${PORT} in your browser`);
});
