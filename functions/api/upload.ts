import {
  API_LIMITS,
  consumeRateLimit,
  getClientIp,
  inferExtension,
  jsonResponse,
  validateUploadFile,
} from './_shared';

interface Env {
  FAL_KEY?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

export async function onRequestPost({ request, env }: RequestContext) {
  const { FAL_KEY } = env;

  if (!FAL_KEY) {
    return jsonResponse({ error: 'FAL_KEY is not configured on the server.' }, 500);
  }

  const clientIp = getClientIp(request);
  const withinRateLimit = consumeRateLimit(
    'upload',
    clientIp,
    API_LIMITS.uploadRequestsPerWindow,
  );

  if (!withinRateLimit) {
    return jsonResponse({ error: 'Çok fazla upload isteği. Lütfen tekrar deneyin.' }, 429);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return jsonResponse({ error: 'Yüklenecek dosya bulunamadı.' }, 400);
    }

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      return jsonResponse({ error: validation.message }, 400);
    }

    const extension = inferExtension(file.type);
    const targetPath = `tekstil-ai-studio/${crypto.randomUUID()}.${extension}`;
    const uploadUrl = `https://api.fal.ai/v1/serverless/files/file/local/${encodeURIComponent(targetPath)}`;

    const upstreamFormData = new FormData();
    upstreamFormData.append('file_upload', file, `upload.${extension}`);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Key ${FAL_KEY}`,
      },
      body: upstreamFormData,
    });

    if (!response.ok) {
      const details = await response.text();
      return jsonResponse({ error: 'Fal CDN upload failed.', details }, response.status);
    }

    return jsonResponse({
      url: `https://v3.fal.media/files/${targetPath}`,
    });
  } catch (error: unknown) {
    return jsonResponse(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
}
