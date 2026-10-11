import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }
  create(): void {
    this.cameras.main.setBackgroundColor(0x8b9d83);
    const title = this.add.text(480, 215, "Bunny's Magical Adventure", { fontFamily: 'Georgia', fontSize: '46px', color: '#283618', fontStyle: 'bold' }).setOrigin(.5);
    this.add.image(480, 330, 'bunny-idle-0').setScale(1.35);
    const track = this.add.rectangle(480, 430, 360, 18, 0xe8dcc7).setStrokeStyle(3, 0x283618);
    const fill = this.add.rectangle(304, 430, 0, 12, 0xc66b3d).setOrigin(0,.5);
    const percent = this.add.text(480, 465, '0%', { fontFamily: 'Epilogue, sans-serif', fontSize: '18px', color: '#283618' }).setOrigin(.5);
    this.tweens.add({ targets: fill, displayWidth: 352, duration: 650, ease: 'Sine.easeInOut', onUpdate: (tween) => percent.setText(`${Math.round(tween.progress * 100)}%`), onComplete: () => this.time.delayedCall(120, () => this.scene.start('MainMenuScene')) });
    track.setDepth(1); fill.setDepth(2); title.setDepth(1);
  }
}
