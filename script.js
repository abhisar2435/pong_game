const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 7;
const ballSpeed = 4;

let gameRunning = false;

// Player Paddle (Left)
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer Paddle (Right)
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: ballSpeed,
    dy: ballSpeed,
    speed: ballSpeed
};

// Scores
let playerScore = 0;
let computerScore = 0;

// Keyboard and Mouse Controls
const keys = {};
let mouseY = canvas.height / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
        if (gameRunning) {
            resetBall();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Game Functions
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ballSpeed * (Math.random() - 0.5);
}

function updatePlayerPaddle() {
    // Arrow keys control
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }

    // Mouse control
    if (mouseY - player.height / 2 > 0 && mouseY - player.height / 2 < canvas.height - player.height) {
        player.y = mouseY - player.height / 2;
    }
}

function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    
    // AI logic: follow the ball with some delay
    if (computerCenter < ball.y - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ball.y + 35) {
        computer.y -= computer.speed;
    }

    // Keep computer paddle in bounds
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Ball collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on where ball hits paddle
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        ball.dy = collidePoint * ball.speed;
    }

    // Computer paddle collision
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        // Add spin based on where ball hits paddle
        let collidePoint = ball.y - (computer.y + computer.height / 2);
        collidePoint = collidePoint / (computer.height / 2);
        ball.dy = collidePoint * ball.speed;
    }

    // Ball out of bounds (scoring)
    if (ball.x - ball.size < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }
    if (ball.x + ball.size > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

function drawPaddle(paddle) {
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'transparent';
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

function drawCenter() {
    ctx.strokeStyle = '#444';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGameStatus() {
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
    }
}

function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenter();

    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }

    // Draw game objects
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
    drawGameStatus();

    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();