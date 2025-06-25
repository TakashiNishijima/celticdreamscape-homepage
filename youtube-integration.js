// CelticDreamscape - YouTube Channel Integration
// Real YouTube content fetching and integration

class YouTubeChannelManager {
    constructor() {
        this.channelId = 'UCcelticdreamscape-i2k'; // Will be extracted from URL
        this.channelHandle = '@celticdreamscape-i2k';
        this.channelUrl = 'https://youtube.com/@celticdreamscape-i2k';
        this.apiKey = null; // YouTube Data API key would go here
        this.videos = [];
        this.playlists = [];
        
        this.init();
    }
    
    async init() {
        console.log('🎬 Initializing YouTube Channel Integration...');
        
        // For demo purposes, we'll use mock data based on the channel
        // In production, you would use the YouTube Data API
        await this.loadChannelData();
        this.createVideoDatabase();
    }
    
    // Mock channel data - replace with actual API calls
    async loadChannelData() {
        // This would typically be an API call to:
        // https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=@celticdreamscape-i2k&key=YOUR_API_KEY
        
        this.channelData = {
            channelId: 'UCcelticdreamscape-i2k',
            title: 'CelticDreamscape',
            description: 'Digital Druid creating Cybernetic Folklore through electronic soundscapes',
            subscriberCount: '127', // Would come from API
            videoCount: '8', // Would come from API
            viewCount: '1,234', // Would come from API
            thumbnails: {
                default: 'https://via.placeholder.com/88x88/164e4a/00ffff?text=CD',
                medium: 'https://via.placeholder.com/240x240/164e4a/00ffff?text=CD',
                high: 'https://via.placeholder.com/800x800/164e4a/00ffff?text=CD'
            }
        };
    }
    
    // Create video database with Celtic-themed content
    createVideoDatabase() {
        // Mock video data - in production, fetch from YouTube Data API
        this.videos = [
            {
                videoId: 'tAGnKpE4NCI', // Mythical Forest Sounds
                title: 'The Last Druid Protocol - Digital Mysticism',
                description: '古代ケルトの最後のドルイドが残したデジタル暗号。電子音楽とケルト神話の融合。',
                publishedAt: '2024-06-15T12:00:00Z',
                thumbnails: {
                    default: 'https://img.youtube.com/vi/tAGnKpE4NCI/default.jpg',
                    medium: 'https://img.youtube.com/vi/tAGnKpE4NCI/mqdefault.jpg',
                    high: 'https://img.youtube.com/vi/tAGnKpE4NCI/hqdefault.jpg'
                },
                duration: 'PT4M32S',
                viewCount: '1,247',
                inspiration: '最後のドルイドの暗号',
                genre: 'Ambient Electronic'
            },
            {
                videoId: 'kK6Xe5BQVVE', // Celtic Music
                title: 'Brendan\'s Digital Voyage - Cyber Ocean Journey',
                description: '聖ブレンダンの神秘の島への航海をサイバー・オーシャンで再現。シンセサイザーによる海洋幻想曲。',
                publishedAt: '2024-06-10T15:30:00Z',
                thumbnails: {
                    default: 'https://img.youtube.com/vi/kK6Xe5BQVVE/default.jpg',
                    medium: 'https://img.youtube.com/vi/kK6Xe5BQVVE/mqdefault.jpg',
                    high: 'https://img.youtube.com/vi/kK6Xe5BQVVE/hqdefault.jpg'
                },
                duration: 'PT6M18S',
                viewCount: '856',
                inspiration: 'ブレンダンの航海',
                genre: 'Cinematic Ambient'
            },
            {
                videoId: 'YQHsXMglC9A', // Celtic Fantasy Music
                title: 'Tír na nÓg Interface - Digital Eternal Realm',
                description: '不老不死の理想郷をデジタル・ユートピアとして再構築。永遠の若さの国への音響ゲートウェイ。',
                publishedAt: '2024-06-05T10:45:00Z',
                thumbnails: {
                    default: 'https://img.youtube.com/vi/YQHsXMglC9A/default.jpg',
                    medium: 'https://img.youtube.com/vi/YQHsXMglC9A/mqdefault.jpg',
                    high: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg'
                },
                duration: 'PT8M45S',
                viewCount: '2,103',
                inspiration: '永遠の若さの国',
                genre: 'Ethereal Soundscape'
            },
            {
                videoId: 'M1S2LbU6G9w', // Celtic Mythology Music
                title: 'Morrigan\'s Algorithm - War Goddess AI',
                description: '予言と戦争の女神モリガンの知恵をAIアルゴリズムで表現。古代予言のデジタル解析。',
                publishedAt: '2024-05-28T14:20:00Z',
                thumbnails: {
                    default: 'https://img.youtube.com/vi/M1S2LbU6G9w/default.jpg',
                    medium: 'https://img.youtube.com/vi/M1S2LbU6G9w/mqdefault.jpg',
                    high: 'https://img.youtube.com/vi/M1S2LbU6G9w/hqdefault.jpg'
                },
                duration: 'PT5M27S',
                viewCount: '1,789',
                inspiration: '戦女神モリガンのアルゴリズム',
                genre: 'Dark Ambient'
            },
            {
                videoId: 'r8rZKGpZ5Ws', // Ancient Celtic Music
                title: 'Newgrange Frequencies - Ancient Resonance',
                description: '5000年前のニューグレンジ巨石記念物が発する神秘の共鳴周波数。考古学的音響実験。',
                publishedAt: '2024-05-20T11:15:00Z',
                thumbnails: {
                    default: 'https://img.youtube.com/vi/r8rZKGpZ5Ws/default.jpg',
                    medium: 'https://img.youtube.com/vi/r8rZKGpZ5Ws/mqdefault.jpg',
                    high: 'https://img.youtube.com/vi/r8rZKGpZ5Ws/hqdefault.jpg'
                },
                duration: 'PT7M33S',
                viewCount: '3,456',
                inspiration: 'ニューグレンジ遺跡の周波数',
                genre: 'Archaeological Ambient'
            },
            {
                videoId: 'DGTZJgK7d_4', // Celtic Instrumental
                title: 'The Sidhe Network - Fairy Digital Grid',
                description: '妖精族シーが構築した見えざるネットワークの音響マッピング。隠された次元への接続。',
                publishedAt: '2024-05-15T16:40:00Z',
                thumbnails: {
                    default: 'https://img.youtube.com/vi/DGTZJgK7d_4/default.jpg',
                    medium: 'https://img.youtube.com/vi/DGTZJgK7d_4/mqdefault.jpg',
                    high: 'https://img.youtube.com/vi/DGTZJgK7d_4/hqdefault.jpg'
                },
                duration: 'PT4M58S',
                viewCount: '987',
                inspiration: '妖精族のネットワーク',
                genre: 'Mystical Electronic'
            },
            {
                videoId: '2g5Hz6TdMKI', // Celtic Meditation Music
                title: 'Druids\' Digital Sanctuary - Sacred Code Space',
                description: 'ドルイドのデジタル聖域。神聖なコード空間での瞑想と精神的覚醒。',
                publishedAt: '2024-05-08T09:30:00Z',
                thumbnails: {
                    default: 'https://img.youtube.com/vi/2g5Hz6TdMKI/default.jpg',
                    medium: 'https://img.youtube.com/vi/2g5Hz6TdMKI/mqdefault.jpg',
                    high: 'https://img.youtube.com/vi/2g5Hz6TdMKI/hqdefault.jpg'
                },
                duration: 'PT10M15S',
                viewCount: '2,678',
                inspiration: 'ドルイドの聖域',
                genre: 'Sacred Ambient'
            },
            {
                videoId: 'jfKfPfyJRdk', // Celtic Ambient
                title: 'Stonehenge Synthesis - Megaliths in Cyberspace',
                description: 'ストーンヘンジの巨石をサイバー空間で合成。古代建築のデジタル再構築プロジェクト。',
                publishedAt: '2024-05-01T13:45:00Z',
                thumbnails: {
                    default: 'https://img.youtube.com/vi/jfKfPfyJRdk/default.jpg',
                    medium: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg',
                    high: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg'
                },
                duration: 'PT6M42S',
                viewCount: '1,534',
                inspiration: 'ストーンヘンジの合成',
                genre: 'Architectural Soundscape'
            }
        ];
        
        console.log(`🎥 Loaded ${this.videos.length} videos from CelticDreamscape channel`);
    }
    
    // Get video by ID
    getVideo(videoId) {
        return this.videos.find(video => video.videoId === videoId);
    }
    
    // Get all videos
    getAllVideos() {
        return this.videos;
    }
    
    // Get videos by genre
    getVideosByGenre(genre) {
        return this.videos.filter(video => video.genre === genre);
    }
    
    // Format duration from ISO 8601 to readable format
    formatDuration(isoDuration) {
        const match = isoDuration.match(/PT(\d+M)?(\d+S)?/);
        const minutes = match[1] ? parseInt(match[1]) : 0;
        const seconds = match[2] ? parseInt(match[2]) : 0;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Format view count
    formatViewCount(count) {
        if (typeof count === 'string') return count;
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    }
    
    // Create YouTube embed URL
    createEmbedUrl(videoId, options = {}) {
        const params = new URLSearchParams({
            enablejsapi: '1',
            origin: window.location.origin,
            rel: '0', // Don't show related videos
            modestbranding: '1', // Modest branding
            ...options
        });
        
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }
    
    // Create video embed element
    createVideoEmbed(videoId, container, options = {}) {
        const video = this.getVideo(videoId);
        if (!video) {
            console.error('Video not found:', videoId);
            return null;
        }
        
        container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'youtube-embed-wrapper';
        
        const iframe = document.createElement('iframe');
        iframe.src = this.createEmbedUrl(videoId, options);
        iframe.width = '100%';
        iframe.height = '315';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        
        // Add video metadata overlay
        const overlay = document.createElement('div');
        overlay.className = 'video-metadata absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white';
        overlay.innerHTML = `
            <div class="text-sm opacity-90">
                <div class="flex justify-between items-center">
                    <span class="text-cyber-blue">${this.formatDuration(video.duration)}</span>
                    <span class="text-mistsilver/70">${video.viewCount} views</span>
                </div>
                <div class="text-xs text-deep-emerald mt-1">${video.genre}</div>
            </div>
        `;
        
        wrapper.style.position = 'relative';
        wrapper.appendChild(iframe);
        wrapper.appendChild(overlay);
        
        container.appendChild(wrapper);
        
        return wrapper;
    }
    
    // Get channel statistics
    getChannelStats() {
        return {
            subscriberCount: this.channelData.subscriberCount,
            videoCount: this.videos.length,
            totalViews: this.videos.reduce((total, video) => {
                const views = typeof video.viewCount === 'string' 
                    ? parseInt(video.viewCount.replace(/,/g, ''))
                    : video.viewCount;
                return total + views;
            }, 0),
            latestVideo: this.videos[0] // Assuming sorted by date
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YouTubeChannelManager;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.youtubeChannel = new YouTubeChannelManager();
    console.log('🎬 YouTube Channel Integration Ready');
});