// Simple CSS-based particle system for reliable background effect
class SimpleParticleSystem {
    constructor() {
        this.particleCount = 15;
        this.particles = [];
        this.container = null;
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.createParticles();
        console.log('✨ Simple particle system initialized');
    }
    
    createContainer() {
        // Find existing container or create new one
        this.container = document.querySelector('.floating-particles');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'floating-particles';
            this.container.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: -1;
                pointer-events: none;
            `;
            
            const homeSection = document.getElementById('home');
            if (homeSection) {
                homeSection.appendChild(this.container);
            }
        }
    }
    
    createParticles() {
        const colors = [
            'rgba(255, 215, 0, 0.8)',  // Gold
            'rgba(0, 191, 255, 0.7)',  // Cyan
            'rgba(50, 205, 50, 0.6)',  // Green
            'rgba(138, 43, 226, 0.5)', // Purple
            'rgba(255, 255, 255, 0.4)' // White
        ];
        
        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            const color = colors[i % colors.length];
            const size = Math.random() * 4 + 2; // 2-6px
            const duration = Math.random() * 6 + 4; // 4-10s
            const delay = Math.random() * 8; // 0-8s delay
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, ${color}, transparent);
                border-radius: 50%;
                box-shadow: 
                    0 0 ${size * 2}px ${color},
                    0 0 ${size * 4}px ${color.replace('0.', '0.2')};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatMagic ${duration}s ease-in-out infinite;
                animation-delay: ${delay}s;
            `;
            
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
        
        // Add animation styles if not already present
        this.addAnimationStyles();
    }
    
    addAnimationStyles() {
        if (!document.querySelector('#particle-animations')) {
            const style = document.createElement('style');
            style.id = 'particle-animations';
            style.textContent = `
                @keyframes floatMagic {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px) scale(1);
                        opacity: 0.6;
                    }
                    25% {
                        transform: translateY(-40px) translateX(30px) scale(1.2);
                        opacity: 1;
                    }
                    50% {
                        transform: translateY(-20px) translateX(-40px) scale(0.8);
                        opacity: 0.8;
                    }
                    75% {
                        transform: translateY(-60px) translateX(20px) scale(1.1);
                        opacity: 0.9;
                    }
                }
                
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Add mouse interaction
    addMouseInteraction() {
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            this.particles.forEach((particle, index) => {
                const rect = particle.getBoundingClientRect();
                const particleX = rect.left + rect.width / 2;
                const particleY = rect.top + rect.height / 2;
                
                const distance = Math.sqrt(
                    Math.pow(mouseX - particleX, 2) + 
                    Math.pow(mouseY - particleY, 2)
                );
                
                if (distance < 100) {
                    const repulsion = (100 - distance) / 100;
                    const angleX = (particleX - mouseX) * repulsion * 0.5;
                    const angleY = (particleY - mouseY) * repulsion * 0.5;
                    
                    particle.style.transform = `translate(${angleX}px, ${angleY}px) scale(${1 + repulsion * 0.3})`;
                    particle.style.opacity = Math.min(1, 0.6 + repulsion * 0.4);
                } else {
                    particle.style.transform = '';
                    particle.style.opacity = '';
                }
            });
        });
    }
    
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.particles = [];
        console.log('✨ Particle system cleaned up');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure styles are loaded
    setTimeout(() => {
        window.simpleParticles = new SimpleParticleSystem();
        
        // Add mouse interaction after another delay
        setTimeout(() => {
            window.simpleParticles.addMouseInteraction();
        }, 500);
    }, 200);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.simpleParticles) {
        window.simpleParticles.destroy();
    }
});