// Browser-side preparation of derivatives before upload (masterfile §9.3).
// Originals are never modified; these are the disposable grid and viewer copies.

export type Prepared = {
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  capturedAt: string | null;
  thumb: Blob | null;
  display: Blob | null;
  poster: Blob | null;
};

const EMPTY: Prepared = { width: null, height: null, durationSeconds: null, capturedAt: null, thumb: null, display: null, poster: null };

async function encode(
  source: CanvasImageSource,
  width: number,
  height: number,
  maxEdge: number,
  type: "image/webp" | "image/jpeg",
  quality: number,
): Promise<Blob | null> {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  // Browsers without WebP encoding fall back to PNG; JPEG is far smaller.
  if (blob && type === "image/webp" && blob.type !== "image/webp") {
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  }
  return blob;
}

async function readCapturedAt(file: File): Promise<string | null> {
  try {
    const exifr = (await import("exifr")).default;
    const tags: { DateTimeOriginal?: unknown; CreateDate?: unknown } | undefined = await exifr.parse(file, [
      "DateTimeOriginal",
      "CreateDate",
    ]);
    const value = tags?.DateTimeOriginal ?? tags?.CreateDate;
    return value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString() : null;
  } catch {
    return null;
  }
}

async function decodeImage(file: File, mimeType: string): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch (error) {
    if (mimeType !== "image/heic" && mimeType !== "image/heif") throw error;
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    return createImageBitmap(blob, { imageOrientation: "from-image" });
  }
}

export async function preparePhoto(file: File, mimeType: string): Promise<Prepared> {
  const capturedAt = await readCapturedAt(file);
  try {
    const bitmap = await decodeImage(file, mimeType);
    const { width, height } = bitmap;
    const [thumb, display] = await Promise.all([
      encode(bitmap, width, height, 400, "image/webp", 0.8),
      encode(bitmap, width, height, 2000, "image/webp", 0.86),
    ]);
    bitmap.close();
    return { ...EMPTY, width, height, capturedAt, thumb, display };
  } catch {
    return { ...EMPTY, capturedAt };
  }
}

function waitFor(el: HTMLVideoElement, event: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), timeoutMs);
    el.addEventListener(event, () => (window.clearTimeout(timer), resolve()), { once: true });
    el.addEventListener("error", () => (window.clearTimeout(timer), reject(new Error("video decode failed"))), { once: true });
  });
}

export async function prepareVideo(file: File): Promise<Prepared> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  let durationSeconds: number | null = null;
  try {
    await waitFor(video, "loadeddata", 20000);
    durationSeconds = Number.isFinite(video.duration) ? video.duration : null;
    video.currentTime = Math.min(1, (durationSeconds ?? 0) / 2);
    await waitFor(video, "seeked", 10000);
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return { ...EMPTY, durationSeconds };
    const [poster, thumb] = await Promise.all([
      encode(video, width, height, 2000, "image/jpeg", 0.85),
      encode(video, width, height, 400, "image/webp", 0.8),
    ]);
    return { ...EMPTY, width, height, durationSeconds, poster, thumb };
  } catch {
    // Some codecs (e.g. HEVC .mov in Chrome) can't be decoded; upload anyway.
    return { ...EMPTY, durationSeconds };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
