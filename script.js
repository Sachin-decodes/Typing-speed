/* =========================================
   CONSTANTS & ELEMENTS
   ========================================= */
const wordBank = [
    "apple", "keyboard", "javascript", "window", "screen",
    "coding", "browser", "speed", "project", "college",
    "computer", "mouse", "internet", "learning", "typing",
    "developer", "syntax", "variable", "function", "design"
];

// DOM Elements
const textDisplay = document.getElementById("textDisplay");
const inputBox = document.getElementById("inputBox");
const startBtn = document.getElementById("restartBtn"); // Acts as Start & Restart
const diffSelect = document.getElementById("diffSelect");

// Stats Elements
const timeLeftDisplay = document.getElementById("timeLeft");
const wpmDisplay = document.getElementById("wpmDisplay");
const accuracyDisplay = document.getElementById("accuracyDisplay");
const resultsTableBody = document.querySelector("#resultsTable tbody");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// Ring Animation Elements
const ring = document.getElementById("ring");
const circleRadius = ring.r.baseVal.value;
const circumference = circleRadius * 2 * Math.PI;

// Multiplayer Elements
const socket = io();
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomCodeInput = document.getElementById("roomCodeInput");
const roomStatus = document.getElementById("roomStatus");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const statusMessage = document.getElementById("statusMessage");
const opponentStats = document.getElementById("opponentStats");
const oppWpmDisplay = document.getElementById("oppWpmDisplay");
const oppProgressDisplay = document.getElementById("oppProgressDisplay");
const lobbyControls = document.getElementById("lobbyControls");

// Game Variables
let timerInterval;
let timeLeft;
let totalTime = 60;
let mistakes = 0;
let isGameActive = false;
let currentText = "";
let isMultiplayer = false;
let currentRoomCode = null;

/* =========================================
   INITIALIZATION
   ========================================= */
// Setup Ring SVG Dash properties
ring.style.strokeDasharray = `${circumference} ${circumference}`;
ring.style.strokeDashoffset = 0;

// Load history on startup
displayHistory();

/* =========================================
   MULTIPLAYER LOGIC
   ========================================= */

createRoomBtn.addEventListener("click", () => {
    socket.emit("createRoom");
});

joinRoomBtn.addEventListener("click", () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    if (code) {
        socket.emit("joinRoom", code);
    }
});

socket.on("roomCreated", (code) => {
    currentRoomCode = code;
    isMultiplayer = true;
    enterLobbyState(code);
    statusMessage.innerText = "Waiting for opponent to join...";
});

socket.on("gameStart", (data) => {
    // data = { words: "...", players: [...] }
    statusMessage.innerText = "Opponent joined! Game starting...";

    // Reset UI for game
    setTimeout(() => {
        startMultiplayerGame(data.words);
    }, 1000);
});

socket.on("opponentProgress", (data) => {
    oppWpmDisplay.innerText = data.wpm;
    oppProgressDisplay.innerText = `${data.progress}%`;
});

socket.on("opponentFinished", (data) => {
    statusMessage.innerText = `Opponent finished! WPM: ${data.wpm}`;
    // You could show a "You Lost" or "You Won" message here if you check your own state
});

socket.on("playerDisconnected", () => {
    alert("Opponent disconnected!");
    resetToSinglePlayer();
});

socket.on("error", (msg) => {
    alert(msg);
});

function enterLobbyState(code) {
    lobbyControls.classList.add("hidden");
    roomStatus.classList.remove("hidden");
    roomCodeDisplay.innerText = code;
    opponentStats.classList.remove("hidden");

    // Disable single player controls
    diffSelect.disabled = true;
    startBtn.disabled = true;
}

function resetToSinglePlayer() {
    isMultiplayer = false;
    currentRoomCode = null;
    lobbyControls.classList.remove("hidden");
    roomStatus.classList.add("hidden");
    opponentStats.classList.add("hidden");
    diffSelect.disabled = false;
    startBtn.disabled = false;
    statusMessage.innerText = "Waiting for opponent...";
}

/* =========================================
   GAME LOGIC
   ========================================= */

function startMultiplayerGame(words) {
    // Reset Game State
    clearInterval(timerInterval);
    mistakes = 0;
    inputBox.value = "";
    inputBox.disabled = false;
    inputBox.focus();
    isGameActive = true;

    // Set Words
    currentText = words;
    textDisplay.innerHTML = currentText.split('').map(char => `<span>${char}</span>`).join('');

    // Reset Stats
    wpmDisplay.innerText = "0";
    accuracyDisplay.innerText = "100%";
    timeLeft = 60; // Fixed time for multiplayer for now
    totalTime = 60;
    updateTimerDisplay();

    // Start Timer
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            finishGame();
        }
    }, 1000);
}

// Main Function to Start/Restart Game (Single Player)
function startGame() {
    if (isMultiplayer) return; // Don't allow manual start in MP

    // 1. Reset Game State
    clearInterval(timerInterval);
    mistakes = 0;
    inputBox.value = "";
    inputBox.disabled = false;
    inputBox.focus();
    isGameActive = true;

    // 2. Update Button Text
    startBtn.innerText = "↻ Restart Game";

    // 3. Set Difficulty Time
    const difficulty = diffSelect.value;
    if (difficulty === "easy") totalTime = 60;
    else if (difficulty === "medium") totalTime = 40;
    else if (difficulty === "hard") totalTime = 20;

    timeLeft = totalTime;

    // 4. Update UI
    wpmDisplay.innerText = "0";
    accuracyDisplay.innerText = "100%";
    generateText();
    updateTimerDisplay();

    // 5. Start Countdown
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            finishGame();
        }
    }, 1000);
}

// Generate Random Words (Single Player)
function generateText() {
    let randomWords = [];
    for (let i = 0; i < 25; i++) { // Generate 25 words
        randomWords.push(wordBank[Math.floor(Math.random() * wordBank.length)]);
    }
    currentText = randomWords.join(" ");
    textDisplay.innerHTML = currentText.split('').map(char => `<span>${char}</span>`).join('');
}

// Update Timer & Ring Animation
function updateTimerDisplay() {
    timeLeftDisplay.innerText = `${timeLeft}s`;

    // Calculate SVG Offset
    const offset = circumference - (timeLeft / totalTime) * circumference;
    ring.style.strokeDashoffset = offset;
}

// Typing Event Listener
inputBox.addEventListener("input", () => {
    if (!isGameActive && !isMultiplayer) startGame(); // Auto-start only in single player

    const charArray = textDisplay.querySelectorAll('span');
    const typedValue = inputBox.value.split('');

    let correctChars = 0;
    mistakes = 0; // Reset and recount mistakes based on current input

    charArray.forEach((charSpan, index) => {
        const char = typedValue[index];

        if (char == null) {
            charSpan.classList.remove('correct');
            charSpan.classList.remove('incorrect');
        } else if (char === charSpan.innerText) {
            charSpan.classList.add('correct');
            charSpan.classList.remove('incorrect');
            correctChars++;
        } else {
            charSpan.classList.add('incorrect');
            charSpan.classList.remove('correct');
            mistakes++;
        }
    });

    // Real-time Stats
    let accuracy = typedValue.length > 0
        ? Math.round(((typedValue.length - mistakes) / typedValue.length) * 100)
        : 100;
    accuracyDisplay.innerText = `${accuracy}%`;

    // Calculate WPM for multiplayer updates
    const timeElapsed = totalTime - timeLeft;
    const timeInMinutes = (timeElapsed === 0 ? 1 : timeElapsed) / 60;
    const currentWpm = Math.round((typedValue.length / 5) / timeInMinutes) || 0;

    // Multiplayer Update
    if (isMultiplayer && isGameActive) {
        let progress = Math.round((typedValue.length / currentText.length) * 100);
        socket.emit("updateProgress", {
            roomCode: currentRoomCode,
            wpm: currentWpm,
            progress: progress
        });
    }

    // Check if finished typing everything
    if (typedValue.length === currentText.length) {
        finishGame();
    }
});

// End Game Logic
function finishGame() {
    clearInterval(timerInterval);
    isGameActive = false;
    inputBox.disabled = true;

    // Calculate Final WPM
    const charactersTyped = inputBox.value.length;
    const timeSpent = totalTime - timeLeft;
    const timeInMinutes = (timeSpent === 0 ? 1 : timeSpent) / 60; // Avoid divide by zero

    const wpm = Math.round((charactersTyped / 5) / timeInMinutes);
    const accuracy = accuracyDisplay.innerText; // Grab final accuracy

    // Save to History (Local)
    saveScore({ wpm, accuracy, time: `${totalTime}s`, date: new Date().toLocaleTimeString() });

    displayHistory();

    if (isMultiplayer) {
        socket.emit("gameFinished", {
            roomCode: currentRoomCode,
            wpm: wpm,
            time: timeSpent
        });
        statusMessage.innerText = `You finished! WPM: ${wpm}. Waiting for opponent...`;
    }
}

/* =========================================
   HISTORY & STORAGE
   ========================================= */

function saveScore(score) {
    let history = JSON.parse(localStorage.getItem("typingHistory")) || [];
    history.unshift(score); // Add to beginning of array
    if (history.length > 5) history.pop(); // Keep only last 5
    localStorage.setItem("typingHistory", JSON.stringify(history));
}

function displayHistory() {
    let history = JSON.parse(localStorage.getItem("typingHistory")) || [];
    resultsTableBody.innerHTML = "";

    history.forEach(record => {
        resultsTableBody.innerHTML += `
            <tr>
                <td>${record.wpm}</td>
                <td>${record.accuracy}</td>
                <td>${record.time}</td>
            </tr>
        `;
    });
}

// Clear History Button
clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("typingHistory");
    displayHistory();
});