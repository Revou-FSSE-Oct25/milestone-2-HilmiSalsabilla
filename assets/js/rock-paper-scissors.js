// game state
let playerScore = 0;
let computerScore = 0;
let roundNumber = 0;
let isGameActive = true;
const winningScore = 3;

// choice mapping
const choices = {
    rock: {emoji: '✊', beats: 'scissors'},
    paper: { emoji: '✋', beats: 'rock' },
    scissors: { emoji: '✌️', beats: 'paper' }
}

// dom elements
const playerScoreDisplay = document.getElementById('player-score');
const computerScoreDisplay = document.getElementById('computer-score');
const roundNumberDisplay = document.getElementById('round-number');
const playerChoiceDisplay = document.getElementById('player-choice-display');
const computerChoiceDisplay = document.getElementById('computer-choice-display');
const gameStatus = document.getElementById('game-status');
const roundResult = document.getElementById('round-result');
const choiceButtons = document.querySelectorAll('.choice-button');
const resetBtn = document.getElementById('reset-game');
const historyList = document.getElementById('history-list');
const victoryModal = document.getElementById('victory-modal');
const victoryTitle = document.getElementById('victory-title');
const victoryMessage = document.getElementById('victory-message');
const finalScore = document.getElementById('final-score');
const totalRounds = document.getElementById('total-rounds');
const playAgainBtn = document.getElementById('play-again');

function setupEventListeners() {
    choiceButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (isGameActive) {
                const playerChoice = button.dataset.choice;
                playRound(playerChoice);
            }
        });
    });
    
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', () => {
        resetGame();
    });

    // close modal
    victoryModal.addEventListener('click', (e) => {
        if(e.target === victoryModal) {
            closeModal()
        }
    });

    // close modal esc
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && !victoryModal.classList.add('hidden')) {
            closeModal()
        }
    })
}

// play a round
function playRound(playerChoice) {
    roundNumber++;

    // get computer choice
    const computerChoice = getComputerChoice();
    
    // display computer choice
    animateChoice(playerChoice, computerChoice);

    // determine choice
    setTimeout(() => {
        const result = determineWinner(playerChoice, computerChoice);
        displayResult(result, playerChoice, computerChoice);

        // check if the game is over
        if(playerScore === winningScore || computerScore === winningScore) {
            setTimeout(() => endGame(), 1500);
        }
    }, 1000);
}

// get random computer choice
function getComputerChoice() {
    const choiceArray = Object.keys(choices);
    const randomIndex = Math.floor(Math.random() * choiceArray.length);
    return choiceArray[randomIndex];
}

// animate choice display
function animateChoice(playerChoice, computerChoice) {
    // disable button when animated
    disableButtons();

    // show thinking animated
    playerChoiceDisplay.textContent = '🤔';
    computerChoiceDisplay.textContent = '🤔';
    gameStatus.innerHTML = '<p>Making choices...</p>';

    // show final choice
    setTimeout(() => {
        playerChoiceDisplay.textContent = choices[playerChoice].emoji;
        computerChoiceDisplay.textContent = choices[computerChoice].emoji;
        enableButtons();
    }, 500);
}

// determine winner
function determineWinner(player, computer) {
    if(player === computer) {
        return 'draw';
    }

    if(choices[player].beats === computer) {
        playerScore++;
        return 'win';
    } else {
        computerScore++;
        return 'lose';
    }
}

// display result
function displayResult(result, playerChoice, computerChoice) {
    let message = '';
    let statusMessage = '';

    switch(result) {
        case 'win':
            message = `🎉 You Win! ${choices[playerChoice].emoji} beats ${choices[computerChoice].emoji}`;
            statusMessage = '<p style="color: var(--color-medium-light);">You won this round!</p>';
            break;
        case 'lose':
            message = `😔 You Lose! ${choices[computerChoice].emoji} beats ${choices[playerChoice].emoji}`;
            statusMessage = '<p style="color: var(--color-accent);">Computer won this round!</p>';
            break;
        case 'draw':
            message = `🤝 Draw! Both chose ${choices[playerChoice].emoji}`;
            statusMessage = '<p style="color: #fbbf24;">It\'s a tie!</p>';
            break;
    }

    roundResult.textContent = message;
    gameStatus.innerHTML = statusMessage;

    // add to history
    addToHistory(result, playerChoice, computerChoice);

    // update display
    updateDisplay();
}

// add to history
function addToHistory(result, playerChoice, computerChoice) {
    const li = document.createElement('li');
    li.classList.add('history-item');

    let resultText = '';
    let resultClass = '';

    switch(result) {
        case 'win':
            resultText = 'Won';
            resultClass = 'win';
            break;
        case 'lose':
            resultText = 'Lost';
            resultClass = 'lose';
            break;
        case 'draw':
            resultText = 'Draw';
            resultClass = 'draw';
            break;
    }

    li.innerHTML = `
        <span class="round-number">Round ${roundNumber}:</span>
        <span class="choices">${choices[playerChoice].emoji} vs ${choices[computerChoice].emoji}</span>
        <span class="result ${resultClass}">${resultText}</span>
    `;

    historyList.insertBefore(li, historyList.firstChild);
}

// endgame
function endGame() {
    isGameActive = false;
    disableButtons();

    const playerWon = playerScore === winningScore;

    if(playerWon) {
        victoryTitle.textContent = '🎉 Victory! 🎉';
        victoryMessage.textContent = 'You won the match!';
    } else {
        victoryTitle.textContent = '😔 Defeat 😔';
        victoryMessage.textContent = 'Computer won the match!';
    }

    finalScore.textContent = `${playerScore} - ${computerScore}`;
    totalRounds.textContent = roundNumber;

    victoryModal.classList.remove('hidden');
    victoryModal.setAttribute('tabindex', '-1');
    victoryModal.focus();
}

// close modal
function closeModal() {
    victoryModal.classList.add('hidden');
    resetBtn.focus();
}

// reset game
function resetGame() {
    playerScore = 0;
    computerScore = 0;
    roundNumber = 0;
    isGameActive = true;

    playerChoiceDisplay.textContent = '❓';
    computerChoiceDisplay.textContent = '❓';
    roundResult.textContent = '';
    gameStatus.innerHTML = '<p>Choose your move!</p>';
    historyList.innerHTML = '';

    updateDisplay();
    enableButtons();
}

// update display
function updateDisplay() {
    playerScoreDisplay.textContent = playerScore;
    computerScoreDisplay.textContent = computerScore;
    roundNumberDisplay.textContent = roundNumber;
}

// disable btn
function disableButtons() {
    choiceButtons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.5';
    });
}

// enable btn
function enableButtons() {
    if(isGameActive) {
        choiceButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
        })
    }
}

// initialisati
function init() {
    setupEventListeners();
    updateDisplay();
}

document.addEventListener('DOMContentLoaded', init);