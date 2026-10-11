import Phaser from 'phaser';
import type { WorldId } from '../types/game';

/** Decorative terrain uses world units, so long ground pieces never stretch artwork. */
export function platformArt(scene: Phaser.Scene, width: number, height: number, world: WorldId): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(8);
  const top = -height / 2;
  const soil = world === 2 ? 0x80604a : world === 3 ? 0x3e4f2b : 0x80674d;
  const grass = world === 2 ? 0xd4b895 : world === 3 ? 0x8b9d83 : 0x718e4e;
  g.fillStyle(soil).fillRoundedRect(-width / 2, top, width, height, Math.min(14, height / 3));
  g.fillStyle(grass).fillRoundedRect(-width / 2, top - 2, width, 13, 7);
  g.lineStyle(2, world === 2 ? 0xe8dcc7 : 0xb0be9c, .65).lineBetween(-width / 2 + 10, top + 2, width / 2 - 10, top + 2);
  for (let x = -width / 2 + 16; x < width / 2 - 10; x += 42) {
    if (world !== 2) {
      g.lineStyle(2, grass).lineBetween(x, top + 1, x - 5, top - 7).lineBetween(x, top + 1, x + 4, top - 10);
    } else {
      g.fillStyle(0xe8dcc7, .4).fillRoundedRect(x, top + 6, 6, 13, 3);
    }
    g.fillStyle(0xd4b895, .18).fillEllipse(x + 6, top + 24, 7, 3);
  }
  return g;
}

export function gardenDecoration(scene: Phaser.Scene, x: number, y: number, world: WorldId): void {
  const g = scene.add.graphics({ x, y }).setDepth(7);
  const accent = world === 3 ? 0xc08e3a : 0xc66b3d;
  g.lineStyle(2, 0x606c38).lineBetween(0, 0, 0, -24);
  g.fillStyle(0x606c38).fillEllipse(-5, -11, 12, 6).fillEllipse(6, -17, 12, 6);
  for (let i = 0; i < 5; i += 1) {
    const a = i * Math.PI * 2 / 5;
    g.fillStyle(world === 3 ? 0x8b9d83 : 0xd4b895).fillCircle(Math.cos(a) * 6, -26 + Math.sin(a) * 6, 4);
  }
  g.fillStyle(accent).fillCircle(0, -26, 3);
  if (world === 1) {
    g.fillStyle(0xd4b895).fillRoundedRect(34, -26, 10, 26, 4);
    g.fillStyle(0xc66b3d).fillEllipse(39, -28, 35, 22);
    g.fillStyle(0xe8dcc7).fillEllipse(34, -31, 7, 4).fillCircle(47, -27, 3);
  } else if (world === 2) {
    g.lineStyle(5, 0xe8dcc7).lineBetween(38, 0, 38, -50);
    g.fillStyle(0xc99176).fillCircle(38, -57, 21);
    g.lineStyle(3, 0xe8dcc7).strokeCircle(38, -57, 14).strokeCircle(38, -57, 7);
  } else {
    g.fillStyle(0x8b9d83).fillTriangle(40, -45, 25, -7, 50, -7);
    g.lineStyle(1.5, 0xd4b895).lineBetween(40, -45, 36, -7);
  }
}
