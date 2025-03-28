const socket = io();

let roomId = null;

// Elements
const roomCodeInput = document.getElementById('room-code');
const joinRoomButton = document.getElementById('join-room');
const createRoomButton = document.getElementById('create-room');
const roomStatus = document.getElementById('room-status');
const gameSection = document.getElementById('game-section');
const choices = document.querySelectorAll('.choice');
const resultText = document.getElementById('result');

// Join Room
joinRoomButton.addEventListener('click', () => {
  const code = roomCodeInput.value.trim();
  if (code) {
    socket.emit('join-room', code);
  } else {
    alert('Masukkan kode room!');
  }
});

// Create Room
createRoomButton.addEventListener('click', () => {
  socket.emit('create-room');
});

// Handle Choice
choices.forEach(choice => {
  choice.addEventListener('click', () => {
    const playerChoice = choice.getAttribute('data-choice');
    socket.emit('make-choice', { roomId, playerChoice });
  });
});

// Socket Events
socket.on('room-created', (code) => {
  roomId = code;
  roomStatus.textContent = `Room dibuat! Kode: ${code}`;
  gameSection.style.display = 'block';
});

socket.on('room-joined', (code) => {
  roomId = code;
  roomStatus.textContent = `Berhasil bergabung ke room: ${code}`;
  gameSection.style.display = 'block';
});

socket.on('room-error', (message) => {
  alert(message);
});

socket.on('game-result', ({ player1, player2, result }) => {
  resultText.textContent = `Lawan memilih ${player2}. Hasil: ${result}`;
});
