import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist-store');
const allowedFiles = new Set(['index.html', 'privacy.html', 'style.css']);
await mkdir(output, { recursive: true });
for (const name of await readdir(output)) {
  if (!allowedFiles.has(name)) throw new Error(`Unexpected file in public site: ${name}`);
}

function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function inline(text) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replaceAll('christian@expo.dev', '<a href="mailto:christian@expo.dev">christian@expo.dev</a>');
}

// These documents use headings, paragraphs, links, bold text, and flat lists.
function renderDocument(markdown) {
  return markdown.trim().split(/\n\s*\n/).flatMap((block) => {
    if (/^(Draft prepared|Prepared for publication)/.test(block)) return [];
    if (block.startsWith('# ')) return [];
    if (block.startsWith('## ')) return `<h2>${inline(block.slice(3))}</h2>`;
    if (block.startsWith('- ')) return `<ul>${block.split('\n').map((line) => `<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
    return `<p>${inline(block.replaceAll('\n', ' '))}</p>`;
  }).join('\n');
}

const pages = [
  { source: 'SUPPORT.md', file: 'index.html', title: 'Support', summary: 'Help with your Oslo offsite guide.' },
  { source: 'PRIVACY-POLICY.md', file: 'privacy.html', title: 'Privacy policy', summary: 'How Oslo Offsite handles information.' },
];

for (const page of pages) {
  let document = await readFile(path.join(root, 'docs', page.source), 'utf8');
  if (document.includes('[CONTACT_EMAIL]')) throw new Error('Set the contact email before exporting.');
  document = document.replace('Privacy information will be available at the published privacy-policy link.', '');
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(page.summary)}">
  <title>${page.title} · Oslo Offsite</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <a class="skip" href="#content">Skip to content</a>
  <header><a class="brand" href="/">Oslo Offsite<span>September 2026</span></a><nav aria-label="Main"><a href="/"${page.file === 'index.html' ? ' aria-current="page"' : ''}>Support</a><a href="/privacy.html"${page.file === 'privacy.html' ? ' aria-current="page"' : ''}>Privacy</a></nav></header>
  <main id="content"><p class="eyebrow">Oslo Offsite</p><h1>${page.title}</h1><p class="intro">${page.summary}</p>${page.file === 'privacy.html' ? '<p class="date">Last updated 9 September 2026</p>' : ''}<article>${renderDocument(document)}</article></main>
  <footer><span>Provided by Christian Magnus Falch</span><a href="mailto:christian@expo.dev">christian@expo.dev</a></footer>
</body>
</html>
`;
  await writeFile(path.join(output, page.file), html);
}

await writeFile(path.join(output, 'style.css'), `:root{color-scheme:light dark;--bg:#f7f8fa;--surface:#fff;--text:#17212b;--muted:#596471;--link:#5b3cbd;--line:#dce1e7}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:17px/1.7 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:var(--link);text-underline-offset:.2em}a:focus-visible{outline:3px solid var(--link);outline-offset:5px}header,footer{max-width:1080px;margin:auto;padding:28px 36px;display:flex;align-items:center;justify-content:space-between;gap:24px}header{border-bottom:1px solid var(--line)}.brand{color:var(--text);font-size:19px;font-weight:700;text-decoration:none;line-height:1.3}.brand span{display:block;font-size:12px;font-weight:500;letter-spacing:.05em;color:var(--muted);margin-top:5px}nav{display:flex;gap:24px;font-size:15px}nav a{text-decoration:none}nav a[aria-current]{text-decoration:underline;font-weight:650}main{max-width:790px;margin:64px auto 72px;padding:0 36px}.eyebrow{font-size:12px;font-weight:650;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}h1{font-size:clamp(36px,7vw,56px);line-height:1.08;letter-spacing:-.04em;margin:12px 0 18px}h2{font-size:24px;line-height:1.3;letter-spacing:-.02em;margin:38px 0 12px}.intro{font-size:21px;line-height:1.5;color:var(--muted);margin-bottom:24px}.date{font-size:13px;color:var(--muted)}article{margin-top:36px}p{margin:0 0 20px}li{margin-bottom:8px}footer{border-top:1px solid var(--line);font-size:13px;color:var(--muted)}.skip{position:absolute;top:-100px;left:20px;background:var(--surface);padding:10px}.skip:focus{top:10px}@media(max-width:540px){header,footer{padding:22px;gap:18px;flex-wrap:wrap}main{margin-top:42px;padding:0 22px}nav{gap:18px}.intro{font-size:19px}body{font-size:16px}footer{align-items:flex-start;flex-direction:column}}@media(prefers-color-scheme:dark){:root{--bg:#11151a;--surface:#191f26;--text:#e8edf3;--muted:#a8b2c0;--link:#bcabff;--line:#303945}}\n`);

console.log('Public support site prepared in dist-store: index.html, privacy.html, style.css');
