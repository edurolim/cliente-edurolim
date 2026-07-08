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
const muted = 'rgba(255,255,255,0.72)';

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
    .replace(/\[\[(.+?)\]\]/g, `<tspan fill="${green}">$1</tspan>`);
}

function textLines(lines, x, y, size, fill, options = {}) {
  const weight = options.weight || 700;
  const family = options.family || 'Inter, Arial, sans-serif';
  const lineHeight = options.lineHeight || Math.round(size * 1.12);
  const anchor = options.anchor || 'start';
  const opacity = options.opacity == null ? 1 : options.opacity;
  return lines.map((line, index) => (
    `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" fill-opacity="${opacity}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${richLine(line)}</text>`
  )).join('\n');
}

function header() {
  return `
    <g font-family="Inter, Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="1.6" fill="rgba(255,255,255,0.58)">
      <text x="48" y="40">EDUARDO ROLIM</text>
      <text x="540" y="40" text-anchor="middle">@OEDUARDO.1</text>
      <text x="1032" y="40" text-anchor="end">JULHO 2026 ®</text>
    </g>`;
}

function progress(index, total) {
  const width = Math.round((W * index) / total);
  return `
    <rect x="0" y="1342" width="${W}" height="8" fill="rgba(255,255,255,0.14)"/>
    <rect x="0" y="1342" width="${width}" height="8" fill="${green}"/>`;
}

function overlaySvg(body) {
  return Buffer.from(`
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      ${body}
    </svg>`);
}

async function fitImage(file) {
  return sharp(path.join(imgDir, file))
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .modulate({ saturation: 0.92, brightness: 0.86 })
    .toBuffer();
}

async function renderPoster({
  image,
  eyebrow,
  kicker,
  title,
  cta,
  index,
  outFile,
  titleY = 895,
  kickerY = 770,
  overlay = 'strong',
}) {
  const bg = await fitImage(image);
  const titleLines = title.map((line) => line.toUpperCase());
  const titleSize = titleLines.length >= 4 ? 70 : titleLines.length === 3 ? 82 : 92;
  const titleLineHeight = titleLines.length >= 4 ? 72 : titleLines.length === 3 ? 84 : 90;
  const titleBlock = textLines(titleLines, 540, titleY, titleSize, white, {
    family: 'Impact, ImpactLocal, Arial Narrow, sans-serif',
    lineHeight: titleLineHeight,
    anchor: 'middle',
  });
  const kickerBlock = kicker
    ? textLines(wrap(kicker.toUpperCase(), 44), 540, kickerY, 28, white, {
        weight: 800,
        lineHeight: 40,
        anchor: 'middle',
      })
    : '';
  const eyebrowBlock = eyebrow
    ? textLines([eyebrow.toUpperCase()], 540, 732, 18, muted, {
        weight: 700,
        lineHeight: 24,
        anchor: 'middle',
      })
    : '';
  const ctaBlock = cta
    ? `
      <rect x="366" y="1196" width="348" height="64" rx="32" fill="${green}"/>
      <text x="540" y="1238" fill="${white}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="900" text-anchor="middle">${esc(cta.toUpperCase())} →</text>`
    : '';
  const overlayFill = overlay === 'soft'
    ? 'rgba(0,0,0,0.34)'
    : 'rgba(0,0,0,0.50)';

  await sharp(bg)
    .composite([{ input: overlaySvg(`
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(0,0,0,0.14)"/>
          <stop offset="42%" stop-color="${overlayFill}"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.84)"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#shade)"/>
      ${header()}
      ${eyebrowBlock}
      ${kickerBlock}
      ${titleBlock}
      ${ctaBlock}
      ${progress(index, 8)}
    `) }])
    .png()
    .toFile(path.join(outDir, outFile));
}

async function main() {
  const slides = [
    {
      image: 'slide_01.png',
      eyebrow: 'Nova camada de descoberta',
      kicker: 'O Google agora mostra quando seu conteudo social vira resultado de busca.',
      title: ['SEU POST', 'VIROU [[RESULTADO]]', 'DE BUSCA'],
      cta: 'Entenda o ponto',
      titleY: 900,
    },
    {
      image: 'slide_02.png',
      eyebrow: 'O que mudou',
      kicker: 'Instagram, TikTok, X e YouTube entram no radar do Search Console.',
      title: ['SOCIAL', 'AGORA TAMBEM', 'E [[BUSCA]]'],
      cta: 'Veja a virada',
      titleY: 900,
    },
    {
      image: 'slide_03.png',
      eyebrow: 'Metrica errada',
      kicker: 'Curtida e view mostram reacao. Busca mostra intencao.',
      title: ['CURTIDA', 'NAO CONTA A', '[[HISTORIA]]', 'INTEIRA'],
      cta: 'Troque a pergunta',
      titleY: 875,
    },
    {
      image: 'slide_04.png',
      eyebrow: 'Novo relatorio',
      kicker: 'A pergunta deixa de ser so quanto engajou.',
      title: ['QUAIS BUSCAS', 'LEVAM PESSOAS', 'ATE SUA [[MARCA]]?'],
      cta: 'Olhe desse jeito',
      titleY: 900,
    },
    {
      image: 'slide_05.png',
      eyebrow: 'Busca + social + IA',
      kicker: 'Conteudo social vira superficie de autoridade, descoberta e demanda.',
      title: ['GOOGLE, SOCIAL', 'E IA VIRARAM', 'O [[MESMO JOGO]]'],
      cta: 'Conecte os pontos',
      titleY: 880,
    },
    {
      image: 'slide_06.png',
      eyebrow: 'Erro comum',
      kicker: 'Post sem intencao vira arquivo morto no feed.',
      title: ['FEED BONITO', 'SEM DESCOBERTA', 'E [[VAIDADE]]', 'CARA'],
      cta: 'Corrija a rota',
      titleY: 860,
    },
    {
      image: 'slide_07.png',
      eyebrow: 'Checklist rapido',
      kicker: 'Audite se seus posts respondem perguntas reais antes da compra.',
      title: ['SUA MARCA', 'APARECE QUANDO', 'O CLIENTE', '[[PESQUISA]]?'],
      cta: 'Use o checklist',
      titleY: 840,
    },
    {
      image: 'slide_08.png',
      eyebrow: 'Proxima vantagem',
      kicker: 'Quem conecta social, busca e IA vira mais facil de encontrar.',
      title: ['A PROXIMA', 'VANTAGEM E SER', '[[ENCONTRADO]]'],
      cta: 'Comentar busca',
      titleY: 900,
    },
  ];

  for (let index = 0; index < slides.length; index += 1) {
    await renderPoster({
      ...slides[index],
      index: index + 1,
      outFile: `slide_${String(index + 1).padStart(2, '0')}.png`,
    });
  }

  console.log('render complete');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
