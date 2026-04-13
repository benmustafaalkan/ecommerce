import {
  API_LIMITS,
  consumeRateLimit,
  getClientIp,
  jsonResponse,
  validateGenerateBody,
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

  try {
    const clientIp = getClientIp(request);
    const withinRateLimit = consumeRateLimit(
      'generate',
      clientIp,
      API_LIMITS.generateRequestsPerWindow,
    );

    if (!withinRateLimit) {
      return jsonResponse({ error: 'Çok fazla üretim isteği. Lütfen tekrar deneyin.' }, 429);
    }

    const rawBody = await request.json();
    const validation = validateGenerateBody(rawBody);

    if (!validation.valid) {
      return jsonResponse({ error: validation.message }, 400);
    }

    const response = await fetch("https://queue.fal.run/fal-ai/nano-banana-pro/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${FAL_KEY}`,
      },
      body: JSON.stringify(validation.value),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return jsonResponse({ error: 'Fal.ai API error', details: errorText }, response.status);
    }

    const data = await response.text();
    
    return new Response(data, {
      headers: { 
        "Content-Type": "application/json",
      }
    });
    
  } catch (error: unknown) {
    return jsonResponse({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
