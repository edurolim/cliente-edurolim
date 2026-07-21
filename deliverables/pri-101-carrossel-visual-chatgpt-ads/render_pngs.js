const fs = require('fs');
const path = require('path');
process.env.FONTCONFIG_FILE = path.join(__dirname, 'fonts', 'fonts.conf');
const sharp = require('sharp');

const W = 1080;
const H = 1350;
const root = __dirname;
const outDir = path.join(root, 'png');
fs.mkdirSync(outDir, { recursive: true });

const green = '#0E9957';
const dark = '#0d0d0d';
const white = '#ffffff';

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rich(value) {
  return esc(value).replace(/\[\[(.+?)\]\]/g, `<tspan fill="${green}" font-style="italic" font-weight="800">$1</tspan>`);
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

function text(lines, x, y, size, fill, opts = {}) {
  const lineHeight = opts.lineHeight || Math.round(size * 1.25);
  const weight = opts.weight || 400;
  const anchor = opts.anchor || 'start';
  const family = opts.family || 'Inter, Arial, sans-serif';
  return lines.map((line, i) =>
    `<text x="${x}" y="${y + i * lineHeight}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${rich(line)}</text>`
  ).join('\n');
}

function header(light = false) {
  const fill = light ? 'rgba(0,0,0,0.36)' : 'rgba(255,255,255,0.52)';
  return `<g fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="14" letter-spacing="1" text-transform="uppercase">
    <text x="48" y="40">EDUARDO ROLIM</text>
    <text x="540" y="40" text-anchor="middle">@OEDUARDO.1</text>
    <text x="1032" y="40" text-anchor="end">JULHO 2026</text>
  </g>`;
}

function progress(index, total, light = false) {
  const bg = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)';
  return `<rect x="0" y="1343" width="${W}" height="7" fill="${bg}"/><rect x="0" y="1343" width="${Math.round(W * index / total)}" height="7" fill="${green}"/>`;
}

function number(index, total, light = false) {
  const fill = light ? 'rgba(0,0,0,0.48)' : 'rgba(255,255,255,0.74)';
  return `<text x="44" y="1320" fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="500">${index}/${total}</text>`;
}

function rule(x, y) {
  return `<rect x="${x}" y="${y}" width="64" height="5" rx="3" fill="${green}"/>`;
}

function panel(lines, x, y, w, light = false) {
  const bg = light ? '#f4f4f4' : 'rgba(255,255,255,0.08)';
  const fill = light ? dark : white;
  return `<rect x="${x}" y="${y}" width="${w}" height="150" fill="${bg}"/>
    <rect x="${x}" y="${y}" width="5" height="150" fill="${green}"/>
    ${text(lines, x + 28, y + 58, 30, fill, { weight: 800, lineHeight: 40 })}`;
}

function svg(body, background = dark) {
  return Buffer.from(`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${background}"/>
    ${body}
  </svg>`);
}

async function writeSlide(name, body, background) {
  await sharp(svg(body, background)).png().toFile(path.join(outDir, name));
}

async function slide01() {
  await writeSlide('slide_01.png', `
    <defs>
      <radialGradient id="r" cx="30%" cy="18%" r="40%"><stop offset="0%" stop-color="rgba(14,153,87,0.45)"/><stop offset="100%" stop-color="rgba(14,153,87,0)"/></radialGradient>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#050505"/><stop offset="55%" stop-color="#151515"/><stop offset="100%" stop-color="#081f16"/></linearGradient>
      <pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse"><path d="M54 0H0V54" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/></pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#r)"/><rect width="${W}" height="${H}" fill="url(#grid)" opacity="0.28"/>
    <g opacity="0.9">
      <rect x="90" y="176" width="390" height="170" rx="18" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)"/>
      <rect x="118" y="204" width="270" height="14" rx="7" fill="rgba(255,255,255,0.28)"/><rect x="118" y="244" width="190" height="14" rx="7" fill="rgba(255,255,255,0.28)"/>
      <rect x="538" y="350" width="460" height="220" rx="20" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)"/>
      <rect x="566" y="384" width="360" height="14" rx="7" fill="rgba(255,255,255,0.28)"/><rect x="566" y="424" width="292" height="14" rx="7" fill="rgba(255,255,255,0.28)"/><rect x="566" y="464" width="210" height="14" rx="7" fill="rgba(255,255,255,0.28)"/>
      <rect x="260" y="860" width="560" height="270" rx="24" fill="rgba(14,153,87,0.16)" stroke="rgba(255,255,255,0.16)"/>
      <rect x="300" y="906" width="430" height="14" rx="7" fill="rgba(255,255,255,0.30)"/><rect x="300" y="954" width="360" height="14" rx="7" fill="rgba(255,255,255,0.30)"/><rect x="300" y="1002" width="430" height="14" rx="7" fill="rgba(255,255,255,0.30)"/>
    </g>
    ${header(false)}
    ${text(wrap('Todo mundo quer aparecer nas respostas. Mas anúncio dentro da IA muda a pergunta.', 35), 540, 826, 29, white, { weight: 800, lineHeight: 40, anchor: 'middle' })}
    ${text(['CHATGPT ADS', 'NÃO É GOOGLE ADS', 'COM OUTRO NOME'], 540, 1010, 82, white, { family: 'ImpactLocal, Impact, Arial Narrow, sans-serif', weight: 900, lineHeight: 78, anchor: 'middle' })}
    ${progress(1, 7, false)}
  `);
}

async function slide02() {
  await writeSlide('slide_02.png', `
    ${header(false)}
    <rect x="540" y="0" width="540" height="${H}" fill="#eef6f2"/>
    <rect x="600" y="250" width="360" height="760" rx="26" fill="#101010"/>
    <rect x="644" y="312" width="250" height="80" rx="18" fill="rgba(255,255,255,0.12)"/>
    <rect x="644" y="424" width="300" height="80" rx="18" fill="rgba(14,153,87,0.50)"/>
    <rect x="644" y="536" width="210" height="80" rx="18" fill="rgba(255,255,255,0.12)"/>
    <rect x="644" y="648" width="270" height="80" rx="18" fill="rgba(255,255,255,0.12)"/>
    <rect x="44" y="322" width="94" height="40" rx="4" fill="${green}"/><text x="91" y="349" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800" text-anchor="middle">ERRO</text>
    ${text(['A TENTAÇÃO É', 'TRATAR COMO', '[[MÍDIA COMUM]].'], 44, 440, 55, white, { weight: 800, lineHeight: 61 })}
    ${rule(44, 642)}
    ${text(wrap('Mesmo painel mental. Mesma lógica de campanha. Mesmo raciocínio de clique.', 29), 44, 732, 30, 'rgba(255,255,255,0.78)', { lineHeight: 45 })}
    ${panel(wrap('Só que a conversa com IA não nasce no mesmo momento de compra.', 29), 44, 1015, 420, false)}
    ${number(2, 7, false)}${progress(2, 7, false)}
  `);
}

async function standard(name, index, light, title, body, callout, kicker) {
  const bg = light ? white : dark;
  const main = light ? dark : white;
  const muted = light ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.78)';
  const kickerSvg = kicker ? `<rect x="64" y="246" width="${Math.max(120, kicker.length * 14)}" height="40" rx="4" fill="${green}"/><text x="${64 + Math.max(120, kicker.length * 14) / 2}" y="273" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800" text-anchor="middle">${esc(kicker.toUpperCase())}</text>` : rule(64, 286);
  await writeSlide(name, `
    ${header(light)}
    ${kickerSvg}
    ${text(wrap(title, 22), 64, 430, 55, main, { weight: 800, lineHeight: 64 })}
    <line x1="64" y1="620" x2="1016" y2="620" stroke="${light ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.16)'}"/>
    ${text(wrap(body, 43), 64, 720, 34, muted, { lineHeight: 52 })}
    ${panel(wrap(callout, 43), 64, 1060, 952, light)}
    ${number(index, 7, light)}${progress(index, 7, light)}
  `, bg);
}

async function slide07() {
  await writeSlide('slide_07.png', `
    ${header(true)}
    ${text(['Eduardo Rolim'], 64, 392, 72, dark, { family: 'Georgia, Times New Roman, serif', weight: 400 })}
    ${rule(64, 468)}
    ${text(wrap('ChatGPT Ads parece mais oportunidade, risco ou distração para empresas brasileiras agora?', 26), 64, 610, 48, dark, { weight: 800, lineHeight: 61 })}
    ${text(wrap('Fontes-base do insumo: Business Insider, EMARKETER, Search Engine Land, OpenAI Ads e comunicados da OpenAI consultados em 21/07/2026.', 78), 64, 1074, 18, 'rgba(0,0,0,0.55)', { lineHeight: 28 })}
    ${number(7, 7, true)}${progress(7, 7, true)}
  `, white);
}

async function contactSheet() {
  const thumbs = [];
  for (let i = 1; i <= 7; i++) {
    const input = path.join(outDir, `slide_${String(i).padStart(2, '0')}.png`);
    thumbs.push(await sharp(input).resize(270, 338).toBuffer());
  }
  const bg = sharp({ create: { width: 1080, height: 1014, channels: 4, background: '#111111' } });
  const composites = thumbs.map((input, i) => ({
    input,
    left: (i % 4) * 270,
    top: Math.floor(i / 4) * 338,
  }));
  await bg.composite(composites).png().toFile(path.join(outDir, 'contact-sheet.png'));
}

async function main() {
  await slide01();
  await slide02();
  await standard('slide_03.png', 3, true, 'Busca, social e IA vendem momentos diferentes.', 'Busca vende intenção declarada. Social vende interrupção e descoberta. IA conversacional intermedia critério, comparação e recomendação.', 'O usuário não está apenas clicando. Está pedindo critério.');
  await standard('slide_04.png', 4, false, 'OpenAI quer anúncios. O mercado quer [[prova]].', 'A OpenAI quer transformar o ChatGPT em plataforma relevante de anúncios. Analistas ainda questionam escala, targeting, mensuração e maturidade do formato.', 'A ambição é grande. A máquina comercial ainda está em construção.', 'Contradição');
  await standard('slide_05.png', 5, true, 'Antes da verba, vem o mapa de perguntas.', 'Quais perguntas comerciais a IA está intermediando? Quando a marca aparece? Que prova sustenta a decisão depois da resposta?', 'Sem isso, o anúncio entra em uma conversa que a empresa ainda não entendeu.');
  await standard('slide_06.png', 6, false, 'O teste mínimo tem 5 peças.', 'Perguntas BOFU. Presença orgânica. Landing page de comparação. Criativos por objeção. Tracking para separar curiosidade, assistência e conversão.', 'O risco não é chegar tarde. É entrar cedo com a estratégia errada.', 'Checklist');
  await slide07();
  await contactSheet();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
