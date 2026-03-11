#!/usr/bin/env node
/**
 * CelticDreamscape — セキュリティ監査スクリプト
 *
 * 6項目のセキュリティチェックを実行し、HTMLメールレポートを送信する。
 *
 * チェック項目:
 *   1. APIキーパターン（AIza*, AKIA*, ghp_*, sk-* 等）
 *   2. パスワード・シークレットのハードコード
 *   3. PII（メールアドレス、個人名）
 *   4. シークレットファイル（.env, config.json 等）
 *   5. Git Author情報（noreply以外の漏洩）
 *   6. Dependabotアラート（GitHub API経由）
 *
 * 環境変数:
 *   GMAIL_USER, GMAIL_APP_PASSWORD, REPORT_EMAIL_TO
 *   GITHUB_TOKEN (GitHub Actions自動提供)
 *   GITHUB_REPOSITORY (GitHub Actions自動提供)
 */

const { execSync } = require('child_process');
const nodemailer = require('nodemailer');
const https = require('https');

// ===== Config =====
const CONFIG = {
    gmailUser: process.env.GMAIL_USER,
    gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
    reportEmailTo: process.env.REPORT_EMAIL_TO,
    githubToken: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPOSITORY || 'TakashiNishijima/celticdreamscape-homepage',
};

// ===== Patterns =====
const API_KEY_PATTERNS = [
    { name: 'Google API Key', regex: /AIza[0-9A-Za-z_-]{35}/g },
    { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
    { name: 'GitHub PAT (classic)', regex: /ghp_[A-Za-z0-9]{36}/g },
    { name: 'GitHub PAT (fine-grained)', regex: /github_pat_[A-Za-z0-9_]{82}/g },
    { name: 'GitHub OAuth Token', regex: /gho_[A-Za-z0-9]{36}/g },
    { name: 'OpenAI API Key', regex: /sk-[A-Za-z0-9]{20,}/g },
    { name: 'Slack Token', regex: /xox[bposa]-[0-9]{10,}-[A-Za-z0-9-]+/g },
    { name: 'Generic Bearer Token', regex: /bearer\s+[A-Za-z0-9_\-.]{20,}/gi },
];

const SECRET_VALUE_PATTERNS = [
    { name: 'Hardcoded password', regex: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/gi },
    { name: 'Hardcoded secret', regex: /(?:secret|api_secret|client_secret)\s*[:=]\s*['"][^'"]{8,}['"]/gi },
    { name: 'Hardcoded token', regex: /(?:access_token|auth_token|api_token)\s*[:=]\s*['"][^'"]{8,}['"]/gi },
    { name: 'Private key block', regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g },
];

const PII_PATTERNS = [
    { name: 'Personal email', regex: /[a-zA-Z0-9._%+-]+@(?:gmail|yahoo|outlook|hotmail|icloud)\.[a-z]{2,}/gi },
    { name: 'Phone number (JP)', regex: /0[789]0-?\d{4}-?\d{4}/g },
];

const SENSITIVE_FILENAMES = [
    '.env', '.env.local', '.env.production', '.env.development',
    'config.json', 'jwt-auth-config.json',
    'credentials.json', 'service-account.json',
    'id_rsa', 'id_ed25519', '*.pem', '*.key', '*.p12',
];

// Allowlist: patterns that are safe to ignore
const ALLOWLIST = [
    /\$\{\{\s*secrets\./,         // GitHub Actions secrets reference
    /process\.env\./,             // Node.js env reference
    /YOUTUBE_API_KEY/,            // env var name (not value)
    /GMAIL_APP_PASSWORD/,         // env var name (not value)
    /GOOGLE_SERVICE_ACCOUNT_KEY/, // env var name (not value)
    /gyouza12@users\.noreply/,    // GitHub noreply email
    /github-actions\[bot\]/,      // Bot author
    /pageToken/,                  // YouTube API pagination parameter
];

// ===== Helpers =====
function exec(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }).trim();
    } catch {
        return '';
    }
}

function isAllowlisted(line) {
    return ALLOWLIST.some(pattern => pattern.test(line));
}

function githubApi(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path,
            headers: {
                'User-Agent': 'security-audit-bot',
                'Accept': 'application/vnd.github+json',
                ...(CONFIG.githubToken ? { 'Authorization': `Bearer ${CONFIG.githubToken}` } : {}),
            },
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch { resolve([]); }
            });
        }).on('error', reject);
    });
}

// ===== Checks =====
function checkApiKeys() {
    const findings = [];
    // Scan all tracked files
    const files = exec('git ls-files').split('\n').filter(Boolean);

    for (const file of files) {
        // Skip binary files and package-lock
        if (/\.(mp4|mp3|png|jpg|jpeg|gif|webp|woff|ttf|ico)$/.test(file)) continue;
        if (file === 'scripts/package-lock.json') continue;

        let content;
        try { content = exec(`git show HEAD:"${file}"`); } catch { continue; }

        for (const pattern of API_KEY_PATTERNS) {
            const matches = content.match(pattern.regex);
            if (matches) {
                for (const m of matches) {
                    const line = `${file}: ${m.substring(0, 20)}...`;
                    if (!isAllowlisted(line) && !isAllowlisted(m)) {
                        findings.push({ file, type: pattern.name, match: m.substring(0, 30) + '...' });
                    }
                }
            }
        }
    }
    return findings;
}

function checkHardcodedSecrets() {
    const findings = [];
    const files = exec('git ls-files').split('\n').filter(Boolean);

    for (const file of files) {
        if (/\.(mp4|mp3|png|jpg|jpeg|gif|webp|woff|ttf|ico)$/.test(file)) continue;
        if (file === 'scripts/package-lock.json') continue;

        let content;
        try { content = exec(`git show HEAD:"${file}"`); } catch { continue; }

        for (const pattern of SECRET_VALUE_PATTERNS) {
            const matches = content.match(pattern.regex);
            if (matches) {
                for (const m of matches) {
                    if (!isAllowlisted(m)) {
                        findings.push({ file, type: pattern.name, match: m.substring(0, 40) + '...' });
                    }
                }
            }
        }
    }
    return findings;
}

function checkPII() {
    const findings = [];
    const files = exec('git ls-files').split('\n').filter(Boolean);

    // Also check for specific name patterns
    const namePatterns = [
        { name: 'Japanese full name', regex: /nishijima|takashi|西島/gi },
    ];

    for (const file of files) {
        if (/\.(mp4|mp3|png|jpg|jpeg|gif|webp|woff|ttf|ico)$/.test(file)) continue;
        if (file === 'scripts/package-lock.json') continue;

        let content;
        try { content = exec(`git show HEAD:"${file}"`); } catch { continue; }

        const allPatterns = [...PII_PATTERNS, ...namePatterns];
        for (const pattern of allPatterns) {
            const matches = content.match(pattern.regex);
            if (matches) {
                for (const m of matches) {
                    if (!isAllowlisted(m)) {
                        findings.push({ file, type: pattern.name, match: m });
                    }
                }
            }
        }
    }
    return findings;
}

function checkSensitiveFiles() {
    const findings = [];
    // Check current files
    const allFiles = exec('git ls-files').split('\n').filter(Boolean);
    for (const file of allFiles) {
        const basename = file.split('/').pop();
        if (SENSITIVE_FILENAMES.some(s => {
            if (s.startsWith('*')) return basename.endsWith(s.substring(1));
            return basename === s;
        })) {
            findings.push({ file, type: 'Sensitive file in repo' });
        }
    }

    // Check git history for previously committed sensitive files
    const historyFiles = exec("git log --all --name-only --pretty=format: | sort -u").split('\n').filter(Boolean);
    for (const file of historyFiles) {
        const basename = file.split('/').pop();
        if (SENSITIVE_FILENAMES.some(s => {
            if (s.startsWith('*')) return basename.endsWith(s.substring(1));
            return basename === s;
        })) {
            if (!allFiles.includes(file)) {
                findings.push({ file, type: 'Sensitive file in history (deleted but still in commits)' });
            }
        }
    }
    return findings;
}

function checkGitAuthors() {
    const findings = [];
    const authors = exec("git log --all --pretty=format:'%an <%ae>' | sort -u").split('\n').filter(Boolean);

    for (const author of authors) {
        const clean = author.replace(/^'|'$/g, '');
        // Allow: noreply GitHub email, github-actions bot
        if (/noreply\.github\.com/.test(clean)) continue;
        if (/github-actions\[bot\]/.test(clean)) continue;
        if (/dependabot\[bot\]/.test(clean)) continue;

        // Any other author is a potential PII leak
        findings.push({ type: 'Non-anonymous git author', match: clean });
    }
    return findings;
}

async function checkDependabot() {
    const findings = [];
    try {
        const alerts = await githubApi(`/repos/${CONFIG.repo}/dependabot/alerts?state=open`);
        if (Array.isArray(alerts)) {
            for (const alert of alerts) {
                findings.push({
                    type: `Dependabot: ${alert.security_vulnerability?.severity || 'unknown'}`,
                    match: `${alert.dependency?.package?.name || 'unknown'} - ${alert.security_advisory?.summary || ''}`,
                });
            }
        }
    } catch (err) {
        findings.push({ type: 'Dependabot API error', match: err.message });
    }
    return findings;
}

// ===== Git History Deep Scan =====
function checkGitHistorySecrets() {
    const findings = [];
    // Search full diff history for actual secret values
    const diffOutput = exec('git log -p --all --diff-filter=A -- "*.js" "*.yml" "*.yaml" "*.json" "*.html" "*.css" "*.md" "*.txt" 2>/dev/null | head -50000');

    for (const pattern of API_KEY_PATTERNS) {
        const matches = diffOutput.match(pattern.regex);
        if (matches) {
            for (const m of matches) {
                if (!isAllowlisted(m)) {
                    findings.push({ type: `History: ${pattern.name}`, match: m.substring(0, 30) + '...' });
                }
            }
        }
    }
    return findings;
}

// ===== Report Generation =====
function generateHtmlReport(results) {
    const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const totalIssues = Object.values(results).reduce((sum, r) => sum + r.findings.length, 0);
    const overallStatus = totalIssues === 0 ? '✅ 安全' : `⚠️ ${totalIssues}件の問題を検出`;
    const statusColor = totalIssues === 0 ? '#10b981' : '#ef4444';

    let rows = '';
    for (const [key, result] of Object.entries(results)) {
        const icon = result.findings.length === 0 ? '✅' : '🔴';
        const status = result.findings.length === 0 ? '問題なし' :
            result.findings.map(f => `<code>${f.type}</code>: ${f.match || f.file || ''}`).join('<br>');
        rows += `
            <tr>
                <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-size:18px;text-align:center;">${icon}</td>
                <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:600;">${result.label}</td>
                <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#475569;">${status}</td>
            </tr>`;
    }

    return `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;">
        <div style="max-width:640px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#1e293b,#334155);padding:28px 32px;color:#fff;">
                <h1 style="margin:0;font-size:22px;">🛡️ セキュリティ監査レポート</h1>
                <p style="margin:8px 0 0;font-size:13px;opacity:0.8;">CelticDreamscape Homepage | ${timestamp}</p>
            </div>
            <div style="padding:24px 32px;">
                <div style="background:${statusColor}15;border-left:4px solid ${statusColor};padding:14px 18px;border-radius:6px;margin-bottom:20px;">
                    <span style="font-size:20px;font-weight:700;color:${statusColor};">${overallStatus}</span>
                </div>
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f8fafc;">
                            <th style="padding:10px;text-align:center;width:40px;"></th>
                            <th style="padding:10px;text-align:left;font-size:13px;color:#64748b;text-transform:uppercase;">チェック項目</th>
                            <th style="padding:10px;text-align:left;font-size:13px;color:#64748b;text-transform:uppercase;">結果</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                <div style="margin-top:24px;padding:14px;background:#f8fafc;border-radius:8px;font-size:12px;color:#94a3b8;text-align:center;">
                    Automated Security Audit by GitHub Actions
                </div>
            </div>
        </div>
    </body></html>`;
}

// ===== Email =====
async function sendReport(html, totalIssues) {
    if (!CONFIG.gmailUser || !CONFIG.gmailAppPassword || !CONFIG.reportEmailTo) {
        console.log('⚠️ Email credentials not configured. Skipping email.');
        console.log('\n--- HTML Report ---');
        console.log(html);
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: CONFIG.gmailUser, pass: CONFIG.gmailAppPassword },
    });

    const statusEmoji = totalIssues === 0 ? '✅' : '⚠️';
    const subject = `${statusEmoji} セキュリティ監査レポート - CelticDreamscape (${new Date().toLocaleDateString('ja-JP')})`;

    await transporter.sendMail({
        from: `"Security Audit Bot" <${CONFIG.gmailUser}>`,
        to: CONFIG.reportEmailTo,
        subject,
        html,
    });

    console.log(`📧 レポートを ${CONFIG.reportEmailTo} に送信しました`);
}

// ===== Main =====
async function main() {
    console.log('🛡️ セキュリティ監査を開始...\n');

    const results = {};

    // 1. API Key patterns
    console.log('🔍 [1/7] APIキーパターンをスキャン中...');
    results.apiKeys = { label: 'APIキーパターン', findings: checkApiKeys() };
    console.log(`   → ${results.apiKeys.findings.length === 0 ? '✅ 問題なし' : `🔴 ${results.apiKeys.findings.length}件検出`}`);

    // 2. Hardcoded secrets
    console.log('🔍 [2/7] パスワード・シークレットをスキャン中...');
    results.secrets = { label: 'パスワード・シークレット', findings: checkHardcodedSecrets() };
    console.log(`   → ${results.secrets.findings.length === 0 ? '✅ 問題なし' : `🔴 ${results.secrets.findings.length}件検出`}`);

    // 3. PII
    console.log('🔍 [3/7] 個人情報(PII)をスキャン中...');
    results.pii = { label: '個人情報 (PII)', findings: checkPII() };
    console.log(`   → ${results.pii.findings.length === 0 ? '✅ 問題なし' : `🔴 ${results.pii.findings.length}件検出`}`);

    // 4. Sensitive files
    console.log('🔍 [4/7] シークレットファイルをチェック中...');
    results.sensitiveFiles = { label: 'シークレットファイル', findings: checkSensitiveFiles() };
    console.log(`   → ${results.sensitiveFiles.findings.length === 0 ? '✅ 問題なし' : `🔴 ${results.sensitiveFiles.findings.length}件検出`}`);

    // 5. Git authors
    console.log('🔍 [5/7] Git Author情報をチェック中...');
    results.gitAuthors = { label: 'Git Author情報', findings: checkGitAuthors() };
    console.log(`   → ${results.gitAuthors.findings.length === 0 ? '✅ 問題なし' : `🔴 ${results.gitAuthors.findings.length}件検出`}`);

    // 6. Git history deep scan
    console.log('🔍 [6/7] Git履歴のディープスキャン中...');
    results.historySecrets = { label: 'Git履歴シークレット', findings: checkGitHistorySecrets() };
    console.log(`   → ${results.historySecrets.findings.length === 0 ? '✅ 問題なし' : `🔴 ${results.historySecrets.findings.length}件検出`}`);

    // 7. Dependabot
    console.log('🔍 [7/7] Dependabotアラートをチェック中...');
    results.dependabot = { label: 'Dependabotアラート', findings: await checkDependabot() };
    console.log(`   → ${results.dependabot.findings.length === 0 ? '✅ 問題なし' : `⚠️ ${results.dependabot.findings.length}件検出`}`);

    // Summary
    const totalIssues = Object.values(results).reduce((sum, r) => sum + r.findings.length, 0);
    console.log(`\n${'='.repeat(50)}`);
    console.log(`総合結果: ${totalIssues === 0 ? '✅ 安全' : `⚠️ ${totalIssues}件の問題を検出`}`);
    console.log(`${'='.repeat(50)}`);

    // Generate and send report
    const html = generateHtmlReport(results);
    await sendReport(html, totalIssues);

    // Exit with error if critical issues found (API keys, passwords, PII)
    const criticalIssues = results.apiKeys.findings.length +
        results.secrets.findings.length +
        results.pii.findings.length +
        results.sensitiveFiles.findings.length;
    if (criticalIssues > 0) {
        console.log('\n🔴 クリティカルな問題が検出されました。ワークフローを失敗にします。');
        process.exit(1);
    }
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
