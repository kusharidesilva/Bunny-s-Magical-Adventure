import Phaser from 'phaser';
import { eventBus, Events } from '../systems/EventBus';

abstract class BridgeScene extends Phaser.Scene {
  protected abstract eventName: string;
  create(data?: unknown): void { eventBus.emit(this.eventName, data); }
}
export class WorldSelectScene extends BridgeScene { protected eventName = Events.SHOW_WORLDS; constructor() { super('WorldSelectScene'); } }
export class LevelSelectScene extends BridgeScene { protected eventName = Events.SHOW_LEVELS; constructor() { super('LevelSelectScene'); } }
export class PauseScene extends BridgeScene { protected eventName = Events.SHOW_PAUSE; constructor() { super('PauseScene'); } }
export class GameOverScene extends BridgeScene { protected eventName = Events.SHOW_GAME_OVER; constructor() { super('GameOverScene'); } }
export class LevelCompleteScene extends BridgeScene { protected eventName = Events.SHOW_COMPLETE; constructor() { super('LevelCompleteScene'); } }
export class FinalVictoryScene extends BridgeScene { protected eventName = Events.SHOW_VICTORY; constructor() { super('FinalVictoryScene'); } }
