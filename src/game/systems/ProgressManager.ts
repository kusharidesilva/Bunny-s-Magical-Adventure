import type { GameSettings, LevelId, SaveData, TutorialAction } from '../types/game';
import { clampStars } from '../utils/scoring';

const STORAGE_KEY = 'bunny-magical-adventure:v1';

const defaultSettings: GameSettings = {
  musicEnabled: true,
  musicVolume: 0.22,
  effectsEnabled: true,
  effectsVolume: 0.45,
  reducedMotion: typeof window !== 'undefined' ? (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false) : false,
  showTouchControls: true,
};

const defaultLevels = (): SaveData['levels'] => ({
  1: { completed: false, bestStars: 0, bestGems: 0 }, 2: { completed: false, bestStars: 0, bestGems: 0 },
  3: { completed: false, bestStars: 0, bestGems: 0 }, 4: { completed: false, bestStars: 0, bestGems: 0 },
  5: { completed: false, bestStars: 0, bestGems: 0 }, 6: { completed: false, bestStars: 0, bestGems: 0 },
});

export const createDefaultSave = (): SaveData => ({ version: 1, unlockedLevel: 1, levels: defaultLevels(), settings: { ...defaultSettings }, tutorials: { move: false, jump: false, doubleJump: false } });

export const isValidSave = (value: unknown): value is SaveData => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SaveData>;
  return candidate.version === 1 && typeof candidate.unlockedLevel === 'number' && candidate.unlockedLevel >= 1 && candidate.unlockedLevel <= 6 &&
    !!candidate.levels && typeof candidate.levels === 'object' && !!candidate.settings && typeof candidate.settings === 'object';
};

export class ProgressManager {
  private saveData: SaveData;

  constructor() { this.saveData = this.load(); }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultSave();
      const parsed: unknown = JSON.parse(raw);
      if (!isValidSave(parsed)) return createDefaultSave();
      const defaults = createDefaultSave();
      return {
        ...defaults,
        ...parsed,
        settings: { ...defaults.settings, ...parsed.settings },
        levels: { ...defaults.levels, ...parsed.levels },
        tutorials: {
          move: parsed.tutorials?.move === true,
          jump: parsed.tutorials?.jump === true,
          doubleJump: parsed.tutorials?.doubleJump === true,
        },
      };
    } catch { return createDefaultSave(); }
  }

  private persist(): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.saveData)); } catch { /* Storage can be disabled. */ }
  }

  get data(): SaveData { return structuredClone(this.saveData); }
  get settings(): GameSettings { return { ...this.saveData.settings }; }
  get hasProgress(): boolean { return Object.values(this.saveData.levels).some((level) => level.completed); }
  hasLearned(action: TutorialAction): boolean { return this.saveData.tutorials[action]; }
  learn(action: TutorialAction): void {
    if (this.hasLearned(action)) return;
    this.saveData.tutorials[action] = true; this.persist();
  }

  completeLevel(levelId: LevelId, stars: number, gems: number): { isBest: boolean } {
    const result = this.saveData.levels[levelId];
    const safeStars = clampStars(stars);
    const isBest = safeStars > result.bestStars || gems > result.bestGems;
    result.completed = true;
    result.bestStars = Math.max(result.bestStars, safeStars);
    result.bestGems = Math.max(result.bestGems, Math.max(0, Math.floor(gems)));
    if (levelId < 6) this.saveData.unlockedLevel = Math.max(this.saveData.unlockedLevel, (levelId + 1) as LevelId) as LevelId;
    this.persist();
    return { isBest };
  }

  updateSettings(settings: Partial<GameSettings>): void {
    this.saveData.settings = {
      ...this.saveData.settings,
      ...settings,
      musicVolume: Math.max(0, Math.min(1, settings.musicVolume ?? this.saveData.settings.musicVolume)),
      effectsVolume: Math.max(0, Math.min(1, settings.effectsVolume ?? this.saveData.settings.effectsVolume)),
    };
    this.persist();
  }

  reset(): void { this.saveData = createDefaultSave(); this.persist(); }
}

export const progressManager = new ProgressManager();
