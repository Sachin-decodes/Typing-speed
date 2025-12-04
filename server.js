const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from current directory
app.use(express.static(__dirname));

// Game State
const rooms = new Map();

const WORDS = [
    "apple", "keyboard", "javascript", "window", "screen",
    "coding", "browser", "speed", "project", "college",
    "computer", "mouse", "internet", "learning", "typing",
    "developer", "syntax", "variable", "function", "design",
    "algorithm", "database", "network", "server", "client"
];

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateWords() {
    const gameWords = [];
    for (let i = 0; i < 25; i++) {
        gameWords.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }
    return gameWords.join(" ");
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createRoom', () => {
        const roomCode = generateRoomCode();
        rooms.set(roomCode, {
            players: [socket.id],
            gameState: 'waiting',
            words: generateWords()
        });
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
        console.log(`Room created: ${roomCode} by ${socket.id}`);
    });

    socket.on('joinRoom', (roomCode) => {
        const room = rooms.get(roomCode);
        if (room && room.players.length < 2 && room.gameState === 'waiting') {
            room.players.push(socket.id);
            socket.join(roomCode);
            
            // Notify both players that game can start
            io.to(roomCode).emit('gameStart', {
                words: room.words,
                players: room.players
            });
            
            room.gameState = 'playing';
            console.log(`User ${socket.id} joined room ${roomCode}`);
        } else {
            socket.emit('error', 'Room not found or full');
        }
    });

    socket.on('updateProgress', ({ roomCode, wpm, progress }) => {
        // Broadcast to other player in the room
        socket.to(roomCode).emit('opponentProgress', {
            wpm,
            progress
        });
    });

    socket.on('gameFinished', ({ roomCode, wpm, time }) => {
        socket.to(roomCode).emit('opponentFinished', { wpm, time });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Cleanup rooms where this user was present
        rooms.forEach((room, code) => {
            if (room.players.includes(socket.id)) {
                io.to(code).emit('playerDisconnected');
                rooms.delete(code);
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
