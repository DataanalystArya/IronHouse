import { FALLBACK } from './fallbackUrls';

const VIDEO_PUBLIC_CANDIDATES = [
  'videos/hero.mp4',
  'videos/hero.webm',
  'videos/gym.mp4',
  'videos/banner.mp4',
  'videos/loop.mp4',
  'videos/background.webm',
];

const POSTER_PUBLIC_CANDIDATES = [
  'images/hero.jpg',
  'images/hero.webp',
  'images/hero-poster.jpg',
  'images/poster.jpg',
  'images/poster.webp',
];

function publicUrl(path) {
  const base = process.env.PUBLIC_URL || '';
  return `${base}/assets/${path}`.replace(/([^:]\/)\/+/g, '$1');
}

async function headOk(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', cache: 'force-cache' });
    return r.ok;
  } catch {
    return false;
  }
}

export async function probePublicVideo() {
  for (const p of VIDEO_PUBLIC_CANDIDATES) {
    const url = publicUrl(p);
    if (await headOk(url)) return url;
  }
  return null;
}

export async function probePublicPoster() {
  for (const p of POSTER_PUBLIC_CANDIDATES) {
    const url = publicUrl(p);
    if (await headOk(url)) return url;
  }
  return null;
}

export async function loadPublicImageManifest() {
  const url = publicUrl('images/manifest.json');
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) return [];
    const data = await r.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter((x) => typeof x === 'string' && x.length > 0)
      .map((name) => ({
        src: publicUrl(`images/${name.replace(/^\//, '')}`),
        base: name.split('/').pop().toLowerCase(),
      }));
  } catch {
    return [];
  }
}

function classify(base) {
  if (/^hero\.|^poster\.|^banner\./i.test(base)) return 'hero';
  if (/trainer|coach|staff/i.test(base)) return 'trainer';
  if (/transformation/i.test(base)) return 'transformation';
  if (/before/i.test(base)) return 'before';
  if (/after/i.test(base)) return 'after';
  if (/feature|training|cardio|strength|diet|nutrition|gym|floor/i.test(base)) return 'feature';
  if (/testimonial|member|avatar|face|portrait/i.test(base)) return 'testimonial';
  return 'pool';
}

function mergeImageSources(bundled, publicManifest) {
  const seen = new Set();
  const out = [];
  for (const b of bundled) {
    if (seen.has(b.src)) continue;
    seen.add(b.src);
    out.push({ src: b.src, base: b.base, kind: classify(b.base) });
  }
  for (const p of publicManifest) {
    if (seen.has(p.src)) continue;
    seen.add(p.src);
    out.push({ src: p.src, base: p.base, kind: classify(p.base) });
  }
  return out;
}

function takeOne(pool, used, preferredKind) {
  if (preferredKind) {
    const hit = pool.find((x) => !used.has(x.src) && x.kind === preferredKind);
    if (hit) {
      used.add(hit.src);
      return hit.src;
    }
  }
  const any = pool.find((x) => !used.has(x.src));
  if (any) {
    used.add(any.src);
    return any.src;
  }
  return null;
}

function pickFromKind(pool, kind, used, max) {
  const res = [];
  for (const x of pool) {
    if (res.length >= max) break;
    if (x.kind !== kind || used.has(x.src)) continue;
    used.add(x.src);
    res.push(x.src);
  }
  return res;
}

function pickAny(pool, used, max) {
  const res = [];
  for (const x of pool) {
    if (res.length >= max) break;
    if (used.has(x.src)) continue;
    used.add(x.src);
    res.push(x.src);
  }
  return res;
}

export function assignAllMedia(bundledList, publicManifestList) {
  const pool = mergeImageSources(bundledList, publicManifestList);
  const used = new Set();

  let heroPoster = FALLBACK.heroPoster;
  const heroHit = pool.find((x) => x.kind === 'hero' && !used.has(x.src));
  if (heroHit) {
    heroPoster = heroHit.src;
    used.add(heroHit.src);
  }

  const trainerSlots = 4;
  let trainerImages = pickFromKind(pool, 'trainer', used, trainerSlots);
  if (trainerImages.length < trainerSlots) {
    const extra = pickAny(pool, used, trainerSlots - trainerImages.length + pool.length);
    trainerImages = [...trainerImages, ...extra].slice(0, trainerSlots);
  }
  for (let i = 0; i < trainerSlots; i++) {
    if (!trainerImages[i]) {
      const f = FALLBACK.trainers[i];
      trainerImages[i] = f;
    }
  }

  const transformDefs = [
    { id: '1', caption: 'Alex · 16-week recomp, athlete standard' },
    { id: '2', caption: 'Sam · 12-week prime, strength first' },
    { id: '3', caption: 'Chris · 20-week transformation, elite coaching' },
    { id: '4', caption: 'Taylor · movement patterns + lean build' },
    { id: '5', caption: 'Jordan · hybrid conditioning results' },
  ];

  const transformations = transformDefs.map((t, i) => {
    // Check if we have a combined transformation image
    const combined = pool.find(x => x.kind === 'transformation' && !used.has(x.src) && x.base.includes(`transformation${i + 1}`));
    if (combined) {
      used.add(combined.src);
      return { ...t, combined: combined.src };
    }
    
    // Fallback to split if no combined found (for backwards compatibility if needed)
    const fb = FALLBACK.transformations[i % 3];
    let before = takeOne(pool, used, 'before') ?? fb.before;
    let after = takeOne(pool, used, 'after') ?? fb.after;
    if (before === after) {
      after = takeOne(pool, used, null) ?? FALLBACK.transformations[(i + 1) % 3].after;
    }
    return { ...t, before, after };
  });

  let featureImages = pickFromKind(pool, 'feature', used, 4);
  if (featureImages.length < 4) {
    featureImages = [...featureImages, ...pickAny(pool, used, 4)].slice(0, 4);
  }
  for (let i = 0; i < 4; i++) {
    if (!featureImages[i]) featureImages[i] = FALLBACK.features[i];
  }

  let testimonialPhotos = pickFromKind(pool, 'testimonial', used, 5);
  if (testimonialPhotos.length < 5) {
    testimonialPhotos = [...testimonialPhotos, ...pickAny(pool, used, 5)].slice(0, 5);
  }
  for (let i = 0; i < 5; i++) {
    if (!testimonialPhotos[i]) testimonialPhotos[i] = FALLBACK.testimonials[i];
  }

  // Pick some atmospheric videos for backgrounds
  const videoPool = bundledList.filter(x => x.src.endsWith('.mp4') || x.src.endsWith('.webm'));

  return {
    heroPoster,
    trainerImages,
    transformations,
    featureImages,
    testimonialPhotos,
    videoPool: videoPool.map(v => v.src),
  };
}

/**
 * Picks the best hero background from bundled src/assets/videos.
 * Prefers named hero/banner clips, then landscape (16:9-style) over portrait, then lighter HD over huge UHD.
 */
export function pickBundledVideo(bundledVideos) {
  if (!bundledVideos.length) return null;
  const score = (name) => {
    let s = 0;
    if (/hero|banner|gym|loop|background/i.test(name)) s += 200;
    const isPortrait = /2160_3840|1080_1920|_2160_3840|_1080_1920/i.test(name);
    const isLandscape = /3840_2160|1920_1080|_3840_2160|_1920_1080/i.test(name);
    if (isLandscape && !isPortrait) s += 80;
    if (isPortrait) s -= 60;
    if (/hd_1920_1080|1920_1080/i.test(name)) s += 40;
    if (/uhd.*3840_2160/i.test(name)) s += 25;
    if (/uhd/i.test(name)) s += 10;
    return s;
  };
  const scored = [...bundledVideos].sort((a, b) => score(b.base) - score(a.base));
  return scored[0].src;
}
