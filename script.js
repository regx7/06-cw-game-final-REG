// --- 1. DOM ELEMENTS ---
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('time');
const livesElement = document.getElementById('lives');
const gameContainer = document.getElementById('game-container');
const colorKey = document.querySelector('.color-key');
const difficultyButtons = document.querySelector('.difficulty-buttons');

// Buttons
const easyBtn = document.getElementById('btn-easy');
const normalBtn = document.getElementById('btn-normal');
const hardBtn = document.getElementById('btn-hard');
const playAgainBtn = document.getElementById('play-again-btn');
const winPlayAgainBtn = document.getElementById('win-play-again-btn');

// Screens
const gameOverScreen = document.getElementById('game-over-screen');
const winScreen = document.getElementById('win-screen');
const finalScoreElement = document.getElementById('final-score');
const winFinalScoreElement = document.getElementById('win-final-score');

// Audio
const clickSound = document.getElementById('audio-click');
const winSound = document.getElementById('audio-win');

// --- 2. GAME STATE VARIABLES ---
let score, timer, lives;
let gameRunning = false;
let gameInterval, dropInterval;
let currentFallSpeed;

// --- 3. EVENT LISTENERS ---
easyBtn.addEventListener('click', () => startGame('easy'));
normalBtn.addEventListener('click', () => startGame('normal'));
hardBtn.addEventListener('click', () => startGame('hard'));

playAgainBtn.addEventListener('click', showDifficultyButtons);
winPlayAgainBtn.addEventListener('click', showDifficultyButtons);

// --- 4. GAME LOGIC FUNCTIONS ---

function startGame(difficulty) {
    if (gameRunning) return;
    gameRunning = true;
    
    score = 0;
    lives = 3;

    // Set difficulty parameters
    if (difficulty === 'easy') {
        timer = 45;
        currentFallSpeed = 5; // 5 second fall
        dropInterval = setInterval(createDrop, 1500); // Slower spawn
    } else if (difficulty === 'normal') {
        timer = 30;
        currentFallSpeed = 4; // 4 second fall
        dropInterval = setInterval(createDrop, 1000); // Normal spawn
    } else { // hard
        timer = 20;
        currentFallSpeed = 2.5; // 2.5 second fall
        dropInterval = setInterval(createDrop, 700); // Faster spawn
    }

    // Update UI
    scoreElement.textContent = score;
    timerElement.textContent = timer;
    livesElement.textContent = lives;

    colorKey.style.display = 'flex';
    gameOverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    difficultyButtons.style.display = 'none';

    // Start game loops
    gameInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timer--;
    timerElement.textContent = timer;
    if (timer <= 0) endGame();
}

function createDrop() {
    if (!gameRunning) return; 

    const drop = document.createElement('div');
    const dropType = Math.random();

    if (dropType < 0.15) { // 15% Bad
        drop.className = 'water-drop drop-brown';
        drop.dataset.type = 'bad';
    } else if (dropType < 0.40) { // 25% Good (10pts)
        drop.className = 'water-drop drop-light-blue';
        drop.dataset.type = 'good';
        drop.dataset.points = 10;
    } else { // 60% Good (5pts)
        drop.className = 'water-drop drop-dark-blue';
        drop.dataset.type = 'good';
        drop.dataset.points = 5;
    }

    drop.style.left = Math.random() * (gameContainer.offsetWidth - 50) + 'px';
    drop.style.animationDuration = currentFallSpeed + 's';
    
    drop.addEventListener('click', function() {
        if (drop.dataset.type === 'good') {
            score += parseInt(drop.dataset.points);
            scoreElement.textContent = score;
            playSound(clickSound); // Play click sound
            
            if (score >= 100) endGame();
        } else {
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) endGame();
        }
        drop.remove();
    });

    gameContainer.appendChild(drop);
    
    drop.addEventListener('animationend', function() {
        if (this.parentNode) this.remove();
    });
}

function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(dropInterval);
    clearGameContainer();
    colorKey.style.display = 'none';

    if (score >= 100) {
        winFinalScoreElement.textContent = score;
        winScreen.classList.remove('hidden');
        playSound(winSound); // Play win sound
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        }
    } else {
        finalScoreElement.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }
}

function showDifficultyButtons() {
    gameOverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    difficultyButtons.style.display = 'flex';
}

function clearGameContainer() {
    const drops = gameContainer.querySelectorAll('.water-drop');
    drops.forEach(drop => drop.remove());
}

// Robust audio play function
function playSound(audioElement) {
    if (audioElement) {
        audioElement.load(); // ADD THIS LINE to hard-reset the audio
        audioElement.currentTime = 0;
        audioElement.play().catch(error => {
            console.error("Audio play failed: ", error);
        });
    }
}