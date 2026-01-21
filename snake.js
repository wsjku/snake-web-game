const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreList = document.getElementById('score-list');
const restartBtn = document.getElementById('restart-btn');
const gameMessage = document.getElementById('game-message');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake, direction, nextDirection, lastDirection, food, gameOver, score, gameInterval, speed;
let scoreHistory = [];
let gameState = 'ready'; // 'ready', 'playing', 'over'
let startTimeout = null;

function initGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    lastDirection = { x: 1, y: 0 };
    food = { x: 15, y: 15 };
    gameOver = false;
    score = 0;
    speed = 200;
    gameState = 'ready';
    clearInterval(gameInterval);
    draw();
    showMessage('Ready');
}

function showMessage(msg, duration) {
    gameMessage.textContent = msg;
    gameMessage.style.display = 'block';
    if (duration) {
        clearTimeout(startTimeout);
        startTimeout = setTimeout(() => {
            gameMessage.style.display = 'none';
        }, duration);
    }
}

function hideMessage() {
    gameMessage.style.display = 'none';
}

function drawTile(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * gridSize, y * gridSize, gridSize - 2, gridSize - 2);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.forEach((segment, idx) => {
        drawTile(segment.x, segment.y, idx === 0 ? '#0f0' : '#fff');
    });
    drawTile(food.x, food.y, '#f00');
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText('Score: ' + score, 10, 390);
}

function update() {
    if (gameOver || gameState !== 'playing') return;
    direction = { ...nextDirection };
    lastDirection = { ...direction };

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            endGame();
            return;
        }
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
        let newSpeed = Math.max(60, 200 - score * 10);
        if (newSpeed !== speed) {
            speed = newSpeed;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, speed);
        }
    } else {
        snake.pop();
    }
}

function placeFood() {
    let newFood;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
            break;
        }
    }
    food = newFood;
}

function endGame() {
    gameOver = true;
    gameState = 'over';
    clearInterval(gameInterval);
    scoreHistory.unshift(score);
    updateScoreboard();
    setTimeout(() => {
        alert('Game Over! Score: ' + score);
    }, 100);
}

function updateScoreboard() {
    scoreList.innerHTML = '';
    scoreHistory.slice(0, 10).forEach((s, idx) => {
        const li = document.createElement('li');
        li.textContent = `#${idx + 1}: ${s}`;
        scoreList.appendChild(li);
    });
}

// 방향키 입력 시, 역방향만 막고, 한 프레임에 한 번만 반영
document.addEventListener('keydown', e => {
    // 게임 준비상태(ready)에서 방향키 누르면 게임 시작
    if (gameState === 'ready' && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        gameState = 'playing';
        showMessage('Start!', 600);
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, speed);
    }
    if (gameState !== 'playing') return;

    switch (e.key) {
        case 'ArrowUp':
            if (lastDirection.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (lastDirection.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (lastDirection.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (lastDirection.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
    }
});

function gameLoop() {
    update();
    draw();
}

function restartGame() {
    clearInterval(gameInterval);
    initGame();
    // Restart 버튼에서 포커스 제거하여 방향키 입력이 바로 canvas/body로 가게 함
    restartBtn.blur();
}

restartBtn.addEventListener('click', restartGame);

initGame();
