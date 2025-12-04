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
const startBtn = document.getElementById("restartBtn");
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
ring.style.strokeDasharray = `${circumference} ${circumference}`;
ring.style.strokeDashoffset = 0;
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
    statusMessage.innerText = "Opponent joined! Game starting...";
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
});

socket.on("gameOver", (data) => {
    const mySocketId = socket.id;
    const myResult = data.results[mySocketId];

    let oppResult;
    for (let id in data.results) {
        if (id !== mySocketId) {
            oppResult = data.results[id];
            break;
        }
    }

    showGameOverModal(myResult, oppResult, data.winnerId === mySocketId);
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

function showGameOverModal(myResult, oppResult, iWon) {
    const modal = document.getElementById("gameOverModal");
    const winnerText = document.getElementById("winnerText");
    const myFinalWpm = document.getElementById("myFinalWpm");
    const myFinalAcc = document.getElementById("myFinalAcc");
    const oppFinalWpm = document.getElementById("oppFinalWpm");
    const oppFinalAcc = document.getElementById("oppFinalAcc");

    myFinalWpm.innerText = myResult.wpm;
    myFinalAcc.innerText = myResult.accuracy + " Acc";
    oppFinalWpm.innerText = oppResult.wpm;
    oppFinalAcc.innerText = oppResult.accuracy + " Acc";

    if (iWon) {
        winnerText.innerText = "🏆 You Won!";
        winnerText.style.color = "#4ade80";
    } else if (myResult.wpm === oppResult.wpm && myResult.accuracy === oppResult.accuracy) {
        winnerText.innerText = "🤝 It's a Draw!";
        winnerText.style.color = "#facc15";
    } else {
        winnerText.innerText = "😔 You Lost!";
        winnerText.style.color = "#f87171";
    }

    modal.classList.remove("hidden");
}

/* =========================================
   GAME LOGIC
   ========================================= */

function startMultiplayerGame(words) {
    clearInterval(timerInterval);
    mistakes = 0;
    inputBox.value = "";
    inputBox.disabled = false;
    inputBox.focus();
    isGameActive = true;

    currentText = words;
    textDisplay.innerHTML = currentText.split('').map(char => `<span>${char}</span>`).join('');

    wpmDisplay.innerText = "0";
    accuracyDisplay.innerText = "100%";
    timeLeft = 60;
    totalTime = 60;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            finishGame();
        }
    }, 1000);
}

function startGame() {
    if (isMultiplayer) return;

    clearInterval(timerInterval);
    mistakes = 0;
    inputBox.value = "";
    inputBox.disabled = false;
    inputBox.focus();
    isGameActive = true;

    startBtn.innerText = "↻ Restart Game";

    const difficulty = diffSelect.value;
    if (difficulty === "easy") totalTime = 60;
    else if (difficulty === "medium") totalTime = 40;
    else if (difficulty === "hard") totalTime = 20;

    timeLeft = totalTime;

    wpmDisplay.innerText = "0";
    accuracyDisplay.innerText = "100%";
    generateText();
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            finishGame();
        }
    }, 1000);
}

function generateText() {
    let randomWords = [];
    for (let i = 0; i < 25; i++) {
        randomWords.push(wordBank[Math.floor(Math.random() * wordBank.length)]);
    }
    currentText = randomWords.join(" ");
    textDisplay.innerHTML = currentText.split('').map(char => `<span>${char}</span>`).join('');
}

function updateTimerDisplay() {
    timeLeftDisplay.innerText = `${timeLeft}s`;
    const offset = circumference - (timeLeft / totalTime) * circumference;
    ring.style.strokeDashoffset = offset;
}

inputBox.addEventListener("input", () => {
    if (!isGameActive && !isMultiplayer) startGame();

    const charArray = textDisplay.querySelectorAll('span');
    const typedValue = inputBox.value.split('');

    let correctChars = 0;
    mistakes = 0;

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

    let accuracy = typedValue.length > 0
        ? Math.round(((typedValue.length - mistakes) / typedValue.length) * 100)
        : 100;
    accuracyDisplay.innerText = `${accuracy}%`;

    const timeElapsed = totalTime - timeLeft;
    const timeInMinutes = (timeElapsed === 0 ? 1 : timeElapsed) / 60;
    const currentWpm = Math.round((typedValue.length / 5) / timeInMinutes) || 0;

    if (isMultiplayer && isGameActive) {
        let progress = Math.round((typedValue.length / currentText.length) * 100);
        socket.emit("updateProgress", {
            roomCode: currentRoomCode,
            wpm: currentWpm,
            progress: progress
        });
    }

    if (typedValue.length === currentText.length) {
        finishGame();
    }
});

function finishGame() {
    clearInterval(timerInterval);
    isGameActive = false;
    inputBox.disabled = true;

    const charactersTyped = inputBox.value.length;
    const timeSpent = totalTime - timeLeft;
    const timeInMinutes = (timeSpent === 0 ? 1 : timeSpent) / 60;

    const wpm = Math.round((charactersTyped / 5) / timeInMinutes);
    const accuracy = accuracyDisplay.innerText;

    saveScore({ wpm, accuracy, time: `${totalTime}s`, date: new Date().toLocaleTimeString() });
    displayHistory();

    if (isMultiplayer) {
        socket.emit("gameFinished", {
            roomCode: currentRoomCode,
            wpm: wpm,
            accuracy: accuracy,
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
    history.unshift(score);
    if (history.length > 5) history.pop();
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

clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("typingHistory");
    displayHistory();
});
