const { chromium } = require('playwright');
const path = require('path');

const outputDir = path.resolve(__dirname, 'png');
const url = process.env.CARROSSEL_URL || 'http://127.0.0.1:8123/deliverables/pri-48-carrossel-search-console-social/carrossel.html';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1800 }, deviceScaleFactor: 1 });
  await page.goto(url);
  await page.waitForTimeout(3000);

  const cssW = await page.evaluate(() => window.innerWidth);
  const cssH = await page.evaluate(() => window.innerHeight);
  const scale = cssW / 1080;
  const slides = await page.locator('body > section').all();

  for (let i = 0; i < slides.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    await page.evaluate((index, currentScale) => {
      const nodes = Array.from(document.querySelectorAll('body > section'));
      nodes.forEach((node, nodeIndex) => {
        node.style.display = nodeIndex === index ? 'block' : 'none';
        if (nodeIndex === index) {
          node.style.position = 'fixed';
          node.style.top = '0';
          node.style.left = '0';
          node.style.width = '1080px';
          node.style.height = '1350px';
          node.style.transform = `scale(${currentScale})`;
          node.style.transformOrigin = 'top left';
        }
      });
    }, i, scale);

    await page.screenshot({
      path: path.join(outputDir, `slide_${num}.png`),
      clip: { x: 0, y: 0, width: cssW, height: cssH },
    });
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
