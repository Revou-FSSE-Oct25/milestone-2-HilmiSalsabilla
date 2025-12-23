// canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// game state
let score = 0;
let lives = 3;
let highScore = 0;
let isGameActive = false;
let isPaused = false;
let gameLoopId = null;

// player object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 8,
    moveLeft: false,
    moveRight: false
};

// falling object arrya
let fallingObjects = [];
let objectSpeed = 2;
let spawnRate = 60;     // frame between spawns
let frameCount = 0;
let lastDifficultyScore = 0;

// dom elemnets
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const highScoreDisplay = document.getElementById('high-score');
const gameStatus = document.getElementById('game-status');
const startBtn = document.getElementById('start-button');
const pauseBtn = document.getElementById('pause-button');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreDisplay = document.getElementById('final-score');
const newRecordDisplay = document.getElementById('new-record');
const playAgainBtn = document.getElementById('play-again');

// setup addeventlisteners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    playAgainBtn.addEventListener('click', resetGame);

    // keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // close modal
    gameOverModal.addEventListener('click', (e) => {
        if(e.target === gameOverModal) {
            closeModal();
        }
    });

    // close modal with esc
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && !gameOverModal.classList.add('hidden')) {
            closeModal();
        }
    });
}

// hendle keydown
function handleKeyDown(e) {
    if(!isGameActive || isPaused) return;

    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            player.moveLeft = true;
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            player.moveRight = true;
            e.preventDefault();
            break;
    }
}

// hanlde keyup
function handleKeyUp(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            player.moveLeft = false;
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            player.moveRight = false;
            e.preventDefault();
            break;
    }
}

// start game
function startGame() {
    cancelAnimationFrame(gameLoopId);

    score = 0;
    lives = 3;
    isGameActive = true;
    isPaused = false;

    fallingObjects = [];
    objectSpeed = 2;
    spawnRate = 60;
    frameCount = 0;
    lastDifficultyScore = 0;

    player.x = canvas.width / 2 - 25;
    player.moveLeft = false;
    player.moveRight = false;

    updateDisplay();
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
    gameStatus.textContent = '';

    gameLoopId = requestAnimationFrame(update);
}

// pause game
function togglePause() {
    if(!isGameActive) return;

    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';

    if(!isPaused) {
        player.moveLeft = false;
        player.moveRight = false;
        cancelAnimationFrame(gameLoopId);
    } else {
        gameLoopId = requestAnimationFrame(update);
    }
}

// game loop update
function update() {
    if(!isGameActive || isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // update
    updatePlayer();
    spawnObjects();
    updateObjects();
    drawPlayer();
    checkCollisions();
    updateDifficulty();

    gameLoopId = requestAnimationFrame(update);
}

// update player position
function updatePlayer() {
    if(player.moveLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if(player.moveRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

// draw player
function drawPlayer() {
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = '#FFF';
    ctx.fillRect(player.x + 15, player.y + 15, 8, 8);
    ctx.fillRect(player.x + 27, player.y + 15, 8, 8);
}

// spawn fall object
function spawnObjects() {
    frameCount++;
    if(frameCount < spawnRate) return;

    frameCount = 0;

    const obj = {
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: objectSpeed,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };

    fallingObjects.push(obj);
}

// update fall object
function updateObjects() {
    for(let i = fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];
        obj.y += obj.speed;

        // draw object
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

        // remove if off screen and add score
        if(obj.y > canvas.height) {
            fallingObjects.splice(i, 1);
            score++;
            scoreDisplay.textContent = score;
        }
    }
}

// check collisions
function checkCollisions() {
    for(let i =fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];

        if( 
            obj.x < player.x + player.width &&
            obj.x + obj.width > player.x &&
            obj.y < player.y + player.height &&
            obj.y + obj.height > player.y
        ) {
            // detect collisions
            fallingObjects.splice(i, 1);
            lives--;
            livesDisplay.textContent = lives;

            // flash effect
            canvas.style.border = '3px solid red';
            setTimeout(() => {
                canvas.style.border = '3px solid var(--color-medium)';
            }, 200);

            if(lives <= 0) {
                endGame();
                return;
            }
        }
    }
}

// update difficullity
function updateDifficulty() {
    if(score > 0 && score % 10 === 0 && score != lastDifficultyScore) {
        objectSpeed = Math.min(objectSpeed + 0.5, 8);
        spawnRate = Math.max(spawnRate - 5, 20);
        lastDifficultyScore = score;
    }
}


// endgame
function endGame() {
    isGameActive = false;
    cancelAnimationFrame(gameLoopId);

    startBtn.disabled = false;
    pauseBtn.disabled = true;

    // check for the new record highscore
    let isNewRecord = false;
    if(score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        saveHighScore();
        isNewRecord = true;
    }

    showGameOver(isNewRecord);
}

// show game over modal
function showGameOver(isNewRecord) {
    finalScoreDisplay.textContent = score;

    newRecordDisplay.classList.toggle(
        'hidden',
        !(isNewRecord && score > 0)
    );

    gameOverModal.classList.remove('hidden');
    gameOverModal.setAttribute('tabindex', '-1');
    gameOverModal.focus();
}

// load highscore
function loadHighScore() {
    try {
        const saved = localStorage.getItem('dodgeHighScore');
        if(saved) {
            highScore = parseInt(saved);
            highScoreDisplay.textContent = highScore;
        }
    } catch (error) {
        console.error('Error loading high score:', error)
    }
}

// save highscore
function saveHighScore() {
    try {
        localStorage.setItem('dodgeHighScore', highScore);
    } catch (error) {
        console.error('Error saving high score:', error)
    }
}

// close modal
function closeModal() {
    gameOverModal.classList.add('hidden');
    startBtn.focus();
}

// reset game
function resetGame() {
    closeModal();
    drawStartScreen();
    startGame();
}

// draw start screen
function drawStartScreen() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press Start to Play', canvas.width / 2, canvas.height / 2);
}

// update display
function updateDisplay() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
}

// initializition
function init() {
    loadHighScore();
    setupEventListeners();
    drawStartScreen();
}

document.addEventListener('DOMContentLoaded', init);