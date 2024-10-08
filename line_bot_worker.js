addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const CLOUDFLARE_API_URL = ENV.CLOUDFLARE_API_URL;
const CLOUDFLARE_API_TOKEN = ENV.CLOUDFLARE_API_TOKEN;

async function handleRequest(request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const requestBody = await request.json();
    const prompt = requestBody.prompt || "default prompt";

    const url = CLOUDFLARE_API_URL;

    const payload = JSON.stringify({
      prompt: prompt,
    });

    const headers = {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: payload,
    });

    const jsonResponse = await response.json();

    if (jsonResponse.result && jsonResponse.result.image) {
      const imageBase64 = jsonResponse.result.image;
      return new Response(
        JSON.stringify({
          image: imageBase64,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response("Failed to generate image", { status: 500 });
    }
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
