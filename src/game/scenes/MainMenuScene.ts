import Phaser from 'phaser';
import { eventBus, Events } from '../systems/EventBus';
import { progressManager } from '../systems/ProgressManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }
  create(): void {
    this.add.image(480, 270, 'forest-art').setDisplaySize(960, 540);
    for (let i = 0; i < 12; i += 1) {
      const light = this.add.circle(80 + i * 75, 150 + (i % 4) * 68, 2, 0xc08e3a, .5);
      if (!progressManager.settings.reducedMotion) this.tweens.add({ targets: light, y: light.y - 16, alpha: .15, duration: 2100 + i * 130, yoyo: true, repeat: -1 });
    }
    eventBus.emit(Events.SHOW_MENU);
  }
}
