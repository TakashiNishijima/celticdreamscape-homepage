// CelticDreamscape - Digital Druid Main JavaScript
// Cybernetic Folklore Audio Experience

class CelticDreamscape {
    constructor() {
        this.wavesurfer = null;
        this.isAudioLoaded = false;
        this.isPlaying = false;
        this.currentTrack = null;
        this.analyser = null;
        this.frequencyData = null;
        this.audioContext = null;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupWaveSurfer();
        this.bindEventListeners();
        this.initializeScrollAnimations();
        this.loadDefaultTrack();
    }
    
    setupWaveSurfer() {
        const waveformContainer = document.getElementById('waveform');
        if (!waveformContainer) {
            console.warn('Waveform container not found');
            return;
        }
        
        this.wavesurfer = WaveSurfer.create({
            container: waveformContainer,
            waveColor: '#00ffff',
            progressColor: '#164e4a',
            backgroundColor: 'rgba(26, 26, 46, 0.8)',
            barWidth: 2,
            barRadius: 1,
            barGap: 1,
            height: 80,
            normalize: true,
            responsive: true,
            interact: true,
            cursorColor: '#ff00ff',
            cursorWidth: 2,
            audioRate: 1
        });
        
        // Wave loading events
        this.wavesurfer.on('ready', () => {
            this.isAudioLoaded = true;
            console.log('Audio loaded successfully');
            this.updatePlayButtons();
            this.setupAudioAnalyser();
        });
        
        this.wavesurfer.on('error', (error) => {
            console.error('WaveSurfer error:', error);
            this.showAudioError();
        });
        
        this.wavesurfer.on('play', () => {
            this.isPlaying = true;
            this.updatePlayButtons();
        });
        
        this.wavesurfer.on('pause', () => {
            this.isPlaying = false;
            this.updatePlayButtons();
        });
        
        // Audio reactive visualization
        this.wavesurfer.on('audioprocess', () => {
            this.updateAudioVisualization();
        });
    }
    
    setupAudioAnalyser() {
        try {
            // Get the Web Audio API context from WaveSurfer
            this.audioContext = this.wavesurfer.backend.ac;
            if (this.audioContext && this.wavesurfer.backend.analyser) {
                this.analyser = this.wavesurfer.backend.analyser;
            } else {
                // Create analyser if not available
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                this.wavesurfer.backend.setFilter(this.analyser);
            }
            
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            console.log('🎵 Audio analyser setup complete');
        } catch (error) {
            console.warn('Could not setup audio analyser:', error);
        }
    }
    
    updateAudioVisualization() {
        if (!this.analyser || !this.frequencyData || !this.isPlaying) return;
        
        try {
            // Get frequency data
            this.analyser.getByteFrequencyData(this.frequencyData);
            
            // Calculate frequency ranges
            const bassRange = this.frequencyData.slice(0, 32);
            const midRange = this.frequencyData.slice(32, 96);
            const trebleRange = this.frequencyData.slice(96, 128);
            
            // Calculate average values
            const bassAvg = bassRange.reduce((a, b) => a + b, 0) / bassRange.length / 255;
            const midAvg = midRange.reduce((a, b) => a + b, 0) / midRange.length / 255;
            const trebleAvg = trebleRange.reduce((a, b) => a + b, 0) / trebleRange.length / 255;
            
            // Send data to background visualization
            if (window.fantasyForestBg && window.fantasyForestBg.updateWithAudioData) {
                window.fantasyForestBg.updateWithAudioData({
                    bass: bassAvg,
                    mid: midAvg,
                    treble: trebleAvg,
                    overall: (bassAvg + midAvg + trebleAvg) / 3
                });
            }
            
            // Update visual effects on page elements
            this.updatePageAudioEffects(bassAvg, midAvg, trebleAvg);
        } catch (error) {
            console.warn('Audio visualization update error:', error);
        }
    }
    
    updatePageAudioEffects(bass, mid, treble) {
        // Update neon glow intensity based on audio
        const neonElements = document.querySelectorAll('.neon-glow, .cyber-glow');
        neonElements.forEach(element => {
            const intensity = 0.8 + (bass + treble) * 0.4;
            element.style.filter = `brightness(${intensity})`;
        });
        
        // Pulse cyber-glass elements with mid frequencies
        const glassElements = document.querySelectorAll('.cyber-glass');
        glassElements.forEach(element => {
            const scale = 1 + mid * 0.02;
            element.style.transform = `scale(${scale})`;
        });
    }
    
    loadDefaultTrack() {
        // Try to load a demo track with better error handling
        const demoTrackUrl = '/assets/audio/demo.mp3';
        
        if (this.wavesurfer) {
            this.checkAudioFile(demoTrackUrl)
                .then(() => {
                    this.wavesurfer.load(demoTrackUrl);
                    this.currentTrack = {
                        title: 'The Last Druid Protocol',
                        artist: 'CelticDreamscape',
                        url: demoTrackUrl
                    };
                    console.log('🎵 Audio track loaded successfully');
                })
                .catch((error) => {
                    console.info('💡 No audio file found - showing placeholder visualization');
                    this.createPlaceholderVisualization();
                });
        }
    }
    
    async checkAudioFile(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error('File not found');
            }
            return true;
        } catch (error) {
            throw new Error('Audio file not accessible');
        }
    }
    
    createPlaceholderVisualization() {
        // Create a placeholder waveform visualization when no audio file is available
        const waveformContainer = document.getElementById('waveform');
        if (!waveformContainer) return;
        
        waveformContainer.innerHTML = `
            <div class="h-full flex items-center justify-center bg-deepnight/50 rounded relative overflow-hidden">
                <div class="text-center">
                    <div class="text-cyber-blue mb-2">
                        <svg class="w-8 h-8 mx-auto animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                    </div>
                    <p class="text-xs text-mistsilver/60">Audio demo unavailable</p>
                    <p class="text-xs text-deep-emerald/80">Place your audio file at: /assets/audio/demo.mp3</p>
                </div>
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-blue/10 to-transparent animate-pulse"></div>
            </div>
        `;
    }
    
    showAudioError() {
        const waveformContainer = document.getElementById('waveform');
        if (!waveformContainer) return;
        
        waveformContainer.innerHTML = `
            <div class="h-full flex items-center justify-center bg-red-900/20 rounded border border-red-500/30">
                <div class="text-center">
                    <div class="text-red-400 mb-2">
                        <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <p class="text-xs text-red-400">Audio loading failed</p>
                </div>
            </div>
        `;
    }
    
    updatePlayButtons() {
        const playButtons = document.querySelectorAll('.play-button');
        playButtons.forEach(button => {
            if (this.isPlaying) {
                button.innerHTML = `
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                `;
            } else {
                button.innerHTML = `
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                `;
            }
        });
    }
    
    bindEventListeners() {
        // Play/Pause button functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('.play-button')) {
                e.preventDefault();
                this.togglePlayback();
            }
        });
        
        // Platform icon click handlers
        document.addEventListener('click', (e) => {
            const platformIcon = e.target.closest('.platform-icon');
            if (platformIcon) {
                e.preventDefault();
                this.handlePlatformSwitch(platformIcon);
            }
        });
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-menu-toggle');
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', this.toggleMobileMenu);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.togglePlayback();
            }
        });
    }
    
    handlePlatformSwitch(platformIcon) {
        const platform = platformIcon.dataset.platform;
        const trackId = platformIcon.dataset.trackId;
        const trackCard = platformIcon.closest('.track-card');
        const playerContainer = trackCard.querySelector('.player-container');
        
        if (!platform || !trackId || !playerContainer) {
            console.warn('Missing platform switch data');
            return;
        }
        
        // Remove active class from all platform icons in this card
        trackCard.querySelectorAll('.platform-icon').forEach(icon => {
            icon.classList.remove('active');
        });
        
        // Add active class to clicked icon
        platformIcon.classList.add('active');
        
        // Prepare track data
        const trackData = {
            id: trackId,
            url: trackId.startsWith('http') ? trackId : undefined,
            videoId: platform === 'youtube' ? trackId : undefined,
            albumId: platform === 'bandcamp' ? trackId : undefined
        };
        
        // Switch platform using music platforms manager
        if (window.musicPlatforms && window.musicPlatforms.switchPlatform) {
            window.musicPlatforms.switchPlatform(platform, trackData, playerContainer);
        } else {
            console.warn('Music platforms manager not available');
            this.fallbackPlayerLoad(platform, trackData, playerContainer);
        }
        
        console.log(`🎵 Switched to ${platform} for track:`, trackId);
    }
    
    fallbackPlayerLoad(platform, trackData, container) {
        // Simple fallback player loading
        container.innerHTML = '';
        
        let embedHtml = '';
        
        switch (platform) {
            case 'youtube':
                embedHtml = `
                    <iframe width="100%" height="100%" 
                        src="https://www.youtube.com/embed/${trackData.videoId}?enablejsapi=1&rel=0&modestbranding=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen loading="lazy">
                    </iframe>
                `;
                break;
            case 'spotify':
                embedHtml = `
                    <iframe width="100%" height="100%" 
                        src="https://open.spotify.com/embed/track/${trackData.id}?utm_source=generator&theme=0" 
                        frameborder="0" 
                        allowtransparency="true" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy">
                    </iframe>
                `;
                break;
            case 'soundcloud':
                embedHtml = `
                    <iframe width="100%" height="100%" 
                        src="https://w.soundcloud.com/player/?url=${encodeURIComponent(trackData.url)}&color=%2300ffff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true" 
                        frameborder="0" 
                        allow="autoplay" 
                        loading="lazy">
                    </iframe>
                `;
                break;
            case 'bandcamp':
                embedHtml = `
                    <iframe width="100%" height="100%" 
                        src="https://bandcamp.com/EmbeddedPlayer/album=${trackData.albumId}/size=large/bgcol=1a1a2e/linkcol=00ffff/tracklist=false/artwork=small/transparent=true/" 
                        seamless loading="lazy">
                    </iframe>
                `;
                break;
            default:
                embedHtml = '<div class="flex items-center justify-center h-full text-mistsilver/60">Player not available</div>';
        }
        
        container.innerHTML = embedHtml;
    }
    
    togglePlayback() {
        if (!this.wavesurfer || !this.isAudioLoaded) {
            console.warn('Audio not loaded yet');
            return;
        }
        
        if (this.isPlaying) {
            this.wavesurfer.pause();
        } else {
            this.wavesurfer.play();
        }
    }
    
    toggleMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.toggle('hidden');
        }
    }
    
    initializeScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, observerOptions);
        
        // Observe elements with fade-in-on-scroll class
        document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
            observer.observe(el);
        });
        
        // Also observe other animated elements
        document.querySelectorAll('.cyber-glass, .stone-tablet, .masonry-item').forEach(el => {
            observer.observe(el);
        });
        
        console.log('🎭 Scroll animations initialized');
    }
    
    // Audio Visualization Effects
    setupAudioVisualization() {
        if (!this.wavesurfer) return;
        
        // Add custom audio visualization effects
        this.wavesurfer.on('audioprocess', () => {
            this.updateVisualizationEffects();
        });
    }
    
    updateVisualizationEffects() {
        // Sync visual effects with audio playback
        const glitchElements = document.querySelectorAll('.glitch');
        const randomGlitch = Math.random() > 0.95;
        
        if (randomGlitch && this.isPlaying) {
            glitchElements.forEach(el => {
                el.style.animation = 'none';
                setTimeout(() => {
                    el.style.animation = 'glitch 0.3s infinite linear alternate-reverse';
                }, 10);
            });
        }
    }
    
    // Track Management
    loadTrack(trackData) {
        if (!this.wavesurfer) return;
        
        this.currentTrack = trackData;
        this.wavesurfer.load(trackData.url);
        
        // Update track info display
        this.updateTrackInfo(trackData);
    }
    
    updateTrackInfo(trackData) {
        const trackTitle = document.querySelector('.current-track-title');
        const trackArtist = document.querySelector('.current-track-artist');
        
        if (trackTitle) trackTitle.textContent = trackData.title;
        if (trackArtist) trackArtist.textContent = trackData.artist;
    }
    
    // Performance Monitoring
    logPerformance() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
            const firstPaint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint');
            
            console.log('🚀 Performance Metrics:');
            console.log(`  • Page load time: ${loadTime}ms`);
            console.log(`  • DOM ready: ${domReady}ms`);
            if (firstPaint) {
                console.log(`  • First paint: ${Math.round(firstPaint.startTime)}ms`);
            }
            
            // Monitor resource loading
            const resources = performance.getEntriesByType('resource');
            const scripts = resources.filter(r => r.name.includes('.js'));
            const totalScriptTime = scripts.reduce((total, script) => total + script.duration, 0);
            console.log(`  • Script loading time: ${Math.round(totalScriptTime)}ms`);
        }
    }
}

// Utility Functions
const utils = {
    // Smooth color transition for cyber effects
    lerpColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    },
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    // Random Celtic-inspired text effects
    applyMysticEffect(element) {
        const originalText = element.textContent;
        const chars = originalText.split('');
        
        element.style.transition = 'all 0.3s ease';
        
        chars.forEach((char, index) => {
            setTimeout(() => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.color = Math.random() > 0.5 ? '#00ffff' : '#164e4a';
                element.appendChild(span);
            }, index * 50);
        });
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 CelticDreamscape - Digital Druid Interface Initialized');
    
    // Initialize main application
    window.celticDreamscape = new CelticDreamscape();
    
    // Log performance metrics
    window.celticDreamscape.logPerformance();
    
    // Add fade-in animation class to CSS if not present
    if (!document.querySelector('.animate-fade-in')) {
        const style = document.createElement('style');
        style.textContent = `
            .animate-fade-in {
                animation: fadeIn 0.8s ease-in-out forwards;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CelticDreamscape, utils };
}