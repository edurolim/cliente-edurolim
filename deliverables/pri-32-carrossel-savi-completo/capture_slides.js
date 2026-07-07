const path = require('path');
const { chromium } = require('playwright');

const root = __dirname;
const outDir = path.join(root, 'png');
const url = process.env.CARROSSEL_URL || 'http://127.0.0.1:8123/deliverables/pri-32-carrossel-savi-completo/carrossel.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1800 },
    deviceScaleFactor: 0.75,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(800);

  const dpr = await page.evaluate(() => window.devicePixelRatio);
  const cssW = await page.evaluate(() => window.innerWidth);
  const cssH = await page.evaluate(() => window.innerHeight);
  const scale = cssW / 1080;
  const slides = await page.locator('body > div').all();

  await page.evaluate(() => {
    for (const el of document.querySelectorAll('body > div')) el.style.display = 'none';
  });

  for (let i = 0; i < slides.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    const filePath = path.join(outDir, `slide_${num}.png`);
    const classes = await slides[i].evaluate(el => el.className);
    const isAccent = classes.includes('accent-bg');
    const isPhotoBg = classes.split(/\s+/).includes('slide');
    const bgColor = isAccent ? '#0E9957' : (isPhotoBg ? '#111111' : '#292A25');

    await page.evaluate(c => {
      document.documentElement.style.background = c;
      document.body.style.background = c;
    }, bgColor);

    await slides[i].evaluate((el, s) => {
      el.style.display = 'flex';
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '1080px';
      el.style.height = '1350px';
      el.style.zIndex = '9999';
      el.style.transform = `scale(${s})`;
      el.style.transformOrigin = 'top left';
    }, scale);

    await page.waitForTimeout(350);
    await page.screenshot({
      path: filePath,
      clip: { x: 0, y: 0, width: cssW, height: cssH },
    });
    console.log(`captured slide ${num} (${cssW}x${cssH} css, dpr ${dpr})`);

    await slides[i].evaluate(el => {
      el.style.display = 'none';
      el.style.position = '';
      el.style.transform = '';
      el.style.transformOrigin = '';
      el.style.zIndex = '';
    });
  }

  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
