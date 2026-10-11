import type { CollectibleData, LevelData, LevelId, PlatformData } from '../types/game';

const floor = (width: number, gaps: Array<[number, number]> = []): PlatformData[] => {
  const sorted = [...gaps].sort((a, b) => a[0] - b[0]);
  const pieces: PlatformData[] = [];
  let cursor = 0;
  for (const [start, end] of sorted) {
    if (start > cursor) pieces.push({ x: cursor + (start - cursor) / 2, y: 680, width: start - cursor, height: 80 });
    cursor = end;
  }
  if (cursor < width) pieces.push({ x: cursor + (width - cursor) / 2, y: 680, width: width - cursor, height: 80 });
  return pieces;
};

const gemTrail = (start: number, count: number, y = 560, spacing = 120): CollectibleData[] =>
  Array.from({ length: count }, (_, index) => ({ x: start + index * spacing, y: y - Math.sin(index * 0.9) * 55, type: 'gem' as const, value: 10 }));

export const LEVELS: readonly LevelData[] = [
  {
    id: 1, worldId: 1, name: 'The First Hop', width: 3900, spawn: { x: 130, y: 560 },
    platforms: [...floor(3900, [[900, 1040], [1940, 2100], [3000, 3170]]),
      { x: 570, y: 545, width: 230 }, { x: 970, y: 570, width: 150 }, { x: 1410, y: 500, width: 240 },
      { x: 2020, y: 545, width: 145 }, { x: 2510, y: 470, width: 260 }, { x: 3090, y: 535, width: 150 }],
    collectibles: [...gemTrail(300, 10), { x: 600, y: 470, type: 'star' }, { x: 1450, y: 420, type: 'star' }, { x: 2550, y: 390, type: 'star' }],
    enemies: [{ x: 1680, y: 605, range: 190, speed: 55 }], hazards: [], checkpoints: [{ x: 2180, y: 580 }], portal: { x: 3720, y: 570 },
  },
  {
    id: 2, worldId: 1, name: 'Whispering Woods', width: 4600, spawn: { x: 130, y: 560 },
    platforms: [...floor(4600, [[760, 930], [1510, 1710], [2460, 2660], [3460, 3670]]),
      { x: 845, y: 555, width: 150, moving: { axis: 'y', distance: 105, duration: 1800 } }, { x: 1605, y: 520, width: 170 },
      { x: 2140, y: 430, width: 230 }, { x: 2560, y: 525, width: 160, moving: { axis: 'x', distance: 90, duration: 2000 } },
      { x: 3060, y: 475, width: 240 }, { x: 3560, y: 520, width: 160 }],
    collectibles: [...gemTrail(300, 14, 555, 135), { x: 875, y: 430, type: 'star' }, { x: 2140, y: 350, type: 'star' }, { x: 3090, y: 395, type: 'star' }],
    enemies: [{ x: 1200, y: 605, range: 210, speed: 65 }, { x: 2880, y: 605, range: 160, speed: 70 }],
    hazards: [{ x: 2330, y: 625, width: 90 }], checkpoints: [{ x: 2300, y: 570 }], portal: { x: 4400, y: 570 },
  },
  {
    id: 3, worldId: 2, name: 'Sugar Rush', width: 4800, spawn: { x: 130, y: 560 },
    platforms: [...floor(4800, [[630, 800], [1300, 1490], [2250, 2460], [3250, 3460], [4060, 4250]]),
      { x: 710, y: 555, width: 150 }, { x: 1385, y: 525, width: 160, moving: { axis: 'y', distance: 135, duration: 1500 } },
      { x: 1900, y: 445, width: 250 }, { x: 2355, y: 520, width: 160 }, { x: 2900, y: 400, width: 220 },
      { x: 3350, y: 535, width: 170 }, { x: 4150, y: 535, width: 160 }],
    collectibles: [...gemTrail(270, 15, 550, 140), { x: 710, y: 465, type: 'star' }, { x: 1900, y: 365, type: 'star' }, { x: 2900, y: 320, type: 'star' }],
    enemies: [{ x: 1030, y: 605, range: 150, speed: 80 }, { x: 3650, y: 605, range: 200, speed: 90 }],
    hazards: [{ x: 2130, y: 625, width: 100 }], checkpoints: [{ x: 2500, y: 570 }], portal: { x: 4620, y: 570 },
  },
  {
    id: 4, worldId: 2, name: 'The Jellybean Trail', width: 5200, spawn: { x: 130, y: 560 },
    platforms: [...floor(5200, [[720, 920], [1480, 1700], [2420, 2670], [3520, 3770], [4450, 4680]]),
      { x: 810, y: 535, width: 160, moving: { axis: 'x', distance: 90, duration: 1500 } }, { x: 1580, y: 515, width: 160, moving: { axis: 'y', distance: 130, duration: 1700 } },
      { x: 2080, y: 400, width: 220 }, { x: 2540, y: 535, width: 180 }, { x: 3100, y: 450, width: 210, moving: { axis: 'x', distance: 110, duration: 1900 } },
      { x: 3635, y: 520, width: 180 }, { x: 4550, y: 525, width: 190 }],
    collectibles: [...gemTrail(280, 17, 545, 140), { x: 820, y: 420, type: 'star' }, { x: 2080, y: 320, type: 'star' }, { x: 3100, y: 355, type: 'star' }],
    enemies: [{ x: 1120, y: 605, range: 170, speed: 88 }, { x: 3920, y: 605, range: 190, speed: 96 }],
    hazards: [{ x: 2300, y: 625, width: 100 }, { x: 4270, y: 625, width: 100 }], checkpoints: [{ x: 2760, y: 570 }], portal: { x: 5020, y: 570 },
  },
  {
    id: 5, worldId: 3, name: 'Starlight Path', width: 5500, spawn: { x: 130, y: 560 },
    platforms: [...floor(5500, [[580, 790], [1230, 1470], [1980, 2230], [2870, 3140], [3900, 4160], [4720, 4930]]),
      { x: 680, y: 530, width: 170 }, { x: 1340, y: 500, width: 180, moving: { axis: 'y', distance: 150, duration: 2100 } },
      { x: 2100, y: 505, width: 180, moving: { axis: 'x', distance: 120, duration: 1900 } }, { x: 2570, y: 390, width: 230 },
      { x: 3000, y: 500, width: 190 }, { x: 3550, y: 420, width: 230 }, { x: 4030, y: 510, width: 180 }, { x: 4820, y: 520, width: 190 }],
    collectibles: [...gemTrail(270, 18, 545, 145), { x: 690, y: 440, type: 'star' }, { x: 2570, y: 310, type: 'star' }, { x: 3550, y: 340, type: 'star' }],
    enemies: [{ x: 970, y: 605, range: 160, speed: 90 }, { x: 3330, y: 605, range: 170, speed: 100 }, { x: 4430, y: 605, range: 170, speed: 105 }],
    hazards: [{ x: 1800, y: 625, width: 110 }, { x: 3760, y: 625, width: 100 }], checkpoints: [{ x: 2760, y: 570 }], portal: { x: 5320, y: 570 },
  },
  {
    id: 6, worldId: 3, name: 'The Moonlight Wish', width: 6200, spawn: { x: 130, y: 560 },
    platforms: [...floor(6200, [[650, 880], [1330, 1580], [2140, 2400], [3010, 3290], [4100, 4380], [5150, 5400]]),
      { x: 755, y: 530, width: 170, moving: { axis: 'y', distance: 130, duration: 1800 } }, { x: 1450, y: 510, width: 185 },
      { x: 2250, y: 495, width: 190, moving: { axis: 'x', distance: 125, duration: 1700 } }, { x: 2730, y: 375, width: 230 },
      { x: 3150, y: 495, width: 200 }, { x: 3700, y: 390, width: 230, moving: { axis: 'y', distance: 90, duration: 2000 } },
      { x: 4240, y: 500, width: 200 }, { x: 4740, y: 365, width: 230 }, { x: 5270, y: 505, width: 200 }],
    collectibles: [...gemTrail(270, 20, 545, 145), { x: 760, y: 420, type: 'star' }, { x: 2730, y: 295, type: 'star' }, { x: 4740, y: 285, type: 'star' }],
    enemies: [{ x: 1070, y: 605, range: 170, speed: 95 }, { x: 3450, y: 605, range: 180, speed: 105 }, { x: 5700, y: 605, range: 170, speed: 110 }],
    hazards: [{ x: 1880, y: 625, width: 110 }, { x: 3920, y: 625, width: 100 }, { x: 4950, y: 625, width: 110 }], checkpoints: [{ x: 2920, y: 570 }, { x: 5000, y: 570 }], portal: { x: 6020, y: 565 },
  },
];

export const getLevel = (id: number): LevelData => LEVELS.find((level) => level.id === id) ?? LEVELS[0];
export const levelExists = (id: number): id is LevelId => Number.isInteger(id) && id >= 1 && id <= 6;
