import { useState, useEffect } from 'react';
import { loadBundledImages, loadBundledVideos } from '../lib/media/loadBundledAssets';
import {
  assignAllMedia,
  pickBundledVideo,
  probePublicVideo,
  probePublicPoster,
  loadPublicImageManifest,
} from '../lib/media/resolveSiteMedia';
import { probeImageMeta, probeVideoMeta, dedupeImagesByDimensions } from '../lib/media/probeMediaMeta';
import { assignIntelligentMedia } from '../lib/media/intelligentAssign';

function initialMedia() {
  const bundledImages = loadBundledImages();
  const bundledVideos = loadBundledVideos();
  const assigned = assignAllMedia(bundledImages, []);
  return {
    ...assigned,
    heroVideo: pickBundledVideo(bundledVideos),
    roles: {},
    intelligenceReady: false,
  };
}

/**
 * Pass 1: instant layout from filenames + heuristics.
 * Pass 2: probes dimensions, dedupes identical resolutions, assigns slots with scoring
 * (hero / trainer / feature / testimonial / transform) — no manual renaming.
 */
export function useSiteMedia() {
  const [media, setMedia] = useState(initialMedia);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const bundledImgs = loadBundledImages();
        const bundledVids = loadBundledVideos();
        const [publicVid, publicPoster, manifest] = await Promise.all([
          probePublicVideo(),
          probePublicPoster(),
          loadPublicImageManifest(),
        ]);

        const imageSrcs = [
          ...new Set([...bundledImgs.map((b) => b.src), ...manifest.map((m) => m.src)]),
        ];

        const [imageProbe, videoProbe] = await Promise.all([
          Promise.all(imageSrcs.map((src) => probeImageMeta(src))),
          Promise.all(bundledVids.map((v) => probeVideoMeta(v.src))),
        ]);

        if (cancelled) return;

        const deduped = await dedupeImagesByDimensions(imageProbe);

        const next = assignIntelligentMedia(deduped, videoProbe, {
          publicVideoUrl: publicVid,
          publicPosterUrl: publicPoster,
        });

        if (!cancelled) setMedia(next);
      } catch {
        if (!cancelled) {
          setMedia((prev) => ({ ...prev, intelligenceReady: false }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return media;
}
