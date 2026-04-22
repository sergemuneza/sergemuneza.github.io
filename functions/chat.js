const GEMINI_API_KEY = "AIzaSyDVWLHhw9YDQHZb7FdRo0cSNAazhGkbz4g";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function onRequestPost(context) {
  const { request } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = await request.json();

    // Convert messages to Gemini format
    const contents = body.messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: body.system }] },
        contents,
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
      }),
    });

    const data = await response.json();

    // Normalize to same shape the frontend expects
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure about that — please contact Serge directly at sergemuneza07@gmail.com!";
    return new Response(JSON.stringify({
      content: [{ type: "text", text }]
    }), { headers: corsHeaders });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Proxy error", detail: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
