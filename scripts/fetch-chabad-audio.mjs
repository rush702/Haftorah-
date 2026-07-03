#!/usr/bin/env node
/**
 * Downloads the cantor trop recordings from Chabad.org's trop trainer
 * into public/audio/trop/ for personal study use.
 *
 * Run on your own machine (needs normal internet access):
 *   node scripts/fetch-chabad-audio.mjs
 *
 * These recordings are © Chabad.org — downloaded for personal educational
 * use only. They are gitignored and must not be redistributed.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const TRAINER_URL =
  'https://www.chabad.org/library/howto/trainer_cdo/aid/1771208/jewish/Learn-to-Read-Torah-and-Haftarah-With-Trop-Audio.htm';

const OUT_DIR = path.resolve('public/audio/trop');

// Our trop keys → name patterns seen in Chabad file names / labels.
// Matching is case-insensitive against the audio file's URL/name.
const TROP_ALIASES = {
  'sof-pasuk': [/sof[\s_-]?pasuk/i, /sof[\s_-]?passuk/i, /siluk/i],
  'etnachta': [/etnachta/i, /esnachta/i, /atnach/i],
  'tipcha': [/tipcha/i, /tifcha/i],
  'mercha': [/mercha/i, /merecha/i, /ma.?arich/i],
  'munach': [/munach(?!.*legarm)/i],
  'munach-legarmeih': [/munach.*legarm/i, /legarmeih/i, /legarmei/i],
  'zakef-katan': [/zakef.?katan/i, /zakeif.?katan/i, /katon/i],
  'zakef-gadol': [/zakef.?gadol/i, /zakeif.?gadol/i, /godol/i],
  'segol': [/segol/i, /sgol/i],
  'shalshelet': [/shalshele/i],
  'kadma': [/kadma/i, /azla(?!.*geresh)/i, /pashta.*kadma|kadma.*pashta/i],
  'pashta': [/pashta(?!.*kadma)/i],
  'tevir': [/tevir/i, /t'vir/i, /tvir/i],
  'geresh': [/geresh(?!ayim)/i, /gerish/i],
  'revia': [/revi/i],
  'darga': [/darga/i],
  'telisha': [/telisha/i, /tlisha/i],
};

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36';

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function extractAudioUrls(html, baseUrl) {
  const urls = new Set();
  // absolute + protocol-relative + relative URLs, mp3/m4a/aac
  const re = /(?:https?:)?\/?\/?[^\s"'<>()]+\.(?:mp3|m4a|aac)(?:\?[^\s"'<>()]*)?/gi;
  for (const m of html.matchAll(re)) {
    let u = m[0];
    if (u.startsWith('//')) u = 'https:' + u;
    else if (u.startsWith('/')) u = new URL(u, baseUrl).href;
    else if (!u.startsWith('http')) continue;
    urls.add(u);
  }
  return [...urls];
}

function matchTrop(url) {
  const name = decodeURIComponent(url.split('/').pop() || '');
  for (const [key, patterns] of Object.entries(TROP_ALIASES)) {
    if (patterns.some((p) => p.test(name) || p.test(url))) return key;
  }
  return null;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: TRAINER_URL } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // Also accept a manual list of URLs (one per line) in scripts/audio-urls.txt
  // — grab them from DevTools > Network tab on the trainer page if the
  // automatic scrape finds nothing.
  let urls = [];
  const manualList = path.resolve('scripts/audio-urls.txt');
  if (existsSync(manualList)) {
    const txt = await readFile(manualList, 'utf8');
    urls = txt.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    console.log(`Using ${urls.length} URLs from scripts/audio-urls.txt`);
  } else {
    console.log('Fetching trainer page...');
    const html = await fetchText(TRAINER_URL);
    urls = extractAudioUrls(html, TRAINER_URL);
    console.log(`Found ${urls.length} audio URLs in page source`);
  }

  if (urls.length === 0) {
    console.log(`
No audio URLs found automatically. The trainer loads audio via JavaScript.

To get the files manually:
  1. Open ${TRAINER_URL} in Chrome
  2. Open DevTools (Cmd+Option+I) > Network tab > filter "Media"
  3. Click each trop button in the trainer — each click loads an .mp3
  4. Right-click each request > Copy URL
  5. Paste all URLs (one per line) into scripts/audio-urls.txt
  6. Re-run: node scripts/fetch-chabad-audio.mjs
`);
    process.exit(1);
  }

  const manifest = {};
  const unmatched = [];

  for (const url of urls) {
    const key = matchTrop(url);
    const ext = (url.match(/\.(mp3|m4a|aac)/i) || [, 'mp3'])[1].toLowerCase();
    if (key) {
      const file = `${key}.${ext}`;
      try {
        const bytes = await download(url, path.join(OUT_DIR, file));
        manifest[key] = file;
        console.log(`  ✓ ${key} ← ${url.split('/').pop()} (${(bytes / 1024).toFixed(0)} KB)`);
      } catch (e) {
        console.log(`  ✗ ${key} failed: ${e.message}`);
      }
    } else {
      unmatched.push(url);
    }
  }

  if (unmatched.length) {
    console.log('\nUnmatched audio URLs (rename manually if any are trop recordings):');
    unmatched.forEach((u) => console.log('  - ' + u));
  }

  await writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nWrote manifest with ${Object.keys(manifest).length} trop recordings to public/audio/trop/`);
  console.log('Restart the dev server and the app will use the real cantor audio.');
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
