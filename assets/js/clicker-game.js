// game state
let score = 0;
let timeLeft = 10;
let isGameActive = false;
let timerInterval = null;
let highScore = 0;

// dom elements
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const highScoreDisplay = document.getElementById("high-score");
const gameStatus = document.getElementById("game-status");
const clickBtn = document.getElementById("click-button");
const startBtn = document.getElementById("start-button");
const resetBtn = document.getElementById("reset-button");
const resultModal = document.getElementById("result-modal");
const finalScoreDisplay = document.getElementById("final-score");
const newRecordDisplay = document.getElementById("new-record");
const playAgainBtn = document.getElementById("play-again");

// setup event listener
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    clickBtn.addEventListener('click', hadleClick);
    resetBtn.addEventListener('click', resetHighScore);
    playAgainBtn.addEventListener('click', resetGame);
}

// update display
function updateDisplay() {
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
}

// start the game
function startGame() {
    score = 0;
    timeLeft = 10;
    isGameActive = true;

    updateDisplay();
    clickBtn.disabled = false;
    startBtn.disabled = true;

    gameStatus.innerHTML = '<p>Click as fast as you can!</p>';

    // start timer
    timerInterval = setInterval(updateTimer, 1000)
}

// handle click button
function hadleClick() {
    if(!isGameActive) return;

    score++;
    scoreDisplay.textContent = score;

    // add click animation
    clickBtn.classList.add('clicked');
    setTimeout(() => {
        clickBtn.classList.remove('clicked');
    }, 100);
}

// update timer
function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if(timeLeft <= 0) {
        endGame();
    }
}

// end the game
function endGame() {
    isGameActive = false;
    clearInterval(timerInterval);
    clickBtn.disabled = true;
    startBtn.disabled = false;

    // check highscore
    let isnewRecord = false;
    if(score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        saveHighScore();
        isnewRecord = true;
    }

    // show result modal
    showResults(isnewRecord);
}

// load highScore form local storage
function loadHighScore() {
    const savedHighScore = localStorage.getItem('clickerHighScore');
    if(savedHighScore) {
        highScore = parseInt(savedHighScore);
        highScoreDisplay.textContent = highScore;
    }
}

// save highScore
function saveHighScore() {
    localStorage.setItem('clickerHighScore', highScore);
}

// show result modal
function showResults(isnewRecord) {
    finalScoreDisplay.textContent = score;

    if(isnewRecord && score > 0) {
        newRecordDisplay.classList.remove('hidden');
    } else {
        newRecordDisplay.classList.add('hidden');
    }

    resultModal.classList.remove('hidden');
}

// reset for another game
function resetGame() {
    resultModal.classList.add('hidden');
    score = 0;
    timeLeft = 10;
    updateDisplay();
    gameStatus.innerHTML = '<p>Click "Start Game" to begin!</p>';
    startGame();
}

// reset high score
function resetHighScore() {
    if(confirm('Are you sure you want to reset your high score?')) {
        highScore = 0;
        highScoreDisplay.textContent = highScore;
        localStorage.removeItem('clickerHighScore');
        alert('High score has been reset!');
    }
}

// initialisasi game
function init() {
    loadHighScore();
    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', init)