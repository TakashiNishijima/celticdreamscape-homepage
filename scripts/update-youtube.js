#!/usr/bin/env node
/**
 * CelticDreamscape - YouTube Data Updater
 * Fetches latest channel stats and videos from YouTube Data API v3
 * and writes them to youtube-data.json for the frontend.
 *
 * Usage:
 *   YOUTUBE_API_KEY=YOUR_KEY node scripts/update-youtube.js
 *
 * Environment Variables:
 *   YOUTUBE_API_KEY  - Required. YouTube Data API v3 key.
 *   CHANNEL_HANDLE   - Optional. Defaults to '@celticdreamscape-i2k'.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_HANDLE = process.env.CHANNEL_HANDLE || '@celticdreamscape-i2k';
const OUTPUT_FILE = path.join(__dirname, '..', 'youtube-data.json');
const MAX_RESULTS = 50;

if (!API_KEY) {
    console.error('❌ YOUTUBE_API_KEY environment variable is required.');
    process.exit(1);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function httpsGetJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.error) {
                        reject(new Error(`YouTube API error: ${json.error.message}`));
                    } else {
                        resolve(json);
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${e.message}`));
                }
            });
            res.on('error', reject);
        }).on('error', reject);
    });
}

function formatCount(count) {
    const n = parseInt(count, 10);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
}

// ─── API Calls ──────────────────────────────────────────────────────────────

async function getChannelByHandle(handle) {
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&forHandle=${cleanHandle}&key=${API_KEY}`;
    const data = await httpsGetJson(url);

    if (!data.items || data.items.length === 0) {
        throw new Error(`Channel not found for handle: ${handle}`);
    }

    const channel = data.items[0];
    return {
        channelId: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnails: channel.snippet.thumbnails,
        uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
        statistics: {
            subscriberCount: channel.statistics.subscriberCount,
            videoCount: channel.statistics.videoCount,
            viewCount: channel.statistics.viewCount,
            subscriberCountFormatted: formatCount(channel.statistics.subscriberCount),
            videoCountFormatted: formatCount(channel.statistics.videoCount),
            viewCountFormatted: formatCount(channel.statistics.viewCount),
        },
    };
}

async function getPlaylistVideos(playlistId) {
    const allVideos = [];
    let pageToken = '';

    // Fetch all playlist items (paginated)
    do {
        const url =
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails` +
            `&playlistId=${playlistId}&maxResults=${MAX_RESULTS}` +
            `${pageToken ? '&pageToken=' + pageToken : ''}` +
            `&key=${API_KEY}`;

        const data = await httpsGetJson(url);

        if (data.items) {
            for (const item of data.items) {
                allVideos.push({
                    videoId: item.contentDetails.videoId,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    publishedAt: item.snippet.publishedAt,
                    thumbnails: item.snippet.thumbnails,
                });
            }
        }
        pageToken = data.nextPageToken || '';
    } while (pageToken);

    // Enrich with duration and view counts (in batches of 50)
    for (let i = 0; i < allVideos.length; i += 50) {
        const batch = allVideos.slice(i, i + 50);
        const ids = batch.map((v) => v.videoId).join(',');
        const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${ids}&key=${API_KEY}`;
        const data = await httpsGetJson(url);

        if (data.items) {
            const statsMap = {};
            for (const item of data.items) {
                statsMap[item.id] = {
                    duration: item.contentDetails.duration,
                    viewCount: item.statistics.viewCount || '0',
                    likeCount: item.statistics.likeCount || '0',
                };
            }
            for (const video of batch) {
                const stats = statsMap[video.videoId];
                if (stats) {
                    video.duration = stats.duration;
                    video.viewCount = stats.viewCount;
                    video.viewCountFormatted = formatCount(stats.viewCount);
                    video.likeCount = stats.likeCount;
                }
            }
        }
    }

    // Sort by publish date (newest first)
    allVideos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    return allVideos;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    console.log(`🔄 Fetching YouTube data for ${CHANNEL_HANDLE}...`);

    // 1. Get channel info
    const channel = await getChannelByHandle(CHANNEL_HANDLE);
    console.log(`📺 Channel: ${channel.title} (${channel.channelId})`);
    console.log(`   Subscribers: ${channel.statistics.subscriberCountFormatted}`);
    console.log(`   Videos: ${channel.statistics.videoCountFormatted}`);
    console.log(`   Views: ${channel.statistics.viewCountFormatted}`);

    // 2. Get all uploaded videos
    const videos = await getPlaylistVideos(channel.uploadsPlaylistId);
    console.log(`🎬 Fetched ${videos.length} videos`);

    // 3. Build output JSON
    const output = {
        lastUpdated: new Date().toISOString(),
        channel: {
            channelId: channel.channelId,
            title: channel.title,
            description: channel.description,
            thumbnails: channel.thumbnails,
            subscriberCount: channel.statistics.subscriberCount,
            subscriberCountFormatted: channel.statistics.subscriberCountFormatted,
            videoCount: channel.statistics.videoCount,
            videoCountFormatted: channel.statistics.videoCountFormatted,
            viewCount: channel.statistics.viewCount,
            viewCountFormatted: channel.statistics.viewCountFormatted,
        },
        videos: videos,
    };

    // 4. Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`✅ Written to ${OUTPUT_FILE}`);

    // 5. Summary
    if (videos.length > 0) {
        console.log(`\n📋 Latest video: "${videos[0].title}" (${videos[0].videoId})`);
    }
}

main().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
