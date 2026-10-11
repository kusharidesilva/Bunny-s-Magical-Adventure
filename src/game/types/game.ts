export type WorldId = 1 | 2 | 3;
export type LevelId = 1 | 2 | 3 | 4 | 5 | 6;
export type TutorialAction = 'move' | 'jump' | 'doubleJump';

export interface Point { x: number; y: number }
export interface PlatformData extends Point { width: number; height?: number; moving?: { axis: 'x' | 'y'; distance: number; duration: number } }
export interface CollectibleData extends Point { type: 'star' | 'gem'; value?: number }
export interface EnemyData extends Point { range: number; speed: number }
export interface HazardData extends Point { width: number }
export interface LevelData {
  id: LevelId;
  worldId: WorldId;
  name: string;
  width: number;
  spawn: Point;
  platforms: PlatformData[];
  collectibles: CollectibleData[];
  enemies: EnemyData[];
  hazards: HazardData[];
  checkpoints: Point[];
  portal: Point;
  tutorial?: string[];
}

export interface WorldData {
  id: WorldId;
  name: string;
  description: string;
  levels: [LevelId, LevelId];
  colors: { sky: number; far: number; mid: number; near: number; ground: number; accent: number };
}

export interface AudioSettings {
  musicEnabled: boolean;
  musicVolume: number;
  effectsEnabled: boolean;
  effectsVolume: number;
}

export interface GameSettings extends AudioSettings {
  reducedMotion: boolean;
  showTouchControls: boolean;
}

export interface LevelResult {
  completed: boolean;
  bestStars: number;
  bestGems: number;
}

export interface SaveData {
  version: 1;
  unlockedLevel: LevelId;
  levels: Record<LevelId, LevelResult>;
  settings: GameSettings;
  tutorials: Record<TutorialAction, boolean>;
}

export interface HudState {
  levelId: LevelId;
  worldName: string;
  levelName: string;
  stars: number;
  gems: number;
  hearts: number;
}

export interface LevelCompletePayload { levelId: LevelId; stars: number; gems: number; isBest: boolean }
