// Функция загрузки спрайтов
function loadSprites() {
    // Создаем программные спрайты (вместо загрузки изображений)
    sprites.ground = createPixelSprite(32, 32, '#8B4513', 'ground');
    sprites.grass = createPixelSprite(32, 32, '#7CFC00', 'grass');
    sprites.gift = createPixelSprite(30, 30, '#FF4081', 'gift');
    sprites.flag = createPixelSprite(40, 150, '#FFD700', 'flag');
    sprites.cloud = createPixelSprite(80, 40, '#FFFFFF', 'cloud');
    sprites.bush = createPixelSprite(60, 40, '#228B22', 'bush');
    sprites.pipe = createPixelSprite(60, 80, '#32CD32', 'pipe');
    
    // Загружаем изображение для игрока из URL
    sprites.player = new Image();
    sprites.player.src = 'https://i.pinimg.com/736x/3b/8c/2d/3b8c2d13ff3ff5afacc7d12c069187d0.jpg';
    
    // Ждем загрузки изображения игрока
    sprites.player.onload = function() {
        loadingElement.textContent = "Спрайты созданы!";
        setTimeout(() => {
            loadingElement.style.display = 'none';
            initGame();
        }, 1000);
    };
    
    // На случай ошибки загрузки
    sprites.player.onerror = function() {
        // Создаем резервный спрайт
        sprites.player = createPixelSprite(40, 60, '#FF0000', 'player');
        loadingElement.textContent = "Спрайты созданы!";
        setTimeout(() => {
            loadingElement.style.display = 'none';
            initGame();
        }, 1000);
    };
}

// Добавим свойства для левитации платформ
let platformFloatTimers = [];

function initGame() {
    player = {
        x: CONFIG.player.startX,
        y: CONFIG.player.startY,
        width: 40, // Размеры под изображение
        height: 60,
        velocityX: 0,
        velocityY: 0,
        isOnGround: false,
        facingRight: true,
        lives: CONFIG.player.lives,
        invincible: false,
        invincibleTimer: 0
    };
    
    // Инициализируем таймеры левитации для каждой платформы (кроме основной земли)
    platformFloatTimers = [];
    for (let i = 0; i < platforms.length; i++) {
        if (platforms[i].type !== 'ground') {
            platformFloatTimers.push({
                offset: Math.random() * Math.PI * 2, // Случайное начальное смещение
                speed: 0.5 + Math.random() * 0.3, // Разная скорость колебания
                amplitude: 3 + Math.random() * 2 // Разная амплитуда
            });
        } else {
            platformFloatTimers.push(null); // Для земли null
        }
    }
    
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

// В функции update добавим обновление левитации платформ
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
    
    // Обновление левитации платформ
    platforms.forEach((platform, index) => {
        if (platform.type === 'platform' && platformFloatTimers[index]) {
            // Обновляем позицию Y платформы для левитации
            const timer = platformFloatTimers[index];
            const originalY = platform.type === 'platform' ? 
                (index === 1 ? 280 : index === 2 ? 220 : index === 3 ? 280 : 180) : platform.y;
            
            // Используем синусоидальную функцию для плавного движения вверх-вниз
            timer.offset += timer.speed * 0.05;
            platform.y = originalY + Math.sin(timer.offset) * timer.amplitude;
        }
    });
    
    // Столкновение с платформами
    player.isOnGround = false;
    platforms.forEach((platform, index) => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + player.velocityY) {
            
            // Если это левитирующая платформа, добавляем немного вертикального движения игроку
            if (platform.type === 'platform' && platformFloatTimers[index]) {
                const timer = platformFloatTimers[index];
                const verticalMovement = Math.cos(timer.offset) * timer.speed * 0.5;
                player.y += verticalMovement;
            }
            
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isOnGround = true;
        }
    });
    
    // ... остальной код функции update остается без изменений ...
}

// В функции draw изменим отрисовку игрока
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
            // Левитирующие платформы
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            ctx.fillStyle = '#7CFC00';
            ctx.fillRect(platform.x, platform.y - 5, platform.width, 5);
            
            // Эффект левитации (свечение под платформой)
            ctx.shadowColor = 'rgba(124, 252, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = 'rgba(124, 252, 0, 0.2)';
            ctx.fillRect(platform.x - 5, platform.y + platform.height, platform.width + 10, 5);
            ctx.shadowBlur = 0;
        }
    });
    
    // Подарки
    gifts.forEach(gift => {
        if (!gift.collected) {
            // Добавляем левитацию подаркам
            const giftFloat = Math.sin(Date.now() / 300 + gift.x) * 3;
            ctx.drawImage(sprites.gift, gift.x, gift.y + giftFloat, gift.width, gift.height);
            
            // Мигающий эффект
            if (Math.sin(Date.now() / 200) > 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(gift.x, gift.y + giftFloat, gift.width, gift.height);
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
            // Рисуем изображение игрока
            ctx.drawImage(sprites.player, 0, 0, player.width, player.height);
        } else {
            // Рисуем изображение игрока
            ctx.drawImage(sprites.player, player.x, player.y, player.width, player.height);
        }
        ctx.restore();
    }
    
    // ... остальной код функции draw остается без изменений ...
}
