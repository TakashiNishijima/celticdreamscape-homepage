#!/usr/bin/env node
/**
 * CelticDreamscape — 自動週次/月次レポート生成スクリプト
 * 
 * GA4 Data API + Search Console API からデータを取得し、
 * 改善提案付きHTMLレポートをメール送信する。
 * 
 * Usage:
 *   node weekly-report.js          # 週次レポート
 *   node weekly-report.js --monthly # 月次レポート
 *   node weekly-report.js --test    # テストメール（ダミーデータ）
 */

const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// ===== Configuration =====
const CONFIG = {
    ga4PropertyId: process.env.GA4_PROPERTY_ID,
    reportEmailTo: process.env.REPORT_EMAIL_TO,
    gmailUser: process.env.GMAIL_USER,
    gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
    siteUrl: 'https://sparkly-biscuit-a80353.netlify.app',
    siteName: 'CelticDreamscape',
};

const isMonthly = process.argv.includes('--monthly');
const isTest = process.argv.includes('--test');

// ===== Auth =====
async function getAuthClient() {
    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
    const key = JSON.parse(keyJson);
    const auth = new google.auth.GoogleAuth({
        credentials: key,
        scopes: [
            'https://www.googleapis.com/auth/analytics.readonly',
            'https://www.googleapis.com/auth/webmasters.readonly',
        ],
    });
    return auth;
}

// ===== GA4 Data API =====
async function fetchGA4Data(auth) {
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
    const propertyId = CONFIG.ga4PropertyId;
    const daysBack = isMonthly ? 30 : 7;
    const startDate = `${daysBack}daysAgo`;

    // Request 1: Overview metrics
    const overviewRes = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
            dateRanges: [
                { startDate, endDate: 'today', name: 'current' },
                { startDate: `${daysBack * 2}daysAgo`, endDate: `${daysBack + 1}daysAgo`, name: 'previous' },
            ],
            metrics: [
                { name: 'activeUsers' },
                { name: 'sessions' },
                { name: 'screenPageViews' },
                { name: 'averageSessionDuration' },
                { name: 'bounceRate' },
            ],
        },
    });

    // Request 2: Events
    const eventsRes = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
            dateRanges: [{ startDate, endDate: 'today' }],
            dimensions: [{ name: 'eventName' }],
            metrics: [{ name: 'eventCount' }],
            dimensionFilter: {
                filter: {
                    fieldName: 'eventName',
                    inListFilter: {
                        values: ['youtube_click', 'spotify_click', 'apple_music_click', 'suno_click',
                            'share_x', 'share_line', 'share_copy', 'subscribe_click'],
                    },
                },
            },
        },
    });

    // Request 3: Traffic sources
    const trafficRes = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
            dateRanges: [{ startDate, endDate: 'today' }],
            dimensions: [{ name: 'sessionDefaultChannelGroup' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: 10,
        },
    });

    // Request 4: Device category
    const deviceRes = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
            dateRanges: [{ startDate, endDate: 'today' }],
            dimensions: [{ name: 'deviceCategory' }],
            metrics: [{ name: 'activeUsers' }],
        },
    });

    // Request 5: Top pages
    const pagesRes = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
            dateRanges: [{ startDate, endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 5,
        },
    });

    return { overviewRes, eventsRes, trafficRes, deviceRes, pagesRes };
}

// ===== Search Console API =====
async function fetchSearchConsoleData(auth) {
    const searchconsole = google.searchconsole({ version: 'v1', auth });
    const daysBack = isMonthly ? 30 : 7;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 2); // SC data has 2-day delay
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysBack);

    const fmt = d => d.toISOString().split('T')[0];

    // Overview
    const overviewRes = await searchconsole.searchanalytics.query({
        siteUrl: CONFIG.siteUrl,
        requestBody: {
            startDate: fmt(startDate),
            endDate: fmt(endDate),
            dimensions: [],
        },
    });

    // Top queries
    const queriesRes = await searchconsole.searchanalytics.query({
        siteUrl: CONFIG.siteUrl,
        requestBody: {
            startDate: fmt(startDate),
            endDate: fmt(endDate),
            dimensions: ['query'],
            rowLimit: 10,
            orderBy: [{ field: 'clicks', sortOrder: 'DESCENDING' }],
        },
    });

    return { overviewRes, queriesRes };
}

// ===== Parse GA4 Response =====
function parseGA4(data) {
    const { overviewRes, eventsRes, trafficRes, deviceRes, pagesRes } = data;

    // Overview
    const rows = overviewRes.data.rows || [];
    const current = rows.find(r => r?.dimensionValues?.[0]?.value === 'date_range_0') || rows[0] || {};
    const previous = rows.find(r => r?.dimensionValues?.[0]?.value === 'date_range_1') || rows[1] || {};
    const getMetric = (row, i) => parseFloat(row?.metricValues?.[i]?.value || '0');

    const overview = {
        users: { current: getMetric(current, 0), previous: getMetric(previous, 0) },
        sessions: { current: getMetric(current, 1), previous: getMetric(previous, 1) },
        pageviews: { current: getMetric(current, 2), previous: getMetric(previous, 2) },
        avgDuration: { current: getMetric(current, 3), previous: getMetric(previous, 3) },
        bounceRate: { current: getMetric(current, 4), previous: getMetric(previous, 4) },
    };

    // Events
    const events = {};
    (eventsRes.data.rows || []).forEach(row => {
        events[row.dimensionValues[0].value] = parseInt(row.metricValues[0].value);
    });

    // Traffic
    const traffic = (trafficRes.data.rows || []).map(row => ({
        channel: row.dimensionValues[0].value,
        sessions: parseInt(row.metricValues[0].value),
    }));

    // Device
    const devices = (deviceRes.data.rows || []).map(row => ({
        category: row.dimensionValues[0].value,
        users: parseInt(row.metricValues[0].value),
    }));

    // Pages
    const pages = (pagesRes.data.rows || []).map(row => ({
        path: row.dimensionValues[0].value,
        views: parseInt(row.metricValues[0].value),
    }));

    return { overview, events, traffic, devices, pages };
}

// ===== Analysis & Suggestions =====
function generateSuggestions(ga4, sc) {
    const suggestions = [];

    // Bounce rate
    const bounceRate = ga4.overview.bounceRate.current * 100;
    if (bounceRate > 70) {
        suggestions.push({
            priority: '🔴',
            title: '直帰率が高い',
            detail: `直帰率 ${bounceRate.toFixed(1)}% — CTAの配置改善やコンテンツの充実を検討してください。`,
        });
    } else if (bounceRate > 50) {
        suggestions.push({
            priority: '🟡',
            title: '直帰率がやや高め',
            detail: `直帰率 ${bounceRate.toFixed(1)}% — 動線改善で下げられる可能性があります。`,
        });
    }

    // CTR from Search Console
    if (sc.overview && sc.overview.ctr !== undefined) {
        const ctr = sc.overview.ctr * 100;
        if (ctr < 3) {
            suggestions.push({
                priority: '🔴',
                title: '検索CTRが低い',
                detail: `CTR ${ctr.toFixed(1)}% — titleタグとmeta descriptionの改善を推奨します。`,
            });
        }
    }

    // Mobile check
    const totalDeviceUsers = ga4.devices.reduce((s, d) => s + d.users, 0);
    const mobileUsers = ga4.devices.find(d => d.category === 'mobile')?.users || 0;
    const mobileRatio = totalDeviceUsers > 0 ? (mobileUsers / totalDeviceUsers) * 100 : 0;
    if (mobileRatio > 60) {
        suggestions.push({
            priority: '🟡',
            title: 'モバイルユーザーが多数',
            detail: `モバイル比率 ${mobileRatio.toFixed(0)}% — モバイルUXの最適化を優先してください。`,
        });
    }

    // Event checks
    const eventNames = ['youtube_click', 'spotify_click', 'share_x', 'share_line', 'subscribe_click'];
    const eventLabels = {
        youtube_click: 'YouTube動画クリック',
        spotify_click: 'Spotifyクリック',
        share_x: 'Xシェア',
        share_line: 'LINEシェア',
        subscribe_click: 'チャンネル登録',
    };
    eventNames.forEach(name => {
        if ((ga4.events[name] || 0) === 0) {
            suggestions.push({
                priority: '🟡',
                title: `${eventLabels[name]} が0件`,
                detail: `「${eventLabels[name]}」ボタンがクリックされていません。ボタンの視認性や位置を改善してください。`,
            });
        }
    });

    // Traffic diversity
    if (ga4.traffic.length === 1) {
        suggestions.push({
            priority: '🟡',
            title: '流入元が単一',
            detail: 'トラフィックが1チャネルに集中しています。SNS投稿やSEOで流入経路を分散させましょう。',
        });
    }

    // User growth
    if (ga4.overview.users.previous > 0) {
        const growth = ((ga4.overview.users.current - ga4.overview.users.previous) / ga4.overview.users.previous) * 100;
        if (growth < -20) {
            suggestions.push({
                priority: '🔴',
                title: 'ユーザー数が大幅減少',
                detail: `前期比 ${growth.toFixed(0)}% — コンテンツ更新やSNS投稿の頻度を見直してください。`,
            });
        } else if (growth > 20) {
            suggestions.push({
                priority: '🟢',
                title: 'ユーザー数が増加中！',
                detail: `前期比 +${growth.toFixed(0)}% — この勢いを維持するために、好調なコンテンツを分析しましょう。`,
            });
        }
    }

    if (suggestions.length === 0) {
        suggestions.push({
            priority: '🟢',
            title: '特に問題なし',
            detail: '主要指標は健全です。現在の施策を継続してください。',
        });
    }

    return suggestions;
}

// ===== HTML Email Template =====
function buildEmailHTML(ga4, sc, suggestions) {
    const period = isMonthly ? '月次' : '週次';
    const daysBack = isMonthly ? 30 : 7;
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;

    const pctChange = (curr, prev) => {
        if (prev === 0) return curr > 0 ? '+∞' : '±0';
        const pct = ((curr - prev) / prev * 100).toFixed(0);
        return pct > 0 ? `+${pct}%` : `${pct}%`;
    };
    const changeColor = (curr, prev, inverse = false) => {
        const diff = curr - prev;
        if (inverse) return diff > 0 ? '#e74c3c' : diff < 0 ? '#27ae60' : '#7f8c8d';
        return diff > 0 ? '#27ae60' : diff < 0 ? '#e74c3c' : '#7f8c8d';
    };
    const fmtDuration = (sec) => {
        const m = Math.floor(sec / 60);
        const s = Math.round(sec % 60);
        return `${m}分${s}秒`;
    };

    const o = ga4.overview;

    // Events table rows
    const eventLabels = {
        youtube_click: '▶️ YouTube動画クリック',
        spotify_click: '🎵 Spotifyクリック',
        apple_music_click: '🍎 Apple Music',
        suno_click: '🎶 SUNO',
        subscribe_click: '🔔 チャンネル登録',
        share_x: '🐦 Xシェア',
        share_line: '💬 LINEシェア',
        share_copy: '🔗 リンクコピー',
    };
    const eventsHTML = Object.entries(eventLabels)
        .map(([key, label]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e8f0e4">${label}</td><td style="padding:6px 12px;border-bottom:1px solid #e8f0e4;text-align:center;font-weight:600">${ga4.events[key] || 0}</td></tr>`)
        .join('');

    // Traffic table
    const trafficHTML = ga4.traffic
        .map(t => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e8f0e4">${t.channel}</td><td style="padding:6px 12px;border-bottom:1px solid #e8f0e4;text-align:center;font-weight:600">${t.sessions}</td></tr>`)
        .join('');

    // Device
    const deviceHTML = ga4.devices
        .map(d => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e8f0e4">${d.category}</td><td style="padding:6px 12px;border-bottom:1px solid #e8f0e4;text-align:center;font-weight:600">${d.users}</td></tr>`)
        .join('');

    // Search Console
    const scOverview = sc.overview || {};
    const scQueriesHTML = (sc.queries || [])
        .map((q, i) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e8f0e4">${i + 1}. ${q.query}</td><td style="padding:6px 12px;border-bottom:1px solid #e8f0e4;text-align:center">${q.clicks}</td><td style="padding:6px 12px;border-bottom:1px solid #e8f0e4;text-align:center">${q.impressions}</td><td style="padding:6px 12px;border-bottom:1px solid #e8f0e4;text-align:center">${(q.ctr * 100).toFixed(1)}%</td></tr>`)
        .join('') || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#999">データなし</td></tr>';

    // Suggestions
    const suggestionsHTML = suggestions
        .map(s => `<div style="padding:12px 16px;margin-bottom:8px;border-radius:8px;background:${s.priority === '🔴' ? '#fef2f2' : s.priority === '🟡' ? '#fffbeb' : '#f0fdf4'}"><strong>${s.priority} ${s.title}</strong><br><span style="color:#555;font-size:14px">${s.detail}</span></div>`)
        .join('');

    return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#EDF2E8;font-family:'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN',sans-serif">
<div style="max-width:640px;margin:0 auto;padding:20px">

<!-- Header -->
<div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);color:white;padding:24px 32px;border-radius:12px 12px 0 0">
    <h1 style="margin:0;font-size:22px">🌿 CelticDreamscape ${period}レポート</h1>
    <p style="margin:4px 0 0;opacity:0.8;font-size:14px">${dateStr}（過去${daysBack}日間）</p>
</div>

<!-- Overview -->
<div style="background:white;padding:24px 32px;border-bottom:1px solid #e8f0e4">
    <h2 style="font-size:16px;color:#1B4332;margin:0 0 16px">📊 サイト概況</h2>
    <table style="width:100%;border-collapse:collapse">
        <tr>
            <td style="padding:12px;text-align:center;background:#f0fdf4;border-radius:8px">
                <div style="font-size:28px;font-weight:700;color:#1B4332">${o.users.current}</div>
                <div style="font-size:12px;color:#666">ユーザー数</div>
                <div style="font-size:12px;color:${changeColor(o.users.current, o.users.previous)};font-weight:600">${pctChange(o.users.current, o.users.previous)}</div>
            </td>
            <td style="width:8px"></td>
            <td style="padding:12px;text-align:center;background:#f0fdf4;border-radius:8px">
                <div style="font-size:28px;font-weight:700;color:#1B4332">${o.sessions.current}</div>
                <div style="font-size:12px;color:#666">セッション</div>
                <div style="font-size:12px;color:${changeColor(o.sessions.current, o.sessions.previous)};font-weight:600">${pctChange(o.sessions.current, o.sessions.previous)}</div>
            </td>
            <td style="width:8px"></td>
            <td style="padding:12px;text-align:center;background:#f0fdf4;border-radius:8px">
                <div style="font-size:28px;font-weight:700;color:#1B4332">${o.pageviews.current}</div>
                <div style="font-size:12px;color:#666">ページビュー</div>
                <div style="font-size:12px;color:${changeColor(o.pageviews.current, o.pageviews.previous)};font-weight:600">${pctChange(o.pageviews.current, o.pageviews.previous)}</div>
            </td>
        </tr>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-top:12px">
        <tr>
            <td style="padding:12px;text-align:center;background:#fffbeb;border-radius:8px">
                <div style="font-size:20px;font-weight:700;color:#92400e">${fmtDuration(o.avgDuration.current)}</div>
                <div style="font-size:12px;color:#666">平均滞在時間</div>
            </td>
            <td style="width:8px"></td>
            <td style="padding:12px;text-align:center;background:#fffbeb;border-radius:8px">
                <div style="font-size:20px;font-weight:700;color:#92400e">${(o.bounceRate.current * 100).toFixed(1)}%</div>
                <div style="font-size:12px;color:#666">直帰率</div>
                <div style="font-size:12px;color:${changeColor(o.bounceRate.current, o.bounceRate.previous, true)};font-weight:600">${pctChange(o.bounceRate.current, o.bounceRate.previous)}</div>
            </td>
        </tr>
    </table>
</div>

<!-- Events -->
<div style="background:white;padding:24px 32px;border-bottom:1px solid #e8f0e4">
    <h2 style="font-size:16px;color:#1B4332;margin:0 0 16px">🎯 カスタムイベント</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr style="background:#e8f0e4"><th style="padding:8px 12px;text-align:left">イベント</th><th style="padding:8px 12px;text-align:center">回数</th></tr>
        ${eventsHTML}
    </table>
</div>

<!-- Traffic Sources -->
<div style="background:white;padding:24px 32px;border-bottom:1px solid #e8f0e4">
    <h2 style="font-size:16px;color:#1B4332;margin:0 0 16px">🌐 流入元</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr style="background:#e8f0e4"><th style="padding:8px 12px;text-align:left">チャネル</th><th style="padding:8px 12px;text-align:center">セッション</th></tr>
        ${trafficHTML}
    </table>
</div>

<!-- Devices -->
<div style="background:white;padding:24px 32px;border-bottom:1px solid #e8f0e4">
    <h2 style="font-size:16px;color:#1B4332;margin:0 0 16px">📱 デバイス</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr style="background:#e8f0e4"><th style="padding:8px 12px;text-align:left">デバイス</th><th style="padding:8px 12px;text-align:center">ユーザー</th></tr>
        ${deviceHTML}
    </table>
</div>

<!-- Search Console -->
<div style="background:white;padding:24px 32px;border-bottom:1px solid #e8f0e4">
    <h2 style="font-size:16px;color:#1B4332;margin:0 0 16px">🔍 検索パフォーマンス</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tr>
            <td style="padding:12px;text-align:center;background:#f0fdf4;border-radius:8px">
                <div style="font-size:24px;font-weight:700;color:#1B4332">${scOverview.clicks || 0}</div>
                <div style="font-size:12px;color:#666">クリック</div>
            </td>
            <td style="width:8px"></td>
            <td style="padding:12px;text-align:center;background:#f0fdf4;border-radius:8px">
                <div style="font-size:24px;font-weight:700;color:#1B4332">${scOverview.impressions || 0}</div>
                <div style="font-size:12px;color:#666">表示回数</div>
            </td>
            <td style="width:8px"></td>
            <td style="padding:12px;text-align:center;background:#f0fdf4;border-radius:8px">
                <div style="font-size:24px;font-weight:700;color:#1B4332">${scOverview.ctr !== undefined ? (scOverview.ctr * 100).toFixed(1) + '%' : '-'}</div>
                <div style="font-size:12px;color:#666">CTR</div>
            </td>
            <td style="width:8px"></td>
            <td style="padding:12px;text-align:center;background:#f0fdf4;border-radius:8px">
                <div style="font-size:24px;font-weight:700;color:#1B4332">${scOverview.position !== undefined ? scOverview.position.toFixed(1) : '-'}</div>
                <div style="font-size:12px;color:#666">平均順位</div>
            </td>
        </tr>
    </table>
    <h3 style="font-size:14px;color:#555;margin:16px 0 8px">検索キーワード TOP10</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="background:#e8f0e4"><th style="padding:6px 12px;text-align:left">キーワード</th><th style="padding:6px 12px;text-align:center">クリック</th><th style="padding:6px 12px;text-align:center">表示</th><th style="padding:6px 12px;text-align:center">CTR</th></tr>
        ${scQueriesHTML}
    </table>
</div>

<!-- Suggestions -->
<div style="background:white;padding:24px 32px;border-radius:0 0 12px 12px">
    <h2 style="font-size:16px;color:#1B4332;margin:0 0 16px">💡 改善提案</h2>
    ${suggestionsHTML}
</div>

<!-- Footer -->
<div style="text-align:center;padding:20px;color:#999;font-size:12px">
    <p>🌿 CelticDreamscape 自動レポート</p>
    <p>Generated by GitHub Actions • <a href="${CONFIG.siteUrl}" style="color:#2D6A4F">サイトを見る</a></p>
</div>

</div>
</body></html>`;
}

// ===== Send Email =====
async function sendEmail(html) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: CONFIG.gmailUser,
            pass: CONFIG.gmailAppPassword,
        },
    });

    const period = isMonthly ? '月次' : '週次';
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;

    await transporter.sendMail({
        from: `"CelticDreamscape Report" <${CONFIG.gmailUser}>`,
        to: CONFIG.reportEmailTo,
        subject: `🌿 CelticDreamscape ${period}レポート — ${dateStr}`,
        html,
    });

    console.log(`📧 ${period}レポートを ${CONFIG.reportEmailTo} に送信しました`);
}

// ===== Test Mode (Dummy Data) =====
function getTestData() {
    const ga4 = {
        overview: {
            users: { current: 42, previous: 35 },
            sessions: { current: 67, previous: 51 },
            pageviews: { current: 189, previous: 140 },
            avgDuration: { current: 145, previous: 120 },
            bounceRate: { current: 0.62, previous: 0.68 },
        },
        events: {
            youtube_click: 15,
            spotify_click: 8,
            apple_music_click: 3,
            suno_click: 1,
            subscribe_click: 5,
            share_x: 2,
            share_line: 4,
            share_copy: 6,
        },
        traffic: [
            { channel: 'Organic Search', sessions: 25 },
            { channel: 'Direct', sessions: 20 },
            { channel: 'Social', sessions: 15 },
            { channel: 'Referral', sessions: 7 },
        ],
        devices: [
            { category: 'mobile', users: 28 },
            { category: 'desktop', users: 12 },
            { category: 'tablet', users: 2 },
        ],
        pages: [
            { path: '/', views: 189 },
        ],
    };
    const sc = {
        overview: { clicks: 18, impressions: 450, ctr: 0.04, position: 28.5 },
        queries: [
            { query: 'celtic music', clicks: 5, impressions: 120, ctr: 0.042 },
            { query: 'ケルト音楽 癒し', clicks: 4, impressions: 85, ctr: 0.047 },
            { query: 'celtic dreamscape', clicks: 3, impressions: 40, ctr: 0.075 },
            { query: 'celtic ambient bgm', clicks: 2, impressions: 60, ctr: 0.033 },
            { query: 'ケルト bgm 作業用', clicks: 2, impressions: 55, ctr: 0.036 },
        ],
    };
    return { ga4, sc };
}

// ===== Main =====
async function main() {
    console.log(`🌿 CelticDreamscape ${isMonthly ? '月次' : '週次'}レポート生成開始`);

    let ga4Data, scData;

    if (isTest) {
        console.log('🧪 テストモード（ダミーデータ使用）');
        const testData = getTestData();
        ga4Data = testData.ga4;
        scData = testData.sc;
    } else {
        const auth = await getAuthClient();

        console.log('📊 GA4 データ取得中...');
        const rawGA4 = await fetchGA4Data(auth);
        ga4Data = parseGA4(rawGA4);

        console.log('🔍 Search Console データ取得中...');
        const rawSC = await fetchSearchConsoleData(auth);
        scData = {
            overview: rawSC.overviewRes.data.rows?.[0] || {},
            queries: (rawSC.queriesRes.data.rows || []).map(r => ({
                query: r.keys[0],
                clicks: r.clicks,
                impressions: r.impressions,
                ctr: r.ctr,
            })),
        };
    }

    console.log('💡 改善提案生成中...');
    const suggestions = generateSuggestions(ga4Data, scData);

    console.log('📧 HTMLメール生成中...');
    const html = buildEmailHTML(ga4Data, scData, suggestions);

    await sendEmail(html);
    console.log('✅ 完了！');
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
