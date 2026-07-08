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
const black = '#0d0d0d';

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrap(text, maxChars) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
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
  const weight = options.weight || 400;
  const family = options.family || 'Arial, sans-serif';
  const lineHeight = options.lineHeight || Math.round(size * 1.22);
  const anchor = options.anchor || 'start';
  const style = options.italic ? 'font-style="italic"' : '';
  return lines.map((line, index) => (
    `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" ${style}>${esc(line)}</text>`
  )).join('\n');
}

function header(light = false) {
  const fill = light ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)';
  return `
    <g font-family="Arial, sans-serif" font-size="14" letter-spacing="1" text-transform="uppercase" fill="${fill}">
      <text x="48" y="38">Eduardo Rolim</text>
      <text x="540" y="38" text-anchor="middle">@oeduardo.1</text>
      <text x="1032" y="38" text-anchor="end">Julho 2026 ®</text>
    </g>`;
}

function progress(percent, light = false) {
  const bg = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)';
  return `
    <rect x="0" y="1343" width="${W}" height="7" fill="${bg}"/>
    <rect x="0" y="1343" width="${Math.round(W * percent / 100)}" height="7" fill="${green}"/>`;
}

function footer(count, light = false) {
  const fill = light ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.66)';
  return `
    <g font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="${fill}">
      <text x="974" y="1298" text-anchor="end">${count}</text>
      <text x="1016" y="1302" fill="${light ? green : white}" font-size="28">→</text>
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
  return sharp(file).resize(width, height, { fit: 'cover', position: 'centre' }).toBuffer();
}

async function renderOnImage(imageFile, body, outFile) {
  const bg = await fitImage(path.join(imgDir, imageFile), W, H);
  await sharp(bg)
    .composite([{ input: overlaySvg(body) }])
    .png()
    .toFile(path.join(outDir, outFile));
}

async function renderSolid(background, body, outFile) {
  await sharp(overlaySvg(body, background))
    .png()
    .toFile(path.join(outDir, outFile));
}

async function renderSplit(imageFile, outFile, tag, titleLines, bullets, count, percent) {
  const right = await fitImage(path.join(imgDir, imageFile), 540, H);
  const title = textLines(titleLines, 48, 292, 54, white, { weight: 800, lineHeight: 58 });
  const bulletSvg = bullets.map((bullet, index) => {
    const y = 545 + index * 122;
    return `
      <text x="48" y="${y}" fill="${green}" font-family="Arial, sans-serif" font-size="30" font-weight="800">•</text>
      ${textLines(wrap(bullet, 29), 84, y, 28, 'rgba(255,255,255,0.88)', { lineHeight: 39 })}`;
  }).join('\n');

  const overlay = overlaySvg(`
    <rect x="0" y="0" width="540" height="${H}" fill="${black}"/>
    <rect x="48" y="224" width="110" height="36" rx="4" fill="${green}"/>
    <text x="103" y="249" fill="${white}" font-family="Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle">${esc(tag)}</text>
    ${title}
    <rect x="48" y="432" width="48" height="3" fill="${green}"/>
    ${bulletSvg}
    ${header(false)}
    ${footer(count, false)}
    ${progress(percent, false)}
  `);

  await sharp({
    create: { width: W, height: H, channels: 4, background: black },
  })
    .composite([{ input: right, left: 540, top: 0 }, { input: overlay }])
    .png()
    .toFile(path.join(outDir, outFile));
}

async function slide1() {
  await renderOnImage('slide_01.jpg', `
    <defs>
      <linearGradient id="cover" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.05)"/>
        <stop offset="38%" stop-color="rgba(0,0,0,0.18)"/>
        <stop offset="66%" stop-color="rgba(0,0,0,0.58)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.82)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#cover)"/>
    ${header(false)}
    ${textLines(wrap('TechCrunch publicou em 7 de julho de 2026 que a Savi Security lancou um app para detectar golpes com IA em textos, emails, voicemails e chamadas.', 58), 540, 806, 28, white, { weight: 800, anchor: 'middle', lineHeight: 40 })}
    ${textLines(['A IA criou um', 'novo mercado:'], 540, 965, 80, white, { family: 'Impact, Arial Black, sans-serif', weight: 900, anchor: 'middle', lineHeight: 82 })}
    ${textLines(['defesa contra golpes', 'que parecem reais'], 540, 1129, 74, white, { family: 'Impact, Arial Black, sans-serif', weight: 900, anchor: 'middle', lineHeight: 76 })}
    <rect x="370" y="1200" width="340" height="58" rx="29" fill="${green}"/>
    <text x="540" y="1237" fill="${white}" font-family="Arial, sans-serif" font-size="20" font-weight="800" text-anchor="middle">SALVAR ESTE POST →</text>
    ${progress(11.1, false)}
  `, 'slide_01.png');
}

async function slide2() {
  await renderSplit('slide_02.jpg', 'slide_02.png', 'Sinal', ['US$ 7 milhoes para', 'um problema que virou', 'mercado'], [
    'No mesmo movimento, a startup anunciou US$ 7 milhoes em seed funding.',
    'A Savi tenta detectar golpes em textos, emails, voicemails e chamadas.',
    'Quando um risco novo fica grande o suficiente, nasce uma camada nova de protecao.',
  ], '1/8', 22.2);
}

async function slide3() {
  await renderSolid(white, `
    ${header(true)}
    <rect x="68" y="407" width="56" height="4" rx="2" fill="${green}"/>
    ${textLines(wrap('Antes de continuar: Quer mais conteudos como esse? Toca 2 vezes na tela e depois me segue.', 29), 68, 500, 62, black, { weight: 800, lineHeight: 74 })}
    ${footer('2/8', true)}
    ${progress(33.3, true)}
  `, 'slide_03.png');
}

async function slide4() {
  await renderSolid(white, `
    ${header(true)}
    <rect x="68" y="240" width="56" height="4" rx="2" fill="${green}"/>
    ${textLines(['O problema nao e uma', 'ferramenta mal usada.'], 68, 330, 52, black, { weight: 800, lineHeight: 62 })}
    <line x1="68" y1="440" x2="1012" y2="440" stroke="rgba(0,0,0,0.12)" stroke-width="1"/>
    ${textLines(wrap('O risco real aparece quando a operacao inteira toma decisoes por canais informais, sem protocolo claro e sem confirmacao fora do fluxo de urgencia.', 43), 68, 520, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    <rect x="68" y="782" width="900" height="126" rx="8" fill="#f5f5f5"/>
    <rect x="68" y="782" width="5" height="126" fill="${green}"/>
    ${textLines(wrap('IA sem processo = pressa convincente + decisao errada em escala.', 45), 92, 835, 30, black, { weight: 700, lineHeight: 44 })}
    ${textLines(wrap('Atendimento, comercial, suporte, financeiro e WhatsApp viraram pontos sensiveis.', 45), 68, 995, 34, 'rgba(0,0,0,0.72)', { lineHeight: 52 })}
    ${footer('3/8', true)}
    ${progress(44.4, true)}
  `, 'slide_04.png');
}

async function slide5() {
  const top = await fitImage(path.join(imgDir, 'slide_05.jpg'), W, 580);
  const overlay = overlaySvg(`
    <rect x="0" y="580" width="${W}" height="770" fill="${black}"/>
    ${header(false)}
    <rect x="58" y="624" width="56" height="4" rx="2" fill="${green}"/>
    ${textLines(wrap('Pagamento urgente, troca bancaria e autorizacao por mensagem nao podem depender de confianca visual.', 35), 58, 710, 46, white, { weight: 800, lineHeight: 54 })}
    <line x1="58" y1="935" x2="1022" y2="935" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap('Familiaridade, tom de voz e foto de perfil ja nao bastam. Se o processo aceita improviso, a IA barateia o erro.', 55), 58, 1010, 28, 'rgba(255,255,255,0.82)', { lineHeight: 44 })}
    ${footer('4/8', false)}
    ${progress(55.6, false)}
  `);

  await sharp({ create: { width: W, height: H, channels: 4, background: black } })
    .composite([{ input: top, left: 0, top: 0 }, { input: overlay }])
    .png()
    .toFile(path.join(outDir, 'slide_05.png'));
}

async function imageImpact(imageFile, outFile, count, percent, title, body, extra) {
  await renderOnImage(imageFile, `
    <defs>
      <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.08)"/>
        <stop offset="42%" stop-color="rgba(0,0,0,0.35)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.86)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#fade)"/>
    ${header(false)}
    <rect x="68" y="300" width="56" height="4" rx="2" fill="${green}"/>
    ${textLines(title, 68, 390, 56, white, { weight: 800, lineHeight: 65 })}
    <line x1="68" y1="600" x2="1012" y2="600" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    ${textLines(wrap(body, 52), 68, 690, 33, 'rgba(255,255,255,0.86)', { lineHeight: 52 })}
    ${extra ? `<line x1="68" y1="980" x2="1012" y2="980" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>${textLines(wrap(extra, 48), 68, 1050, 33, 'rgba(255,255,255,0.86)', { lineHeight: 52 })}` : ''}
    ${footer(count, false)}
    ${progress(percent, false)}
  `, outFile);
}

async function slide6() {
  await imageImpact('slide_06.jpg', 'slide_06.png', '5/8', 66.7, ['A IA nao cria so', 'produtividade.'], 'Ela tambem reduz o custo de fraude, pressa falsa, mensagem convincente e decisao errada. Para empresarios, a licao nao e medo. E sistema.');
}

async function slide7() {
  await renderSplit('slide_07.jpg', 'slide_07.png', 'Licao', ['Toda nova capacidade', 'da IA cria dois', 'mercados'], [
    'Quem usa para crescer.',
    'Quem precisa se proteger do abuso.',
    'Quem organiza sistema primeiro ganha vantagem antes do resto.',
  ], '6/8', 77.8);
}

async function slide8() {
  await imageImpact('slide_08.jpg', 'slide_08.png', '7/8', 88.9, ['O jogo maduro nao e', 'adotar IA mais rapido.'], 'E adotar IA com regra, revisao, canal de confirmacao e criterio de automacao.', 'IA sem processo aumenta improviso. IA com sistema cria vantagem.');
}

async function slide9() {
  await renderSolid(white, `
    ${header(true)}
    <text x="68" y="405" fill="${black}" font-family="Georgia, serif" font-size="72">Eduardo Rolim</text>
    ${textLines(wrap('Salve este post e comente IA para receber um checklist de governanca basica antes de colocar IA na operacao.', 43), 68, 520, 34, black, { weight: 700, lineHeight: 50 })}
    ${textLines(wrap('Fonte: TechCrunch, 7 de julho de 2026. Savi Security, deteccao de golpes com IA em textos, emails, voicemails e chamadas.', 64), 68, 735, 20, 'rgba(0,0,0,0.55)', { lineHeight: 32 })}
    <rect x="68" y="935" width="362" height="58" rx="29" fill="${green}"/>
    <text x="249" y="972" fill="${white}" font-family="Arial, sans-serif" font-size="20" font-weight="800" text-anchor="middle">COMENTAR IA</text>
    ${progress(100, true)}
  `, 'slide_09.png');
}

async function main() {
  await slide1();
  await slide2();
  await slide3();
  await slide4();
  await slide5();
  await slide6();
  await slide7();
  await slide8();
  await slide9();
  console.log('render complete');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
