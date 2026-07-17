const fs = require('fs');
const path = require('path');
process.env.FONTCONFIG_FILE = path.join(__dirname, 'fonts', 'fonts.conf');
const sharp = require('sharp');

const W = 1080;
const H = 1350;
const root = __dirname;
const imgDir = path.join(root, 'img');
const outDir = path.join(root, 'png');

fs.mkdirSync(outDir, { recursive: true });

const green = '#0E9957';
const white = '#ffffff';
const dark = '#0d0d0d';

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function richLine(line) {
  return esc(line).replace(/\[\[(.+?)\]\]/g, `<tspan fill="${green}" font-style="italic" font-weight="700">$1</tspan>`);
}

function wrap(text, maxChars) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function textLines(lines, x, y, size, fill, options = {}) {
  const lineHeight = options.lineHeight || Math.round(size * 1.22);
  const family = options.family || 'Inter, Arial, sans-serif';
  const weight = options.weight || 400;
  const anchor = options.anchor || 'start';
  const opacity = options.opacity == null ? 1 : options.opacity;
  const stroke = options.stroke
    ? ` stroke="${options.stroke}" stroke-width="${options.strokeWidth || 1}" stroke-linejoin="round" paint-order="stroke fill"`
    : '';
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" fill-opacity="${opacity}"${stroke} font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${richLine(line)}</text>`
    )
    .join('\n');
}

function coverTitle(lines, x, y, size, options = {}) {
  const lineHeight = options.lineHeight || Math.round(size * 0.92);
  return lines
    .map((line, index) => {
      const isGreen = line.includes('[[');
      const clean = line.replace(/\[\[|\]\]/g, '');
      const fill = isGreen ? green : white;
      return `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" stroke="${fill}" stroke-width="5" stroke-linejoin="round" paint-order="stroke fill" font-family="ImpactLocal, Impact, Arial Narrow, sans-serif" font-size="${size}" font-weight="900" text-anchor="middle">${esc(clean)}</text>`;
    })
    .join('\n');
}

function header(light = false) {
  const fill = light ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.50)';
  return `
    <g font-family="Space Grotesk, Inter, Arial, sans-serif" font-size="14" letter-spacing="1" fill="${fill}">
      <text x="48" y="40">EDUARDO ROLIM</text>
      <text x="540" y="40" text-anchor="middle">@OEDUARDO.1</text>
      <text x="1032" y="40" text-anchor="end">JULHO 2026 ®</text>
    </g>`;
}

function progress(index, total, light = false) {
  const bg = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)';
  const width = Math.round((W * index) / total);
  return `
    <rect x="0" y="1343" width="${W}" height="7" fill="${bg}"/>
    <rect x="0" y="1343" width="${width}" height="7" fill="${green}"/>`;
}

function arrow(light = false) {
  const stroke = light ? green : white;
  return `
    <g transform="translate(1012 1302)" opacity="0.55" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <line x1="-18" y1="0" x2="0" y2="0"/>
      <polyline points="-7 -7,0 0,-7 7"/>
    </g>`;
}

function slideNumber(index, total, light = false) {
  const fill = light ? 'rgba(0,0,0,0.48)' : 'rgba(255,255,255,0.78)';
  return `
    <text x="44" y="1320" fill="${fill}" font-family="Space Grotesk, Inter, Arial, sans-serif" font-size="18" font-weight="500" letter-spacing="0.8">${index}/${total}</text>`;
}

function overlaySvg(body, background = null) {
  return Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      ${background ? `<rect width="${W}" height="${H}" fill="${background}"/>` : ''}
      ${body}
    </svg>`);
}

async function fitImage(file, width = W, height = H) {
  return sharp(path.join(imgDir, file)).resize(width, height, { fit: 'cover', position: 'centre' }).toBuffer();
}

async function renderImageFull(imageFile, body, outFile) {
  const bg = await fitImage(imageFile);
  await sharp(bg).composite([{ input: overlaySvg(body) }]).png().toFile(path.join(outDir, outFile));
}

async function renderSplit(imageFile, body, outFile) {
  const right = await fitImage(imageFile, 540, H);
  await sharp({
    create: { width: W, height: H, channels: 4, background: dark },
  })
    .composite([
      { input: right, left: 540, top: 0 },
      { input: overlaySvg(body) },
    ])
    .png()
    .toFile(path.join(outDir, outFile));
}

async function renderTopImage(imageFile, body, outFile, topHeight = 580) {
  const top = await fitImage(imageFile, W, topHeight);
  await sharp({
    create: { width: W, height: H, channels: 4, background: dark },
  })
    .composite([
      { input: top, left: 0, top: 0 },
      { input: overlaySvg(body) },
    ])
    .png()
    .toFile(path.join(outDir, outFile));
}

async function renderSolid(background, body, outFile) {
  await sharp(overlaySvg(body, background)).png().toFile(path.join(outDir, outFile));
}

async function slide01() {
  await renderImageFull(
    'slide_01.jpg',
    `
    <defs>
      <linearGradient id="cover" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.00)"/>
        <stop offset="35%" stop-color="rgba(0,0,0,0.08)"/>
        <stop offset="62%" stop-color="rgba(0,0,0,0.45)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.72)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#cover)"/>
    ${header(false)}
    ${textLines(wrap('A Publicis colocou na mesa um novo padrão: marcas vão produzir conteúdo para máquinas tanto quanto para humanos.', 34), 540, 804, 28, white, { weight: 900, lineHeight: 39, anchor: 'middle', stroke: white, strokeWidth: 0.8 })}
    ${coverTitle(['SEU CONTEÚDO AGORA PRECISA', 'CONVENCER [[PESSOAS]] E MÁQUINAS.'], 540, 1010, 74, { lineHeight: 78 })}
    <rect x="344" y="1236" width="392" height="62" rx="31" fill="${green}"/>
    <text x="540" y="1276" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1.5">ENTENDA ISSO</text>
    <g transform="translate(686 1265)" stroke="${white}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <line x1="-14" y1="0" x2="4" y2="0"/>
      <polyline points="-3 -7,4 0,-3 7"/>
    </g>
    ${progress(1, 7, false)}
  `,
    'slide_01.png'
  );
}

async function slide02() {
  await renderSplit(
    'slide_02.jpg',
    `
    ${header(false)}
    <rect x="44" y="322" width="142" height="40" rx="4" fill="${green}"/>
    <text x="115" y="348" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">MUDANÇA</text>
    ${textLines(['A DISPUTA', 'GANHOU UMA', 'NOVA [[AUDIÊNCIA]].'], 44, 430, 54, white, { weight: 800, lineHeight: 58 })}
    <rect x="44" y="620" width="48" height="3" fill="${green}"/>
    ${textLines(wrap('• Durante anos, a disputa foi aparecer no feed, ranquear no Google e criar lembrança na cabeça do cliente.', 30), 44, 734, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• Agora existe outra audiência silenciosa entrando no funil.', 30), 44, 978, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• LLMs, busca generativa e motores de resposta interpretam marcas antes de indicar opções.', 30), 44, 1134, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${slideNumber(2, 7, false)}
    ${arrow(false)}
    ${progress(2, 7, false)}
  `,
    'slide_02.png'
  );
}

async function slide03() {
  await renderSolid(
    white,
    `
    ${header(true)}
    <rect x="64" y="286" width="56" height="5" rx="2" fill="${green}"/>
    ${textLines(wrap('Isso não significa escrever para robôs e esquecer pessoas.', 24), 64, 430, 58, dark, { weight: 800, lineHeight: 68 })}
    <line x1="64" y1="650" x2="1016" y2="650" stroke="rgba(0,0,0,0.10)" stroke-width="1"/>
    ${textLines(wrap('Significa que o conteúdo precisa fazer duas coisas ao mesmo tempo: persuadir humanos e deixar a marca legível para sistemas de IA.', 44), 64, 758, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    <rect x="64" y="1058" width="952" height="128" fill="#f5f5f5"/>
    <rect x="64" y="1058" width="5" height="128" fill="${green}"/>
    ${textLines(wrap('Conteúdo forte = desejo humano + clareza estrutural para IA.', 38), 92, 1134, 30, dark, { weight: 700, lineHeight: 42 })}
    ${slideNumber(3, 7, true)}
    ${arrow(true)}
    ${progress(3, 7, true)}
  `,
    'slide_03.png'
  );
}

async function slide04() {
  await renderTopImage(
    'slide_04.jpg',
    `
    ${header(false)}
    <rect x="0" y="580" width="${W}" height="${H - 580}" fill="${dark}"/>
    <rect x="56" y="664" width="60" height="3" rx="2" fill="${green}"/>
    ${textLines(['PARA HUMANOS,', 'O CONTEÚDO', 'AINDA PRECISA', '[[VENDER]].'], 56, 724, 46, white, { weight: 800, lineHeight: 56 })}
    <line x1="56" y1="968" x2="1024" y2="968" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Humanos precisam sentir desejo, confiança, urgência, clareza de promessa e prova suficiente para agir.', 42), 56, 1056, 27, 'rgba(255,255,255,0.78)', { lineHeight: 42 })}
    ${slideNumber(4, 7, false)}
    ${arrow(false)}
    ${progress(4, 7, false)}
  `,
    'slide_04.png'
  );
}

async function slide05() {
  await renderImageFull(
    'slide_05.jpg',
    `
    <defs>
      <linearGradient id="impactA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.00)"/>
        <stop offset="30%" stop-color="rgba(0,0,0,0.05)"/>
        <stop offset="58%" stop-color="rgba(0,0,0,0.55)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.80)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#impactA)"/>
    ${header(false)}
    <rect x="64" y="456" width="56" height="4" rx="2" fill="${green}"/>
    ${textLines(['PARA MÁQUINAS,', 'A MARCA', 'PRECISA FICAR', '[[LEGÍVEL]].'], 64, 536, 56, white, { weight: 700, lineHeight: 64 })}
    <line x1="64" y1="830" x2="1016" y2="830" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Máquinas precisam entender oferta, categoria, página, FAQ, review, case, localização, disponibilidade, autoridade e consistência.', 40), 64, 946, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    ${slideNumber(5, 7, false)}
    ${arrow(false)}
    ${progress(5, 7, false)}
  `,
    'slide_05.png'
  );
}

async function slide06() {
  await renderSplit(
    'slide_06.jpg',
    `
    ${header(false)}
    <rect x="44" y="322" width="146" height="40" rx="4" fill="${green}"/>
    <text x="117" y="348" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">VANTAGEM</text>
    ${textLines(['CONTEÚDO', 'GENÉRICO', 'PERDE [[FORÇA]].'], 44, 430, 54, white, { weight: 800, lineHeight: 58 })}
    <rect x="44" y="620" width="48" height="3" fill="${green}"/>
    ${textLines(wrap('• O conteúdo genérico perde força porque não ensina nada específico.', 30), 44, 734, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• A vantagem não está em postar mais por ansiedade.', 30), 44, 944, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• Está em organizar páginas, provas, dados, perguntas comerciais e mensuração como um sistema de descoberta.', 30), 44, 1100, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${slideNumber(6, 7, false)}
    ${arrow(false)}
    ${progress(6, 7, false)}
  `,
    'slide_06.png'
  );
}

async function slide07() {
  await renderSolid(
    white,
    `
    ${header(true)}
    <text x="64" y="560" fill="${dark}" font-family="Georgia, Times New Roman, serif" font-size="72" font-weight="400">Eduardo Rolim</text>
    ${textLines(wrap('Seguir para mais diagnósticos de IA aplicada a marketing, conteúdo e crescimento.', 34), 64, 700, 30, dark, { weight: 700, lineHeight: 46 })}
    ${textLines(wrap('Feed Maker v4 | Eduardo Rolim', 44), 64, 908, 18, 'rgba(0,0,0,0.55)', { lineHeight: 30 })}
    ${slideNumber(7, 7, true)}
    ${progress(7, 7, true)}
  `,
    'slide_07.png'
  );
}

async function contactSheet() {
  const cols = 3;
  const rows = 3;
  const thumbW = Math.round(W / cols);
  const thumbH = Math.round(H / rows);
  const composites = [];

  for (let index = 1; index <= 7; index += 1) {
    const input = await sharp(path.join(outDir, `slide_${String(index).padStart(2, '0')}.png`))
      .resize(thumbW, thumbH, { fit: 'cover', position: 'top' })
      .png()
      .toBuffer();

    composites.push({
      input,
      left: ((index - 1) % cols) * thumbW,
      top: Math.floor((index - 1) / cols) * thumbH,
    });
  }

  await sharp({
    create: { width: W, height: H, channels: 4, background: white },
  })
    .composite(composites)
    .png()
    .toFile(path.join(outDir, 'contact-sheet.png'));
}

async function main() {
  await slide01();
  await slide02();
  await slide03();
  await slide04();
  await slide05();
  await slide06();
  await slide07();
  await contactSheet();
  console.log(`Rendered 7 slides and contact sheet to ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
