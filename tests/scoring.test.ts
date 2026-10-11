import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDefaultSave, isValidSave, ProgressManager } from '../src/game/systems/ProgressManager';
import { clampStars, completedLevels, levelUnlocked, totalBestGems, totalStars, worldUnlocked } from '../src/game/utils/scoring';

describe('progress and scoring', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('clamps star ratings to the valid range', () => {
    expect(clampStars(-2)).toBe(0); expect(clampStars(2.9)).toBe(2); expect(clampStars(9)).toBe(3);
  });

  it('starts with only the first level and world unlocked', () => {
    const save = createDefaultSave();
    expect(levelUnlocked(1, save)).toBe(true); expect(levelUnlocked(2, save)).toBe(false);
    expect(worldUnlocked(1, save)).toBe(true); expect(worldUnlocked(2, save)).toBe(false);
  });

  it('calculates totals from best results', () => {
    const save = createDefaultSave();
    save.levels[1] = { completed: true, bestStars: 3, bestGems: 70 };
    save.levels[2] = { completed: true, bestStars: 2, bestGems: 50 };
    expect(totalStars(save)).toBe(5); expect(totalBestGems(save)).toBe(120); expect(completedLevels(save)).toBe(2);
  });

  it('rejects corrupt save shapes', () => {
    expect(isValidSave(null)).toBe(false); expect(isValidSave({ version: 99 })).toBe(false); expect(isValidSave(createDefaultSave())).toBe(true);
  });

  it('keeps learned hints dismissed across reloads and migrates existing saves', () => {
    const oldSave = createDefaultSave();
    const { tutorials: _tutorials, ...legacy } = oldSave;
    let stored = JSON.stringify(legacy);
    vi.stubGlobal('localStorage', { getItem: () => stored, setItem: (_key: string, value: string) => { stored = value; } });
    const progress = new ProgressManager();
    expect(progress.hasLearned('doubleJump')).toBe(false);
    progress.learn('doubleJump');
    expect(new ProgressManager().hasLearned('doubleJump')).toBe(true);
    expect(new ProgressManager().hasLearned('jump')).toBe(false);
    progress.reset();
    expect(new ProgressManager().hasLearned('doubleJump')).toBe(false);
  });
});
