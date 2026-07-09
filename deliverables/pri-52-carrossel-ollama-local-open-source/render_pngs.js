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
  return lines.map((line, index) => (
    `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" fill-opacity="${opacity}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${richLine(line)}</text>`
  )).join('\n');
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
  await renderImageFull('slide_01.jpg', `
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
    ${textLines(wrap('OLLAMA LEVANTOU US$ 65 MILHÕES, DECLAROU MAIS DE 8,9 MILHÕES DE DEVS MENSAIS E TIROU IA LOCAL DO NINHO TÉCNICO.', 44), 540, 900, 28, white, { weight: 800, lineHeight: 40, anchor: 'middle' })}
    ${textLines(['A IA DO NAVEGADOR', 'NÃO É A', '[[ÚNICA OPÇÃO]]'], 540, 1048, 92, white, { family: 'Impact, ImpactLocal, Arial Narrow, sans-serif', lineHeight: 90, anchor: 'middle' })}
    <rect x="322" y="1210" width="436" height="66" rx="33" fill="${green}"/>
    <text x="540" y="1252" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1.5">ENTENDA A VIRADA</text>
    <g transform="translate(710 1241)" stroke="${white}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <line x1="-14" y1="0" x2="4" y2="0"/>
      <polyline points="-3 -7,4 0,-3 7"/>
    </g>
    ${progress(1, 9, false)}
  `, 'slide_01.png');
}

async function slide02() {
  await renderSplit('slide_02.jpg', `
    ${header(false)}
    <rect x="44" y="322" width="110" height="40" rx="4" fill="${green}"/>
    <text x="99" y="348" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">SINAL</text>
    ${textLines(['IA LOCAL SAIU', 'DO NICHO E VIROU', '[[ARQUITETURA]]'], 44, 448, 54, white, { weight: 800, lineHeight: 58 })}
    <rect x="44" y="620" width="48" height="3" fill="${green}"/>
    ${textLines(wrap('A primeira onda perguntou qual ferramenta assinar.', 30), 44, 708, 28, 'rgba(255,255,255,0.88)', { lineHeight: 42 })}
    ${textLines(wrap('• A fase madura pergunta onde o dado roda e quanto custa escalar.', 31), 44, 866, 28, 'rgba(255,255,255,0.88)', { lineHeight: 42 })}
    ${textLines(wrap('• Controle operacional deixou de ser detalhe técnico.', 31), 44, 1014, 28, 'rgba(255,255,255,0.88)', { lineHeight: 42 })}
    ${arrow(false)}
    ${progress(2, 9, false)}
  `, 'slide_02.png');
}

async function slide03() {
  await renderSolid(white, `
    ${header(true)}
    <rect x="64" y="286" width="56" height="5" rx="2" fill="${green}"/>
    ${textLines(wrap('Antes de continuar: Quer mais conteúdos como esse?', 24), 64, 462, 62, dark, { weight: 800, lineHeight: 74 })}
    ${textLines(wrap('Toca [[2 vezes]] na tela e depois me segue.', 22), 64, 698, 62, dark, { weight: 800, lineHeight: 74 })}
    ${arrow(true)}
    ${progress(3, 9, true)}
  `, 'slide_03.png');
}

async function slide04() {
  await renderSolid(white, `
    ${header(true)}
    <rect x="64" y="276" width="56" height="4" rx="2" fill="${green}"/>
    ${textLines(['SAAS CONTINUA ÚTIL.', 'O ERRO É TERCEIRIZAR', 'A [[DECISÃO TÉCNICA]].'], 64, 372, 50, dark, { weight: 800, lineHeight: 58 })}
    <line x1="64" y1="526" x2="1016" y2="526" stroke="rgba(0,0,0,0.10)" stroke-width="1"/>
    ${textLines(wrap('Ferramentas prontas entregam velocidade, interface e conveniência. Isso segue valendo.', 42), 64, 642, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    <rect x="64" y="856" width="952" height="112" fill="#f5f5f5"/>
    <rect x="64" y="856" width="5" height="112" fill="${green}"/>
    ${textLines(wrap('Conveniência não substitui arquitetura.', 36), 92, 924, 30, dark, { weight: 700, lineHeight: 42 })}
    ${textLines(wrap('Em fluxo crítico, API externa, caixa-preta e custo variável precisam entrar na conta com o mesmo peso de qualidade e time-to-value.', 46), 64, 1074, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    ${arrow(true)}
    ${progress(4, 9, true)}
  `, 'slide_04.png');
}

async function slide05() {
  await renderTopImage('slide_05.jpg', `
    ${header(false)}
    <rect x="0" y="580" width="${W}" height="${H - 580}" fill="${dark}"/>
    <rect x="56" y="664" width="60" height="3" rx="2" fill="${green}"/>
    ${textLines(['OLLAMA GANHA FORÇA', 'QUANDO A OPERAÇÃO', 'PEDE [[CONTROLE]]'], 56, 744, 46, white, { weight: 800, lineHeight: 56 })}
    <line x1="56" y1="876" x2="1024" y2="876" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Licença MIT, suporte a macOS, Windows e Linux, API local em localhost:11434 e integrações com apps e agentes mudam o tipo de teste possível.', 49), 56, 966, 27, 'rgba(255,255,255,0.78)', { lineHeight: 42 })}
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
        <stop offset="100%" stop-color="rgba(0,0,0,0.80)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#impactA)"/>
    ${header(false)}
    <rect x="64" y="498" width="56" height="4" rx="2" fill="${green}"/>
    ${textLines(['IA LOCAL NÃO ELIMINA', 'CUSTO. ELA SÓ TROCA', 'O [[TRADE-OFF]].'], 64, 614, 56, white, { weight: 700, lineHeight: 64 })}
    <line x1="64" y1="744" x2="1016" y2="744" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Parte da assinatura sai de cena, mas entram hardware, setup, manutenção, avaliação de qualidade, segurança e critério técnico.', 43), 64, 860, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    ${arrow(false)}
    ${progress(6, 9, false)}
  `, 'slide_06.png');
}

async function slide07() {
  await renderSplit('slide_07.jpg', `
    ${header(false)}
    <rect x="44" y="322" width="150" height="40" rx="4" fill="${green}"/>
    <text x="119" y="348" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">ESTRATÉGIA</text>
    ${textLines(['A OPERAÇÃO MADURA', 'TENDE A SER', '[[HÍBRIDA]]'], 44, 448, 54, white, { weight: 800, lineHeight: 58 })}
    <rect x="44" y="620" width="48" height="3" fill="${green}"/>
    ${textLines(wrap('• Modelo fechado quando qualidade, produto e suporte compensam.', 30), 44, 708, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• Aberto ou local quando privacidade, teste e custo operacional pesam mais.', 30), 44, 874, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• RAG, triagem, atendimento e análise documental são bons pilotos.', 30), 44, 1040, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
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
        <stop offset="100%" stop-color="rgba(0,0,0,0.80)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#impactB)"/>
    ${header(false)}
    <rect x="64" y="458" width="56" height="4" rx="2" fill="${green}"/>
    ${textLines(['O PONTO NÃO É', 'ABANDONAR FERRAMENTAS.', 'É PARAR DE CONFUNDIR', '[[CONVENIÊNCIA COM ARQUITETURA]].'], 64, 574, 54, white, { weight: 700, lineHeight: 62 })}
    <line x1="64" y1="828" x2="1016" y2="828" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Antes de automatizar tudo, mapear dados, custo e risco evita comprar velocidade onde o negócio precisa de controle.', 42), 64, 944, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    <line x1="64" y1="1110" x2="1016" y2="1110" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Open source sem governança vira improviso com outro nome.', 38), 64, 1198, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    ${arrow(false)}
    ${progress(8, 9, false)}
  `, 'slide_08.png');
}

async function slide09() {
  await renderSolid(white, `
    ${header(true)}
    <text x="64" y="560" fill="${dark}" font-family="Georgia, Times New Roman, serif" font-size="72">Eduardo Rolim</text>
    ${textLines(wrap('[[Comente LOCAL]] para receber um checklist de avaliação antes de levar IA local ou híbrida para a operação.', 42), 64, 704, 30, dark, { weight: 700, lineHeight: 46 })}
    ${textLines(wrap('Fontes: PRI-51, TechCrunch 09/07/2026, Ollama GitHub, site oficial e quickstart consultados em 09 de julho de 2026.', 58), 64, 910, 18, 'rgba(0,0,0,0.55)', { lineHeight: 30 })}
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
