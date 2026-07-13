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
    ${textLines(wrap('O Google avançou com formatos de anúncio baseados em Gemini. A pauta que importa para vendas é Business Agent for Leads.', 34), 540, 850, 30, white, { weight: 900, lineHeight: 41, anchor: 'middle', stroke: white, strokeWidth: 0.8 })}
    ${coverTitle(['O PRÓXIMO LEAD', 'PODE CONVERSAR', 'COM O [[ANÚNCIO]].'], 540, 1016, 90, { lineHeight: 84 })}
    <rect x="334" y="1236" width="412" height="62" rx="31" fill="${green}"/>
    <text x="540" y="1276" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1.5">ENTENDA O PONTO</text>
    <g transform="translate(696 1265)" stroke="${white}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <line x1="-14" y1="0" x2="4" y2="0"/>
      <polyline points="-3 -7,4 0,-3 7"/>
    </g>
    ${progress(1, 9, false)}
  `,
    'slide_01.png'
  );
}

async function slide02() {
  await renderSplit(
    'slide_02.jpg',
    `
    ${header(false)}
    <rect x="44" y="322" width="124" height="40" rx="4" fill="${green}"/>
    <text x="106" y="348" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">VIRADA</text>
    ${textLines(['O ANÚNCIO', 'DEIXOU DE SER', 'SÓ [[CLIQUE]].'], 44, 430, 54, white, { weight: 800, lineHeight: 58 })}
    <rect x="44" y="620" width="48" height="3" fill="${green}"/>
    ${textLines(wrap('• Antes: busca, anúncio, clique, landing page, formulário, vendedor.', 30), 44, 734, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• Agora: busca, anúncio, conversa e lead mais qualificado.', 30), 44, 922, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• Tráfego, copy, página, FAQ, prova, CRM e atendimento entram antes do clique virar lead.', 30), 44, 1088, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${arrow(false)}
    ${progress(2, 9, false)}
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
    ${textLines(wrap('Antes de continuar: Quer mais conteúdos como esse? Toca 2 vezes na tela e depois me segue.', 26), 64, 438, 58, dark, { weight: 800, lineHeight: 70 })}
    ${arrow(true)}
    ${progress(3, 9, true)}
  `,
    'slide_03.png'
  );
}

async function slide04() {
  await renderSolid(
    white,
    `
    ${header(true)}
    <rect x="64" y="276" width="56" height="4" rx="2" fill="${green}"/>
    ${textLines(['O AGENTE RESPONDE', 'COM O QUE', '[[ENCONTRA]].'], 64, 360, 52, dark, { weight: 800, lineHeight: 58 })}
    <line x1="64" y1="526" x2="1016" y2="526" stroke="rgba(0,0,0,0.10)" stroke-width="1"/>
    ${textLines(wrap('Oferta clara vira resposta clara. FAQ fraco vira resposta fraca. Prova escondida vira argumento perdido. Página confusa vira conversa confusa.', 42), 64, 630, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    <rect x="64" y="984" width="952" height="116" fill="#f5f5f5"/>
    <rect x="64" y="984" width="5" height="116" fill="${green}"/>
    ${textLines(wrap('Landing page deixa de ser vitrine. Vira base de conhecimento comercial.', 42), 92, 1056, 30, dark, { weight: 700, lineHeight: 42 })}
    ${textLines(wrap('Quem compra, qual dor resolve, por que confiar, objeções e próximo passo passam a treinar a conversa.', 42), 64, 1188, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    ${arrow(true)}
    ${progress(4, 9, true)}
  `,
    'slide_04.png'
  );
}

async function slide05() {
  await renderTopImage(
    'slide_05.jpg',
    `
    ${header(false)}
    <rect x="0" y="580" width="${W}" height="${H - 580}" fill="${dark}"/>
    <rect x="56" y="664" width="60" height="3" rx="2" fill="${green}"/>
    ${textLines(['LEIA A', 'DIREÇÃO, NÃO', 'A [[PROMESSA]].'], 56, 724, 46, white, { weight: 800, lineHeight: 56 })}
    <line x1="56" y1="904" x2="1024" y2="904" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('A pesquisa PRI-70 registra o alerta certo: não tratar beta ou rollout regional como disponibilidade global imediata.', 49), 56, 994, 27, 'rgba(255,255,255,0.78)', { lineHeight: 42 })}
    ${textLines(wrap('O ponto não é prometer recurso. É ler a direção do mercado.', 49), 56, 1162, 27, 'rgba(255,255,255,0.78)', { lineHeight: 42 })}
    ${arrow(false)}
    ${progress(5, 9, false)}
  `,
    'slide_05.png'
  );
}

async function slide06() {
  await renderImageFull(
    'slide_06.jpg',
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
    ${textLines(['A PERGUNTA', 'MUDOU.'], 64, 536, 56, white, { weight: 700, lineHeight: 64 })}
    <line x1="64" y1="684" x2="1016" y2="684" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Não é só “quanto custa o clique?”. Agora entra outra: o anúncio sabe responder antes de mandar o lead para o site?', 42), 64, 800, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    <line x1="64" y1="1018" x2="1016" y2="1018" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Quem não organiza resposta perde eficiência mesmo com IA.', 38), 64, 1134, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    ${arrow(false)}
    ${progress(6, 9, false)}
  `,
    'slide_06.png'
  );
}

async function slide07() {
  await renderSplit(
    'slide_07.jpg',
    `
    ${header(false)}
    <rect x="44" y="322" width="104" height="40" rx="4" fill="${green}"/>
    <text x="96" y="348" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">BASE</text>
    ${textLines(['LANDING PAGE', 'VIROU BASE', '[[COMERCIAL]].'], 44, 430, 54, white, { weight: 800, lineHeight: 58 })}
    <rect x="44" y="620" width="48" height="3" fill="${green}"/>
    ${textLines(wrap('• Mapear perguntas que aparecem antes da compra.', 30), 44, 734, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• Transformar objeções em respostas claras com prova, oferta e critérios.', 30), 44, 900, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• Integrar CRM, roteamento e follow-up.', 30), 44, 1088, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${arrow(false)}
    ${progress(7, 9, false)}
  `,
    'slide_07.png'
  );
}

async function slide08() {
  await renderImageFull(
    'slide_08.jpg',
    `
    <defs>
      <linearGradient id="impactB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.00)"/>
        <stop offset="30%" stop-color="rgba(0,0,0,0.05)"/>
        <stop offset="58%" stop-color="rgba(0,0,0,0.55)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.80)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#impactB)"/>
    ${header(false)}
    <rect x="64" y="456" width="56" height="4" rx="2" fill="${green}"/>
    ${textLines(['RESPOSTA CLARA', 'VALE MAIS QUE', 'CLIQUE [[BARATO]].'], 64, 536, 56, white, { weight: 700, lineHeight: 64 })}
    <line x1="64" y1="766" x2="1016" y2="766" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('A disputa não é apenas por clique barato.', 34), 64, 882, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    <line x1="64" y1="952" x2="1016" y2="952" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Empresa com oferta confusa treina agente confuso. Funil organizado transforma anúncio em conversa comercial.', 40), 64, 1068, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    ${arrow(false)}
    ${progress(8, 9, false)}
  `,
    'slide_08.png'
  );
}

async function slide09() {
  await renderSolid(
    white,
    `
    ${header(true)}
    <text x="64" y="560" fill="${dark}" font-family="Georgia, Times New Roman, serif" font-size="72" font-weight="400">Eduardo Rolim</text>
    ${textLines(['Qual resposta comercial ainda', 'falta no [[FUNIL]]?'], 64, 700, 30, green, { weight: 700, lineHeight: 46 })}
    ${textLines(wrap('Comente a resposta ou siga para mais análises de IA aplicada a vendas.', 40), 64, 824, 30, dark, { weight: 700, lineHeight: 44 })}
    ${textLines(wrap('Feed Maker v2 | Eduardo Rolim', 36), 64, 980, 18, 'rgba(0,0,0,0.55)', { lineHeight: 30 })}
    ${progress(9, 9, true)}
  `,
    'slide_09.png'
  );
}

async function main() {
  await slide01();
  await slide02();
  await slide03();
  await slide04();
  await slide05();
  await slide06();
  await slide07();
  await slide08();
  await slide09();
  console.log(`Rendered 9 slides to ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
