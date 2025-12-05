// Замените функцию createPixelSprite на эту улучшенную версию:
function createPixelSprite(width, height, color, design) {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = width;
    spriteCanvas.height = height;
    const spriteCtx = spriteCanvas.getContext('2d');
    
    // Прозрачный фон
    spriteCtx.clearRect(0, 0, width, height);
    
    // Градиенты и тени для всех спрайтов
    if (design === 'player') {
        // Тело с градиентом
        const bodyGradient = spriteCtx.createLinearGradient(0, 0, 0, height);
        bodyGradient.addColorStop(0, color);
        bodyGradient.addColorStop(1, darkenColor(color, 40));
        
        // Голова
        spriteCtx.fillStyle = '#FFE5B4';
        spriteCtx.fillRect(width/4, 0, width/2, height/4);
        
        // Волосы с градиентом
        const hairGradient = spriteCtx.createLinearGradient(0, 0, 0, height/8);
        hairGradient.addColorStop(0, '#8B4513');
        hairGradient.addColorStop(1, '#5D2906');
        spriteCtx.fillStyle = hairGradient;
        spriteCtx.fillRect(width/4, 0, width/2, height/8);
        
        // Платье с градиентом
        spriteCtx.fillStyle = bodyGradient;
        spriteCtx.fillRect(width/4, height/4, width/2, height/2);
        
        // Ремешок
        spriteCtx.fillStyle = '#FFD700';
        spriteCtx.fillRect(width/4, height/2 - 5, width/2, 5);
        
        // Ноги
        spriteCtx.fillStyle = darkenColor(color, 50);
        spriteCtx.fillRect(width/4, height*3/4, width/4, height/4);
        spriteCtx.fillRect(width/2, height*3/4, width/4, height/4);
        
        // Обводка
        spriteCtx.strokeStyle = '#000';
        spriteCtx.lineWidth = 1;
        spriteCtx.strokeRect(width/4, 0, width/2, height);
        
        // Глаза
        spriteCtx.fillStyle = '#000';
        spriteCtx.fillRect(width/4 + 5, height/8, 3, 3);
        spriteCtx.fillRect(width*3/4 - 8, height/8, 3, 3);
        
        // Улыбка
        spriteCtx.beginPath();
        spriteCtx.arc(width/2, height/6 + 5, 5, 0.2, Math.PI - 0.2);
        spriteCtx.stroke();
    }
    else if (design === 'ground') {
        // Земля с текстурой
        spriteCtx.fillStyle = '#8B4513';
        spriteCtx.fillRect(0, 0, width, height);
        
        // Тень
        spriteCtx.fillStyle = '#5D2906';
        spriteCtx.fillRect(0, height-5, width, 5);
        
        // Детали
        for (let i = 0; i < width; i += 4) {
            for (let j = 0; j < height; j += 4) {
                const brightness = 50 + Math.random() * 50;
                spriteCtx.fillStyle = `rgb(${139 + brightness}, ${69 + brightness}, ${19 + brightness})`;
                spriteCtx.fillRect(i, j, 2, 2);
            }
        }
    }
    else if (design === 'gift') {
        // Основной цвет с градиентом
        const gradient = spriteCtx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, darkenColor(color, 30));
        
        spriteCtx.fillStyle = gradient;
        spriteCtx.fillRect(0, 0, width, height);
        
        // Обводка
        spriteCtx.strokeStyle = '#000';
        spriteCtx.lineWidth = 2;
        spriteCtx.strokeRect(1, 1, width-2, height-2);
        
        // Ленточка
        spriteCtx.fillStyle = '#FFD700';
        // Вертикальная
        spriteCtx.fillRect(width/2 - 2, 0, 4, height);
        // Горизонтальная
        spriteCtx.fillRect(0, height/2 - 2, width, 4);
        
        // Блестящие уголки
        spriteCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        spriteCtx.fillRect(0, 0, 3, 3);
        spriteCtx.fillRect(width-3, 0, 3, 3);
        spriteCtx.fillRect(0, height-3, 3, 3);
        spriteCtx.fillRect(width-3, height-3, 3, 3);
        
        // Блики
        const sparkleGradient = spriteCtx.createRadialGradient(
            width/3, height/3, 0,
            width/3, height/3, 10
        );
        sparkleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        sparkleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        spriteCtx.fillStyle = sparkleGradient;
        spriteCtx.fillRect(width/3 - 10, height/3 - 10, 20, 20);
    }
    // ... аналогично улучшаем другие спрайты
    
    return spriteCanvas;
}

// Функция для затемнения цвета
function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}
