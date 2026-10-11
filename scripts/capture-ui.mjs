import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const failures = [];
try {
  for (const [label, width, height, mobile] of [
    ['desktop', 1440, 1000, false],
    ['mobile', 390, 844, true],
    ['small-mobile', 320, 740, true],
    ['tablet', 768, 1024, true],
    ['landscape-mobile', 844, 390, true],
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
    page.on('pageerror', (error) => failures.push(error.message));
    await page.goto('http://127.0.0.1:5173');
    await page.locator('#game-title').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `docs/screenshots/menu-${label}.png`, fullPage: true });
    const layout = await page.evaluate(() => {
      const links = document.querySelector('.menu-links').getBoundingClientRect();
      const previews = document.querySelector('.world-preview').getBoundingClientRect();
      const play = document.querySelector('[data-action="play"]').getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        menuOverlap: links.bottom > previews.top,
        playVisible: play.top >= 0 && play.bottom <= window.innerHeight,
      };
    });
    console.log(label, JSON.stringify(layout));
    if (layout.overflow || layout.menuOverlap) failures.push(`${label}: layout overlap or overflow`);
    await page.locator('[data-action="worlds"]').first().click();
    await page.screenshot({ path: `docs/screenshots/worlds-${label}.png`, fullPage: true });
    await page.locator('[data-action="menu"]').first().click();
    await page.locator('[data-action="play"]').click();
    await page.waitForTimeout(700);
    const state = await page.evaluate(() => {
      const game = window.__bunnyGame;
      const scene = game.scene.getScene('GameScene');
      return {
        hearts: scene.hearts,
        bunny: { x: scene.bunny.x, y: scene.bunny.y, bodyX: scene.bunny.body.x, bodyY: scene.bunny.body.y, grounded: scene.bunny.body.blocked.down, vx: scene.bunny.body.velocity.x, vy: scene.bunny.body.velocity.y },
        canvas: game.canvas.getBoundingClientRect().toJSON(),
      };
    });
    console.log(label, 'game', JSON.stringify(state));
    if (state.hearts < 3) failures.push(`${label}: health lost before any player input`);
    await page.screenshot({ path: `docs/screenshots/game-${label}.png`, fullPage: true });
    await page.close();
  }
  console.log('Runtime/layout issues:', JSON.stringify(failures));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}
