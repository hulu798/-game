// 游戏常量
const GRID_SIZE = 20; // 网格大小
const INITIAL_SNAKE_LENGTH = 5; // 初始蛇的长度
const CANVAS_SIZE = 400; // 画布大小
const FPS = 60; // 帧率

// 游戏变量
let canvas, ctx;
let snake = []; // 蛇的身体，每个元素是一个{x, y}对象
let food = {}; // 食物的位置
let direction = "right"; // 蛇的移动方向
let nextDirection = "right"; // 下一次移动的方向
let score = 0; // 当前分数
let highScore = localStorage.getItem("snakeHighScore") || 0; // 最高分数
let gameLoop; // 游戏循环
let gameSpeed; // 游戏速度
let gameStarted = false; // 游戏是否已开始
let gamePaused = false; // 游戏是否暂停
let gridVisible = true; // 是否显示网格

// DOM元素
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const difficultyLevel = document.getElementById("difficultyLevel");
const gameOverModal = document.getElementById("gameOverModal");
const finalScoreElement = document.getElementById("finalScore");
const restartButton = document.getElementById("restartButton");
const upButton = document.getElementById("upButton");
const downButton = document.getElementById("downButton");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");

// 初始化
window.onload = function () {
    canvas = document.getElementById("gameCanvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx = canvas.getContext("2d");

    highScoreElement.textContent = highScore;

    startButton.addEventListener("click", startGame);
    pauseButton.addEventListener("click", togglePause);
    restartButton.addEventListener("click", restartGame);

    // 键盘控制
    document.addEventListener("keydown", handleKeyPress);

    // 移动端控制
    upButton.addEventListener("click", () => changeDirection("up"));
    downButton.addEventListener("click", () => changeDirection("down"));
    leftButton.addEventListener("click", () => changeDirection("left"));
    rightButton.addEventListener("click", () => changeDirection("right"));

    // 难度更改
    difficultyLevel.addEventListener("change", updateDifficulty);

    // 初始渲染
    drawGrid();
    drawEmptyGame();
};

// 开始游戏
function startGame() {
    if (gameStarted) return;

    resetGame();
    gameStarted = true;
    startButton.textContent = "重新开始";

    // 创建初始蛇
    const centerX = Math.floor(CANVAS_SIZE / GRID_SIZE / 2);
    const centerY = Math.floor(CANVAS_SIZE / GRID_SIZE / 2);

    snake = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        snake.push({ x: centerX - i, y: centerY });
    }

    // 生成第一个食物
    generateFood();

    // 设置游戏速度
    updateDifficulty();

    // 开始游戏循环
    startGameLoop();
}

// 重置游戏
function resetGame() {
    score = 0;
    direction = "right";
    nextDirection = "right";
    scoreElement.textContent = "0";
    clearInterval(gameLoop);
    hideGameOverModal();
}

// 重新开始游戏
function restartGame() {
    hideGameOverModal();
    startGame();
}

// 暂停/继续游戏
function togglePause() {
    if (!gameStarted) return;

    gamePaused = !gamePaused;
    pauseButton.textContent = gamePaused ? "继续" : "暂停";

    if (gamePaused) {
        clearInterval(gameLoop);
    } else {
        startGameLoop();
    }
}

// 开始游戏循环
function startGameLoop() {
    gameLoop = setInterval(function () {
        update();
        render();
    }, 1000 / gameSpeed);
}

// 更新游戏难度
function updateDifficulty() {
    const difficulty = difficultyLevel.value;

    switch (difficulty) {
        case "easy":
            gameSpeed = 8;
            break;
        case "medium":
            gameSpeed = 12;
            break;
        case "hard":
            gameSpeed = 17;
            break;
        default:
            gameSpeed = 12;
    }

    if (gameStarted && !gamePaused) {
        clearInterval(gameLoop);
        startGameLoop();
    }
}

// 更新游戏状态
function update() {
    // 更新蛇的方向
    direction = nextDirection;

    // 确定蛇头的下一个位置
    const head = { ...snake[0] };

    switch (direction) {
        case "up":
            head.y--;
            break;
        case "down":
            head.y++;
            break;
        case "left":
            head.x--;
            break;
        case "right":
            head.x++;
            break;
    }

    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }

    // 添加新头部
    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += getDifficultyMultiplier();
        scoreElement.textContent = score;

        // 更新最高分
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore);
            highScoreElement.textContent = highScore;
        }

        // 生成新食物
        generateFood();
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
}

// 获取难度分数倍率
function getDifficultyMultiplier() {
    const difficulty = difficultyLevel.value;

    switch (difficulty) {
        case "easy":
            return 1;
        case "medium":
            return 2;
        case "hard":
            return 3;
        default:
            return 1;
    }
}

// 检查碰撞
function checkCollision(position) {
    // 碰到边界
    if (
        position.x < 0 ||
        position.y < 0 ||
        position.x >= CANVAS_SIZE / GRID_SIZE ||
        position.y >= CANVAS_SIZE / GRID_SIZE
    ) {
        return true;
    }

    // 碰到自己的身体
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === position.x && snake[i].y === position.y) {
            return true;
        }
    }

    return false;
}

// 生成食物
function generateFood() {
    const gridWidth = CANVAS_SIZE / GRID_SIZE;
    const gridHeight = CANVAS_SIZE / GRID_SIZE;

    // 找到所有空位置
    let emptySpaces = [];
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            // 检查该位置是否已被蛇占用
            let isOccupied = false;
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === x && snake[i].y === y) {
                    isOccupied = true;
                    break;
                }
            }

            if (!isOccupied) {
                emptySpaces.push({ x, y });
            }
        }
    }

    // 随机选择一个空位置
    if (emptySpaces.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptySpaces.length);
        food = emptySpaces[randomIndex];
    }
}

// 处理键盘输入
function handleKeyPress(event) {
    const key = event.key.toLowerCase();

    // 开始/暂停游戏（空格键）
    if (key === " ") {
        if (!gameStarted) {
            startGame();
        } else {
            togglePause();
        }
        event.preventDefault();
        return;
    }

    // 如果游戏未开始或已暂停，不处理方向键
    if (!gameStarted || gamePaused) return;

    // 方向控制
    if ((key === "arrowup" || key === "w") && direction !== "down") {
        changeDirection("up");
    } else if ((key === "arrowdown" || key === "s") && direction !== "up") {
        changeDirection("down");
    } else if ((key === "arrowleft" || key === "a") && direction !== "right") {
        changeDirection("left");
    } else if ((key === "arrowright" || key === "d") && direction !== "left") {
        changeDirection("right");
    }
}

// 改变方向
function changeDirection(newDirection) {
    // 防止直接反向移动
    if (
        (newDirection === "up" && direction !== "down") ||
        (newDirection === "down" && direction !== "up") ||
        (newDirection === "left" && direction !== "right") ||
        (newDirection === "right" && direction !== "left")
    ) {
        nextDirection = newDirection;
    }
}

// 渲染游戏
function render() {
    // 清除画布
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 绘制网格
    if (gridVisible) {
        drawGrid();
    }

    // 绘制食物
    drawFood();

    // 绘制蛇
    drawSnake();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;

    // 绘制垂直线
    for (let x = 0; x <= CANVAS_SIZE; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_SIZE);
        ctx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= CANVAS_SIZE; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_SIZE, y);
        ctx.stroke();
    }
}

// 绘制空游戏
function drawEmptyGame() {
    ctx.fillStyle = "#95a5a6";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("按开始游戏按钮开始", CANVAS_SIZE / 2, CANVAS_SIZE / 2);
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        // 使用渐变色表示蛇身
        const gradientValue = index / snake.length;

        if (index === 0) {
            // 蛇头
            ctx.fillStyle = "#c0392b";
        } else {
            // 蛇身渐变
            ctx.fillStyle = `rgb(46, ${Math.floor(204 - 100 * gradientValue)}, 113)`;
        }

        // 绘制蛇的每一段
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );

        // 给每一段添加边框
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );

        // 为蛇头添加眼睛
        if (index === 0) {
            drawSnakeEyes(segment);
        }
    });
}

// 绘制蛇眼睛
function drawSnakeEyes(head) {
    ctx.fillStyle = "white";

    const eyeSize = GRID_SIZE / 5;
    const eyeOffset = GRID_SIZE / 4;

    let leftEyeX, leftEyeY, rightEyeX, rightEyeY;

    switch (direction) {
        case "up":
            leftEyeX = head.x * GRID_SIZE + eyeOffset;
            leftEyeY = head.y * GRID_SIZE + eyeOffset;
            rightEyeX = head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
            rightEyeY = head.y * GRID_SIZE + eyeOffset;
            break;
        case "down":
            leftEyeX = head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
            leftEyeY = head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
            rightEyeX = head.x * GRID_SIZE + eyeOffset;
            rightEyeY = head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
            break;
        case "left":
            leftEyeX = head.x * GRID_SIZE + eyeOffset;
            leftEyeY = head.y * GRID_SIZE + eyeOffset;
            rightEyeX = head.x * GRID_SIZE + eyeOffset;
            rightEyeY = head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
            break;
        case "right":
            leftEyeX = head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
            leftEyeY = head.y * GRID_SIZE + eyeOffset;
            rightEyeX = head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
            rightEyeY = head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
            break;
    }

    // 眼白
    ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
    ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);

    // 眼球
    ctx.fillStyle = "black";
    const pupilSize = eyeSize / 2;
    ctx.fillRect(leftEyeX + pupilSize / 2, leftEyeY + pupilSize / 2, pupilSize, pupilSize);
    ctx.fillRect(rightEyeX + pupilSize / 2, rightEyeY + pupilSize / 2, pupilSize, pupilSize);
}

// 绘制食物
function drawFood() {
    // 创建食物渐变色
    const gradient = ctx.createRadialGradient(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        1,
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE - 2
    );
    gradient.addColorStop(0, "#e74c3c");
    gradient.addColorStop(1, "#c0392b");

    ctx.fillStyle = gradient;

    // 绘制一个圆形食物
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // 添加高光
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 3,
        food.y * GRID_SIZE + GRID_SIZE / 3,
        GRID_SIZE / 6,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    startButton.textContent = "开始游戏";
    finalScoreElement.textContent = score;
    showGameOverModal();
}

// 显示游戏结束模态框
function showGameOverModal() {
    gameOverModal.style.display = "block";
}

// 隐藏游戏结束模态框
function hideGameOverModal() {
    gameOverModal.style.display = "none";
} 