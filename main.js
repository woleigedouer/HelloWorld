class ParticleTextAnimation {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.particles = [];
        this.mouse = {
            x: 0,
            y: 0,
            radius: 50
        };
        this.isTouch = false;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const textPoints = this.getTextPoints();
        this.particles = textPoints.map(point => new Particle(point.x, point.y));
    }
    
    getTextPoints() {
        // 创建离屏canvas用于文字渲染
        const offscreenCanvas = document.createElement('canvas');
        const offscreenCtx = offscreenCanvas.getContext('2d');
        
        // 根据屏幕尺寸决定文字布局
        const isMobile = window.innerWidth < 600;
        const texts = isMobile ? ['Hello', 'World'] : ['Hello World'];
        
        // 计算字体大小
        const fontSize = isMobile ? 
            Math.min(this.canvas.width / 4, this.canvas.height / 6) : 
            Math.min(this.canvas.width / 6, this.canvas.height / 6);
        
        const lineHeight = fontSize * 1.2;
        const totalHeight = lineHeight * texts.length;
        
        // 设置字体
        offscreenCtx.font = `bold ${fontSize}px Arial`;
        
        // 计算最大文字宽度
        const maxWidth = Math.max(...texts.map(text => offscreenCtx.measureText(text).width));
        
        // 设置离屏canvas尺寸
        offscreenCanvas.width = maxWidth;
        offscreenCanvas.height = totalHeight * 1.2;
        
        // 重新设置字体（canvas尺寸改变后需要重设）
        offscreenCtx.font = `bold ${fontSize}px Arial`;
        offscreenCtx.textBaseline = 'middle';
        offscreenCtx.textAlign = 'center';
        offscreenCtx.fillStyle = 'white';
        
        // 渲染文字
        texts.forEach((text, index) => {
            const y = (index * lineHeight) + (offscreenCanvas.height / 2) - ((texts.length - 1) * lineHeight / 2);
            offscreenCtx.fillText(text, offscreenCanvas.width / 2, y);
        });
        
        // 获取像素数据
        const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const pixels = imageData.data;
        
        // 提取文字像素点
        const points = [];
        const gap = isMobile ? 4 : 6; // 粒子间距
        
        // 计算在屏幕中的偏移
        const offsetX = (this.canvas.width - offscreenCanvas.width) / 2;
        const offsetY = (this.canvas.height - offscreenCanvas.height) / 2;
        
        for (let y = 0; y < offscreenCanvas.height; y += gap) {
            for (let x = 0; x < offscreenCanvas.width; x += gap) {
                const index = (y * offscreenCanvas.width + x) * 4;
                const alpha = pixels[index + 3];
                
                if (alpha > 128) { // 如果像素不透明
                    points.push({
                        x: offsetX + x,
                        y: offsetY + y
                    });
                }
            }
        }
        
        return points;
    }
    
    bindEvents() {
        // 鼠标事件
        this.canvas.addEventListener('mousemove', (e) => this.updateMousePosition(e));
        this.canvas.addEventListener('mouseleave', () => this.resetMousePosition());
        
        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isTouch = true;
            this.updateMousePosition(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.isTouch = true;
            this.updateMousePosition(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', () => {
            this.isTouch = false;
            this.resetMousePosition();
        });
        
        this.canvas.addEventListener('touchcancel', () => {
            this.isTouch = false;
            this.resetMousePosition();
        });
        
        // 窗口大小改变
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });
    }
    
    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        if (e.touches) {
            this.mouse.x = e.touches[0].clientX - rect.left;
            this.mouse.y = e.touches[0].clientY - rect.top;
        } else {
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        }
    }
    
    resetMousePosition() {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
    }
    
    animate() {
        // 清空画布（带轨迹效果）
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 设置粒子颜色
        this.ctx.fillStyle = 'white';
        
        // 更新和绘制粒子
        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    new ParticleTextAnimation();
});
