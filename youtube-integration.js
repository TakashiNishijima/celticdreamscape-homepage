// CelticDreamscape - YouTube Channel Integration
// Loads video data from youtube-data.json (auto-updated by GitHub Actions)

class YouTubeChannelManager {
    constructor() {
        this.channelHandle = '@celticdreamscape-i2k';
        this.channelUrl = 'https://youtube.com/@celticdreamscape-i2k';
        this.channelData = null;
        this.videos = [];

        this.init();
    }

    async init() {
        console.log('🎬 Initializing YouTube Channel Integration...');

        try {
            const response = await fetch('./youtube-data.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            this.channelData = data.channel;
            this.videos = data.videos || [];

            console.log(`📺 Loaded ${this.videos.length} videos (last updated: ${data.lastUpdated})`);

            // Update channel stats on the page
            this.updateChannelStats();

            // Render portfolio videos
            this.renderPortfolioVideos();
        } catch (err) {
            console.warn('⚠️ Could not load youtube-data.json, using fallback:', err.message);
            this.loadFallbackData();
        }
    }

    // Fallback data in case JSON fails to load (e.g. local file:// access)
    loadFallbackData() {
        this.channelData = {
            subscriberCount: '100',
            subscriberCountFormatted: '100',
            videoCount: '33',
            videoCountFormatted: '33',
            viewCount: '8000',
            viewCountFormatted: '8.0K',
        };
        this.videos = [
            { videoId: 'u1-R74XzX8Y', title: 'Digital Druid Chronicles I', description: 'CelticDreamscapeの音響世界への入り口。' },
            { videoId: 'OMHSzASXsMg', title: 'Mystic Frequencies', description: '古代の石碑が響かせる神秘的な周波数。' },
            { videoId: 'HlgwkIseCnE', title: 'Cyber Celtic Ritual', description: 'デジタル空間で行われるケルト儀式。' },
        ];

        this.updateChannelStats();
        this.renderPortfolioVideos();
    }

    // Update the channel stats displayed on the page
    updateChannelStats() {
        if (!this.channelData) return;

        const subFormatted = this.channelData.subscriberCountFormatted || this.formatCount(this.channelData.subscriberCount);
        const vidFormatted = this.channelData.videoCountFormatted || this.formatCount(this.channelData.videoCount);
        const viewFormatted = this.channelData.viewCountFormatted || this.formatCount(this.channelData.viewCount);

        // Update subscriber count
        const subElements = document.querySelectorAll('[data-stat="subscribers"]');
        subElements.forEach(el => { el.textContent = subFormatted; });

        // Update video count
        const vidElements = document.querySelectorAll('[data-stat="videos"]');
        vidElements.forEach(el => { el.textContent = vidFormatted; });

        // Update view count
        const viewElements = document.querySelectorAll('[data-stat="views"]');
        viewElements.forEach(el => { el.textContent = viewFormatted; });

        console.log(`📊 Stats updated: ${subFormatted} subs, ${vidFormatted} videos, ${viewFormatted} views`);
    }

    // Render portfolio video cards dynamically
    renderPortfolioVideos() {
        const container = document.getElementById('portfolio-videos');
        if (!container) {
            console.warn('⚠️ #portfolio-videos container not found');
            return;
        }

        // Use up to the 3 most recent videos
        const displayVideos = this.videos.slice(0, 3);

        // Color themes for the 3 cards
        const themes = [
            {
                gradient: 'from-indigo-900/40 via-cyan-800/30 to-indigo-900/40',
                border: 'border-cyan-400/40',
                hoverShadow: 'hover:shadow-[0_0_100px_rgba(0,255,255,0.3)]',
                orbGradient1: 'from-cyan-400/20 to-blue-500/20',
                orbGradient2: 'from-orange-400/25 to-yellow-500/25',
                shimmer: 'via-white/5',
                titleGradient: 'from-cyan-300 via-blue-300 to-cyan-300',
                divider: 'via-cyan-400',
                videoGlow: 'from-cyan-400/30 via-blue-400/20 to-cyan-400/30',
                videoBg: 'from-slate-900/60 to-indigo-900/60',
                videoBorder: 'border-cyan-400/30 hover:border-cyan-300/60',
                videoShadow: 'shadow-[0_0_40px_rgba(0,255,255,0.2)]',
                tag1: { bg: 'from-emerald-500/30 to-green-500/30', text: 'text-emerald-300', border: 'border-emerald-400/30', label: 'Celtic Electronic' },
                tag2: { bg: 'from-blue-500/30 to-cyan-500/30', text: 'text-cyan-300', border: 'border-cyan-400/30', label: 'Mystical Journey' },
                descColor: 'text-cyan-300',
                emoji: '🌟',
            },
            {
                gradient: 'from-emerald-900/40 via-green-800/30 to-emerald-900/40',
                border: 'border-emerald-400/40',
                hoverShadow: 'hover:shadow-[0_0_100px_rgba(34,197,94,0.3)]',
                orbGradient1: 'from-emerald-400/25 to-green-500/25',
                orbGradient2: 'from-blue-400/20 to-cyan-500/20',
                shimmer: 'via-emerald-300/5',
                titleGradient: 'from-emerald-300 via-green-300 to-emerald-300',
                divider: 'via-emerald-400',
                videoGlow: 'from-emerald-400/30 via-green-400/20 to-emerald-400/30',
                videoBg: 'from-slate-900/60 to-emerald-900/60',
                videoBorder: 'border-emerald-400/30 hover:border-emerald-300/60',
                videoShadow: 'shadow-[0_0_40px_rgba(34,197,94,0.2)]',
                tag1: { bg: 'from-emerald-500/30 to-green-500/30', text: 'text-emerald-300', border: 'border-emerald-400/30', label: 'Ambient Soundscape' },
                tag2: { bg: 'from-purple-500/30 to-violet-500/30', text: 'text-purple-300', border: 'border-purple-400/30', label: 'Mystical Resonance' },
                descColor: 'text-emerald-300',
                emoji: '🌿',
            },
            {
                gradient: 'from-purple-900/40 via-violet-800/30 to-purple-900/40',
                border: 'border-purple-400/40',
                hoverShadow: 'hover:shadow-[0_0_100px_rgba(147,51,234,0.3)]',
                orbGradient1: 'from-purple-400/25 to-violet-500/25',
                orbGradient2: 'from-orange-400/30 to-red-500/30',
                shimmer: 'via-purple-300/5',
                titleGradient: 'from-purple-300 via-violet-300 to-purple-300',
                divider: 'via-purple-400',
                videoGlow: 'from-purple-400/30 via-violet-400/20 to-purple-400/30',
                videoBg: 'from-slate-900/60 to-purple-900/60',
                videoBorder: 'border-purple-400/30 hover:border-purple-300/60',
                videoShadow: 'shadow-[0_0_40px_rgba(147,51,234,0.2)]',
                tag1: { bg: 'from-purple-500/30 to-violet-500/30', text: 'text-purple-300', border: 'border-purple-400/30', label: 'Ritual Electronic' },
                tag2: { bg: 'from-orange-500/30 to-red-500/30', text: 'text-orange-300', border: 'border-orange-400/30', label: 'Sacred Technology' },
                descColor: 'text-purple-300',
                emoji: '🔮',
            },
        ];

        container.innerHTML = '';

        displayVideos.forEach((video, index) => {
            const t = themes[index % themes.length];

            const card = document.createElement('div');
            card.className = `group relative overflow-hidden bg-gradient-to-br ${t.gradient} backdrop-blur-2xl border-2 ${t.border} rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] ${t.hoverShadow} transition-all duration-700 hover:scale-[1.02]`;
            card.innerHTML = `
                <!-- Floating Orbs -->
                <div class="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br ${t.orbGradient1} rounded-full opacity-15 animate-pulse"></div>
                <div class="absolute bottom-8 left-8 w-16 h-16 bg-gradient-to-br ${t.orbGradient2} rounded-full opacity-20" style="animation: float 6s ease-in-out infinite;"></div>

                <!-- Shimmer Effect -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent ${t.shimmer} to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>

                <div class="relative z-10">
                    <!-- Title -->
                    <div class="text-center mb-8">
                        <h3 class="text-4xl font-black bg-gradient-to-r ${t.titleGradient} bg-clip-text text-transparent mb-4">
                            ${t.emoji} ${video.title} ${t.emoji}
                        </h3>
                        <div class="w-32 h-1 bg-gradient-to-r from-transparent ${t.divider} to-transparent mx-auto mb-6"></div>
                    </div>

                    <!-- Video Container -->
                    <div class="relative mb-8 group/video">
                        <div class="absolute inset-0 bg-gradient-to-r ${t.videoGlow} rounded-2xl opacity-30 group-hover/video:opacity-50 transition-all duration-500"></div>
                        <div class="relative video-wrapper bg-gradient-to-br ${t.videoBg} rounded-2xl p-4 border-2 ${t.videoBorder} transition-all duration-500">
                            <iframe class="video-iframe w-full h-80 rounded-xl ${t.videoShadow}"
                                src="https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&modestbranding=1"
                                title="${video.title}" frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowfullscreen loading="lazy">
                            </iframe>
                        </div>
                    </div>

                    <!-- Tags and Description -->
                    <div class="text-center">
                        <div class="flex justify-center gap-3 mb-6">
                            <span class="bg-gradient-to-r ${t.tag1.bg} ${t.tag1.text} px-4 py-2 rounded-full text-sm font-semibold border ${t.tag1.border}">${t.tag1.label}</span>
                            <span class="bg-gradient-to-r ${t.tag2.bg} ${t.tag2.text} px-4 py-2 rounded-full text-sm font-semibold border ${t.tag2.border}">${t.tag2.label}</span>
                        </div>
                        <p class="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
                            ${video.description}
                        </p>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

        console.log(`🎥 Rendered ${displayVideos.length} portfolio videos`);
    }

    // ─── Utility Methods ────────────────────────────────────────────────────

    formatCount(count) {
        const n = parseInt(count, 10);
        if (isNaN(n)) return count;
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return String(n);
    }

    // Get video by ID
    getVideo(videoId) {
        return this.videos.find(video => video.videoId === videoId);
    }

    // Get all videos
    getAllVideos() {
        return this.videos;
    }

    // Format duration from ISO 8601 to readable format
    formatDuration(isoDuration) {
        if (!isoDuration) return '0:00';
        const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return '0:00';
        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const seconds = match[3] ? parseInt(match[3]) : 0;
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Create YouTube embed URL
    createEmbedUrl(videoId, options = {}) {
        const params = new URLSearchParams({
            enablejsapi: '1',
            origin: window.location.origin,
            rel: '0',
            modestbranding: '1',
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

        wrapper.style.position = 'relative';
        wrapper.appendChild(iframe);
        container.appendChild(wrapper);

        return wrapper;
    }

    // Get channel statistics
    getChannelStats() {
        if (!this.channelData) return null;
        return {
            subscriberCount: this.channelData.subscriberCount,
            videoCount: this.channelData.videoCount,
            viewCount: this.channelData.viewCount,
            latestVideo: this.videos[0] || null,
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