export async function onRequestPost(context) {
  const { request, env } = context;

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { system, messages } = await request.json();

    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ reply: 'Server configuration error: API key not set.' }), { status: 500, headers: cors });
    }

    const formattedMessages = [
      { role: 'system', content: system },
      ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    ];

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sergemuneza.pages.dev',
        'X-Title': 'Serge Muneza Portfolio'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: formattedMessages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await res.json();

    if (data?.error) {
      return new Response(JSON.stringify({ reply: 'AI error: ' + data.error.message }), { headers: cors });
    }

    const reply = data?.choices?.[0]?.message?.content
      || "I'm not sure about that. Please contact Serge directly at sergemuneza07@gmail.com!";

    return new Response(JSON.stringify({ reply }), { headers: cors });

  } catch (err) {
    return new Response(JSON.stringify({ reply: 'Server error: ' + err.message }), { status: 500, headers: cors });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
