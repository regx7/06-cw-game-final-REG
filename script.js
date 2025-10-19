// Game State Variables
let score;
let timer;
let lives;
let gameRunning = false;
let gameInterval;
let dropInterval;

// DOM Elements
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('time');
const livesElement = document.getElementById('lives');
const startBtn = document.getElementById('start-btn');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again-btn');
const winPlayAgainBtn = document.getElementById('win-play-again-btn');
const gameContainer = document.getElementById('game-container');

// Event Listeners
startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);
winPlayAgainBtn && winPlayAgainBtn.addEventListener('click', startGame);

// NEW FUNCTION: Clears all drops from the game board
function clearGameContainer() {
    // Only remove drop elements — don't clear static UI (like the jerry can)
    const drops = gameContainer.querySelectorAll('.water-drop');
    drops.forEach(d => d.remove());
}

function startGame() {
    if (gameRunning) {
        return;
    }
    gameRunning = true;

    // NEW: Clear any old drops before starting
    clearGameContainer();

    // 1. Reset game state
    score = 0;
    timer = 30;
    lives = 3;

    // 2. Update the display
    scoreElement.textContent = score;
    timerElement.textContent = timer;
    livesElement.textContent = lives;
    startBtn.style.display = 'none';
    gameOverScreen.classList.add('hidden');
    // Hide win screen if it was visible from a previous game
    const winScreen = document.getElementById('win-screen');
    if (winScreen) winScreen.classList.add('hidden');

    // 3. Start the game loops
    gameInterval = setInterval(updateTimer, 1000);
    dropInterval = setInterval(createDrop, 1000);
    // Ensure the color key is visible when the game starts
    const colorKey = document.querySelector('.color-key');
    if (colorKey) colorKey.style.display = 'flex';
}

function updateTimer() {
    timer--;
    timerElement.textContent = timer;

    if (timer <= 0) {
        endGame();
    }
}

function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(dropInterval);
    
    // NEW: Clear leftover drops when game ends
    clearGameContainer();

    finalScoreElement.textContent = score;
    // If score > 100, show win screen + confetti; otherwise show game over
    const winScreen = document.getElementById('win-screen');
    // Hide the color key when the game ends
    const colorKey = document.querySelector('.color-key');
    if (colorKey) colorKey.style.display = 'none';

    if (score >= 100 && typeof confetti === 'function' && winScreen) {
        const winScoreElement = document.getElementById('win-final-score');
        if (winScoreElement) winScoreElement.textContent = score;
        winScreen.classList.remove('hidden');

        // Trigger confetti
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
        });
    } else {
        gameOverScreen.classList.remove('hidden');
    }
}

function createDrop() {
    if (!gameRunning) return; // Stop creating drops if game has ended
    
    const drop = document.createElement('div');
    // Set drop type based on desired rarities:
    // - Dark Blue (good, +5 points): 60%
    // - Light Blue (good, +10 points): 25%
    // - Green (bad): 15%
    const r = Math.random();
    if (r < 0.60) {
        drop.className = 'water-drop drop-dark-blue';
        drop.dataset.type = 'good';
        drop.dataset.points = 5;
    } else if (r < 0.60 + 0.25) { // up to 0.85
        drop.className = 'water-drop drop-light-blue';
        drop.dataset.type = 'good';
        drop.dataset.points = 10;
    } else {
        drop.className = 'water-drop drop-brown';
        drop.dataset.type = 'bad';
    }

    drop.style.left = Math.random() * (gameContainer.offsetWidth - 50) + 'px';
    
    drop.addEventListener('click', function() {
        if (drop.dataset.type === 'good') {
            score += parseInt(drop.dataset.points);
            scoreElement.textContent = score;
        } else {
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) {
                endGame();
            }
        }
        drop.remove();
    });

    gameContainer.appendChild(drop);
    
    // When the falling animation completes, simply remove the drop.
    // Do NOT penalize the player here for missed good drops; penalization
    // only happens on click for bad drops (or wherever else logic applies).
    drop.addEventListener('animationend', function() {
        if (this.parentNode) {
            this.remove();
        }
    });
}