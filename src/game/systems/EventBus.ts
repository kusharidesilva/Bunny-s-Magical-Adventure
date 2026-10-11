import Phaser from 'phaser';

export const eventBus = new Phaser.Events.EventEmitter();

export const Events = {
  SHOW_MENU: 'ui:show-menu',
  SHOW_WORLDS: 'ui:show-worlds',
  SHOW_LEVELS: 'ui:show-levels',
  SHOW_SETTINGS: 'ui:show-settings',
  SHOW_HELP: 'ui:show-help',
  SHOW_PAUSE: 'ui:show-pause',
  SHOW_GAME_OVER: 'ui:show-game-over',
  SHOW_COMPLETE: 'ui:show-complete',
  SHOW_VICTORY: 'ui:show-victory',
  HIDE_OVERLAYS: 'ui:hide-overlays',
  HUD: 'game:hud',
  TUTORIAL: 'game:tutorial',
  START_LEVEL: 'game:start-level',
  PAUSE: 'game:pause',
  RESUME: 'game:resume',
  RESTART: 'game:restart',
  INPUT: 'game:input',
  SETTINGS_CHANGED: 'settings:changed',
} as const;
