import type { LevelId, SaveData } from '../types/game';

export const clampStars = (stars: number): number => Math.max(0, Math.min(3, Math.floor(stars)));
export const totalStars = (save: SaveData): number => Object.values(save.levels).reduce((sum, level) => sum + level.bestStars, 0);
export const totalBestGems = (save: SaveData): number => Object.values(save.levels).reduce((sum, level) => sum + level.bestGems, 0);
export const completedLevels = (save: SaveData): number => Object.values(save.levels).filter((level) => level.completed).length;
export const worldUnlocked = (worldId: number, save: SaveData): boolean => worldId === 1 || save.unlockedLevel >= ((worldId - 1) * 2 + 1);
export const levelUnlocked = (levelId: LevelId, save: SaveData): boolean => levelId <= save.unlockedLevel;
