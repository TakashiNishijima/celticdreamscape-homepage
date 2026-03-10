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
        try {
            const response = await fetch('./youtube-data.json');
            if (!response.ok) throw new Error('Failed to load');
            const data = await response.json();
            this.channelData = data.channel;
            this.videos = data.videos || [];
            console.log(`📺 Loaded ${this.videos.length} videos from youtube-data.json`);
        } catch (error) {
            console.warn('⚠️ youtube-data.json load failed, using fallback:', error);
            this.loadFallbackData();
        }

        // Filter out Shorts
        this.regularVideos = this.videos.filter(v => !this.isShort(v));
        console.log(`📺 ${this.regularVideos.length} regular videos (${this.videos.length - this.regularVideos.length} Shorts excluded)`);

        this.updateChannelStats();
        this.renderNewVideos();
        this.renderFeaturedVideos();
        this.injectVideoSchema();
    }

    // Inject VideoObject structured data for SEO
    injectVideoSchema() {
        if (this.regularVideos.length === 0) return;

        // Use the displayed videos (new + featured, deduplicated)
        const newVids = this.regularVideos.slice(0, 3);
        const featured = [...this.regularVideos].sort((a, b) =>
            parseInt(b.viewCount || '0') - parseInt(a.viewCount || '0')
        ).slice(0, 3);

        const allDisplayed = [...new Map(
            [...newVids, ...featured].map(v => [v.videoId, v])
        ).values()];

        const videoObjects = allDisplayed.map(v => ({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": v.title,
            "description": (v.description || '').substring(0, 200),
            "thumbnailUrl": v.thumbnails?.high?.url || v.thumbnails?.medium?.url || '',
            "uploadDate": v.publishedAt,
            "duration": v.duration,
            "contentUrl": `https://www.youtube.com/watch?v=${v.videoId}`,
            "embedUrl": `https://www.youtube.com/embed/${v.videoId}`,
            "interactionStatistic": {
                "@type": "InteractionCounter",
                "interactionType": { "@type": "WatchAction" },
                "userInteractionCount": parseInt(v.viewCount || '0')
            }
        }));

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(videoObjects);
        document.head.appendChild(script);
        console.log(`📊 Injected VideoObject schema for ${videoObjects.length} videos`);
    }

    loadFallbackData() {
        this.channelData = {
            subscriberCount: '157',
            subscriberCountFormatted: '157',
            videoCount: '46',
            videoCountFormatted: '46',
            viewCount: '12737',
            viewCountFormatted: '12.7K'
        };
        this.videos = [];
    }

    updateChannelStats() {
        if (!this.channelData) return;

        const statElements = document.querySelectorAll('[data-stat]');
        statElements.forEach(el => {
            const type = el.dataset.stat;
            if (type === 'subscribers') {
                el.textContent = this.channelData.subscriberCountFormatted || this.channelData.subscriberCount;
            } else if (type === 'videos') {
                el.textContent = this.channelData.videoCountFormatted || this.channelData.videoCount;
            } else if (type === 'views') {
                el.textContent = this.channelData.viewCountFormatted || this.formatCount(this.channelData.viewCount);
            }
        });
    }

    // Check if a video is a Short
    isShort(video) {
        const title = (video.title || '').toLowerCase();
        if (title.includes('#shorts') || title.includes('#short')) return true;
        // Shorts are typically ≤ 60 seconds
        const match = (video.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (match) {
            const totalSec = (parseInt(match[1] || 0) * 3600) + (parseInt(match[2] || 0) * 60) + parseInt(match[3] || 0);
            if (totalSec > 0 && totalSec <= 61) return true;
        }
        return false;
    }

    // Render NEW videos (latest 3, excluding Shorts)
    renderNewVideos() {
        const container = document.getElementById('new-videos');
        if (!container || this.regularVideos.length === 0) return;

        const newVideos = this.regularVideos.slice(0, 3);
        container.innerHTML = newVideos.map(video => this.createVideoCard(video, true)).join('');
    }

    // Render FEATURED videos (top 3 by view count, excluding Shorts)
    renderFeaturedVideos() {
        const container = document.getElementById('featured-videos');
        if (!container || this.regularVideos.length === 0) return;

        const sorted = [...this.regularVideos].sort((a, b) => {
            const viewsA = parseInt(a.statistics?.viewCount || a.viewCount || '0');
            const viewsB = parseInt(b.statistics?.viewCount || b.viewCount || '0');
            return viewsB - viewsA;
        });

        const featured = sorted.slice(0, 3);
        container.innerHTML = featured.map(video => this.createVideoCard(video, false)).join('');
    }

    createVideoCard(video, isNew) {
        const videoId = video.videoId;
        const title = video.title || 'Untitled';
        const thumb = video.thumbnails?.high?.url || video.thumbnails?.medium?.url || video.thumbnails?.default?.url || '';
        const views = this.formatCount(video.statistics?.viewCount || '0');
        const duration = this.formatDuration(video.duration || '');
        const publishedAt = video.publishedAt ? this.formatDate(video.publishedAt) : '';

        const badge = isNew
            ? `<span class="absolute top-3 left-3 bg-forest text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>`
            : `<span class="absolute top-3 left-3 bg-warm-gold text-white text-xs font-bold px-2 py-1 rounded-full">⭐ Popular</span>`;

        return `
        <div class="video-card">
            <div class="relative group cursor-pointer" onclick="if(typeof gtag==='function')gtag('event','youtube_click',{event_category:'video',event_label:'${title.replace(/'/g, '')}',video_id:'${videoId}'});window.open('https://www.youtube.com/watch?v=${videoId}','_blank')">
                <img src="${thumb}" alt="${title}" class="w-full aspect-video object-cover" loading="lazy">
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <svg class="w-14 h-14 text-white opacity-0 group-hover:opacity-90 transition-opacity drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
                ${badge}
                ${duration ? `<span class="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded">${duration}</span>` : ''}
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-gray-800 text-sm leading-snug mb-2" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${title}</h3>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>👁️ ${views} views</span>
                    ${publishedAt ? `<span>${publishedAt}</span>` : ''}
                </div>
            </div>
        </div>`;
    }

    formatCount(count) {
        const num = parseInt(count);
        if (isNaN(num)) return count;
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    formatDuration(isoDuration) {
        if (!isoDuration) return '';
        const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return '';
        const h = match[1] ? match[1] + ':' : '';
        const m = match[2] ? match[2].padStart(h ? 2 : 1, '0') : '0';
        const s = match[3] ? match[3].padStart(2, '0') : '00';
        return `${h}${m}:${s}`;
    }

    formatDate(dateStr) {
        try {
            const d = new Date(dateStr);
            return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
        } catch { return ''; }
    }

    getChannelStats() {
        return this.channelData ? {
            subscribers: this.channelData.subscriberCount,
            videos: this.channelData.videoCount,
            views: this.channelData.viewCount
        } : null;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    window.youtubeChannel = new YouTubeChannelManager();
    console.log('🎬 YouTube Channel Integration Ready');
});