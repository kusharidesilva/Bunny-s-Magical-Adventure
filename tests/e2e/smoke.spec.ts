import { expect, test } from '@playwright/test';

test('loads the game menu and starts the first level', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: "Bunny's Magical Adventure" })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.locator('#game-canvas canvas')).toBeVisible();
  await expect(page.getByText('Stars 0 / 3')).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(page.locator('#hud-hearts')).toHaveText('Hearts 3');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Take a breather' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByText('Stars 0 / 3')).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test('level selection remains usable at a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Level Select' }).click();
  await expect(page.getByRole('heading', { name: 'Where will you hop next?' })).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
});

test('fullscreen button enters and exits an edge-to-edge mobile fallback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, 'requestFullscreen', { configurable: true, value: undefined });
    Object.defineProperty(Element.prototype, 'webkitRequestFullscreen', { configurable: true, value: undefined });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter fullscreen' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-fullscreen', 'fallback');
  await expect(page.getByRole('button', { name: 'Exit fullscreen' })).toHaveAttribute('aria-pressed', 'true');
  const frame = await page.locator('.game-frame').boundingBox();
  expect(frame?.x).toBe(0); expect(frame?.y).toBe(0);
  expect(Math.round(frame?.width ?? 0)).toBe(page.viewportSize()?.width);
  await page.keyboard.press('Escape');
  await expect(page.locator('#app')).not.toHaveAttribute('data-fullscreen');
  await expect(page.getByRole('button', { name: 'Enter fullscreen' })).toHaveAttribute('aria-pressed', 'false');
});

test('illustrated world previews and toolbar preferences work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Mute audio', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Enable audio', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Enable audio', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByLabel('Music', { exact: true })).not.toBeChecked();
  await page.getByLabel('Reduced motion', { exact: true }).check();
  await expect(page.locator('#app')).toHaveAttribute('data-reduced-motion', 'true');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.locator('.preview-world[data-value="1"]').click();
  await expect(page.getByRole('heading', { name: 'Choose a level' })).toBeVisible();
});

test('double jump boosts height and learned hints stay dismissed', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.locator('#tutorial-hint')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(80);
  await page.keyboard.up('ArrowRight');
  await page.evaluate(() => {
    const scene = (window as any).__bunnyGame.scene.getScene('GameScene');
    scene.bunny.body.reset(370, 603); scene.bunny.setVelocity(0);
  });
  await page.waitForTimeout(100);
  await expect(page.locator('#tutorial-hint')).toContainText('Jump');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(150);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(60);
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(60);
  const velocity = await page.evaluate(() => (window as any).__bunnyGame.scene.getScene('GameScene').bunny.body.velocity.y);
  expect(velocity).toBeLessThan(-400);
  await expect(page.locator('#tutorial-hint')).toBeHidden();
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(50);
  const beforeThird = await page.evaluate(() => (window as any).__bunnyGame.scene.getScene('GameScene').bunny.body.velocity.y);
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(50);
  const thirdVelocity = await page.evaluate(() => (window as any).__bunnyGame.scene.getScene('GameScene').bunny.body.velocity.y);
  expect(thirdVelocity).toBeGreaterThan(beforeThird);
  await page.keyboard.up('ArrowUp');
  await page.reload();
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.locator('#tutorial-hint')).toBeHidden();
});

test('a quick double tap reaches the tallest ledge', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.evaluate(() => (window as any).__bunnyGame.scene.getScene('GameScene').scene.restart({ levelId: 6 }));
  await expect(page.locator('#hud-level')).toContainText('The Moonlight Wish');
  await page.evaluate(() => {
    const scene = (window as any).__bunnyGame.scene.getScene('GameScene');
    scene.bunny.body.reset(4500, 603); scene.bunny.setVelocity(0);
  });
  await page.waitForTimeout(150);
  await page.keyboard.down('ArrowRight');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(50);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(50);
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(50);
  await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => (window as any).__bunnyGame.scene.getScene('GameScene').bunny.x >= 4660);
  await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => {
    const body = (window as any).__bunnyGame.scene.getScene('GameScene').bunny.body;
    return body.blocked.down && body.bottom < 400;
  }, undefined, { timeout: 6000 });
  await expect(page.locator('#hud-hearts')).toHaveText('Hearts 3');
});
