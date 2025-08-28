class Particle {
    constructor(x, y) {
        // 重置粒子到指定位置
        this.reset(x, y);
    }
    
    reset(targetX, targetY) {
        // 从屏幕边缘随机位置开始
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: // 上边
                this.x = Math.random() * window.innerWidth;
                this.y = -10;
                break;
            case 1: // 右边
                this.x = window.innerWidth + 10;
                this.y = Math.random() * window.innerHeight;
                break;
            case 2: // 下边
                this.x = Math.random() * window.innerWidth;
                this.y = window.innerHeight + 10;
                break;
            case 3: // 左边
                this.x = -10;
                this.y = Math.random() * window.innerHeight;
                break;
        }
        
        // 目标位置（文字中的位置）
        this.targetX = targetX;
        this.targetY = targetY;
        this.originalX = targetX;
        this.originalY = targetY;
        
        // 运动属性
        this.speed = Math.random() * 4 + 2;
        this.size = Math.random() * 1.5 + 1;
        this.arrived = false;
        
        // 物理属性
        this.velocityX = 0;
        this.velocityY = 0;
        this.friction = 0.85;
        this.returnForce = 0.08;
    }
    
    update(mouse) {
        // 检查是否超出边界
        if (this.x < -50 || this.x > window.innerWidth + 50 || 
            this.y < -50 || this.y > window.innerHeight + 50) {
            return;
        }
        
        if (this.arrived) {
            // 已到达目标位置，处理鼠标交互和回归
            this.handleMouseInteraction(mouse);
            this.returnToOriginal();
            this.applyPhysics();
        } else {
            // 还在移动到目标位置
            this.moveToTarget();
        }
    }
    
    handleMouseInteraction(mouse) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果在鼠标影响范围内
        if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            
            // 计算推力
            const pushX = Math.cos(angle) * force * 3;
            const pushY = Math.sin(angle) * force * 3;
            
            this.velocityX -= pushX;
            this.velocityY -= pushY;
        }
    }
    
    returnToOriginal() {
        // 回归原始位置的力
        const returnX = this.originalX - this.x;
        const returnY = this.originalY - this.y;
        
        this.velocityX += returnX * this.returnForce;
        this.velocityY += returnY * this.returnForce;
    }
    
    applyPhysics() {
        // 应用摩擦力
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;
        
        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
    
    moveToTarget() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            this.arrived = true;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
