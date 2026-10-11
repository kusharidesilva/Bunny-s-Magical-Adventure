import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { FinalVictoryScene, GameOverScene, LevelCompleteScene, LevelSelectScene, PauseScene, WorldSelectScene } from './scenes/BridgeScenes';
import { GameScene } from './scenes/GameScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { PreloadScene } from './scenes/PreloadScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-canvas',
  width: 960,
  height: 540,
  backgroundColor: '#8b9d83',
  render: { antialias: true, pixelArt: false, roundPixels: false, powerPreference: 'high-performance' },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 960, height: 540 },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 1450 }, debug: false, fps: 60 } },
  scene: [BootScene, PreloadScene, MainMenuScene, WorldSelectScene, LevelSelectScene, GameScene, PauseScene, GameOverScene, LevelCompleteScene, FinalVictoryScene],
  input: { activePointers: 4 },
  audio: { disableWebAudio: false },
  disableContextMenu: true,
};
