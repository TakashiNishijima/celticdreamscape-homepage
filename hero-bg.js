// CelticDreamscape - Hero Background 3D Visualization
// Optimized Cyber-Celtic Starfield with Performance Enhancements

class CelticStarfield {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.stars = null;
        this.celticNodes = null;
        this.animationId = null;
        this.isInitialized = false;
        
        // Performance optimizations
        this.starsCount = 500; // Reduced from 1000
        this.maxPixelRatio = 1.5; // Limit high-DPI rendering
        this.targetFPS = 60;
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / this.targetFPS;
        
        // Celtic mysticism parameters
        this.mysticPulse = 0;
        this.druididcEnergy = 0;
        this.ancientRhythm = 0.01;
        
        this.init();
    }
    
    init() {
        try {
            this.setupScene();
            this.createStarField();
            this.createCelticNodes();
            this.setupEventListeners();
            this.animate();
            this.isInitialized = true;
            console.log('🌟 Celtic Starfield initialized with', this.starsCount, 'particles');
        } catch (error) {
            console.error('Failed to initialize Celtic Starfield:', error);
            this.fallbackVisualization();
        }
    }
    
    setupScene() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) {
            throw new Error('Hero canvas element not found');
        }
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x1a1a2e, 100, 1000);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.camera.position.z = 100;
        
        // Renderer setup with performance optimizations
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: window.devicePixelRatio <= 1, // Disable AA on high-DPI
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.maxPixelRatio));
        this.renderer.setClearColor(0x1a1a2e, 0);
        
        // Performance optimizations
        this.renderer.shadowMap.enabled = false; // Disable shadows for performance
        this.renderer.physicallyCorrectLights = false;
    }
    
    createStarField() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.starsCount * 3);
        const colors = new Float32Array(this.starsCount * 3);
        const sizes = new Float32Array(this.starsCount);
        
        // Celtic color palette
        const celticColors = [
            new THREE.Color(0x00ffff), // Cyber blue
            new THREE.Color(0x164e4a), // Deep emerald
            new THREE.Color(0xc0c5ce), // Mist silver
            new THREE.Color(0x888899), // Stone gray
            new THREE.Color(0xff00ff)  // Cyber pink (rare)
        ];
        
        for (let i = 0; i < this.starsCount; i++) {
            const i3 = i * 3;
            
            // Distribute stars in a Celtic knot-inspired pattern
            const radius = Math.random() * 800 + 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            // Add Celtic spiral influence
            const spiral = Math.sin(theta * 3) * 50;
            
            positions[i3] = (radius + spiral) * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = (radius + spiral) * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = (radius + spiral) * Math.cos(phi);
            
            // Assign Celtic colors with weighted distribution
            const colorIndex = this.getWeightedColorIndex();
            const color = celticColors[colorIndex];
            
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Vary star sizes for mystical effect
            sizes[i] = Math.random() * 3 + 1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Efficient point material
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }
    
    getWeightedColorIndex() {
        const rand = Math.random();
        if (rand < 0.4) return 0; // Cyber blue (40%)
        if (rand < 0.7) return 1; // Deep emerald (30%)
        if (rand < 0.85) return 2; // Mist silver (15%)
        if (rand < 0.95) return 3; // Stone gray (10%)
        return 4; // Cyber pink (5% - rare)
    }
    
    createCelticNodes() {
        // Create special Celtic mystical nodes
        const nodeGeometry = new THREE.SphereGeometry(2, 8, 8);
        const nodeMaterial = new THREE.MeshBasicMaterial({
            color: 0x164e4a,
            transparent: true,
            opacity: 0.6
        });
        
        this.celticNodes = new THREE.Group();
        
        // Create nodes in sacred geometry pattern
        const nodeCount = 12; // Sacred number in Celtic tradition
        for (let i = 0; i < nodeCount; i++) {
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
            
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = 150;
            
            node.position.x = Math.cos(angle) * radius;
            node.position.y = Math.sin(angle) * radius;
            node.position.z = (Math.random() - 0.5) * 100;
            
            this.celticNodes.add(node);
        }
        
        this.scene.add(this.celticNodes);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        
        // Mouse interaction for mystical effects
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        
        // Visibility API for performance
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
        if (!this.camera) return;
        
        // Subtle camera movement for immersion
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.camera.position.x += (mouseX * 10 - this.camera.position.x) * 0.05;
        this.camera.position.y += (mouseY * 10 - this.camera.position.y) * 0.05;
    }
    
    onVisibilityChange() {
        if (document.hidden) {
            this.pauseAnimation();
        } else {
            this.resumeAnimation();
        }
    }
    
    animate(currentTime = 0) {
        // Frame rate throttling for performance
        if (currentTime - this.lastFrameTime < this.frameInterval) {
            this.animationId = requestAnimationFrame(this.animate.bind(this));
            return;
        }
        
        this.lastFrameTime = currentTime;
        
        if (!this.scene || !this.renderer || !this.camera) return;
        
        this.updateMysticalEffects();
        this.updateStarField();
        this.updateCelticNodes();
        
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    updateMysticalEffects() {
        // Update mystical energy cycles
        this.mysticPulse += this.ancientRhythm;
        this.druididcEnergy = Math.sin(this.mysticPulse) * 0.5 + 0.5;
        
        // Apply energy to scene fog
        if (this.scene.fog) {
            const fogIntensity = 0.1 + this.druididcEnergy * 0.05;
            this.scene.fog.density = fogIntensity;
        }
    }
    
    updateStarField() {
        if (!this.stars) return;
        
        // Rotate starfield slowly
        this.stars.rotation.x = this.mysticPulse * 0.1;
        this.stars.rotation.y = this.mysticPulse * 0.15;
        
        // Pulse star sizes based on mystical energy
        const positions = this.stars.geometry.attributes.position.array;
        const colors = this.stars.geometry.attributes.color.array;
        
        // Update only a subset of stars each frame for performance
        const updateCount = Math.min(50, this.starsCount);
        const startIndex = Math.floor(Math.random() * (this.starsCount - updateCount));
        
        for (let i = startIndex; i < startIndex + updateCount; i++) {
            const i3 = i * 3;
            
            // Add subtle mystical breathing effect
            const breathe = Math.sin(this.mysticPulse + i * 0.1) * 0.1;
            
            // Subtle color pulsing
            if (Math.random() < 0.01) { // 1% chance per frame
                colors[i3] = Math.min(1, colors[i3] + breathe * 0.2);
                colors[i3 + 1] = Math.min(1, colors[i3 + 1] + breathe * 0.1);
                colors[i3 + 2] = Math.min(1, colors[i3 + 2] + breathe * 0.3);
            }
        }
        
        this.stars.geometry.attributes.color.needsUpdate = true;
    }
    
    updateCelticNodes() {
        if (!this.celticNodes) return;
        
        // Rotate Celtic nodes in sacred pattern
        this.celticNodes.rotation.z = this.mysticPulse * 0.2;
        
        // Update individual node materials
        this.celticNodes.children.forEach((node, index) => {
            const phase = this.mysticPulse + index * 0.5;
            const opacity = 0.3 + Math.sin(phase) * 0.3;
            
            node.material.opacity = Math.max(0.1, opacity);
            
            // Subtle scale pulsing
            const scale = 1 + Math.sin(phase * 2) * 0.2;
            node.scale.setScalar(scale);
        });
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
    
    fallbackVisualization() {
        // Simple CSS fallback when WebGL fails
        const canvas = document.getElementById('hero-canvas');
        if (canvas) {
            canvas.style.display = 'none';
            
            // Create CSS-based starfield
            const starfield = document.createElement('div');
            starfield.className = 'css-starfield';
            starfield.innerHTML = `
                <style>
                    .css-starfield {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: -1;
                        background: 
                            radial-gradient(2px 2px at 20px 30px, #00ffff, transparent),
                            radial-gradient(2px 2px at 40px 70px, #164e4a, transparent),
                            radial-gradient(1px 1px at 90px 40px, #c0c5ce, transparent),
                            radial-gradient(1px 1px at 130px 80px, #00ffff, transparent),
                            radial-gradient(2px 2px at 160px 30px, #164e4a, transparent);
                        background-repeat: repeat;
                        background-size: 200px 100px;
                        animation: drift 20s linear infinite;
                    }
                    
                    @keyframes drift {
                        from { transform: translateX(0); }
                        to { transform: translateX(-200px); }
                    }
                </style>
            `;
            
            document.body.appendChild(starfield);
            console.log('🎨 CSS fallback starfield activated');
        }
    }
    
    // Performance monitoring
    getPerformanceStats() {
        return {
            starsCount: this.starsCount,
            pixelRatio: this.renderer?.getPixelRatio() || 'N/A',
            targetFPS: this.targetFPS,
            isInitialized: this.isInitialized
        };
    }
    
    // Cleanup method
    destroy() {
        this.pauseAnimation();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.stars) {
            this.stars.geometry.dispose();
            this.stars.material.dispose();
        }
        
        if (this.celticNodes) {
            this.celticNodes.children.forEach(node => {
                node.geometry.dispose();
                node.material.dispose();
            });
        }
        
        window.removeEventListener('resize', this.onWindowResize);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        
        console.log('🧹 Celtic Starfield cleaned up');
    }
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl) {
        // Initialize Celtic Starfield
        window.celticStarfield = new CelticStarfield();
        
        // Log performance info
        console.log('🔧 Performance Settings:', window.celticStarfield.getPerformanceStats());
    } else {
        console.warn('⚠️ WebGL not supported, using CSS fallback');
        // Create instance anyway to trigger fallback
        window.celticStarfield = new CelticStarfield();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.celticStarfield) {
        window.celticStarfield.destroy();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CelticStarfield;
}