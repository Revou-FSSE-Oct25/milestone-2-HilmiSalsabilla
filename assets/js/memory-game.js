// game state
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isChecking = false;
let isGameStarted = false;
let bestScore = null;

// card symbols
const cardSymbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎸'];

// dom elements
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const bestScoreDisplay = document.getElementById('best-score');
const gameStatus = document.getElementById('game-status');
const cardGrid = document.getElementById('card-grid');
const startBtn = document.getElementById('start-button');
const restartBtn = document.getElementById('restart-button');
const victoryModal = document.getElementById('victory-modal');
const finalMovesDisplay = document.getElementById('final-moves');
const newRecordDisplay = document.getElementById('new-record');
const playAgainBtn = document.getElementById('play-again');

// setup eventlisteners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', () => {
        closeModal();
        resetGame();
    });

    // close modal
    victoryModal.addEventListener('click', (e) => {
        if(e.target === victoryModal) {
            closeModal();
        }
    });

    // close modal with esc
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && !victoryModal.classList.contains('hidden')) {
            closeModal();
        }
    })
}

// create card deck
function createDeck() {
    const deck = [];
    
    cardSymbols.forEach(symbol => {
        deck.push({
            symbol, id: Math.random()
        });
        deck.push({
            symbol, id: Math.random()
        });
    });

    return shuffleArray(deck);
}

// shuffle card deck
function shuffleArray(arr) {
    const shuffled = [...arr];

    for(let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

// start game
function startGame() {
    cards = createDeck();
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    isGameStarted = true;
    isChecking = false;

    updateDisplay();
    renderCards();

    startBtn.disabled = true;
    restartBtn.disabled = false;
    gameStatus.innerHTML = '<p>Find all matching pairs!</p>';
}

// render cards
function renderCards() {
    cardGrid.innerHTML = '';

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.index = index;
        cardElement.setAttribute('role', 'button');
        cardElement.setAttribute('tabindex', '0');
        cardElement.setAttribute('aria-label', `Card ${index + 1}`);

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        cardFront.textContent = '?';

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.textContent = card.symbol;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        cardElement.appendChild(cardInner);

        cardElement.addEventListener('click', () => {
            flipCard(index);
        });

        cardElement.addEventListener('keydown', (e) => {
            if(e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                flipCard(index);
            }
        });

        cardGrid.appendChild(cardElement);
    });
}

// flipcard
function flipCard(index) {
    if(!isGameStarted || isChecking) return;

    const cardElement = cardGrid.children[index];

    // dont flipped if already flipped or matched
    if(cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) {
        return;
    }

    // flip card
    cardElement.classList.add('flipped');
    flippedCards.push({
        index, symbol: cards[index].symbol
    });

    // check if 2 cards flipped
    if(flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

// check for matched
function checkMatch() {
    isChecking = true;
    const [card1, card2] = flippedCards;

    if(card1.symbol === card2.symbol) {
        // if match found
        setTimeout(() => {
            const el1 = cardGrid.children[card1.index];
            const el2 = cardGrid.children[card2.index];

            el1.classList.add('matched');
            el2.classList.add('matched');

            matchedPairs++;
            matchesDisplay.textContent = `${matchedPairs}/8`;

            flippedCards = [];
            isChecking = false;

            // check if game won
            if(matchedPairs === 8) {
                setTimeout(() => endGame(), 500);
            }
        }, 500);
    } else {
        // no match
        setTimeout(() => {
            const el1 = cardGrid.children[card1.index];
            const el2 = cardGrid.children[card2.index];

            el1.classList.remove('flipped');
            el2.classList.remove('flipped');

            flippedCards = [];
            isChecking = false;
        }, 1000)
    }
}

// load best score
function loadBestScore() {
    const saved = localStorage.getItem('memoryBestScore');
    if(saved) {
        bestScore = parseInt(saved);
        bestScoreDisplay.textContent = `${bestScore} moves`;
    }
}

// save best score
function saveBestScore() {
    localStorage.setItem('memoryBestScore', bestScore);
}

// endgame
function endGame() {
    isGameStarted = false;

    // check new best score
    let isNewRecord = false;
    if(bestScore === null || moves < bestScore) {
        bestScore = moves;
        bestScoreDisplay.textContent = `${bestScore} moves`;
        saveBestScore();
        isNewRecord = true;
    }

    showVictory(isNewRecord);
}

// show victorymodal
function showVictory(isNewRecord) {
    finalMovesDisplay.textContent = moves;

    if(isNewRecord) {
        newRecordDisplay.classList.remove('hidden');
    } else {
        newRecordDisplay.classList.add('hidden');
    }

    victoryModal.classList.remove('hidden');
    victoryModal.setAttribute('tabindex', '-1');
    victoryModal.focus();
}

// closemodal
function closeModal() {
    victoryModal.classList.add('hidden');
    startBtn.focus();
}

// reset game
function resetGame() {
    closeModal();
    startBtn.disabled = false;
    restartBtn.disabled = true;
    isGameStarted = false;

    cardGrid.innerHTML = '';
    gameStatus.innerHTML = '<p>Click "Start Game" to begin!</p>';

    moves = 0;
    matchedPairs = 0;

    updateDisplay();
    startGame();
}

function updateDisplay() {
    movesDisplay.textContent = moves;
    matchesDisplay.textContent = `${matchedPairs} moves`;
}

// initilization
function init() {
    loadBestScore();
    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', init);