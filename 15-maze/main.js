const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 35;
const cols = 20;
const rows = 20;

// Set fixed resolution but CSS will scale it
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let playerX = 1;
let playerY = 0;
let moves = 0;
let attempts = 0;
let startTime = null;
let timerInterval = null;
let mazeCompleted = false;

// Define the maze (1 = wall, 0 = path)
const maze = [
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1]
];

const exitX = 18;
const exitY = 19;

function drawMaze() {
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x] === 1) {
                // Wall - Modern Black
                ctx.fillStyle = '#000000';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            } else {
                // Path - Clean White with subtle grid
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                ctx.strokeStyle = '#f0f0f0';
                ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    // Draw start indicator (Subtle)
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('START', 1 * cellSize + cellSize / 2, 0 * cellSize + cellSize / 2 + 4);

    // Draw exit (Inverted)
    ctx.fillStyle = '#000';
    ctx.fillRect(exitX * cellSize + 2, exitY * cellSize + 2, cellSize - 4, cellSize - 4);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Inter';
    ctx.fillText('EXIT', exitX * cellSize + cellSize / 2, exitY * cellSize + cellSize / 2 + 4);

    // Draw player (A distinct white circle with black border or vice versa)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
        playerX * cellSize + cellSize / 2,
        playerY * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Pulse effect for player
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
        playerX * cellSize + cellSize / 2,
        playerY * cellSize + cellSize / 2,
        cellSize / 2.5,
        0,
        Math.PI * 2
    );
    ctx.stroke();
}

function canMove(x, y) {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return false;
    return maze[y][x] === 0;
}

function movePlayer(dx, dy) {
    if (mazeCompleted) return;

    const newX = playerX + dx;
    const newY = playerY + dy;

    if (canMove(newX, newY)) {
        playerX = newX;
        playerY = newY;
        moves++;
        document.getElementById('moves').textContent = moves;

        // Check if reached exit
        if (playerX === exitX && playerY === exitY) {
            completeMaze();
        }

        drawMaze();
    }
}

function completeMaze() {
    mazeCompleted = true;
    clearInterval(timerInterval);

    // Unlock login form
    document.getElementById('loginForm').classList.add('unlocked');

    // Celebrate
    createConfetti();

    // Focus on username field
    setTimeout(() => {
        document.getElementById('username').focus();
    }, 500);
}

function createConfetti() {
    const celebration = document.getElementById('celebration');
    // For B&W theme, use shades of gray and black/white
    const colors = ['#000000', '#ffffff', '#888888', '#cccccc'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            celebration.appendChild(confetti);

            let pos = -10;
            const drift = (Math.random() - 0.5) * 5;
            let left = parseFloat(confetti.style.left);

            const interval = setInterval(() => {
                pos += 5;
                left += drift;
                confetti.style.top = pos + 'px';
                confetti.style.left = left + 'px';

                if (pos > window.innerHeight) {
                    clearInterval(interval);
                    confetti.remove();
                }
            }, 20);
        }, i * 30);
    }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function resetMaze() {
    playerX = 1;
    playerY = 0;
    moves = 0;
    attempts++;
    mazeCompleted = false;
    document.getElementById('moves').textContent = '0';
    document.getElementById('attempts').textContent = attempts;
    drawMaze();

    if (timerInterval) {
        clearInterval(timerInterval);
    }
    startTimer();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (mazeCompleted) return;

    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePlayer(1, 0);
            break;
        case 'r':
        case 'R':
            e.preventDefault();
            resetMaze();
            break;
    }
});

// Form submission
document.getElementById('loginFormElement').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('ACCESS GRANTED\n\nWelcome to the Nexus Security Systems.');
});

// Initialize
drawMaze();
resetMaze();