// CelticDreamscape - Internationalization (i18n)
// Auto-detect browser language and switch between Japanese/English

(function () {
    'use strict';

    const LANG_KEY = 'celticdreamscape-lang';

    const translations = {
        // Hero
        'hero-line1-text': { ja: 'ヘッドフォンを装着した瞬間、', en: 'The moment you put on headphones,' },
        'hero-line1b-text': { ja: '世界は静まり', en: 'the world falls silent' },
        'hero-title-main': { ja: '"ケルトの旅"', en: '"A Celtic Journey"' },
        'hero-title-suffix': { ja: 'が始まる。', en: 'begins.' },
        'hero-subtitle': { ja: '古代ケルトの神話と現代サウンドデザインが融合する、癒しの音響体験', en: 'A healing sonic experience where ancient Celtic mythology meets modern sound design' },
        // CTAs
        'cta-youtube': { ja: '🔔 チャンネル登録', en: '🔔 Subscribe' },
        'cta-spotify': { ja: '🎵 Spotifyで聴く', en: '🎵 Listen on Spotify' },
        // Stats
        'stat-sub-1': { ja: 'デジタル・ピルグリム', en: 'Digital Pilgrims' },
        'stat-sub-2': { ja: '音響の儀式', en: 'Sonic Rituals' },
        'stat-sub-3': { ja: 'デジタル・ドルイドの影響', en: 'Digital Druid Influence' },
        // Footer
        'footer-desc': { ja: '古代ケルトの神話と現代サウンドデザインを融合させた、新しい形の音響体験。', en: 'A new sonic experience fusing ancient Celtic mythology with modern sound design.' },
        'listen-all-btn': { ja: 'Spotifyで全曲を聴く →', en: 'Listen all on Spotify →' },
    };

    const complexBlocks = {
        'about-para': {
            ja: null,
            en: `<span class="text-forest font-bold text-2xl">CelticDreamscape</span> fuses
                <span class="text-forest-light font-semibold">ancient Celtic mythology</span> with
                <span class="text-warm-gold font-semibold">modern cybernetics</span> to create
                <span class="text-forest font-semibold">a new form of sonic experience</span>.
                <br><br>
                Reviving lost wisdom within soundscapes, we invite listeners into the
                <span class="text-forest-light font-semibold">🌲 Mystic Forest 🌲</span>.`
        },
    };

    function detectLanguage() {
        const saved = localStorage.getItem(LANG_KEY);
        if (saved) return saved;
        const browserLang = navigator.language || navigator.userLanguage || 'ja';
        return browserLang.startsWith('ja') ? 'ja' : 'en';
    }

    function applyLanguage(lang) {
        // Simple translations
        for (const [id, texts] of Object.entries(translations)) {
            const el = document.getElementById(id);
            if (el && texts[lang]) el.textContent = texts[lang];
        }

        // Complex blocks
        for (const [id, texts] of Object.entries(complexBlocks)) {
            const el = document.getElementById(id);
            if (!el) continue;
            if (!texts.ja) texts.ja = el.innerHTML;
            if (texts[lang]) el.innerHTML = texts[lang];
        }

        // Update toggle button
        const btn = document.getElementById('lang-toggle');
        if (btn) btn.textContent = lang === 'ja' ? '🇬🇧 EN' : '🇯🇵 JP';

        localStorage.setItem(LANG_KEY, lang);
    }

    function toggleLanguage() {
        const current = detectLanguage();
        const next = current === 'ja' ? 'en' : 'ja';
        applyLanguage(next);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const lang = detectLanguage();
        applyLanguage(lang);

        const toggleBtn = document.getElementById('lang-toggle');
        if (toggleBtn) toggleBtn.addEventListener('click', toggleLanguage);
        console.log(`🌍 Language: ${lang}`);
    });

    window.celticI18n = { applyLanguage, toggleLanguage, detectLanguage };
})();
