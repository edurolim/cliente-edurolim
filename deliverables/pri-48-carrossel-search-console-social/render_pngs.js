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
const greenSoft = '#3CD3A4';
const white = '#ffffff';
const black = '#111111';
const dark = '#292A25';

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

function richLine(line) {
  return esc(line)
    .replace(/\[\[(.+?)\]\]/g, `<tspan fill="${green}" font-style="italic" font-weight="700">$1</tspan>`);
}

function textLines(lines, x, y, size, fill, options = {}) {
  const weight = options.weight || 400;
  const family = options.family || 'Inter, Arial, sans-serif';
  const lineHeight = options.lineHeight || Math.round(size * 1.24);
  const anchor = options.anchor || 'start';
  const opacity = options.opacity == null ? 1 : options.opacity;
  return lines.map((line, index) => (
    `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" fill-opacity="${opacity}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${richLine(line)}</text>`
  )).join('\n');
}

function header(light = false) {
  const fill = light ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.55)';
  return `
    <g font-family="Space Grotesk, Arial, sans-serif" font-size="14" letter-spacing="1" fill="${fill}">
      <text x="48" y="40">POWERED BY POSTLAB</text>
      <text x="540" y="40" text-anchor="middle">@OEDUARDO.1</text>
      <text x="1032" y="40" text-anchor="end">JULHO 2026 ®</text>
    </g>`;
}

function footer(count, light = false) {
  const fill = light ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.82)';
  const countBlock = count ? `<text x="1015" y="1298" text-anchor="end" fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600">${count}</text>` : '';
  return `
    <rect x="0" y="1274" width="${W}" height="76" fill="${light ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.45)'}"/>
    <g fill="${fill}" font-family="Inter, Arial, sans-serif">
      <circle cx="40" cy="1312" r="10" stroke="${fill}" stroke-width="2" fill="none"/>
      <circle cx="40" cy="1312" r="3" fill="${fill}"/>
      <text x="64" y="1319" font-size="18" font-weight="700">@oeduardo.1</text>
      ${countBlock}
    </g>`;
}

function progress(index, total, light = false) {
  const bg = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.14)';
  const width = Math.round((W * index) / total);
  return `
    <rect x="0" y="1342" width="${W}" height="8" fill="${bg}"/>
    <rect x="0" y="1342" width="${width}" height="8" fill="${green}"/>`;
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
  const right = await fitImage(imageFile, 470, H);
  await sharp({
    create: { width: W, height: H, channels: 4, background: dark },
  })
    .composite([
      { input: right, left: 610, top: 0 },
      { input: overlaySvg(body) },
    ])
    .png()
    .toFile(path.join(outDir, outFile));
}

async function renderTopImage(imageFile, body, outFile, topHeight = 500) {
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

async function slide1() {
  await renderImageFull('slide_01.png', `
    <defs>
      <linearGradient id="cover" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.10)"/>
        <stop offset="35%" stop-color="rgba(0,0,0,0.18)"/>
        <stop offset="68%" stop-color="rgba(0,0,0,0.56)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.82)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#cover)"/>
    ${header(false)}
    <g fill="${white}">
      <circle cx="468" cy="782" r="13" stroke="${white}" stroke-width="2.2" fill="none"/>
      <circle cx="468" cy="782" r="4" fill="${white}"/>
      <rect x="486" y="770" width="128" height="24" rx="12" fill="rgba(255,255,255,0.12)"/>
      <text x="550" y="787" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" text-anchor="middle">@oeduardo.1</text>
    </g>
    ${textLines(['SEU POST VIROU', '[[RESULTADO DE BUSCA]]'], 72, 928, 88, white, { family: 'Impact, ImpactLocal, Arial Narrow, sans-serif', lineHeight: 84 })}
    ${textLines(wrap('O Google agora mostra como Instagram, TikTok, X e YouTube aparecem no Search e Discover.', 38), 72, 1120, 28, 'rgba(255,255,255,0.88)', { weight: 600, lineHeight: 40 })}
    <rect x="72" y="1210" width="306" height="62" rx="31" fill="${green}"/>
    <text x="225" y="1250" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="800" text-anchor="middle">O QUE MUDA AGORA →</text>
    ${footer('', false)}
    ${progress(1, 8, false)}
  `, 'slide_01.png');
}

async function slide2() {
  await renderSplit('slide_02.png', `
    ${header(false)}
    <rect x="64" y="224" width="132" height="38" rx="6" fill="${green}"/>
    <text x="130" y="249" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800" text-anchor="middle">O QUE MUDOU</text>
    ${textLines(['O GOOGLE ABRIU', 'UMA NOVA CAMADA', 'DE [[MEDICAO]]'], 64, 340, 58, white, { weight: 800, lineHeight: 64 })}
    ${textLines(wrap('Agora marcas e criadores conseguem acompanhar propriedades de plataformas sociais no Search Console.', 28), 64, 604, 31, 'rgba(255,255,255,0.90)', { lineHeight: 44 })}
    <rect x="64" y="850" width="470" height="164" rx="12" fill="rgba(255,255,255,0.06)"/>
    <rect x="64" y="850" width="8" height="164" fill="${green}"/>
    ${textLines(wrap('Nao e sobre postar mais. E sobre medir melhor.', 26), 92, 925, 34, white, { weight: 700, lineHeight: 48 })}
    ${footer('1/7', false)}
    ${progress(2, 8, false)}
  `, 'slide_02.png');
}

async function slide3() {
  await renderSolid(white, `
    ${header(true)}
    <rect x="70" y="186" width="940" height="980" rx="26" fill="#f4f1eb"/>
    <rect x="70" y="186" width="940" height="16" rx="8" fill="${green}"/>
    ${textLines(['CURTIDA NAO CONTA', 'A [[HISTORIA INTEIRA]]'], 118, 330, 62, black, { weight: 800, lineHeight: 68 })}
    ${textLines(wrap('Um post pode gerar descoberta sem virar like. Pode aparecer numa busca, levar alguem ao perfil e acionar lembranca, DM, WhatsApp ou venda dias depois.', 38), 118, 530, 32, 'rgba(0,0,0,0.74)', { lineHeight: 46 })}
    <rect x="118" y="826" width="844" height="178" rx="14" fill="${green}"/>
    ${textLines(wrap('Social media tambem precisa provar demanda.', 28), 160, 910, 44, white, { weight: 800, lineHeight: 56 })}
    ${footer('2/7', true)}
    ${progress(3, 8, true)}
  `, 'slide_03.png');
}

async function slide4() {
  await renderTopImage('slide_04.png', `
    <rect x="0" y="500" width="${W}" height="${H - 500}" fill="${dark}"/>
    ${header(false)}
    ${textLines(['O RELATORIO MUDA', 'DE [[PERGUNTA]]'], 62, 620, 58, white, { weight: 800, lineHeight: 62 })}
    ${textLines(['Antes: "quantas views teve?"', 'Agora: "quais buscas levaram', 'pessoas ate esse conteudo?"'], 62, 785, 31, 'rgba(255,255,255,0.86)', { lineHeight: 44 })}
    ${textLines([
      '• Quais termos puxam meu perfil?',
      '• Quais posts aparecem no Google?',
      '• Quais temas geram descoberta qualificada?',
      '• Que duvidas viram pauta de conteudo?'
    ], 62, 978, 28, white, { weight: 500, lineHeight: 44 })}
    ${footer('3/7', false)}
    ${progress(4, 8, false)}
  `, 'slide_04.png');
}

async function slide5() {
  await renderImageFull('slide_05.png', `
    <defs>
      <linearGradient id="impact" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(14,153,87,0.16)"/>
        <stop offset="46%" stop-color="rgba(8,18,15,0.38)"/>
        <stop offset="100%" stop-color="rgba(8,18,15,0.86)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#impact)"/>
    ${header(false)}
    <rect x="72" y="760" width="370" height="40" rx="20" fill="rgba(14,153,87,0.22)" stroke="rgba(60,211,164,0.48)" stroke-width="1.5"/>
    <text x="257" y="786" fill="${greenSoft}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle">BUSCA + SOCIAL + IA SEARCH</text>
    ${textLines(['GOOGLE, SOCIAL', 'E IA ESTAO VIRANDO', 'O [[MESMO JOGO]]'], 72, 890, 74, white, { family: 'Impact, ImpactLocal, Arial Narrow, sans-serif', lineHeight: 76 })}
    ${textLines(wrap('Seu conteudo social vira mais uma superficie de autoridade e descoberta.', 33), 72, 1142, 30, 'rgba(255,255,255,0.88)', { weight: 600, lineHeight: 42 })}
    ${footer('4/7', false)}
    ${progress(5, 8, false)}
  `, 'slide_05.png');
}

async function slide6() {
  await renderSplit('slide_06.png', `
    ${header(false)}
    <rect x="62" y="220" width="118" height="38" rx="6" fill="rgba(255,255,255,0.08)"/>
    <text x="121" y="246" fill="${greenSoft}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800" text-anchor="middle">ERRO COMUM</text>
    ${textLines(['O ERRO E TRATAR', 'SOCIAL COMO', '[[VITRINE SOLTA]]'], 62, 340, 56, white, { weight: 800, lineHeight: 62 })}
    ${textLines(wrap('Post sem intencao vira arquivo morto. Conteudo orientado por pergunta vira ativo: responde dores reais, aparece em mais lugares e alimenta funil.', 29), 62, 612, 31, 'rgba(255,255,255,0.88)', { lineHeight: 44 })}
    <rect x="62" y="964" width="470" height="176" rx="14" fill="${green}"/>
    ${textLines(wrap('Feed bonito sem descoberta e vaidade cara.', 22), 98, 1030, 33, white, { weight: 800, lineHeight: 42 })}
    ${footer('5/7', false)}
    ${progress(6, 8, false)}
  `, 'slide_06.png');
}

async function slide7() {
  await renderTopImage('slide_07.png', `
    <rect x="0" y="505" width="${W}" height="${H - 505}" fill="${white}"/>
    ${header(true)}
    ${textLines(['CHECKLIST RAPIDO', 'PARA SUA [[MARCA]]'], 62, 622, 60, black, { weight: 800, lineHeight: 64 })}
    ${textLines([
      '• Quais perguntas seus clientes fazem antes de comprar?',
      '• Seu perfil responde essas perguntas com clareza?',
      '• Seus posts usam termos que o cliente realmente pesquisa?',
      '• Voce mede descoberta fora da plataforma?',
      '• Existe ponte clara para DM, WhatsApp ou pagina comercial?'
    ], 62, 804, 29, 'rgba(0,0,0,0.78)', { lineHeight: 46 })}
    ${footer('6/7', true)}
    ${progress(7, 8, true)}
  `, 'slide_07.png');
}

async function slide8() {
  await renderImageFull('slide_08.png', `
    <defs>
      <linearGradient id="cta" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.16)"/>
        <stop offset="40%" stop-color="rgba(0,0,0,0.28)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.82)"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#cta)"/>
    ${header(false)}
    ${textLines(['A PROXIMA', 'VANTAGEM E SER', '[[ENCONTRADO]]'], 72, 926, 84, white, { family: 'Impact, ImpactLocal, Arial Narrow, sans-serif', lineHeight: 84 })}
    ${textLines(wrap('Comente BUSCA para receber um checklist de auditoria de descoberta.', 34), 72, 1142, 30, 'rgba(255,255,255,0.90)', { weight: 600, lineHeight: 42 })}
    <rect x="72" y="1216" width="286" height="58" rx="29" fill="${green}"/>
    <text x="215" y="1254" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="800" text-anchor="middle">COMENTAR BUSCA</text>
    ${footer('7/7', false)}
    ${progress(8, 8, false)}
  `, 'slide_08.png');
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
  console.log('render complete');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
