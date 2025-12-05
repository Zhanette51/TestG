// ===================== НАСТРОЙКИ ИГРЫ =====================
const CONFIG = {
    player: {
        startX: 80,
        startY: 350,
        width: 80,
        height: 120,
        speed: 6,
        jumpForce: 18,
        lives: 3
    },
    gravity: 0.8,
    world: {
        groundLevel: 450,
        skyColor: '#87CEEB'
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

// Массив приятных сообщений для каждого подарка
const giftMessages = [
    "Самая добрая! 💖",
    "Самая красивая! 🌸",
    "Всегда поддерживаешь! 🤗",
    "Мой главный пример! 👑",
    "Мы тебя очень любим! ❤️",
    "Ты делаешь мир лучше! ✨",
    "Твоя улыбка - солнце! ☀️",
    "Самая мудрая! 🦉",
    "Твои объятия - дом! 🏡",
    "Вдохновляешь меня! 🎯"
];

// Инициализируем объект для спрайтов
const sprites = {};

// Создаем детализированные спрайты программно
function createDetailedSprite(width, height, type) {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = width;
    spriteCanvas.height = height;
    const spriteCtx = spriteCanvas.getContext('2d');
    
    spriteCtx.clearRect(0, 0, width, height);
    
    if (type === 'princess') {
        // Детализированная принцесса
        const bodyWidth = width * 0.6;
        const bodyHeight = height * 0.4;
        
        // Платье (нижняя часть)
        spriteCtx.fillStyle = '#FF1493';
        spriteCtx.beginPath();
        spriteCtx.moveTo(width/2 - bodyWidth/2, height * 0.6);
        spriteCtx.bezierCurveTo(
            width/2 - bodyWidth/2, height * 0.6,
            width/2 - bodyWidth/3, height,
            width/2, height
        );
        spriteCtx.bezierCurveTo(
            width/2, height,
            width/2 + bodyWidth/3, height,
            width/2 + bodyWidth/2, height * 0.6
        );
        spriteCtx.closePath();
        spriteCtx.fill();
        
        // Верх платья
        spriteCtx.fillStyle = '#FF69B4';
        spriteCtx.fillRect(width/2 - bodyWidth/2, height * 0.4, bodyWidth, height * 0.2);
        
        // Лицо
        spriteCtx.fillStyle = '#FFE4B5';
        spriteCtx.beginPath();
        spriteCtx.arc(width/2, height * 0.3, width * 0.2, 0, Math.PI * 2);
        spriteCtx.fill();
        
        // Волосы
        spriteCtx.fillStyle = '#8B4513';
        spriteCtx.beginPath();
        spriteCtx.arc(width/2, height * 0.3, width * 0.22, 0, Math.PI * 2);
        spriteCtx.fill();
        
        // Корона
        spriteCtx.fillStyle = '#FFD700';
        spriteCtx.fillRect(width/2 - width*0.15, height * 0.18, width * 0.3, width * 0.1);
        // Зубцы короны
        for (let i = 0; i < 5; i++) {
            const x = width/2 - width*0.15 + i * (width * 0.3 / 5);
            spriteCtx.beginPath();
            spriteCtx.moveTo(x, height * 0.18);
            spriteCtx.lineTo(x + width*0.03, height * 0.1);
            spriteCtx.lineTo(x + width*0.06, height * 0.18);
            spriteCtx.closePath();
            spriteCtx.fill();
        }
        
        // Глаза
        spriteCtx.fillStyle = '#000';
        spriteCtx.beginPath();
        spriteCtx.arc(width/2 - width*0.08, height * 0.28, width * 0.03, 0, Math.PI * 2);
        spriteCtx.arc(width/2 + width*0.08, height * 0.28, width * 0.03, 0, Math.PI * 2);
        spriteCtx.fill();
        
        // Улыбка
        spriteCtx.strokeStyle = '#FF69B4';
        spriteCtx.lineWidth = 3;
        spriteCtx.beginPath();
        spriteCtx.arc(width/2, height * 0.33, width * 0.1, 0.2, Math.PI - 0.2);
        spriteCtx.stroke();
        
        // Руки
        spriteCtx.fillStyle = '#FFE4B5';
        spriteCtx.fillRect(width/2 - bodyWidth/2 - width*0.08, height * 0.45, width*0.08, height*0.1);
        spriteCtx.fillRect(width/2 + bodyWidth/2, height * 0.45, width*0.08, height*0.1);
        
        // Украшения на платье
        spriteCtx.fillStyle = '#FFD700';
        for (let i = 0; i < 5; i++) {
            const x = width/2 - bodyWidth/3 + i * (bodyWidth * 0.4 / 4);
            spriteCtx.beginPath();
            spriteCtx.arc(x, height * 0.55, width * 0.03, 0, Math.PI * 2);
            spriteCtx.fill();
        }
    }
    else if (type === 'detailed_ground') {
        // Детализированная земля с текстурой
        spriteCtx.fillStyle = '#8B4513';
        spriteCtx.fillRect(0, 0, width, height);
        
        // Текстура земли
        spriteCtx.fillStyle = '#A0522D';
        for (let i = 0; i < width; i += 6) {
            for (let j = 0; j < height; j += 6) {
                if (Math.random() > 0.7) {
                    spriteCtx.fillRect(i, j, 3, 3);
                }
            }
        }
    }
    else if (type === 'detailed_grass') {
        // Детализированная трава
        spriteCtx.fillStyle = '#32CD32';
        spriteCtx.fillRect(0, 0, width, height);
        
        // Травинки
        spriteCtx.fillStyle = '#228B22';
        for (let i = 0; i < width; i += 4) {
            const height = 3 + Math.random() * 6;
            spriteCtx.fillRect(i, 0, 2, height);
        }
    }
    else if (type === 'detailed_gift') {
        // Детализированный подарок
        spriteCtx.fillStyle = '#FF4081';
        spriteCtx.fillRect(0, 0, width, height);
        
        // Ленточка
        spriteCtx.fillStyle = '#FFFF00';
        spriteCtx.fillRect(width/2 - 4, 0, 8, height);
        spriteCtx.fillRect(0, height/2 - 4, width, 8);
        
        // Блестящие украшения
        spriteCtx.fillStyle = '#FFFFFF';
        spriteCtx.beginPath();
        spriteCtx.arc(width/4, height/4, width/8, 0, Math.PI * 2);
        spriteCtx.fill();
        spriteCtx.beginPath();
        spriteCtx.arc(width*3/4, height*3/4, width/12, 0, Math.PI * 2);
        spriteCtx.fill();
    }
    else if (type === 'detailed_flag') {
        // Флагшток
        spriteCtx.fillStyle = '#8B4513';
        spriteCtx.fillRect(width/2 - 5, 0, 10, height);
        
        // Флаг
        spriteCtx.fillStyle = '#FF0000';
        spriteCtx.beginPath();
        spriteCtx.moveTo(width/2, height/4);
        spriteCtx.lineTo(width, height/4 - 20);
        spriteCtx.lineTo(width/2, height/4 + 20);
        spriteCtx.closePath();
        spriteCtx.fill();
        
        // Украшение наверху
        spriteCtx.fillStyle = '#FFD700';
        spriteCtx.beginPath();
        spriteCtx.arc(width/2, 10, 15, 0, Math.PI * 2);
        spriteCtx.fill();
    }
    else if (type === 'detailed_cloud') {
        // Детализированное облако
        spriteCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        spriteCtx.beginPath();
        
        const centerX = width/2;
        const centerY = height/2;
        
        // Рисуем пушистое облако
        spriteCtx.arc(centerX - width*0.2, centerY, height*0.4, 0, Math.PI * 2);
        spriteCtx.arc(centerX, centerY, height*0.5, 0, Math.PI * 2);
        spriteCtx.arc(centerX + width*0.2, centerY, height*0.4, 0, Math.PI * 2);
        spriteCtx.arc(centerX - width*0.1, centerY - height*0.2, height*0.3, 0, Math.PI * 2);
        spriteCtx.arc(centerX + width*0.1, centerY - height*0.2, height*0.3, 0, Math.PI * 2);
        
        spriteCtx.fill();
        
        // Тени для объема
        spriteCtx.fillStyle = 'rgba(200, 220, 240, 0.3)';
        spriteCtx.beginPath();
        spriteCtx.arc(centerX - width*0.2, centerY + height*0.1, height*0.35, 0, Math.PI * 2);
        spriteCtx.fill();
    }
    else if (type === 'detailed_bush') {
        // Детализированный куст
        const centerX = width/2;
        const centerY = height/2;
        
        // Основные листья
        spriteCtx.fillStyle = '#228B22';
        spriteCtx.beginPath();
        spriteCtx.arc(centerX, centerY, Math.min(width, height)*0.4, 0, Math.PI * 2);
        spriteCtx.fill();
        
        // Более светлые листья сверху
        spriteCtx.fillStyle = '#32CD32';
        spriteCtx.beginPath();
        spriteCtx.arc(centerX - width*0.2, centerY - height*0.1, width*0.3, 0, Math.PI * 2);
        spriteCtx.arc(centerX + width*0.2, centerY - height*0.1, width*0.3, 0, Math.PI * 2);
        spriteCtx.fill();
        
        // Ягодки
        spriteCtx.fillStyle = '#FF4500';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * width*0.3;
            const y = centerY + Math.sin(angle) * height*0.2;
            spriteCtx.beginPath();
            spriteCtx.arc(x, y, width*0.05, 0, Math.PI * 2);
            spriteCtx.fill();
        }
    }
    else if (type === 'levitating_island') {
        // Левитирующий островок
        const centerX = width/2;
        
        // Основная платформа
        spriteCtx.fillStyle = '#8B4513';
        spriteCtx.beginPath();
        spriteCtx.moveTo(0, height);
        spriteCtx.bezierCurveTo(
            width*0.2, height*0.8,
            width*0.8, height*0.8,
            width, height
        );
        spriteCtx.lineTo(width, height);
        spriteCtx.lineTo(0, height);
        spriteCtx.closePath();
        spriteCtx.fill();
        
        // Верх платформы
        spriteCtx.fillStyle = '#A0522D';
        spriteCtx.fillRect(0, height*0.6, width, height*0.4);
        
        // Трава сверху
        spriteCtx.fillStyle = '#32CD32';
        spriteCtx.fillRect(0, height*0.55, width, height*0.1);
        
        // Травинки
        spriteCtx.fillStyle = '#228B22';
        for (let i = 0; i < width; i += 8) {
            const h = 5 + Math.random() * 10;
            spriteCtx.fillRect(i, height*0.55 - h, 2, h);
        }
        
        // Камни и детали
        spriteCtx.fillStyle = '#696969';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * width;
            const y = height*0.65 + Math.random() * height*0.3;
            const size = 5 + Math.random() * 15;
            spriteCtx.beginPath();
            spriteCtx.arc(x, y, size, 0, Math.PI * 2);
            spriteCtx.fill();
        }
        
        // Эффект левитации (свечение снизу)
        spriteCtx.fillStyle = 'rgba(124, 252, 0, 0.3)';
        spriteCtx.beginPath();
        spriteCtx.moveTo(0, height);
        spriteCtx.bezierCurveTo(
            width*0.3, height + 20,
            width*0.7, height + 20,
            width, height
        );
        spriteCtx.lineTo(width, height);
        spriteCtx.lineTo(0, height);
        spriteCtx.closePath();
        spriteCtx.fill();
    }
    
    return spriteCanvas;
}

// Функция загрузки спрайтов
function loadSprites() {
    // Создаем детализированные спрайты
    sprites.player = createDetailedSprite(80, 120, 'princess');
    sprites.ground = createDetailedSprite(64, 64, 'detailed_ground');
    sprites.grass = createDetailedSprite(64, 32, 'detailed_grass');
    sprites.gift = createDetailedSprite(45, 45, 'detailed_gift');
    sprites.flag = createDetailedSprite(60, 225, 'detailed_flag');
    sprites.cloud = createDetailedSprite(150, 80, 'detailed_cloud');
    sprites.bush = createDetailedSprite(120, 80, 'detailed_bush');
    sprites.island = createDetailedSprite(200, 100, 'levitating_island');
    
    // Симулируем загрузку
    loadingElement.textContent = "Создаю волшебный мир...";
    
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
    {x: 0, y: CONFIG.world.groundLevel, width: 1200, height: 150, type: 'ground'},
    // Левитирующие островки
    {x: 200, y: 320, width: 180, height: 40, type: 'island', originalY: 320},
    {x: 450, y: 250, width: 200, height: 40, type: 'island', originalY: 250},
    {x: 750, y: 320, width: 180, height: 40, type: 'island', originalY: 320},
    {x: 950, y: 200, width: 150, height: 40, type: 'island', originalY: 200},
    // Дополнительные островки
    {x: 300, y: 180, width: 120, height: 30, type: 'island', originalY: 180},
    {x: 600, y: 150, width: 140, height: 35, type: 'island', originalY: 150}
];

let gifts = [
    {x: 230, y: 270, width: 45, height: 45, collected: false, type: 'gift'},
    {x: 500, y: 200, width: 45, height: 45, collected: false, type: 'gift'},
    {x: 800, y: 270, width: 45, height: 45, collected: false, type: 'gift'},
    {x: 1000, y: 150, width: 45, height: 45, collected: false, type: 'gift'},
    {x: 1100, y: 120, width: 45, height: 45, collected: false, type: 'gift'}
];

let flag = {x: 1100, y: 200, width: 60, height: 225, reached: false};
let clouds = [
    {x: 100, y: 80, width: 150, height: 80},
    {x: 400, y: 60, width: 180, height: 90},
    {x: 700, y: 100, width: 200, height: 100},
    {x: 900, y: 50, width: 160, height: 70},
    {x: 1100, y: 80, width: 140, height: 60}
];

let bushes = [
    {x: 50, y: CONFIG.world.groundLevel - 60, width: 120, height: 80},
    {x: 250, y: CONFIG.world.groundLevel - 70, width: 140, height: 90},
    {x: 500, y: CONFIG.world.groundLevel - 60, width: 130, height: 85},
    {x: 750, y: CONFIG.world.groundLevel - 80, width: 150, height: 95},
    {x: 1000, y: CONFIG.world.groundLevel - 65, width: 125, height: 82}
];

let trees = [
    {x: 150, y: CONFIG.world.groundLevel - 150, width: 60, height: 150},
    {x: 350, y: CONFIG.world.groundLevel - 180, width: 70, height: 180},
    {x: 650, y: CONFIG.world.groundLevel - 160, width: 65, height: 160},
    {x: 850, y: CONFIG.world.groundLevel - 200, width: 80, height: 200}
];

let score = 0;
let gameOver = false;
let gameWin = false;
const keys = {};
const particles = [];
let floatingMessages = [];

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
    floatingMessages = [];
    
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
        createParticles(player.x + player.width/2, player.y + player.height, 10, '#f1c40f');
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
    if (player.y > canvas.height + 100) {
        loseLife();
        return;
    }
    
    // ЛЕВИТАЦИЯ ОСТРОВКОВ
    platforms.forEach((platform, index) => {
        if (platform.type === 'island') {
            const time = Date.now() * 0.001;
            const floatSpeed = 0.5 + index * 0.1;
            const floatHeight = 10 + index * 2;
            
            platform.y = platform.originalY + Math.sin(time * floatSpeed) * floatHeight;
        }
    });
    
    // Столкновение с платформами
    player.isOnGround = false;
    platforms.forEach((platform, index) => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + player.velocityY) {
            
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isOnGround = true;
            
            // Эффект приземления на левитирующий остров
            if (platform.type === 'island') {
                createParticles(player.x + player.width/2, player.y + player.height, 8, '#32CD32');
                player.velocityY = -2; // Мягкий отскок
            }
        }
    });
    
    // Сбор подарков
    gifts.forEach((gift, index) => {
        if (!gift.collected &&
            player.x < gift.x + gift.width &&
            player.x + player.width > gift.x &&
            player.y < gift.y + gift.height &&
            player.y + player.height > gift.y) {
            
            gift.collected = true;
            score++;
            scoreElement.textContent = score;
            
            // Эффект сбора
            createParticles(gift.x + gift.width/2, gift.y + gift.height/2, 15, '#e74c3c');
            
            // Показываем приятное сообщение
            showFloatingMessage(
                giftMessages[index % giftMessages.length], 
                gift.x + gift.width/2, 
                gift.y
            );
            
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
    
    // Обновление плавающих сообщений
    for (let i = floatingMessages.length - 1; i >= 0; i--) {
        floatingMessages[i].update();
        if (floatingMessages[i].life <= 0) {
            floatingMessages.splice(i, 1);
        }
    }
}

function draw() {
    // Очистка экрана
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Фон неба с градиентом
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#5c94fc');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Солнце
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(1100, 80, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(1100, 80, 70, 0, Math.PI * 2);
    ctx.fill();
    
    // Облака с эффектом левитации
    clouds.forEach((cloud, index) => {
        const cloudFloat = Math.sin(Date.now() * 0.0005 + index) * 5;
        ctx.drawImage(sprites.cloud, cloud.x, cloud.y + cloudFloat, cloud.width, cloud.height);
    });
    
    // Деревья
    trees.forEach(tree => {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(tree.x, tree.y, tree.width, tree.height);
        
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(tree.x + tree.width/2, tree.y, tree.width * 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Кусты
    bushes.forEach(bush => {
        ctx.drawImage(sprites.bush, bush.x, bush.y, bush.width, bush.height);
    });
    
    // Основная земля
    for (let x = 0; x < platforms[0].width; x += 64) {
        ctx.drawImage(sprites.ground, x, platforms[0].y, 64, 64);
        // Трава сверху
        for (let grassX = x; grassX < x + 64; grassX += 64) {
            ctx.drawImage(sprites.grass, grassX, platforms[0].y - 32, 64, 32);
        }
    }
    
    // Левитирующие островки
    platforms.forEach((platform, index) => {
        if (platform.type === 'island') {
            ctx.drawImage(sprites.island, platform.x, platform.y, platform.width, platform.height);
        }
    });
    
    // Подарки с левитацией
    gifts.forEach(gift => {
        if (!gift.collected) {
            const giftFloat = Math.sin(Date.now() * 0.003 + gift.x) * 5;
            ctx.drawImage(sprites.gift, gift.x, gift.y + giftFloat, gift.width, gift.height);
            
            // Эффект сияния
            if (Math.sin(Date.now() / 150) > 0) {
                ctx.shadowColor = '#FF4081';
                ctx.shadowBlur = 20;
                ctx.drawImage(sprites.gift, gift.x, gift.y + giftFloat, gift.width, gift.height);
                ctx.shadowBlur = 0;
            }
        }
    });
    
    // Флаг
    ctx.drawImage(sprites.flag, flag.x, flag.y, flag.width, flag.height);
    
    // Анимация флага
    if (flag.reached) {
        ctx.save();
        ctx.translate(flag.x + flag.width, flag.y + 50);
        ctx.rotate(Math.sin(Date.now() / 200) * 0.5);
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(60, -30);
        ctx.lineTo(0, -60);
        ctx.fill();
        ctx.restore();
    }
    
    // Игрок (принцесса)
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
        
        // Эффект при движении
        if (player.velocityX !== 0 && player.isOnGround) {
            createParticles(player.x + player.width/2, player.y + player.height, 3, '#FF69B4');
        }
    }
    
    // Частицы
    particles.forEach(particle => {
        particle.draw(ctx);
    });
    
    // Плавающие сообщения
    floatingMessages.forEach(message => {
        message.draw(ctx);
    });
}

function loseLife() {
    if (player.invincible) return;
    
    player.lives--;
    livesElement.textContent = '❤️'.repeat(player.lives);
    
    if (player.lives <= 0) {
        gameOver = true;
        showMessage("Попробуй ещё раз, принцесса! 💪");
    } else {
        player.invincible = true;
        player.invincibleTimer = 120;
        player.x = CONFIG.player.startX;
        player.y = CONFIG.player.startY;
        player.velocityX = 0;
        player.velocityY = 0;
        
        // Эффект потери жизни
        for (let i = 0; i < 25; i++) {
            createParticles(player.x + player.width/2, player.y + player.height/2, 5, '#e74c3c');
        }
    }
}

function showWinMessage() {
    const messages = [
        "🎊 ТЫ СУПЕР-ПРИНЦЕССА! 🎊",
        "С Юбилеем, королева! 👑",
        "Ты собрала все подарки!",
        "Мы тебя очень любим! 💖"
    ];
    
    let message = messages[0];
    messageElement.innerHTML = `
        <div style="margin-bottom: 30px; font-size: 2em;">${message}</div>
        <div style="font-size: 1em; color: #2c3e50;">${messages.slice(1).join('<br>')}</div>
        <div style="margin-top: 30px; font-size: 0.9em;">Нажми R или кнопку для новой игры</div>
    `;
    messageElement.style.display = 'block';
    
    // Большой фейерверк
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            createParticles(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                15,
                ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'][Math.floor(Math.random() * 5)]
            );
        }, i * 50);
    }
}

function showMessage(text) {
    messageElement.textContent = text;
    messageElement.style.display = 'block';
}

// Функция для создания плавающего сообщения
function showFloatingMessage(text, x, y) {
    floatingMessages.push({
        x: x,
        y: y,
        text: text,
        life: 120,
        velocityY: -3,
        opacity: 1,
        update: function() {
            this.y += this.velocityY;
            this.life--;
            this.opacity = this.life / 120;
        },
        draw: function(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.font = 'bold 20px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#D32F2F';
            ctx.lineWidth = 4;
            
            // Тень
            ctx.strokeText(this.text, this.x, this.y);
            // Основной текст
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    });
}

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 12,
            velocityY: (Math.random() - 0.5) * 12 - 3,
            life: 40 + Math.random() * 40,
            color: color,
            size: 4 + Math.random() * 6,
            update: function() {
                this.x += this.velocityX;
                this.y += this.velocityY;
                this.velocityY += 0.1;
                this.life--;
                this.size *= 0.95;
            },
            draw: function(ctx) {
                ctx.globalAlpha = this.life / 80;
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
