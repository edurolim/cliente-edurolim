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

const colors = {
  green: '#0E9957',
  greenSoft: '#3CD3A4',
  dark: '#292A25',
  black: '#0d0d0d',
  white: '#ffffff',
  textDark: '#111111',
};

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function richText(value, fill = colors.white, fontWeight = 400) {
  return esc(value).replace(/\[\[(.+?)\]\]/g, `<tspan fill="${colors.green}" font-style="italic" font-weight="700">$1</tspan>`);
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

function textBlock(lines, x, y, size, fill, options = {}) {
  const lineHeight = options.lineHeight || Math.round(size * 1.25);
  const family = options.family || 'Inter, Arial, sans-serif';
  const weight = options.weight || 400;
  const anchor = options.anchor || 'start';
  return lines.map((line, index) => (
    `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${richText(line, fill, weight)}</text>`
  )).join('\n');
}

function header(light = false) {
  const fill = light ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.50)';
  return `
    <g font-family="Space Grotesk, Arial, sans-serif" font-size="14" letter-spacing="1" fill="${fill}">
      <text x="48" y="40">EDUARDO ROLIM</text>
      <text x="540" y="40" text-anchor="middle">@OEDUARDO.1</text>
      <text x="1032" y="40" text-anchor="end">JULHO 2026 ®</text>
    </g>`;
}

function progress(index, total, light = false) {
  const bg = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)';
  const width = (W * index) / total;
  return `
    <rect x="0" y="1343" width="${W}" height="7" fill="${bg}"/>
    <rect x="0" y="1343" width="${width}" height="7" fill="${colors.green}"/>`;
}

function arrow(light = false) {
  const stroke = light ? colors.green : colors.white;
  return `
    <g transform="translate(1014 1300)" opacity="0.55">
      <line x1="-18" y1="0" x2="0" y2="0" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      <polyline points="-7 -7,0 0,-7 7" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
}

function overlaySvg(body, background = null) {
  return Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      ${background ? `<rect width="${W}" height="${H}" fill="${background}"/>` : ''}
      ${body}
    </svg>`);
}

async function fitImage(file, width, height) {
  return sharp(path.join(imgDir, file)).resize(width, height, { fit: 'cover', position: 'centre' }).toBuffer();
}

async function renderImageFull(imageFile, body, outFile) {
  const bg = await fitImage(imageFile, W, H);
  await sharp(bg).composite([{ input: overlaySvg(body) }]).png().toFile(path.join(outDir, outFile));
}

async function renderSolid(background, body, outFile) {
  await sharp(overlaySvg(body, background)).png().toFile(path.join(outDir, outFile));
}

async function renderSplit(imageFile, body, outFile) {
  const right = await fitImage(imageFile, 540, H);
  await sharp({
    create: { width: W, height: H, channels: 4, background: colors.black },
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
    create: { width: W, height: H, channels: 4, background: colors.black },
  })
    .composite([
      { input: top, left: 0, top: 0 },
      { input: overlaySvg(body) },
    ])
    .png()
    .toFile(path.join(outDir, outFile));
}

const slideData = {
  coverPretitle: 'Se listas de clientes entrarem no jogo, CRM, consentimento e tracking viram prioridade imediata.',
  coverTitle: ['CHATGPT ADS', 'COM SUA [[BASE]]'],
};

async function slide01() {
  await renderImageFull('slide_01.jpg', `
    <defs>
      <linearGradient id="cover" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.00)"/>
        <stop offset="34%" stop-color="rgba(0,0,0,0.10)"/>
        <stop offset="63%" stop-color="rgba(0,0,0,0.48)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.80)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#cover)"/>
    ${header(false)}
    ${textBlock(wrap(slideData.coverPretitle.toUpperCase(), 56), 540, 938, 28, colors.white, { weight: 800, lineHeight: 38, anchor: 'middle' })}
    ${textBlock(slideData.coverTitle, 540, 1048, 94, colors.white, { family: 'Impact, ImpactLocal, Arial Narrow, sans-serif', lineHeight: 92, anchor: 'middle' })}
    <rect x="353" y="1204" width="374" height="64" rx="32" fill="${colors.green}"/>
    <text x="540" y="1245" fill="${colors.white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1.2">ENTENDA O PONTO</text>
    <g transform="translate(676 1236)" stroke="${colors.white}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="-14" y1="0" x2="4" y2="0"/>
      <polyline points="-3 -7,4 0,-3 7" fill="none"/>
    </g>
    ${progress(1, 9, false)}
  `, 'slide_01.png');
}

async function slide02() {
  await renderSplit('slide_02.jpg', `
    ${header(false)}
    <rect x="44" y="332" width="146" height="40" rx="4" fill="${colors.green}"/>
    <text x="117" y="358" fill="${colors.white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">SINAL NOVO</text>
    ${textBlock(['O SINAL MAIS FORTE', 'NÃO É', '[[“ANUNCIAR NA IA”]]'], 44, 448, 54, colors.white, { weight: 800, lineHeight: 58 })}
    <rect x="44" y="645" width="48" height="3" fill="${colors.green}"/>
    ${textBlock(wrap('É que CRM, consentimento e tracking ficam muito mais decisivos.', 28), 44, 732, 28, 'rgba(255,255,255,0.88)', { lineHeight: 40 })}
    ${textBlock(wrap('• A mídia deixa de ser só criativo e verba.', 30), 44, 894, 28, 'rgba(255,255,255,0.88)', { lineHeight: 40 })}
    ${textBlock(wrap('• Ela passa a depender da qualidade da sua base.', 31), 44, 1000, 28, 'rgba(255,255,255,0.88)', { lineHeight: 40 })}
    ${arrow(false)}
    ${progress(2, 9, false)}
  `, 'slide_02.png');
}

async function slide03() {
  await renderSolid(colors.white, `
    ${header(true)}
    <rect x="64" y="288" width="56" height="5" rx="2" fill="${colors.green}"/>
    ${textBlock(wrap('Antes de continuar: Quer mais conteúdos como esse?', 24), 64, 464, 62, colors.textDark, { weight: 800, lineHeight: 74 })}
    ${textBlock(wrap('Toca [[2 vezes]] na tela e depois me segue.', 22), 64, 700, 62, colors.textDark, { weight: 800, lineHeight: 74 })}
    ${arrow(true)}
    ${progress(3, 9, true)}
  `, 'slide_03.png');
}

async function slide04() {
  await renderSolid(colors.white, `
    ${header(true)}
    <rect x="64" y="276" width="56" height="4" rx="2" fill="${colors.green}"/>
    ${textBlock(['O QUE FOI [[REPORTADO]]', 'ATÉ AGORA'], 64, 392, 52, colors.textDark, { weight: 800, lineHeight: 60 })}
    <line x1="64" y1="486" x2="1016" y2="486" stroke="rgba(0,0,0,0.10)" stroke-width="1"/>
    ${textBlock(wrap('Search Engine Land relatou upload de e-mails e telefones em ChatGPT Ads, enquanto os termos oficiais da OpenAI já citam Audience Tools.', 45), 64, 602, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    <rect x="64" y="862" width="952" height="128" rx="0" fill="#f5f5f5"/>
    <rect x="64" y="862" width="5" height="128" fill="${colors.green}"/>
    ${textBlock(wrap('Sinal de maturidade do canal, não liberação geral confirmada para todo anunciante.', 46), 92, 926, 30, colors.textDark, { weight: 700, lineHeight: 42 })}
    ${textBlock(wrap('A leitura correta não é “já está disponível para todos”, e sim: o jogo de mídia em IA está ficando mais sério.', 45), 64, 1084, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    ${arrow(true)}
    ${progress(4, 9, true)}
  `, 'slide_04.png');
}

async function slide05() {
  await renderTopImage('slide_05.jpg', `
    ${header(false)}
    <rect x="0" y="580" width="${W}" height="${H - 580}" fill="${colors.black}"/>
    <rect x="56" y="664" width="60" height="3" rx="2" fill="${colors.green}"/>
    ${textBlock(['O QUE MUDA PARA', '[[TRÁFEGO PAGO]]'], 56, 748, 46, colors.white, { weight: 800, lineHeight: 56 })}
    <line x1="56" y1="824" x2="1024" y2="824" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textBlock(wrap('Base limpa, opt-in claro, oferta coerente e eventos confiáveis deixam de ser detalhe operacional.', 50), 56, 914, 27, 'rgba(255,255,255,0.78)', { lineHeight: 42 })}
    ${textBlock(wrap('Viram pré-requisito para qualquer teste sério quando mídia e dados próprios passam a conversar.', 50), 56, 1092, 27, 'rgba(255,255,255,0.78)', { lineHeight: 42 })}
    ${arrow(false)}
    ${progress(5, 9, false)}
  `, 'slide_05.png');
}

async function slide06() {
  await renderImageFull('slide_06.jpg', `
    <defs>
      <linearGradient id="impactA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.00)"/>
        <stop offset="30%" stop-color="rgba(0,0,0,0.05)"/>
        <stop offset="58%" stop-color="rgba(0,0,0,0.55)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.82)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#impactA)"/>
    ${header(false)}
    <rect x="64" y="508" width="56" height="4" rx="2" fill="${colors.green}"/>
    ${textBlock(['O RISCO NÃO É SÓ', '[[PERDER TIMING]]'], 64, 624, 56, colors.white, { weight: 700, lineHeight: 64 })}
    <line x1="64" y1="688" x2="1016" y2="688" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textBlock(wrap('É entrar cedo sem governança e transformar inovação em problema de privacidade, segmentação ruim e perda de confiança na oferta.', 42), 64, 804, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    ${arrow(false)}
    ${progress(6, 9, false)}
  `, 'slide_06.png');
}

async function slide07() {
  await renderSplit('slide_07.jpg', `
    ${header(false)}
    <rect x="44" y="318" width="128" height="40" rx="4" fill="${colors.green}"/>
    <text x="108" y="344" fill="${colors.white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">CHECKLIST</text>
    ${textBlock(['ANTES DE TESTAR,', 'ARRUME O [[BÁSICO]]'], 44, 434, 54, colors.white, { weight: 800, lineHeight: 58 })}
    <rect x="44" y="576" width="48" height="3" fill="${colors.green}"/>
    ${textBlock(wrap('• Seus contatos têm consentimento claro para uso?', 28), 44, 684, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textBlock(wrap('• Seu CRM está limpo, segmentado e acionável?', 29), 44, 834, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textBlock(wrap('• Pixel, UTM, oferta e eventos fazem sentido para intenção conversacional?', 29), 44, 982, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${arrow(false)}
    ${progress(7, 9, false)}
  `, 'slide_07.png');
}

async function slide08() {
  await renderImageFull('slide_08.jpg', `
    <defs>
      <linearGradient id="impactB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.00)"/>
        <stop offset="30%" stop-color="rgba(0,0,0,0.05)"/>
        <stop offset="58%" stop-color="rgba(0,0,0,0.55)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.82)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#impactB)"/>
    ${header(false)}
    <rect x="64" y="468" width="56" height="4" rx="2" fill="${colors.green}"/>
    ${textBlock(['A PERGUNTA', 'ESTRATÉGICA [[MUDA]]'], 64, 584, 56, colors.white, { weight: 700, lineHeight: 64 })}
    <line x1="64" y1="650" x2="1016" y2="650" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textBlock(wrap('Sai “como anunciar no ChatGPT?”', 26), 64, 752, 33, 'rgba(255,255,255,0.82)', { lineHeight: 48 })}
    <line x1="64" y1="822" x2="1016" y2="822" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textBlock(wrap('Entra “minha operação está pronta para mídia com dados próprios dentro da IA?”', 34), 64, 930, 33, 'rgba(255,255,255,0.82)', { lineHeight: 48 })}
    ${arrow(false)}
    ${progress(8, 9, false)}
  `, 'slide_08.png');
}

async function slide09() {
  await renderSolid(colors.white, `
    ${header(true)}
    <text x="64" y="560" fill="${colors.textDark}" font-family="Playfair Display, Times New Roman, serif" font-size="72">Eduardo Rolim</text>
    ${textBlock(wrap('[[Comente IA ADS]] que eu te envio um checklist para preparar base, consentimento, tracking e oferta.', 40), 64, 704, 30, colors.textDark, { weight: 700, lineHeight: 46 })}
    ${textBlock(wrap('Fonte: Search Engine Land, 7 de julho de 2026, e termos oficiais da OpenAI para publicidade.', 54), 64, 900, 18, 'rgba(0,0,0,0.55)', { lineHeight: 30 })}
    ${progress(9, 9, true)}
  `, 'slide_09.png');
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
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
