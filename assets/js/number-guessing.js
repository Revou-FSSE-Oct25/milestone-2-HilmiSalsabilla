// game state
let secretNumber = 0;
let attemptsLeft = 10;
let totalAttempts = 10;
let guessHistory = [];
let bestScore = null;
let minRange = 1;
let maxRange = 100;

// dom elements
const attemptsDisplay = document.getElementById('attempts');
const rangeDisplay = document.getElementById('range');
const bestScoreDisplay = document.getElementById('best-score');
const guessStatus = document.getElementById('guess-status');
const guessForm = document.getElementById('guess-form');
const guessInput = document.getElementById('guess-input');
const hintMessage = document.getElementById('hint-message');
const guessList = document.getElementById('guess-list');
const newGameBtn = document.getElementById('new-game');
const resultModal = document.getElementById('result-modal');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const secretNumberDisplay = document.getElementById('secret-number');
const attemptsUsedDisplay = document.getElementById('attempts-used');
const newRecordDisplay = document.getElementById('new-record');
const playAgainBtn = document.getElementById('play-again');

// setup event listeners
function setupEventListeners() {
    guessForm.addEventListener('submit', handleGuess);
    newGameBtn.addEventListener('click', startNewGame);
    playAgainBtn.addEventListener('click', () => {
        resultModal.classList.add('hidden');
        startNewGame();
    });
    
    // close modal
    resultModal.addEventListener('click', (e) => {
        if(e.target === resultModal) {
            closeModal();
        }
    });

    // close modal with esc
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && !resultModal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// start new game
function startNewGame() {
    secretNumber = Math.floor(Math.random() * 100) + 1;
    attemptsLeft = totalAttempts;
    guessHistory = [];
    minRange = 1;
    maxRange = 100;

    updateDisplay();
    clearHistory();

    guessInput.value = '';
    guessInput.disabled = false;
    guessInput.focus();

    guessStatus.innerHTML = '<p>Make your first guess!</p>';
    hintMessage.textContent = '';
}

// handle guess submittion
function handleGuess(e) {
    e.preventDefault();

    const guess = parseInt(guessInput.value);

    // validate input
    if(isNaN(guess) || guess < 1 || guess > 100) {
        showHint('Please enter a valid number between 1 and 100!', 'error');
        return
    }

    // check guess
    if(guessHistory.includes(guess)) {
        showHint('You already guessed that number!', 'warning')
    }
    
    // prosses
    processGuess(guess);

    // clear input
    guessInput.value = '';
    guessInput.focus();
}

// process guess
function processGuess(guess) {
    attemptsLeft--;
    guessHistory.push(guess);

    updateDisplay();
    addToHistory(guess);

    // check if correct
    if(guess === secretNumber) {
        winGame();
        return;
    }

    // check if out of attempt
    if(attemptsLeft === 0) {
        loseGame();
        return;
    }
    
    // provide hint
    if(guess < secretNumber) {
        showHint('Too Low! Try a higher number.', 'low');
        minRange = Math.max(minRange, guess + 1);
    } else {
        showHint('Too High! Try a lower number.', 'high');
        maxRange = Math.min(maxRange, guess - 1);
    }

    updateRange();
}

// hint message
function showHint(message, type) {
    hintMessage.textContent = message;
    hintMessage.className = `hint-message ${type}`;
}

// add guess to history
function addToHistory(guess) {
    const li = document.createElement('li');
    const attemptsUsed = totalAttempts - attemptsLeft;

    let indicator = '';
    if(guess < secretNumber) {
        indicator = '↑ (too low)';
        li.classList.add('low');
    } else if(guess > secretNumber) {
        indicator = '↓ (too high)';
        li.classList.add('high');
    }

    li.textContent = `Attempt ${attemptsUsed}: ${guess} ${indicator}`;
    guessList.appendChild(li);
}

// clear history
function clearHistory() {
    guessList.innerHTML = '';
}

// update range display
function updateDisplay() {
    rangeDisplay.textContent = `${minRange} - ${maxRange}`;
    attemptsDisplay.textContent = attemptsLeft;
}

// update range display
function updateRange() {
    rangeDisplay.textContent = `${minRange} - ${maxRange}`;
}

// wingame
function winGame() {
    guessInput.disabled = true;
    const attemptsUsed = totalAttempts - attemptsLeft;

    // check new best score
    let isNewRecord = false;
    if(bestScore === null || attemptsUsed < bestScore) {
        bestScore = attemptsUsed;
        bestScoreDisplay.textContent = `${bestScore} attempts`;
        saveBestScore();
        isNewRecord = true;
    }

    showResult(true, isNewRecord, attemptsUsed);
}

// saving best score
function saveBestScore() {
    try {
        localStorage.setItem('guessBestScore', bestScore);
    } catch (error) {
        console.error('Error saving best score:'. error)
    }   
}

// load best score
function loadBestScore() {
    try {
        const saved = localStorage.getItem('guessBestScore');
        if(saved) {
            bestScore = parseInt(saved);
            bestScoreDisplay.textContent = `${bestScore} attempts`;
        }
    } catch (error) {
        console.error('Error loading best score:', error)
    }
}

// lose game
function loseGame() {
    guessInput.disabled = true;
    showResult(false, false, totalAttempts);
}

// show result modal
function showResult(won, isNewRecord, attemptsUsed) {
    if(won) {
        resultTitle.textContent = 'Congratulations! 🎉';
        resultMessage.textContent = 'You guessed the number!';
    } else {
        resultTitle.textContent = 'Game Over! 😔';
        resultMessage.textContent = 'You ran out of attempts!';
    }

    secretNumberDisplay.textContent = secretNumber;
    attemptsUsedDisplay.textContent = attemptsUsed;

    if(isNewRecord && won) {
        newRecordDisplay.classList.remove('hidden');
    } else {
        newRecordDisplay.classList.add('hidden');
    }

    resultModal.classList.remove('hidden');
}

// closa modal
function closeModal() {
    resultModal.classList.add('hidden');
    guessInput.focus();
}

// initialisasi game
function init() {
    loadBestScore();
    setupEventListeners();
    startNewGame();
}

document.addEventListener('DOMContentLoaded', init);