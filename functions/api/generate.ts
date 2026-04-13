export async function onRequestPost({ request, env }: any) {
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
    
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
