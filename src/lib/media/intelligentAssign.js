import { FALLBACK } from './fallbackUrls';
// Name update: Priya -> Rosy for transformation 1

const CAPTIONS = [
  { id: '1', caption: 'Rosy · 16-week recomp, athlete standard' },
  { id: '2', caption: 'Arjun · 12-week prime, strength first' },
  { id: '3', caption: 'Chris · 20-week transformation, elite coaching' },
  { id: '4', caption: 'Mike · 24-week shred, full body recomp' },
  { id: '5', caption: 'Neha · hybrid conditioning results' },
];

const FEATURE_LABELS = ['training', 'cardio', 'strength', 'diet', 'recovery', 'community'];

export function scoreHeroVideo(m) {
  if (!m.ok || !m.width || !m.height) return Number.NEGATIVE_INFINITY;
  if (m.height > m.width) return Number.NEGATIVE_INFINITY;
  if (m.aspect < 1.25) return Number.NEGATIVE_INFINITY;
  const ideal = 16 / 9;
  const arFit = 1 - Math.min(Math.abs(m.aspect - ideal) / ideal, 0.45);
  return m.area * (0.35 + 0.65 * arFit);
}

export function scoreHeroPoster(m) {
  if (!m.width || !m.height) return Number.NEGATIVE_INFINITY;
  if (Math.min(m.width, m.height) < 560) return Number.NEGATIVE_INFINITY;
  if (m.aspect < 1.28) return Number.NEGATIVE_INFINITY;
  const ideal = 16 / 9;
  const arFit = 1 - Math.min(Math.abs(m.aspect - ideal) / ideal, 0.5);
  return m.area * arFit;
}

export function scoreTrainerPortrait(m) {
  if (!m.width || !m.height) return Number.NEGATIVE_INFINITY;
  if (Math.min(m.width, m.height) < 360) return Number.NEGATIVE_INFINITY;
  const ar = m.aspect;
  if (ar > 1.22) return Number.NEGATIVE_INFINITY;
  if (ar < 0.48) return Number.NEGATIVE_INFINITY;
  const sweet = 0.74;
  const shape = 1 - Math.min(Math.abs(ar - sweet) / 1.2, 0.4);
  return m.area * (0.4 + 0.6 * shape);
}

export function scoreFeatureWide(m) {
  if (!m.width || !m.height) return Number.NEGATIVE_INFINITY;
  if (Math.min(m.width, m.height) < 420) return Number.NEGATIVE_INFINITY;
  if (m.aspect < 1.08) return Number.NEGATIVE_INFINITY;
  const bonus = Math.min(m.aspect / 1.55, 1.35);
  return m.area * bonus;
}

export function scoreTestimonialFace(m) {
  if (!m.width || !m.height) return Number.NEGATIVE_INFINITY;
  if (Math.min(m.width, m.height) < 260) return Number.NEGATIVE_INFINITY;
  const ar = m.aspect;
  if (ar >= 0.78 && ar <= 1.22) return m.area * 1.15;
  if (ar > 0.58 && ar < 0.78) return m.area;
  if (ar > 1.22 && ar < 1.45) return m.area * 0.82;
  return Number.NEGATIVE_INFINITY;
}

export function scoreTransformBody(m) {
  if (!m.width || !m.height) return Number.NEGATIVE_INFINITY;
  if (Math.min(m.width, m.height) < 320) return Number.NEGATIVE_INFINITY;
  const ar = m.aspect;
  if (ar < 0.42 || ar > 1.2) return Number.NEGATIVE_INFINITY;
  return m.area;
}

function pickBestVideo(videoMetas) {
  const ok = videoMetas.filter((v) => v.ok && v.width > 0);
  if (!ok.length) return null;
  const ranked = [...ok].sort((a, b) => scoreHeroVideo(b) - scoreHeroVideo(a));
  const top = ranked[0];
  return scoreHeroVideo(top) > Number.NEGATIVE_INFINITY ? top : null;
}

/**
 * Programmatic slot assignment with internal role registry (no on-disk renames).
 */
export function assignIntelligentMedia(dedupedImages, videoMetas, options = {}) {
  const { publicVideoUrl = null, publicPosterUrl = null } = options;
  const used = new Set();
  const roles = {};

  const bestVid = pickBestVideo(videoMetas);
  let heroVideo = bestVid ? bestVid.src : null;
  if (heroVideo) {
    used.add(heroVideo);
    roles.heroVideo = { role: 'hero', src: heroVideo, reason: 'best-landscape-video' };
  } else if (publicVideoUrl) {
    heroVideo = publicVideoUrl;
    roles.heroVideo = { role: 'hero', src: heroVideo, reason: 'public-fallback' };
  }

  // --- 1. PRE-ALLOCATE EXACT MATCHES ---
  const exactTrainers = [];
  for (let i = 0; i < 4; i++) {
    const hit = dedupedImages.find((m) => !used.has(m.src) && m.src.match(new RegExp(`trainer${i + 1}[\\._]`, 'i')));
    if (hit) {
      used.add(hit.src);
      exactTrainers[i] = hit.src;
    }
  }

  const exactTransforms = [];
  for (let i = 0; i < CAPTIONS.length; i++) {
    const hit = dedupedImages.find((m) => !used.has(m.src) && m.src.match(new RegExp(`transformation${i + 1}[\\._]`, 'i')));
    if (hit) {
      used.add(hit.src);
      exactTransforms[i] = hit.src;
    }
  }

  const pool = () => dedupedImages.filter((m) => !used.has(m.src));

  // --- 2. HEURISTICS ---
  let heroPoster = null;
  const posterRanked = [...pool()].sort((a, b) => scoreHeroPoster(b) - scoreHeroPoster(a));
  const bestPoster = posterRanked[0];
  if (bestPoster && scoreHeroPoster(bestPoster) > Number.NEGATIVE_INFINITY) {
    heroPoster = bestPoster.src;
    used.add(heroPoster);
    roles.heroPoster = { role: 'hero-poster', src: heroPoster, reason: 'landscape-still' };
  } else if (publicPosterUrl) {
    heroPoster = publicPosterUrl;
    roles.heroPoster = { role: 'hero-poster', src: heroPoster, reason: 'public' };
  }
  if (!heroPoster) {
    heroPoster = FALLBACK.heroPoster;
    roles.heroPoster = { role: 'hero-poster', src: heroPoster, reason: 'curated-fallback' };
  }

  const trainerImages = [];
  const trainerRanked = [...pool()]
    .map((m) => ({ m, s: scoreTrainerPortrait(m) }))
    .filter((x) => x.s > Number.NEGATIVE_INFINITY)
    .sort((a, b) => b.s - a.s);
  for (let i = 0; i < 4; i++) {
    if (exactTrainers[i]) {
      trainerImages.push(exactTrainers[i]);
      roles[`trainer${i + 1}`] = { role: 'trainer', slot: i + 1, src: exactTrainers[i], reason: 'exact-match' };
      continue;
    }
    const hit = trainerRanked.find((x) => !used.has(x.m.src));
    if (hit) {
      used.add(hit.m.src);
      trainerImages.push(hit.m.src);
      roles[`trainer${i + 1}`] = { role: 'trainer', slot: i + 1, src: hit.m.src, reason: 'portrait-score' };
    } else {
      trainerImages.push(FALLBACK.trainers[i]);
      roles[`trainer${i + 1}`] = { role: 'trainer', slot: i + 1, src: FALLBACK.trainers[i], reason: 'fallback' };
    }
  }

  const featureImages = [];
  const featRanked = [...pool()]
    .map((m) => ({ m, s: scoreFeatureWide(m) }))
    .filter((x) => x.s > Number.NEGATIVE_INFINITY)
    .sort((a, b) => b.s - a.s);
  for (let i = 0; i < 6; i++) {
    const hit = featRanked.find((x) => !used.has(x.m.src));
    if (hit) {
      used.add(hit.m.src);
      featureImages.push(hit.m.src);
      roles[`feature_${FEATURE_LABELS[i]}`] = { role: 'feature', slot: FEATURE_LABELS[i], src: hit.m.src };
    } else {
      featureImages.push(FALLBACK.features[i]);
      roles[`feature_${FEATURE_LABELS[i]}`] = { role: 'feature', slot: FEATURE_LABELS[i], src: FALLBACK.features[i] };
    }
  }

  const testimonialPhotos = [];
  for (let i = 0; i < 5; i++) {
    testimonialPhotos.push(FALLBACK.testimonials[i]);
    roles[`testimonial${i + 1}`] = { role: 'testimonial', slot: i + 1, src: FALLBACK.testimonials[i], reason: 'curated-fallback' };
  }

  const transformRanked = [...pool()]
    .map((m) => ({ m, s: scoreTransformBody(m) }))
    .filter((x) => x.s > Number.NEGATIVE_INFINITY)
    .sort((a, b) => b.s - a.s);

  const transformations = CAPTIONS.map((c, i) => {
    if (exactTransforms[i]) {
      roles[`transformation${i + 1}_combined`] = { role: 'transform', slide: i + 1, src: exactTransforms[i] };
      return { id: c.id, caption: c.caption, combined: exactTransforms[i] };
    }
    const fb = FALLBACK.transformations[i % 3] || FALLBACK.transformations[0];
    const candidates = transformRanked.map((x) => x.m).filter((m) => !used.has(m.src));
    let before = candidates[0]?.src;
    let after = candidates[1]?.src;
    if (before && after && before === after) {
      after = candidates[2]?.src;
    }
    if (!before || !after) {
      return { id: c.id, caption: c.caption, before: fb.before, after: fb.after };
    }
    used.add(before);
    used.add(after);
    roles[`transform${i + 1}_before`] = { role: 'transform-before', slide: i + 1, src: before };
    roles[`transform${i + 1}_after`] = { role: 'transform-after', slide: i + 1, src: after };
    return { id: c.id, caption: c.caption, before, after };
  });

  return {
    heroVideo,
    heroPoster,
    trainerImages,
    transformations,
    featureImages,
    testimonialPhotos,
    videoPool: videoMetas.map((v) => v.src),
    roles,
    intelligenceReady: true,
  };
}
