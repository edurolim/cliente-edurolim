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
    ${textLines(wrap('09/07/2026: A OPENAI LANÇOU O CHATGPT WORK. O RECADO É SIMPLES: A IA SAIU DO CHAT E ENTROU NO WORKFLOW.', 44), 540, 858, 28, white, { weight: 800, lineHeight: 40, anchor: 'middle' })}
    ${textLines(['PROMPT É PEDIDO.', '[[WORKFLOW]]', 'É SISTEMA.'], 540, 1000, 84, white, { family: 'Impact, ImpactLocal, Arial Narrow, sans-serif', lineHeight: 82, anchor: 'middle' })}
    <rect x="336" y="1220" width="408" height="62" rx="31" fill="${green}"/>
    <text x="540" y="1260" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1.5">ENTENDA O JOGO</text>
    <g transform="translate(710 1249)" stroke="${white}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <line x1="-14" y1="0" x2="4" y2="0"/>
      <polyline points="-3 -7,4 0,-3 7"/>
    </g>
    ${progress(1, 9, false)}
  `, 'slide_01.png');
}

async function slide02() {
  await renderSplit('slide_02.jpg', `
    ${header(false)}
    <rect x="44" y="322" width="134" height="40" rx="4" fill="${green}"/>
    <text x="111" y="348" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">VIRADA</text>
    ${textLines(['O USO ANTIGO', 'ERA SIMPLES.', 'O NOVO JOGO É', '[[OPERAÇÃO]]'], 44, 430, 54, white, { weight: 800, lineHeight: 58 })}
    <rect x="44" y="620" width="48" height="3" fill="${green}"/>
    ${textLines(wrap('Pedir legenda, ideia, resumo e prompt melhor ajuda.', 30), 44, 734, 28, 'rgba(255,255,255,0.88)', { lineHeight: 42 })}
    ${textLines(wrap('• Agora entram apps, arquivos, CRM, aprovações e metas.', 31), 44, 890, 28, 'rgba(255,255,255,0.88)', { lineHeight: 42 })}
    ${textLines(wrap('• O output deixa de ser texto solto e vira entregável.', 31), 44, 1046, 28, 'rgba(255,255,255,0.88)', { lineHeight: 42 })}
    ${arrow(false)}
    ${progress(2, 9, false)}
  `, 'slide_02.png');
}

async function slide03() {
  await renderSolid(white, `
    ${header(true)}
    <rect x="64" y="286" width="56" height="5" rx="2" fill="${green}"/>
    ${textLines(wrap('A notícia não é só mais um modelo ou mais uma tela bonita.', 24), 64, 430, 58, dark, { weight: 800, lineHeight: 70 })}
    ${textLines(wrap('É um recado para empresas: IA está saindo da caixa de texto e entrando no fluxo real de trabalho.', 38), 64, 720, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    ${arrow(true)}
    ${progress(3, 9, true)}
  `, 'slide_03.png');
}

async function slide04() {
  await renderSolid(white, `
    ${header(true)}
    <rect x="64" y="276" width="56" height="4" rx="2" fill="${green}"/>
    ${textLines(['CHATGPT WORK É', 'AGENTE DE TRABALHO,', 'NÃO VITRINE DE', '[[PROMPT]].'], 64, 360, 50, dark, { weight: 800, lineHeight: 58 })}
    <line x1="64" y1="526" x2="1016" y2="526" stroke="rgba(0,0,0,0.10)" stroke-width="1"/>
    ${textLines(wrap('A própria OpenAI posiciona o produto como capaz de agir em apps e arquivos, ficar em projetos por horas e criar docs, planilhas, slides, sites e materiais.', 42), 64, 642, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    <rect x="64" y="856" width="952" height="112" fill="#f5f5f5"/>
    <rect x="64" y="856" width="5" height="112" fill="${green}"/>
    ${textLines(wrap('Trabalho composto, não resposta isolada.', 36), 92, 924, 30, dark, { weight: 700, lineHeight: 42 })}
    ${textLines(wrap('Em marketing e vendas, pesquisa vira brief, brief vira criativo, CRM revela follow-up quebrado e dashboard orienta a próxima ação.', 46), 64, 1074, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    ${arrow(true)}
    ${progress(4, 9, true)}
  `, 'slide_04.png');
}

async function slide05() {
  await renderTopImage('slide_05.jpg', `
    ${header(false)}
    <rect x="0" y="580" width="${W}" height="${H - 580}" fill="${dark}"/>
    <rect x="56" y="664" width="60" height="3" rx="2" fill="${green}"/>
    ${textLines(['O ERRO AGORA É', 'COMPRAR FERRAMENTA', 'ANTES DE DESENHAR', 'O [[WORKFLOW]]'], 56, 724, 46, white, { weight: 800, lineHeight: 56 })}
    <line x1="56" y1="876" x2="1024" y2="876" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Sem entrada clara, dado confiável, regra, limite, dono e aprovação humana, automação só acelera a bagunça em vez de melhorar a operação.', 49), 56, 966, 27, 'rgba(255,255,255,0.78)', { lineHeight: 42 })}
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
    ${textLines(['A VANTAGEM NÃO ESTÁ', 'NO PROMPT PERFEITO.', 'ESTÁ NO PROCESSO', '[[CERTO]].'], 64, 578, 56, white, { weight: 700, lineHeight: 64 })}
    <line x1="64" y1="744" x2="1016" y2="744" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Escolha uma rotina repetitiva, com alto volume, impacto comercial, critério claro e métrica de negócio antes de delegar mais trabalho para a IA.', 43), 64, 860, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    ${arrow(false)}
    ${progress(6, 9, false)}
  `, 'slide_06.png');
}

async function slide07() {
  await renderSplit('slide_07.jpg', `
    ${header(false)}
    <rect x="44" y="322" width="142" height="40" rx="4" fill="${green}"/>
    <text x="115" y="348" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">PROCESSO</text>
    ${textLines(['WORKFLOW BOM', 'TEM LIMITE,', 'DONO E', '[[MÉTRICA]]'], 44, 430, 54, white, { weight: 800, lineHeight: 58 })}
    <rect x="44" y="620" width="48" height="3" fill="${green}"/>
    ${textLines(wrap('• Escolha uma rotina repetitiva e cara.', 30), 44, 734, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• Defina entrada, regra, aprovação e exceção humana.', 30), 44, 900, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    ${textLines(wrap('• Meça tempo economizado, erro reduzido, lead recuperado ou venda influenciada.', 30), 44, 1066, 28, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
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
    ${textLines(['IA SEM PROCESSO', 'VIRA BARULHO.', 'IA COM PROCESSO', 'VIRA [[SISTEMA]].'], 64, 574, 54, white, { weight: 700, lineHeight: 62 })}
    <line x1="64" y1="828" x2="1016" y2="828" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('O diferencial deixa de ser saber pedir um texto melhor e passa a ser saber qual processo delegar, com quais dados e quais limites.', 42), 64, 944, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    <line x1="64" y1="1110" x2="1016" y2="1110" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Autonomia útil entra junto com revisão humana, governança e métrica.', 38), 64, 1198, 33, 'rgba(255,255,255,0.82)', { lineHeight: 50 })}
    ${arrow(false)}
    ${progress(8, 9, false)}
  `, 'slide_08.png');
}

async function slide09() {
  await renderSolid(white, `
    ${header(true)}
    <text x="64" y="560" fill="${dark}" font-family="Georgia, Times New Roman, serif" font-size="72">Eduardo Rolim</text>
    ${textLines(wrap('[[Comente WORKFLOW]] para mapear um processo repetitivo que pode virar fluxo medido com IA.', 42), 64, 704, 30, dark, { weight: 700, lineHeight: 46 })}
    ${textLines(wrap('Fontes: PRI-58, OpenAI ChatGPT Work e GPT-5.6 de 09/07/2026, e case Deutsche Telekom de 10/07/2026.', 58), 64, 910, 18, 'rgba(0,0,0,0.55)', { lineHeight: 30 })}
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
