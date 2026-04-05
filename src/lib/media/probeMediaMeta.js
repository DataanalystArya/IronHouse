/** Browser-side probes — no manual file renaming; uses intrinsic dimensions + optional byte size. */

const IMAGE_PROBE_MS = 12000;
const VIDEO_PROBE_MS = 10000;

export function probeImageMeta(src) {
  return new Promise((resolve) => {
    const done = (payload) => resolve(payload);
    const timer = setTimeout(
      () => done({ src, ok: false, width: 0, height: 0, aspect: 0, area: 0 }),
      IMAGE_PROBE_MS
    );
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      clearTimeout(timer);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      done({
        src,
        ok: true,
        width: w,
        height: h,
        aspect: w / Math.max(h, 1),
        area: w * h,
      });
    };
    img.onerror = () => {
      clearTimeout(timer);
      done({ src, ok: false, width: 0, height: 0, aspect: 0, area: 0 });
    };
    img.src = src;
  });
}

export function probeVideoMeta(src) {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    v.playsInline = true;
    let settled = false;
    const finish = (ok, width = 0, height = 0) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        v.removeAttribute('src');
        v.load();
      } catch {
        /* ignore */
      }
      resolve({
        src,
        ok,
        width,
        height,
        aspect: width / Math.max(height, 1),
        area: width * height,
      });
    };
    const timer = setTimeout(() => finish(false), VIDEO_PROBE_MS);
    v.onloadedmetadata = () => finish(true, v.videoWidth, v.videoHeight);
    v.onerror = () => finish(false);
    v.src = src;
  });
}

export async function probeContentLength(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', cache: 'force-cache' });
    const n = parseInt(r.headers.get('content-length') || '0', 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * Same width×height usually means duplicate asset; keep the largest file (higher quality / less compression).
 */
export async function dedupeImagesByDimensions(metaList) {
  const valid = metaList.filter((m) => m.ok && m.width > 32 && m.height > 32);
  const groups = new Map();
  const out = [];
  for (const m of valid) {
    if (m.src.match(/(trainer|transformation|testimonial|hero|feature)\w*[._]/i)) {
      out.push(m);
      continue;
    }
    const k = `${m.width}x${m.height}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(m);
  }
  for (const group of groups.values()) {
    if (group.length === 1) {
      const bytes = await probeContentLength(group[0].src);
      out.push({ ...group[0], bytes });
      continue;
    }
    const withBytes = await Promise.all(
      group.map(async (m) => ({ ...m, bytes: await probeContentLength(m.src) }))
    );
    withBytes.sort((a, b) => b.bytes - a.bytes);
    out.push(withBytes[0]);
  }
  return out;
}
