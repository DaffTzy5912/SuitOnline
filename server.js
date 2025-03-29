const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create Room
  socket.on('create-room', () => {
    const roomId = generateRoomCode();
    rooms[roomId] = { players: [], choices: {} };
    socket.join(roomId);
    socket.emit('room-created', roomId);
  });

  // Join Room
  socket.on('join-room', (roomId) => {
    if (rooms[roomId] && rooms[roomId].players.length < 2) {
      socket.join(roomId);
      rooms[roomId].players.push(socket.id);
      socket.emit('room-joined', roomId);

      if (rooms[roomId].players.length === 2) {
        io.to(roomId).emit('room-ready');
      }
    } else {
      socket.emit('room-error', 'Room tidak ditemukan atau sudah penuh.');
    }
  });

  // Make Choice
  socket.on('make-choice', ({ roomId, playerChoice }) => {
    if (!rooms[roomId]) return;

    const playerIndex = rooms[roomId].players.indexOf(socket.id);
    rooms[roomId].choices[playerIndex] = playerChoice;

    if (Object.keys(rooms[roomId].choices).length === 2) {
      const [player1, player2] = rooms[roomId].choices;
      const result = determineWinner(player1, player2);
      io.to(roomId).emit('game-result', {
        player1,
        player2,
        result,
      });
      delete rooms[roomId];
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

function generateRoomCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function determineWinner(player1, player2) {
  if (player1 === player2) return 'Seri!';
  if (
    (player1 === 'rock' && player2 === 'scissors') ||
    (player1 === 'scissors' && player2 === 'paper') ||
    (player1 === 'paper' && player2 === 'rock')
  ) {
    return 'Kamu menang!';
  }
  return 'Kamu kalah!';
}

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
