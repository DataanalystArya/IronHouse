/**
 * Webpack require.context — drop files into src/assets/images and src/assets/videos.
 * Videos in src are bundled (keep short loops small); prefer public/assets/videos for large files.
 */
export function loadBundledImages() {
  try {
    const ctx = require.context('../../assets/images', false, /\.(jpe?g|png|webp|gif)$/i);
    return ctx
      .keys()
      .sort()
      .map((key) => ({
        key,
        src: ctx(key),
        base: key.replace(/^\.\//, '').toLowerCase(),
      }));
  } catch {
    return [];
  }
}

export function loadBundledVideos() {
  try {
    const ctx = require.context('../../assets/videos', false, /\.(mp4|webm|mov)$/i);
    return ctx
      .keys()
      .sort()
      .map((key) => ({
        key,
        src: ctx(key),
        base: key.replace(/^\.\//, '').toLowerCase(),
      }));
  } catch {
    return [];
  }
}
