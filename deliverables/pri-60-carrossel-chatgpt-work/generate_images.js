const fs = require('fs');
const path = require('path');

const root = __dirname;
const promptsPath = path.join(root, 'image-prompts.md');
const imgDir = path.join(root, 'img');
const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI;
const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
const usedSlides = [1, 2, 5, 6, 7, 8];

function loadPrompts() {
  const text = fs.readFileSync(promptsPath, 'utf8');
  const matches = [...text.matchAll(/^## Slide\s+(\d{2})\n([\s\S]*?)(?=\n## Slide|\s*$)/gm)];
  const prompts = new Map();

  for (const match of matches) {
    prompts.set(Number(match[1]), match[2].trim());
  }

  return prompts;
}

async function requestImage(prompt) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '4:5' },
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Gemini request failed: HTTP ${response.status}: ${JSON.stringify(data)}`);
  }

  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data);
  if (!imagePart) {
    throw new Error(`Gemini response missing inline image data: ${JSON.stringify(data)}`);
  }

  return { data, base64: imagePart.inlineData.data };
}

async function main() {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY or GEMINI is not set');
  }

  fs.mkdirSync(imgDir, { recursive: true });
  const prompts = loadPrompts();

  for (const slide of usedSlides) {
    const prompt = prompts.get(slide);
    if (!prompt) {
      throw new Error(`Prompt missing for slide ${slide}`);
    }

    console.log(`slide ${String(slide).padStart(2, '0')}: requesting image`);
    const result = await requestImage(prompt);
    const outFile = path.join(imgDir, `slide_${String(slide).padStart(2, '0')}.jpg`);
    fs.writeFileSync(outFile, Buffer.from(result.base64, 'base64'));
    fs.writeFileSync(
      path.join(imgDir, `request_${String(slide).padStart(2, '0')}.json`),
      JSON.stringify({ model: 'gemini-2.5-flash-image', prompt }, null, 2),
      'utf8'
    );
    console.log(`slide ${String(slide).padStart(2, '0')}: saved ${outFile}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
