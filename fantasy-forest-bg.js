// CelticDreamscape - Fantasy Forest Background with Magical Particles
// Dynamic forest scene with floating light particles and mouse interaction

class FantasyForestBackground {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.particleCount = 300;
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        this.clock = new THREE.Clock();
        this.isInitialized = false;
        
        // Particle system properties
        this.particlePositions = null;
        this.particleVelocities = null;
        this.particleColors = null;
        this.particleSizes = null;
        this.particleOpacities = null;
        this.time = 0;
        
        // Forest background
        this.forestTexture = null;
        this.forestPlane = null;
        
        // Performance settings
        this.maxPixelRatio = 1.5;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        
        // Audio reactive properties
        this.audioData = {
            bass: 0,
            mid: 0,
            treble: 0,
            overall: 0
        };
        this.audioSmoothing = 0.8;
        this.smoothedAudioData = { ...this.audioData };
        
        this.init();
    }
    
    async init() {
        try {
            this.setupCanvas();
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupForestBackground();
            this.setupParticleSystem();
            this.setupLighting();
            this.setupEventListeners();
            this.animate();
            this.isInitialized = true;
            console.log('🌲 Fantasy Forest Background initialized');
        } catch (error) {
            console.error('Failed to initialize Fantasy Forest Background:', error);
            this.fallbackBackground();
        }
    }
    
    setupCanvas() {
        let canvas = document.getElementById('hero-canvas');
        if (!canvas) {
            // Create canvas if it doesn't exist
            canvas = document.createElement('canvas');
            canvas.id = 'hero-canvas';
            canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -10;
                pointer-events: none;
            `;
            document.body.insertBefore(canvas, document.body.firstChild);
            console.log('🎨 Canvas created dynamically');
        } else {
            console.log('🎨 Canvas found in DOM');
        }
        return canvas;
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        
        // Add subtle fog for depth
        this.scene.fog = new THREE.Fog(0x0f1929, 50, 200);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 50);
    }
    
    setupRenderer() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) {
            throw new Error('Canvas not found for renderer setup');
        }
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: window.devicePixelRatio <= 1,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.maxPixelRatio));
        this.renderer.setClearColor(0x0f1929, 0.3); // More transparent
        
        // Enable alpha blending
        this.renderer.sortObjects = false;
        console.log('🎮 Renderer initialized');
    }
    
    setupForestBackground() {
        // Create a background plane with forest texture
        const geometry = new THREE.PlaneGeometry(200, 120);
        
        // Create a gradient texture for the forest background
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create forest gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#0f1929'); // Dark blue top
        gradient.addColorStop(0.3, '#164e4a'); // Deep emerald
        gradient.addColorStop(0.6, '#1a3e3e'); // Forest green
        gradient.addColorStop(1, '#0f1929'); // Dark bottom
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add forest silhouette
        ctx.fillStyle = 'rgba(22, 78, 74, 0.6)';
        ctx.beginPath();
        for (let x = 0; x < 512; x += 20) {
            const height = 100 + Math.sin(x * 0.02) * 30 + Math.random() * 40;
            ctx.lineTo(x, 512 - height);
        }
        ctx.lineTo(512, 512);
        ctx.lineTo(0, 512);
        ctx.closePath();
        ctx.fill();
        
        // Add ancient ruins silhouettes
        this.addRuinsSilhouettes(ctx);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });
        
        this.forestPlane = new THREE.Mesh(geometry, material);
        this.forestPlane.position.z = -80;
        this.scene.add(this.forestPlane);
    }
    
    addRuinsSilhouettes(ctx) {
        // Add standing stones
        ctx.fillStyle = 'rgba(136, 136, 153, 0.4)';
        
        // Standing stone 1
        ctx.fillRect(80, 350, 15, 100);
        // Standing stone 2
        ctx.fillRect(200, 320, 12, 130);
        // Standing stone 3
        ctx.fillRect(350, 340, 18, 110);
        // Standing stone 4
        ctx.fillRect(420, 330, 14, 120);
        
        // Add stone circle
        ctx.strokeStyle = 'rgba(136, 136, 153, 0.3)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(256, 400, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add dolmen (stone table)
        ctx.fillStyle = 'rgba(136, 136, 153, 0.5)';
        ctx.fillRect(150, 420, 80, 8); // Top stone
        ctx.fillRect(150, 430, 12, 40); // Left support
        ctx.fillRect(218, 430, 12, 40); // Right support
    }
    
    setupParticleSystem() {
        const geometry = new THREE.BufferGeometry();
        
        // Initialize particle arrays
        this.particlePositions = new Float32Array(this.particleCount * 3);
        this.particleVelocities = new Float32Array(this.particleCount * 3);
        this.particleColors = new Float32Array(this.particleCount * 3);
        this.particleSizes = new Float32Array(this.particleCount);
        this.particleOpacities = new Float32Array(this.particleCount);
        
        // Celtic magical colors
        const colors = [
            { r: 1.0, g: 0.84, b: 0.0 },    // Gold
            { r: 0.0, g: 0.8, b: 0.4 },     // Emerald
            { r: 0.6, g: 0.9, b: 1.0 },     // Pale blue
            { r: 0.8, g: 1.0, b: 0.6 },     // Light green
            { r: 1.0, g: 0.9, b: 0.7 }      // Warm white
        ];
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // Position particles in 3D space
            this.particlePositions[i3] = (Math.random() - 0.5) * 160;     // x
            this.particlePositions[i3 + 1] = (Math.random() - 0.5) * 100; // y
            this.particlePositions[i3 + 2] = (Math.random() - 0.5) * 100; // z
            
            // Random initial velocities
            this.particleVelocities[i3] = (Math.random() - 0.5) * 0.02;
            this.particleVelocities[i3 + 1] = Math.random() * 0.01 + 0.005;
            this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
            
            // Assign colors
            const colorIndex = Math.floor(Math.random() * colors.length);
            const color = colors[colorIndex];
            this.particleColors[i3] = color.r;
            this.particleColors[i3 + 1] = color.g;
            this.particleColors[i3 + 2] = color.b;
            
            // Random sizes and opacities
            this.particleSizes[i] = Math.random() * 3 + 1;
            this.particleOpacities[i] = Math.random() * 0.8 + 0.2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(this.particleSizes, 1));
        
        // Create particle material with custom shader for better visual effects
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    setupLighting() {
        // Ambient light for overall scene
        const ambientLight = new THREE.AmbientLight(0x164e4a, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light for depth
        const directionalLight = new THREE.DirectionalLight(0xffd700, 0.2);
        directionalLight.position.set(50, 50, 50);
        this.scene.add(directionalLight);
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        
        // Mouse movement for particle interaction
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        
        // Visibility change for performance
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this), false);
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.maxPixelRatio));
    }
    
    onMouseMove(event) {
        // Convert mouse position to normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    onVisibilityChange() {
        if (document.hidden) {
            this.pauseAnimation();
        } else {
            this.resumeAnimation();
        }
    }
    
    updateParticles() {
        if (!this.particles) return;
        
        this.time += 0.01;
        
        const positions = this.particles.geometry.attributes.position.array;
        const colors = this.particles.geometry.attributes.color.array;
        const sizes = this.particles.geometry.attributes.size.array;
        
        const mouseInfluence = 15; // Radius of mouse influence
        const mouseStrength = 0.02; // Strength of mouse repulsion
        
        // Audio reactive modifiers
        const bassBoost = 1 + this.smoothedAudioData.bass * 2;
        const trebleSparkle = this.smoothedAudioData.treble;
        const midGlow = this.smoothedAudioData.mid;
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // Get current position
            let x = positions[i3];
            let y = positions[i3 + 1];
            let z = positions[i3 + 2];
            
            // Apply Perlin-like noise for natural movement
            const noiseX = Math.sin(this.time + i * 0.1) * 0.01;
            const noiseY = Math.cos(this.time * 0.7 + i * 0.15) * 0.005;
            const noiseZ = Math.sin(this.time * 0.5 + i * 0.2) * 0.01;
            
            // Audio reactive movement
            const audioMovementX = Math.sin(this.time * 2 + i * 0.1) * this.smoothedAudioData.bass * 0.05;
            const audioMovementY = Math.cos(this.time * 1.5 + i * 0.15) * this.smoothedAudioData.treble * 0.03;
            
            // Apply base velocities with noise and audio
            x += this.particleVelocities[i3] + noiseX + audioMovementX;
            y += this.particleVelocities[i3 + 1] + noiseY + audioMovementY;
            z += this.particleVelocities[i3 + 2] + noiseZ;
            
            // Mouse interaction - convert mouse coordinates to world space
            const mouseWorldX = this.mouse.x * 80;
            const mouseWorldY = this.mouse.y * 50;
            
            const distanceToMouse = Math.sqrt(
                (x - mouseWorldX) ** 2 + 
                (y - mouseWorldY) ** 2
            );
            
            if (distanceToMouse < mouseInfluence) {
                const repulsionForce = (mouseInfluence - distanceToMouse) / mouseInfluence;
                const dirX = (x - mouseWorldX) / distanceToMouse;
                const dirY = (y - mouseWorldY) / distanceToMouse;
                
                x += dirX * repulsionForce * mouseStrength;
                y += dirY * repulsionForce * mouseStrength;
            }
            
            // Boundary wrapping
            if (x > 80) x = -80;
            if (x < -80) x = 80;
            if (y > 50) y = -50;
            if (z > 50) z = -50;
            if (z < -50) z = 50;
            
            // Update positions
            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;
            
            // Audio reactive colors
            const bassParticle = i % 3 === 0;
            const trebleParticle = i % 3 === 1;
            
            if (bassParticle) {
                // Bass particles: gold to bright gold
                colors[i3] = 1.0; // R
                colors[i3 + 1] = 0.84 + midGlow * 0.16; // G
                colors[i3 + 2] = midGlow * 0.3; // B
            } else if (trebleParticle) {
                // Treble particles: emerald with sparkle
                colors[i3] = trebleSparkle * 0.5; // R
                colors[i3 + 1] = 0.8 + trebleSparkle * 0.2; // G
                colors[i3 + 2] = 0.4 + trebleSparkle * 0.3; // B
            } else {
                // Mid particles: blue-white mix
                colors[i3] = 0.6 + midGlow * 0.4; // R
                colors[i3 + 1] = 0.9 + midGlow * 0.1; // G
                colors[i3 + 2] = 1.0; // B
            }
            
            // Audio reactive sizes
            const baseSize = this.particleSizes[i];
            sizes[i] = baseSize * (0.8 + this.smoothedAudioData.overall * 0.4);
            
            // Update opacity based on distance and time
            const baseOpacity = 0.3 + Math.sin(this.time * 2 + i * 0.1) * 0.3;
            const audioOpacity = 0.5 + this.smoothedAudioData.overall * 0.5;
            this.particleOpacities[i] = Math.max(0.1, baseOpacity * audioOpacity);
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.color.needsUpdate = true;
        this.particles.geometry.attributes.size.needsUpdate = true;
        
        // Audio reactive rotation
        const rotationSpeed = 0.05 + this.smoothedAudioData.overall * 0.03;
        this.particles.rotation.y = this.time * rotationSpeed;
        
        // Audio reactive material opacity
        this.particles.material.opacity = 0.8 + this.smoothedAudioData.overall * 0.2;
    }
    
    // New method to receive audio data from main.js
    updateWithAudioData(audioData) {
        // Smooth the audio data for more natural visual response
        this.smoothedAudioData.bass = this.smoothedAudioData.bass * this.audioSmoothing + audioData.bass * (1 - this.audioSmoothing);
        this.smoothedAudioData.mid = this.smoothedAudioData.mid * this.audioSmoothing + audioData.mid * (1 - this.audioSmoothing);
        this.smoothedAudioData.treble = this.smoothedAudioData.treble * this.audioSmoothing + audioData.treble * (1 - this.audioSmoothing);
        this.smoothedAudioData.overall = this.smoothedAudioData.overall * this.audioSmoothing + audioData.overall * (1 - this.audioSmoothing);
        
        // Store raw data for immediate effects
        this.audioData = { ...audioData };
    }
    
    updateForestBackground() {
        if (!this.forestPlane) return;
        
        // Gentle swaying motion with audio reactive enhancement
        const sway = Math.sin(this.time * 0.5) * 2;
        const audioSway = this.smoothedAudioData.bass * 5;
        this.forestPlane.position.x = sway + audioSway;
        
        // Audio reactive opacity
        const baseOpacity = 0.8 + Math.sin(this.time * 0.3) * 0.1;
        const audioOpacity = this.smoothedAudioData.mid * 0.2;
        this.forestPlane.material.opacity = Math.min(1.0, baseOpacity + audioOpacity);
    }
    
    animate(currentTime = 0) {
        // Frame rate throttling
        if (currentTime - this.lastFrameTime < this.frameInterval) {
            this.animationId = requestAnimationFrame(this.animate.bind(this));
            return;
        }
        
        this.lastFrameTime = currentTime;
        
        if (!this.scene || !this.renderer || !this.camera) return;
        
        this.updateParticles();
        this.updateForestBackground();
        
        // Subtle camera movement
        this.camera.position.x = Math.sin(this.time * 0.2) * 2;
        this.camera.position.y = Math.cos(this.time * 0.15) * 1;
        
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    resumeAnimation() {
        if (!this.animationId && this.isInitialized) {
            this.animate();
        }
    }
    
    fallbackBackground() {
        // Enhanced CSS fallback when WebGL fails
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.style.background = `
                linear-gradient(135deg, 
                    rgba(15, 25, 45, 0.95) 0%,
                    rgba(22, 78, 74, 0.6) 20%,
                    rgba(0, 100, 0, 0.4) 40%,
                    rgba(34, 139, 34, 0.6) 60%,
                    rgba(22, 78, 74, 0.6) 80%,
                    rgba(15, 25, 45, 0.9) 100%),
                radial-gradient(ellipse at 30% 70%, rgba(255, 215, 0, 0.15), transparent 50%),
                radial-gradient(ellipse at 70% 30%, rgba(0, 191, 255, 0.1), transparent 40%)
            `;
            
            // Add animated particles with CSS
            const particlesContainer = document.createElement('div');
            particlesContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: -5;
                pointer-events: none;
            `;
            
            // Create CSS particles
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: ${i % 2 === 0 ? 'rgba(255, 215, 0, 0.8)' : 'rgba(0, 191, 255, 0.6)'};
                    border-radius: 50%;
                    animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    box-shadow: 0 0 10px currentColor;
                `;
                particlesContainer.appendChild(particle);
            }
            
            homeSection.appendChild(particlesContainer);
            
            // Add CSS animation
            if (!document.querySelector('#fallback-animation')) {
                const style = document.createElement('style');
                style.id = 'fallback-animation';
                style.textContent = `
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.7; }
                        25% { transform: translateY(-20px) translateX(10px); opacity: 1; }
                        50% { transform: translateY(-10px) translateX(-15px); opacity: 0.8; }
                        75% { transform: translateY(-30px) translateX(5px); opacity: 0.9; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            console.log('🎨 Enhanced CSS fallback background activated');
        }
    }
    
    destroy() {
        this.pauseAnimation();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
        
        if (this.forestPlane) {
            this.forestPlane.geometry.dispose();
            this.forestPlane.material.dispose();
        }
        
        window.removeEventListener('resize', this.onWindowResize);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        
        console.log('🧹 Fantasy Forest Background cleaned up');
    }
    
    getPerformanceStats() {
        return {
            particleCount: this.particleCount,
            pixelRatio: this.renderer?.getPixelRatio() || 'N/A',
            targetFPS: this.targetFPS,
            isInitialized: this.isInitialized
        };
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌲 DOM loaded, initializing Fantasy Forest Background...');
    
    // Small delay to ensure all resources are loaded
    setTimeout(() => {
        // Check for WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl && window.THREE) {
            try {
                // Initialize Fantasy Forest Background
                window.fantasyForestBg = new FantasyForestBackground();
                
                // Log performance info
                console.log('🌟 Fantasy Forest Performance:', window.fantasyForestBg.getPerformanceStats());
            } catch (error) {
                console.error('❌ Failed to initialize 3D background:', error);
                // Fallback to enhanced CSS background
                const fallbackInstance = new FantasyForestBackground();
                fallbackInstance.fallbackBackground();
            }
        } else {
            console.warn('⚠️ WebGL or Three.js not available, using CSS fallback');
            
            // Create enhanced fallback
            const fallbackInstance = {
                fallbackBackground: () => {
                    const homeSection = document.getElementById('home');
                    if (homeSection) {
                        homeSection.style.background = `
                            linear-gradient(135deg, 
                                rgba(15, 25, 45, 0.95) 0%,
                                rgba(22, 78, 74, 0.6) 20%,
                                rgba(0, 100, 0, 0.4) 40%,
                                rgba(34, 139, 34, 0.6) 60%,
                                rgba(22, 78, 74, 0.6) 80%,
                                rgba(15, 25, 45, 0.9) 100%),
                            radial-gradient(ellipse at 30% 70%, rgba(255, 215, 0, 0.15), transparent 50%),
                            radial-gradient(ellipse at 70% 30%, rgba(0, 191, 255, 0.1), transparent 40%)
                        `;
                        console.log('🎨 Basic CSS fallback applied');
                    }
                }
            };
            fallbackInstance.fallbackBackground();
        }
    }, 100);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.fantasyForestBg && window.fantasyForestBg.destroy) {
        window.fantasyForestBg.destroy();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FantasyForestBackground;
}