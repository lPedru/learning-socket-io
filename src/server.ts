import express from 'express';
import http from 'http';
import ejs from 'ejs';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs');
app.set('views', './src/views');

app.get('/', (req, res) => {
  res.render('pages/home');
});

//! --------------

const onlineUsers = new Set<any>();

io.on('connection', (socket) => {
  socket.on('new user', (data) => {
    socket.data.userId = data.username;
    socket.data.userColor = data.color;
    onlineUsers.add(data);
    io.emit('new user', [...onlineUsers]);
  });

  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach(item => item.username == socket.data.userId ? onlineUsers.delete(item) : item);
    io.emit('user disconnected', socket.data.userId);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });
});


server.listen(3000, () => {
  console.log('Listening on PORT 3000');
});
