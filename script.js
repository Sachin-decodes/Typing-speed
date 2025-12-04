/* ==== GLOBAL ==== */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(135deg, #111827, #1f2937);
    color: white;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 40px 20px;
}

.main-container {
    width: 100%;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* ==== HEADER ==== */
header h1 {
    text-align: center;
    font-size: 2.5rem;
    background: linear-gradient(to right, #4ade80, #3b82f6);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 10px;
}

/* ==== LAYOUT GRIDS ==== */
.dashboard {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
}

.card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
    backdrop-filter: blur(10px);
}

/* ==== LEFT CARD: TIMER & STATS ==== */
.stats-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    text-align: center;
}

#timerContainer {
    position: relative;
    width: 120px;
    height: 120px;
}

.progress-ring {
    transform: rotate(-90deg);
}

#ring {
    stroke-dasharray: 326;
    stroke-dashoffset: 0;
    transition: stroke-dashoffset 1s linear;
}

#timeLeft {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5rem;
    font-weight: bold;
    font-family: 'Roboto Mono', monospace;
}

.mini-stats {
    display: flex;
    gap: 20px;
    width: 100%;
    justify-content: space-around;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 15px;
}

.stat {
    display: flex;
    flex-direction: column;
}

.label {
    font-size: 0.8rem;
    opacity: 0.6;
}

#wpmDisplay,
#accuracyDisplay {
    font-size: 1.2rem;
    font-weight: bold;
    color: #4ade80;
}

/* ==== RIGHT CARD: TYPING ==== */
.typing-card {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

#textDisplay {
    font-family: 'Roboto Mono', monospace;
    font-size: 1.2rem;
    line-height: 1.6;
    background: rgba(0, 0, 0, 0.3);
    padding: 15px;
    border-radius: 10px;
    height: 150px;
    overflow-y: auto;
    color: #d1d5db;
}

#inputBox {
    width: 100%;
    height: 60px;
    padding: 15px;
    font-family: 'Roboto Mono', monospace;
    font-size: 1.1rem;
    border-radius: 10px;
    border: none;
    outline: none;
    background: #f3f4f6;
    color: #111827;
}

#inputBox:focus {
    box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.5);
}

/* ==== SETTINGS BAR ==== */
.settings-bar {
    display: flex;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 12px;
    align-items: center;
}

select {
    padding: 10px 20px;
    background: #374151;
    color: white;
    border: 1px solid #4b5563;
    border-radius: 8px;
    cursor: pointer;
}

button {
    padding: 10px 25px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
}

button:hover {
    background: #2563eb;
    transform: translateY(-2px);
}

/* ==== RESULTS TABLE ==== */
.results-card h3 {
    text-align: center;
    margin-bottom: 15px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
}

th,
td {
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

th {
    background: rgba(0, 0, 0, 0.2);
}

#clearHistoryBtn {
    width: 100%;
    background: #ef4444;
}

#clearHistoryBtn:hover {
    background: #dc2626;
}

/* Correct/Incorrect highlighting */
.correct {
    color: #4ade80;
}

.incorrect {
    color: #f87171;
    text-decoration: underline;
}

/* Responsive: Stack on mobile */
@media (max-width: 768px) {
    .dashboard {
        grid-template-columns: 1fr;
    }
}

/* ==== MULTIPLAYER ==== */
.multiplayer-card {
    text-align: center;
    margin-bottom: 20px;
}

.multiplayer-card h3 {
    margin-bottom: 15px;
    color: #4ade80;
}

#lobbyControls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.join-container {
    display: flex;
    gap: 10px;
}

#roomCodeInput {
    padding: 10px;
    border-radius: 8px;
    border: none;
    background: #374151;
    color: white;
    font-family: 'Roboto Mono', monospace;
    text-transform: uppercase;
}

.code-display {
    font-family: 'Roboto Mono', monospace;
    font-size: 1.5rem;
    font-weight: bold;
    color: #facc15;
    background: rgba(0, 0, 0, 0.3);
    padding: 5px 10px;
    border-radius: 5px;
    margin: 0 10px;
}

#roomStatus p {
    margin: 10px 0;
    font-size: 1.1rem;
}

/* Utility */
.hidden {
    display: none !important;
}

/* Opponent Stats Card */
#opponentStats {
    border-color: #facc15;
}

#opponentStats h3 {
    color: #facc15;
    margin-bottom: 10px;
    text-align: center;
}

/* ==== MODAL ==== */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: #1f2937;
    padding: 30px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.winner-text {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 20px;
    color: #facc15;
}

.comparison-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 25px;
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 12px;
}

.player-result {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.big-stat {
    font-size: 2rem;
    font-weight: bold;
    color: #4ade80;
}

.sub-stat {
    font-size: 0.9rem;
    opacity: 0.7;
}

.vs-divider {
    font-weight: bold;
    opacity: 0.5;
    font-size: 1.2rem;
}
