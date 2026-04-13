const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedAspectRatios = new Set(['1:1', '4:5', '3:4', '9:16', '16:9']);
const allowedResolutions = new Set(['1K', '2K', '4K']);
const allowedOutputFormats = new Set(['png', 'jpeg', 'webp']);

const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

export const API_LIMITS = {
  maxPromptLength: 1200,
  maxImageCount: 2,
  maxUploadSizeBytes: MAX_UPLOAD_SIZE_BYTES,
  rateLimitWindowMs: RATE_LIMIT_WINDOW_MS,
  generateRequestsPerWindow: 10,
  uploadRequestsPerWindow: 20,
} as const;

export interface GenerateRequestBody {
  prompt: string;
  image_urls: string[];
  aspect_ratio: string;
  resolution: string;
  output_format: string;
  num_images: number;
}

export const jsonResponse = (
  body: Record<string, unknown>,
  status = 200,
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const getClientIp = (request: Request): string =>
  request.headers.get('cf-connecting-ip') ||
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  'unknown';

export const consumeRateLimit = (
  scope: 'generate' | 'upload',
  clientIp: string,
  maxRequests: number,
): boolean => {
  const key = `${scope}:${clientIp}`;
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + API_LIMITS.rateLimitWindowMs,
    });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return true;
};

export const validateGenerateBody = (
  body: unknown,
): { valid: true; value: GenerateRequestBody } | { valid: false; message: string } => {
  if (!body || typeof body !== 'object') {
    return { valid: false, message: 'Geçersiz istek gövdesi.' };
  }

  const candidate = body as Partial<GenerateRequestBody>;

  if (typeof candidate.prompt !== 'string' || candidate.prompt.trim().length === 0) {
    return { valid: false, message: 'Prompt zorunludur.' };
  }

  if (candidate.prompt.length > API_LIMITS.maxPromptLength) {
    return { valid: false, message: 'Prompt çok uzun.' };
  }

  if (!Array.isArray(candidate.image_urls) || candidate.image_urls.length === 0) {
    return { valid: false, message: 'En az bir görsel URL zorunludur.' };
  }

  if (candidate.image_urls.length > API_LIMITS.maxImageCount) {
    return { valid: false, message: 'En fazla iki görsel URL gönderilebilir.' };
  }

  const invalidImageUrl = candidate.image_urls.find(
    (imageUrl) =>
      typeof imageUrl !== 'string' ||
      imageUrl.length === 0 ||
      (!imageUrl.startsWith('https://') && !imageUrl.startsWith('data:image/')),
  );

  if (invalidImageUrl) {
    return { valid: false, message: 'Geçersiz görsel URL formatı.' };
  }

  if (
    typeof candidate.aspect_ratio !== 'string' ||
    !allowedAspectRatios.has(candidate.aspect_ratio)
  ) {
    return { valid: false, message: 'Desteklenmeyen aspect ratio.' };
  }

  if (
    typeof candidate.resolution !== 'string' ||
    !allowedResolutions.has(candidate.resolution)
  ) {
    return { valid: false, message: 'Desteklenmeyen çözünürlük.' };
  }

  if (
    typeof candidate.output_format !== 'string' ||
    !allowedOutputFormats.has(candidate.output_format)
  ) {
    return { valid: false, message: 'Desteklenmeyen çıktı formatı.' };
  }

  if (
    typeof candidate.num_images !== 'number' ||
    !Number.isInteger(candidate.num_images) ||
    candidate.num_images < 1 ||
    candidate.num_images > API_LIMITS.maxImageCount
  ) {
    return { valid: false, message: 'Geçersiz varyasyon sayısı.' };
  }

  return {
    valid: true,
    value: {
      prompt: candidate.prompt.trim(),
      image_urls: candidate.image_urls,
      aspect_ratio: candidate.aspect_ratio,
      resolution: candidate.resolution,
      output_format: candidate.output_format,
      num_images: candidate.num_images,
    },
  };
};

export const validateUploadFile = (
  file: File,
): { valid: true } | { valid: false; message: string } => {
  if (!allowedImageMimeTypes.has(file.type)) {
    return { valid: false, message: 'Desteklenmeyen dosya formatı.' };
  }

  if (file.size === 0) {
    return { valid: false, message: 'Boş dosya yüklenemez.' };
  }

  if (file.size > API_LIMITS.maxUploadSizeBytes) {
    return { valid: false, message: 'Dosya boyutu 20 MB sınırını aşıyor.' };
  }

  return { valid: true };
};

export const inferExtension = (mimeType: string): string => {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
};
