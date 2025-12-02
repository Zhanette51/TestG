// ===================== НАСТРОЙКИ ИГРЫ =====================
const CONFIG = {
    player: {
        startX: 50,
        startY: 250,
        width: 40,
        height: 60,
        speed: 4,
        jumpForce: 14,
        lives: 3
    },
    gravity: 0.6,
    world: {
        groundLevel: 350,
        skyColor: '#5c94fc'
    }
};

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const messageElement = document.getElementById('message');
const loadingElement = document.getElementById('loading');
const restartButton = document.getElementById('restartButton');

// Инициализируем объект для спрайтов
const sprites = {};

// Создаем простые пиксельные спрайты программно
function createPixelSprite(width, height, color, design) {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = width;
    spriteCanvas.height = height;
    const spriteCtx = spriteCanvas.getContext('2d');
    
    // Фон прозрачный
    spriteCtx.clearRect(0, 0, width, height);
    
    // Рисуем пиксельный спрайт
    if (design === 'player') {
        // Мама-Марио (пиксельный)
        spriteCtx.fillStyle = color;
        // Тело
        spriteCtx.fillRect(width/4, height/4, width/2, height/2);
        // Ноги
        spriteCtx.fillRect(width/4, height*3/4, width/4, height/4);
        spriteCtx.fillRect(width/2, height*3/4, width/4, height/4);
        // Голова
        spriteCtx.fillStyle = '#FFD700';
        spriteCtx.fillRect(width/4, 0, width/2, height/4);
        // Волосы
        spriteCtx.fillStyle = '#8B4513';
        spriteCtx.fillRect(width/4, 0, width/2, height/8);
    }
    else if (design === 'ground') {
        // Земля - коричневый блок
        spriteCtx.fillStyle = '#8B4513';
        spriteCtx.fillRect(0, 0, width, height);
        // Детали
        spriteCtx.fillStyle = '#A0522D';
        for (let i = 0; i < width; i += 8) {
            for (let j = 0; j < height; j += 8) {
                if ((i + j) % 16 === 0) {
                    spriteCtx.fillRect(i, j, 4, 4);
                }
            }
        }
    }
    else if (design === 'gift') {
        // Подарок
        spriteCtx.fillStyle = color;
        spriteCtx.fillRect(0, 0, width, height);
        // Ленточка
        spriteCtx.fillStyle = '#FFFF00';
        spriteCtx.fillRect(width/2 - 3, 0, 6, height); // Вертикальная
        spriteCtx.fillRect(0, height/2 - 3, width, 6); // Горизонтальная
        // Блеск
        spriteCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        spriteCtx.fillRect(width/4, height/4, width/8, height/8);
    }
    else if (design === 'flag') {
        // Флагшток
        spriteCtx.fillStyle = '#8B4513';
        spriteCtx.fillRect(width/2 - 3, 0, 6, height);
        // Флаг
        spriteCtx.fillStyle = '#FF0000';
        spriteCtx.beginPath();
        spriteCtx.moveTo(width/2, height/3);
        spriteCtx.lineTo(width, height/3 - 15);
        spriteCtx.lineTo(width/2, height/3 + 15);
        spriteCtx.closePath();
        spriteCtx.fill();
    }
    else if (design === 'cloud') {
        // Облако
        spriteCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        spriteCtx.beginPath();
        spriteCtx.arc(width/2, height/2, Math.min(width, height)/2, 0, Math.PI * 2);
        spriteCtx.fill();
    }
    else if (design === 'bush') {
        // Куст
        spriteCtx.fillStyle = '#228B22';
        spriteCtx.beginPath();
        spriteCtx.arc(width/2, height/2, Math.min(width, height)/2, 0, Math.PI * 2);
        spriteCtx.fill();
    }
    else {
        // Простой цветной прямоугольник для остальных
        spriteCtx.fillStyle = color;
        spriteCtx.fillRect(0, 0, width, height);
    }
    
    return spriteCanvas;
}

// Функция загрузки спрайтов
function loadSprites() {
    // Создаем программные спрайты (вместо загрузки изображений)
    sprites.player = createPixelSprite(40, 60, '#FF0000', 'player');
    sprites.ground = createPixelSprite(32, 32, '#8B4513', 'ground');
    sprites.grass = createPixelSprite(32, 32, '#7CFC00', 'grass');
    sprites.gift = createPixelSprite(30, 30, '#FF4081', 'gift');
    sprites.flag = createPixelSprite(40, 150, '#FFD700', 'flag');
    sprites.cloud = createPixelSprite(80, 40, '#FFFFFF', 'cloud');
    sprites.bush = createPixelSprite(60, 40, '#228B22', 'bush');
    sprites.pipe = createPixelSprite(60, 80, '#32CD32', 'pipe');
    
    // Симулируем загрузку
    loadingElement.textContent = "Спрайты созданы!";
    setTimeout(() => {
        loadingElement.style.display = 'none';
        initGame();
    }, 1000);
}

// Игровые объекты
let player = {
    x: CONFIG.player.startX,
    y: CONFIG.player.startY,
    width: CONFIG.player.width,
    height: CONFIG.player.height,
    velocityX: 0,
    velocityY: 0,
    isOnGround: false,
    facingRight: true,
    lives: CONFIG.player.lives,
    invincible: false,
    invincibleTimer: 0
};

let platforms = [
    // Основная земля
    {x: 0, y: CONFIG.world.groundLevel, width: 800, height: 50, type: 'ground'},
    // Платформы
    {x: 150, y: 280, width: 120, height: 20, type: 'platform'},
    {x: 320, y: 220, width: 120, height: 20, type: 'platform'},
    {x: 500, y: 280, width: 120, height: 20, type: 'platform'},
    {x: 650, y: 180, width: 100, height: 20, type: 'platform'}
];

let gifts = [
    {x: 180, y: 240, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 350, y: 180, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 530, y: 240, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 680, y: 140, width: 30, height: 30, collected: false, type: 'gift'},
    {x: 750, y: 100, width: 30, height: 30, collected: false, type: 'gift'}
];

let flag = {x: 750, y: 180, width: 40, height: 150, reached: false};
let clouds = [
    {x: 100, y: 60, width: 80, height: 40},
    {x: 350, y: 80, width: 100, height: 50},
    {x: 600, y: 40, width: 120, height: 60}
];

let bushes = [
    {x: 50, y: CONFIG.world.groundLevel - 30, width: 60, height: 40},
    {x: 300, y: CONFIG.world.groundLevel - 30, width: 80, height: 50},
    {x: 550, y: CONFIG.world.groundLevel - 30, width: 70, height: 45}
];

let score = 0;
let gameOver = false;
let gameWin = false;
const keys = {};
const particles = [];

// ===================== УПРАВЛЕНИЕ =====================
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'r' || e.key === 'R') resetGame();
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

restartButton.addEventListener('click', resetGame);

// ===================== ФУНКЦИИ ИГРЫ =====================
function initGame() {
    player = {
        x: CONFIG.player.startX,
        y: CONFIG.player.startY,
        width: CONFIG.player.width,
        height: CONFIG.player.height,
        velocityX: 0,
        velocityY: 0,
        isOnGround: false,
        facingRight: true,
        lives: CONFIG.player.lives,
        invincible: false,
        invincibleTimer: 0
    };
    
    gifts.forEach(gift => gift.collected = false);
    flag.reached = false;
    score = 0;
    gameOver = false;
    gameWin = false;
    scoreElement.textContent = score;
    livesElement.textContent = '❤️'.repeat(player.lives);
    messageElement.style.display = 'none';
    
    gameLoop();
}

function gameLoop() {
    if (gameOver || gameWin) {
        if (gameWin) {
            showWinMessage();
        }
        return;
    }
    
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Управление
    player.velocityX = 0;
    if (keys['ArrowLeft']) {
        player.velocityX = -CONFIG.player.speed;
        player.facingRight = false;
    }
    if (keys['ArrowRight']) {
        player.velocityX = CONFIG.player.speed;
        player.facingRight = true;
    }
    
    // Прыжок
    if (keys['ArrowUp'] && player.isOnGround) {
        player.velocityY = -CONFIG.player.jumpForce;
        player.isOnGround = false;
        createParticles(player.x + player.width/2, player.y + player.height, 5, '#f1c40f');
    }
    
    // Гравитация
    player.velocityY += CONFIG.gravity;
    
    // Обновление позиции
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Границы экрана
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    
    // Проверка падения
    if (player.y > canvas.height) {
        loseLife();
        return;
    }
    
    // Столкновение с платформами
    player.isOnGround = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + player.velocityY) {
            
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isOnGround = true;
        }
    });
    
    // Сбор подарков
    gifts.forEach(gift => {
        if (!gift.collected &&
            player.x < gift.x + gift.width &&
            player.x + player.width > gift.x &&
            player.y < gift.y + gift.height &&
            player.y + player.height > gift.y) {
            
            gift.collected = true;
            score++;
            scoreElement.textContent = score;
            
            // Эффект сбора
            createParticles(gift.x + gift.width/2, gift.y + gift.height/2, 10, '#e74c3c');
            
            if (score === gifts.length) {
                messageElement.textContent = "🎁 Все подарки собраны! К флагу! 🎁";
                messageElement.style.display = 'block';
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 2000);
            }
        }
    });
    
    // Достижение флага
    if (!flag.reached &&
        player.x < flag.x + flag.width &&
        player.x + player.width > flag.x &&
        player.y < flag.y + flag.height &&
        player.y + player.height > flag.y) {
        
        flag.reached = true;
        if (score === gifts.length) {
            gameWin = true;
        } else {
            messageElement.textContent = "Сначала собери все подарки!";
            messageElement.style.display = 'block';
            setTimeout(() => {
                messageElement.style.display = 'none';
                flag.reached = false;
            }, 1500);
        }
    }
    
    // Обновление невидимости
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }
    
    // Обновление частиц
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function draw() {
    // Очистка экрана
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Фон
    ctx.fillStyle = CONFIG.world.skyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Облака
    clouds.forEach(cloud => {
        ctx.drawImage(sprites.cloud, cloud.x, cloud.y, cloud.width, cloud.height);
    });
    
    // Кусты
    bushes.forEach(bush => {
        ctx.drawImage(sprites.bush, bush.x, bush.y, bush.width, bush.height);
    });
    
    // Платформы
    platforms.forEach(platform => {
        if (platform.type === 'ground') {
            // Рисуем землю с текстурой
            for (let x = platform.x; x < platform.x + platform.width; x += 32) {
                ctx.drawImage(sprites.ground, x, platform.y, 32, 32);
            }
            // Трава сверху
            for (let x = platform.x; x < platform.x + platform.width; x += 32) {
                ctx.drawImage(sprites.grass, x, platform.y - 10, 32, 20);
            }
        } else {
            // Обычные платформы
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            ctx.fillStyle = '#7CFC00';
            ctx.fillRect(platform.x, platform.y - 5, platform.width, 5);
        }
    });
    
    // Подарки
    gifts.forEach(gift => {
        if (!gift.collected) {
            ctx.drawImage(sprites.gift, gift.x, gift.y, gift.width, gift.height);
            // Мигающий эффект
            if (Math.sin(Date.now() / 200) > 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(gift.x, gift.y, gift.width, gift.height);
            }
        }
    });
    
    // Флаг
    ctx.drawImage(sprites.flag, flag.x, flag.y, flag.width, flag.height);
    
    // Игрок
    if (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.save();
        if (!player.facingRight) {
            ctx.translate(player.x + player.width, player.y);
            ctx.scale(-1, 1);
            ctx.drawImage(sprites.player, 0, 0, player.width, player.height);
        } else {
            ctx.drawImage(sprites.player, player.x, player.y, player.width, player.height);
        }
        ctx.restore();
    }
    
    // Частицы
    particles.forEach(particle => {
        particle.draw(ctx);
    });
    
    // Анимация флага при достижении
    if (flag.reached) {
        ctx.save();
        ctx.translate(flag.x + flag.width, flag.y + 30);
        ctx.rotate(Math.sin(Date.now() / 200) * 0.3);
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40, -20);
        ctx.lineTo(0, -40);
        ctx.fill();
        ctx.restore();
    }
}

function loseLife() {
    if (player.invincible) return;
    
    player.lives--;
    livesElement.textContent = '❤️'.repeat(player.lives);
    
    if (player.lives <= 0) {
        gameOver = true;
        showMessage("Попробуй ещё раз, я верю в тебя! 💪");
    } else {
        player.invincible = true;
        player.invincibleTimer = 120; // 2 секунды
        player.x = CONFIG.player.startX;
        player.y = CONFIG.player.startY;
        player.velocityX = 0;
        player.velocityY = 0;
        
        // Эффект потери жизни
        for (let i = 0; i < 20; i++) {
            createParticles(player.x + player.width/2, player.y + player.height/2, 3, '#e74c3c');
        }
    }
}

function showWinMessage() {
    const messages = [
        "🎊 ТЫ СУПЕР-МАМА! 🎊",
        "...",
        "...",
        "Мы тебя очень любим! 💖"
    ];
    
    let message = messages[0];
    messageElement.innerHTML = `
        <div style="margin-bottom: 20px; font-size: 1.5em;">${message}</div>
        <div style="font-size: 0.8em; color: #2c3e50;">${messages.slice(1).join('<br>')}</div>
        <div style="margin-top: 20px; font-size: 0.7em;">Нажми R или кнопку для новой игры</div>
    `;
    messageElement.style.display = 'block';
    
    // Фейерверк
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createParticles(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                10,
                ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db'][Math.floor(Math.random() * 4)]
            );
        }, i * 100);
    }
}

function showMessage(text) {
    messageElement.textContent = text;
    messageElement.style.display = 'block';
}

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 8,
            velocityY: (Math.random() - 0.5) * 8 - 2,
            life: 30 + Math.random() * 30,
            color: color,
            size: 3 + Math.random() * 5,
            update: function() {
                this.x += this.velocityX;
                this.y += this.velocityY;
                this.velocityY += 0.1;
                this.life--;
                this.size *= 0.95;
            },
            draw: function(ctx) {
                ctx.globalAlpha = this.life / 60;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        });
    }
}

function resetGame() {
    initGame();
}

// Запуск игры
loadSprites();
