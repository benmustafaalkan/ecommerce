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
    return new Response(JSON.stringify({ error: 'FAL_KEY is not configured on the server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();

    const response = await fetch("https://queue.fal.run/fal-ai/nano-banana-pro/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${FAL_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: 'Fal.ai API error', details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.text();
    
    return new Response(data, {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
    
  } catch (error: unknown) {
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
