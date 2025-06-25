// CelticDreamscape - Music Platform Integration
// Multi-platform audio streaming integration

class MusicPlatformManager {
    constructor() {
        this.platforms = {
            spotify: null,
            soundcloud: null,
            bandcamp: null,
            youtube: null
        };
        this.currentPlatform = null;
        this.currentTrack = null;
        this.isPlaying = false;
        
        this.init();
    }
    
    async init() {
        console.log('🎵 Initializing Music Platform Manager...');
        await this.initializeSpotify();
        await this.initializeSoundCloud();
        this.initializeBandcamp();
        this.setupEventListeners();
    }
    
    // Spotify Web Playback SDK Integration
    async initializeSpotify() {
        try {
            // Load Spotify Web Playback SDK
            await this.loadScript('https://sdk.scdn.co/spotify-player.js');
            
            window.onSpotifyWebPlaybackSDKReady = () => {
                // Note: Requires Spotify Premium and authentication
                console.log('🎧 Spotify Web Playback SDK ready');
                
                // Create Spotify player instance
                this.platforms.spotify = new Spotify.Player({
                    name: 'CelticDreamscape Web Player',
                    getOAuthToken: cb => {
                        // Get OAuth token from your backend
                        // cb(access_token);
                        console.warn('Spotify OAuth token required');
                    },
                    volume: 0.5
                });
                
                // Error handling
                this.platforms.spotify.addListener('initialization_error', ({ message }) => {
                    console.error('Spotify initialization error:', message);
                });
                
                this.platforms.spotify.addListener('authentication_error', ({ message }) => {
                    console.error('Spotify authentication error:', message);
                });
                
                // Ready
                this.platforms.spotify.addListener('ready', ({ device_id }) => {
                    console.log('🎵 Spotify player ready with Device ID:', device_id);
                });
                
                // Connect to the player
                this.platforms.spotify.connect();
            };
        } catch (error) {
            console.warn('Spotify integration failed:', error);
        }
    }
    
    // SoundCloud API Integration
    async initializeSoundCloud() {
        try {
            // Load SoundCloud Widget API
            await this.loadScript('https://w.soundcloud.com/player/api.js');
            
            console.log('🔊 SoundCloud Widget API loaded');
            
            // SoundCloud integration will use iframe embeds
            this.platforms.soundcloud = {
                initialized: true,
                widgets: new Map()
            };
            
        } catch (error) {
            console.warn('SoundCloud integration failed:', error);
        }
    }
    
    // Bandcamp Embed Integration
    initializeBandcamp() {
        console.log('🎼 Bandcamp embed integration ready');
        this.platforms.bandcamp = {
            initialized: true,
            embeds: new Map()
        };
    }
    
    // Utility: Load external scripts
    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Create Spotify embed
    createSpotifyEmbed(trackId, container) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
        iframe.width = '100%';
        iframe.height = '352';
        iframe.frameBorder = '0';
        iframe.allowtransparency = 'true';
        iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        iframe.loading = 'lazy';
        
        container.appendChild(iframe);
        return iframe;
    }
    
    // Create SoundCloud embed
    createSoundCloudEmbed(trackUrl, container) {
        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '166';
        iframe.scrolling = 'no';
        iframe.frameBorder = 'no';
        iframe.allow = 'autoplay';
        iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%2300ffff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
        
        container.appendChild(iframe);
        
        // Initialize SoundCloud widget
        if (window.SC) {
            const widget = SC.Widget(iframe);
            this.platforms.soundcloud.widgets.set(trackUrl, widget);
            
            widget.bind(SC.Widget.Events.READY, () => {
                console.log('🔊 SoundCloud widget ready');
            });
            
            widget.bind(SC.Widget.Events.PLAY, () => {
                this.isPlaying = true;
                this.currentPlatform = 'soundcloud';
            });
            
            widget.bind(SC.Widget.Events.PAUSE, () => {
                this.isPlaying = false;
            });
        }
        
        return iframe;
    }
    
    // Create Bandcamp embed
    createBandcampEmbed(albumId, container) {
        const iframe = document.createElement('iframe');
        iframe.style.border = '0';
        iframe.style.width = '100%';
        iframe.style.height = '120px';
        iframe.src = `https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=large/bgcol=1a1a2e/linkcol=00ffff/tracklist=false/artwork=small/transparent=true/`;
        iframe.seamless = true;
        
        container.appendChild(iframe);
        return iframe;
    }
    
    // Create YouTube Music embed
    createYouTubeEmbed(videoId, container) {
        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '315';
        iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        
        container.appendChild(iframe);
        return iframe;
    }
    
    // Universal track loader
    loadTrack(platform, trackData, container) {
        switch (platform) {
            case 'spotify':
                return this.createSpotifyEmbed(trackData.id, container);
            case 'soundcloud':
                return this.createSoundCloudEmbed(trackData.url, container);
            case 'bandcamp':
                return this.createBandcampEmbed(trackData.albumId, container);
            case 'youtube':
                return this.createYouTubeEmbed(trackData.videoId, container);
            default:
                console.error('Unknown platform:', platform);
                return null;
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Platform selection handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-platform]')) {
                const platform = e.target.dataset.platform;
                const trackData = JSON.parse(e.target.dataset.track || '{}');
                const container = e.target.closest('.track-card').querySelector('.player-container');
                
                this.switchPlatform(platform, trackData, container);
            }
        });
    }
    
    // Switch between platforms
    switchPlatform(platform, trackData, container) {
        // Clear existing player
        container.innerHTML = '';
        
        // Load new platform player
        const player = this.loadTrack(platform, trackData, container);
        
        if (player) {
            this.currentPlatform = platform;
            this.currentTrack = trackData;
            console.log(`🎵 Switched to ${platform}:`, trackData);
        }
    }
    
    // Get track information
    getTrackInfo(platform, trackId) {
        // This would typically fetch from the platform's API
        const mockData = {
            spotify: {
                id: trackId,
                name: 'The Last Druid Protocol',
                artist: 'CelticDreamscape',
                album: 'Digital Mysticism',
                duration: 245000,
                preview_url: null
            },
            soundcloud: {
                url: trackId,
                title: 'Brendan\'s Digital Voyage',
                user: 'CelticDreamscape',
                duration: 312000
            }
        };
        
        return Promise.resolve(mockData[platform] || {});
    }
    
    // Platform availability check
    isPlatformAvailable(platform) {
        return this.platforms[platform] && this.platforms[platform].initialized;
    }
    
    // Get all available platforms
    getAvailablePlatforms() {
        return Object.keys(this.platforms).filter(p => this.isPlatformAvailable(p));
    }
}

// Track data configuration
const TRACK_DATABASE = {
    'the-last-druid-protocol': {
        title: 'The Last Druid Protocol',
        description: '古代の叡智がデジタル・コードに変換される瞬間を音で表現',
        inspiration: '最後のドルイドの暗号',
        platforms: {
            spotify: { id: '4iV5W9uYEdYUVa79Axb7Rh' }, // Example Spotify track ID
            soundcloud: { url: 'https://soundcloud.com/celticdreamscape/the-last-druid-protocol' },
            bandcamp: { albumId: '1234567890' },
            youtube: { videoId: 'dQw4w9WgXcQ' }
        }
    },
    'brendans-digital-voyage': {
        title: 'Brendan\'s Digital Voyage',
        description: '聖ブレンダンの神秘の島への航海をサイバー・オーシャンで再現',
        inspiration: 'ブレンダンの航海',
        platforms: {
            spotify: { id: '0VjIjW4GlUla4FI9M4XgBJ' },
            soundcloud: { url: 'https://soundcloud.com/celticdreamscape/brendans-digital-voyage' },
            youtube: { videoId: 'dQw4w9WgXcQ' }
        }
    },
    'tir-na-nog-interface': {
        title: 'Tír na nÓg Interface',
        description: '不老不死の理想郷をデジタル・ユートピアとして再構築',
        inspiration: '永遠の若さの国',
        platforms: {
            spotify: { id: '6JEK0CvvjDjjMUBFoXShNZ' },
            bandcamp: { albumId: '0987654321' },
            youtube: { videoId: 'dQw4w9WgXcQ' }
        }
    },
    'morrigans-algorithm': {
        title: 'Morrigan\'s Algorithm',
        description: '予言と戦争の女神の知恵をAIアルゴリズムで表現',
        inspiration: '戦女神モリガンのアルゴリズム',
        platforms: {
            soundcloud: { url: 'https://soundcloud.com/celticdreamscape/morrigans-algorithm' },
            youtube: { videoId: 'dQw4w9WgXcQ' }
        }
    },
    'newgrange-frequencies': {
        title: 'Newgrange Frequencies',
        description: '5000年前の巨石記念物が発する神秘の共鳴周波数',
        inspiration: 'ニューグレンジ遺跡の周波数',
        platforms: {
            spotify: { id: '2GeFLlhGaKLpVOoOj3Rj5Q' },
            soundcloud: { url: 'https://soundcloud.com/celticdreamscape/newgrange-frequencies' },
            bandcamp: { albumId: '1122334455' }
        }
    },
    'the-sidhe-network': {
        title: 'The Sidhe Network',
        description: '妖精族が構築した見えざるネットワークの音響マッピング',
        inspiration: '妖精族のネットワーク',
        platforms: {
            spotify: { id: '7qiZfU4dY5rRk3FO4EsUdh' },
            youtube: { videoId: 'dQw4w9WgXcQ' }
        }
    }
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MusicPlatformManager, TRACK_DATABASE };
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlatforms = new MusicPlatformManager();
    window.trackDatabase = TRACK_DATABASE;
    console.log('🎼 Music Platform Integration Ready');
});