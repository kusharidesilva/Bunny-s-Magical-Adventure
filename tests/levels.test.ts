import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels/levelData';

describe('level definitions', () => {
  it('contains six complete levels across three worlds', () => {
    expect(LEVELS).toHaveLength(6); expect(new Set(LEVELS.map((level) => level.worldId))).toEqual(new Set([1, 2, 3]));
  });

  it.each(LEVELS)('$name has a valid route contract', (level) => {
    expect(level.width).toBeGreaterThan(3500);
    expect(level.portal.x).toBeGreaterThan(level.spawn.x);
    expect(level.collectibles.filter((item) => item.type === 'star')).toHaveLength(3);
    expect(level.platforms.length).toBeGreaterThan(5);
  });
});
