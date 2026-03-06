// CelticDreamscape - Internationalization (i18n)
// Auto-detect browser language and switch between Japanese/English

(function () {
    'use strict';

    const LANG_KEY = 'celticdreamscape-lang';

    // Translation dictionary for complex HTML blocks (by element id)
    const translations = {
        // Hero catchphrase - Line 1
        'hero-line1-glow': { ja: 'ヘッドフォンを装着した瞬間、', en: 'The moment you put on headphones,' },
        'hero-line1-text': { ja: 'ヘッドフォンを装着した瞬間、', en: 'The moment you put on headphones,' },
        'hero-line1b-glow': { ja: '世界は静まり', en: 'the world falls silent' },
        'hero-line1b-text': { ja: '世界は静まり', en: 'the world falls silent' },
        // Hero - Line 2 (Celtic Journey)
        'hero-title-glow1': { ja: '"ケルトの旅"', en: '"A Celtic Journey"' },
        'hero-title-glow2': { ja: '"ケルトの旅"', en: '"A Celtic Journey"' },
        'hero-title-main': { ja: '"ケルトの旅"', en: '"A Celtic Journey"' },
        'hero-title-suffix': { ja: 'が始まる。', en: 'begins.' },
        // Hero - Line 3
        'hero-line3-glow': { ja: '今すぐ', en: 'Enter' },
        'hero-line3-text': { ja: '今すぐ', en: 'Enter' },
        'hero-line3b-glow': { ja: '癒やしの森へ', en: 'the Healing Forest' },
        'hero-line3b-text': { ja: '癒やしの森へ', en: 'the Healing Forest' },
        // Hero CTAs
        'cta-youtube': { ja: '🔔 チャンネル登録', en: '🔔 Subscribe' },
        'cta-spotify': { ja: '🎵 Spotifyで聴く', en: '🎵 Listen on Spotify' },
        // Featured track
        'featured-desc': { ja: '✨ Immerse yourself in the mystical Celtic soundscape ✨', en: '✨ Immerse yourself in the mystical Celtic soundscape ✨' },
        'play-btn': { ja: '🎵 Click Here to Play Music 🎶', en: '🎵 Click Here to Play Music 🎶' },
        // About section - stat subtitles
        'stat-sub-1': { ja: 'デジタル・ピルグリム', en: 'Digital Pilgrims' },
        'stat-sub-2': { ja: '音響の儀式', en: 'Sonic Rituals' },
        'stat-sub-3': { ja: 'デジタル・ドルイドの影響', en: 'Digital Druid Influence' },
        // About description
        'about-desc-keyword1': { ja: '古代ケルトの神話', en: 'ancient Celtic mythology' },
        'about-desc-keyword2': { ja: '現代のサイバネティクス', en: 'modern cybernetics' },
        'about-desc-glow1': { ja: '新しい形の音響体験', en: 'a new sonic experience' },
        'about-desc-text1': { ja: '新しい形の音響体験', en: 'a new sonic experience' },
        'about-desc-glow2': { ja: 'デジタル・ドルイド', en: 'Digital Druid' },
        'about-desc-text2': { ja: '✨ デジタル・ドルイド ✨', en: '✨ Digital Druid ✨' },
        'about-desc-glow3': { ja: '神秘の森', en: 'the Mystic Forest' },
        'about-desc-text3': { ja: '🌲 神秘の森 🌲', en: '🌲 the Mystic Forest 🌲' },
        // Portfolio descriptions
        'portfolio-sub-1': { ja: 'インスピレーション: デジタル・ドルイドの記録', en: 'Inspiration: Digital Druid Chronicles' },
        'portfolio-sub-2': { ja: 'インスピレーション: 神秘の周波数', en: 'Inspiration: Mystic Frequencies' },
        'portfolio-sub-3': { ja: 'インスピレーション: サイバー・ケルトの儀式', en: 'Inspiration: Cyber Celtic Ritual' },
        'portfolio-desc-1-keyword': { ja: '新次元のサウンドスケープ', en: 'a new dimension of soundscapes' },
        'portfolio-desc-2-keyword1': { ja: '自然の叡智', en: 'Nature\'s wisdom' },
        'portfolio-desc-2-keyword2': { ja: 'デジタル技術', en: 'digital technology' },
        'portfolio-desc-3-keyword': { ja: '神聖なる電子音響', en: 'sacred electronic sounds' },
        // Contact - Spotify button
        'listen-all-btn': { ja: '🎧 Spotifyで全曲を聴く', en: '🎧 Listen All on Spotify' },
        // Footer
        'footer-desc': { ja: '古代ケルトの神話と現代サウンドデザインを融合させた、新しい形の音響体験。', en: 'A new sonic experience fusing ancient Celtic mythology with modern sound design.' },
    };

    // Complex text nodes that mix Japanese with HTML - handle via parent innerHTML
    const complexBlocks = {
        'about-para': {
            ja: null, // stored on first run
            en: `<span class="relative"><span class="absolute inset-0 text-cyber-blue blur-sm">CelticDreamscape</span><span class="relative text-cyan-300 font-bold text-3xl">CelticDreamscape</span></span> fuses <span class="text-purple-300 font-semibold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">ancient Celtic mythology</span> with <span class="text-cyber-blue font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">modern cybernetics</span> to create <span class="relative"><span class="absolute inset-0 text-emerald-400 blur-sm opacity-50">a new sonic experience</span><span class="relative text-emerald-300 font-bold text-2xl">a new sonic experience</span></span>.<br><br>As a <span class="relative"><span class="absolute inset-0 text-purple-400 blur-sm opacity-60">Digital Druid</span><span class="relative text-purple-300 font-bold text-3xl">✨ Digital Druid ✨</span></span>, reviving lost wisdom within synthetic soundscapes, guiding listeners into <span class="relative"><span class="absolute inset-0 text-emerald-400 blur-sm opacity-50">the Mystic Forest</span><span class="relative text-emerald-300 font-bold text-2xl">🌲 the Mystic Forest 🌲</span></span>.`
        },
        'portfolio-desc-1': {
            ja: null,
            en: `Gateway to CelticDreamscape's sonic world. Where ancient Celtic mysticism meets digital technology — welcome to <span class="text-cyan-300 font-semibold">a new dimension of soundscapes</span>.`
        },
        'portfolio-desc-2': {
            ja: null,
            en: `Recreating the mystical frequencies of ancient stone monuments in modern soundscapes. The ultimate healing experience woven by <span class="text-emerald-300 font-semibold">nature's wisdom</span> and <span class="text-cyan-300 font-semibold">digital technology</span>.`
        },
        'portfolio-desc-3': {
            ja: null,
            en: `A Celtic ritual performed in digital space. The pinnacle of <span class="text-purple-300 font-semibold">sacred electronic sound</span>, born from the harmony of ancient wisdom and future technology.`
        }
    };

    // Detect preferred language
    function detectLanguage() {
        const saved = localStorage.getItem(LANG_KEY);
        if (saved) return saved;
        const browserLang = navigator.language || navigator.userLanguage || 'ja';
        return browserLang.startsWith('ja') ? 'ja' : 'en';
    }

    // Apply language
    function applyLanguage(lang) {
        // Simple text elements by ID
        Object.keys(translations).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = translations[id][lang];
            }
        });

        // Complex HTML blocks by ID
        Object.keys(complexBlocks).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (complexBlocks[id].ja === null) {
                    complexBlocks[id].ja = el.innerHTML;
                }
                el.innerHTML = lang === 'en' ? complexBlocks[id].en : complexBlocks[id].ja;
            }
        });

        // Update html lang
        document.documentElement.lang = lang;

        // Update toggle button
        const toggleBtn = document.getElementById('lang-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = lang === 'ja' ? '🇬🇧 EN' : '🇯🇵 JP';
            toggleBtn.setAttribute('aria-label', lang === 'ja' ? 'Switch to English' : '日本語に切替');
        }

        localStorage.setItem(LANG_KEY, lang);
        window.__currentLang = lang;
    }

    // Toggle language
    function toggleLanguage() {
        const current = window.__currentLang || 'ja';
        applyLanguage(current === 'ja' ? 'en' : 'ja');
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        const lang = detectLanguage();
        applyLanguage(lang);

        const toggleBtn = document.getElementById('lang-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleLanguage);
        }
        console.log(`🌍 Language: ${lang}`);
    });

    window.celticI18n = { applyLanguage, toggleLanguage, detectLanguage };
})();
