import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload(): void {
    this.load.svg('forest-art', '/assets/art/forest.svg', { width: 1280, height: 720 });
    this.load.svg('candy-art', '/assets/art/candy.svg', { width: 1280, height: 720 });
    this.load.svg('moonlight-art', '/assets/art/moonlight.svg', { width: 1280, height: 720 });
  }

  create(): void {
    this.createTextures();
    this.createAnimations();
    this.scene.start('PreloadScene');
  }

  private createTextures(): void {
    const makeBunny = (key: string, offset = 0, ears = 0): void => {
      const g = this.add.graphics();
      g.fillStyle(0x283618, .12).fillEllipse(35, 81, 46, 7);
      g.lineStyle(1.3, 0xb08b6e);
      g.fillStyle(0xe8dcc7).fillEllipse(21 + ears, 20, 14, 36).strokeEllipse(21 + ears, 20, 14, 36);
      g.fillEllipse(46 - ears, 20, 14, 36).strokeEllipse(46 - ears, 20, 14, 36);
      g.fillStyle(0xc99176).fillEllipse(21 + ears, 20, 6, 26).fillEllipse(46 - ears, 20, 6, 26);
      g.fillStyle(0xd4b895).fillEllipse(35, 67 + offset, 36, 29).strokeEllipse(35, 67 + offset, 36, 29);
      g.fillStyle(0xe8dcc7).fillCircle(55, 67 + offset, 8).strokeCircle(55, 67 + offset, 8);
      g.fillEllipse(23, 79 + offset, 20, 9).strokeEllipse(23, 79 + offset, 20, 9);
      g.fillEllipse(46, 79 + offset, 20, 9).strokeEllipse(46, 79 + offset, 20, 9);
      g.fillEllipse(34, 68 + offset, 21, 19);
      g.fillStyle(0xc66b3d).fillTriangle(46, 57 + offset, 65, 69 + offset, 50, 75 + offset);
      g.fillRoundedRect(15, 55 + offset, 40, 10, 4);
      g.lineStyle(1.5, 0xd4b895).lineBetween(19, 60 + offset, 50, 60 + offset);
      g.lineStyle(1.3, 0xb08b6e);
      g.fillStyle(0xe8dcc7).fillEllipse(34, 45 + offset, 47, 36).strokeEllipse(34, 45 + offset, 47, 36);
      g.fillStyle(0xc99176, .7).fillEllipse(19, 50 + offset, 9, 5).fillEllipse(49, 50 + offset, 9, 5);
      g.fillStyle(0x283618).fillEllipse(26, 44 + offset, 6, 9).fillEllipse(42, 44 + offset, 6, 9);
      g.fillStyle(0xe8dcc7).fillCircle(25, 42 + offset, 1.5).fillCircle(41, 42 + offset, 1.5);
      g.fillStyle(0xc99176).fillTriangle(31, 51 + offset, 37, 51 + offset, 34, 54 + offset);
      g.lineStyle(1.1, 0x80604a).lineBetween(34, 54 + offset, 34, 56 + offset).lineBetween(34, 56 + offset, 31, 57 + offset).lineBetween(34, 56 + offset, 37, 57 + offset);
      g.generateTexture(key, 70, 86); g.destroy();
    };
    makeBunny('bunny-idle-0'); makeBunny('bunny-idle-1', -1, 1); makeBunny('bunny-run-0', 1, -1); makeBunny('bunny-run-1', -1, 2);
    makeBunny('bunny-jump-0', -3, 2); makeBunny('bunny-fall-0', 2, -1); makeBunny('bunny-hurt-0', 1, 2);
    makeBunny('bunny-celebrate-0', -4, 3); makeBunny('bunny-celebrate-1', -7, 0); makeBunny('bunny-respawn-0', 0, 3);

    this.texture('platform', 128, 36, (g) => { g.fillStyle(0x6b4f36).fillRoundedRect(0, 5, 128, 31, 12); g.fillStyle(0x8b9d83).fillRoundedRect(0, 0, 128, 14, 10); g.fillStyle(0xb9c49f).fillCircle(22, 8, 4).fillCircle(83, 7, 3); });
    this.texture('star', 44, 44, (g) => { const points = [{x:22,y:1},{x:28,y:15},{x:43,y:16},{x:31,y:26},{x:35,y:42},{x:22,y:33},{x:9,y:42},{x:13,y:26},{x:1,y:16},{x:16,y:15}]; g.fillStyle(0xc08e3a).fillPoints(points,true); g.lineStyle(1.5,0x9c6c28).strokePoints(points,true); g.fillStyle(0xe8dcc7,.7).fillTriangle(22,5,17,17,7,18); });
    this.texture('gem', 28, 34, (g) => { g.fillStyle(0xc66b3d).fillPoints([{x:14,y:1},{x:27,y:10},{x:23,y:28},{x:14,y:34},{x:5,y:28},{x:1,y:10}],true); g.lineStyle(2,0xe8dcc7,.65).lineBetween(14,2,14,32).lineBetween(1,10,27,10); });
    this.texture('enemy', 54, 48, (g) => { g.fillStyle(0xb08b6e).fillRoundedRect(4,13,46,32,18); g.fillStyle(0xc66b3d).fillEllipse(27,15,52,27); g.fillStyle(0x283618).fillCircle(20,29,3).fillCircle(35,29,3); g.lineStyle(2,0x283618).lineBetween(19,44,14,48).lineBetween(36,44,41,48); });
    this.texture('checkpoint-off', 40, 72, (g) => { g.fillStyle(0x6b4f36).fillRoundedRect(16,22,8,50,4); g.fillStyle(0xb08b6e).fillRoundedRect(4,3,32,32,12); g.fillStyle(0x606c38).fillCircle(20,19,10); });
    this.texture('checkpoint-on', 40, 72, (g) => { g.fillStyle(0x6b4f36).fillRoundedRect(16,22,8,50,4); g.fillStyle(0xc08e3a).fillRoundedRect(4,3,32,32,12); g.fillStyle(0xe8dcc7).fillCircle(20,19,10); });
    this.texture('portal', 82, 118, (g) => { g.lineStyle(12,0xc08e3a,.8).strokeEllipse(41,60,60,102); g.lineStyle(5,0xe8dcc7,.9).strokeEllipse(41,60,43,85); g.fillStyle(0x8b9d83,.55).fillEllipse(41,60,35,76); });
    this.texture('spike', 86, 38, (g) => { g.fillStyle(0xc66b3d).fillTriangle(0,38,14,3,28,38).fillTriangle(24,38,43,1,58,38).fillTriangle(52,38,72,4,86,38); });
    this.texture('spark', 10, 10, (g) => g.fillStyle(0xc08e3a).fillCircle(5,5,5));
  }

  private texture(key: string, width: number, height: number, draw: (graphics: Phaser.GameObjects.Graphics) => void): void {
    const graphics = this.add.graphics(); draw(graphics); graphics.generateTexture(key, width, height); graphics.destroy();
  }

  private createAnimations(): void {
    const animation = (key: string, frames: string[], frameRate: number, repeat = -1): void => { if (!this.anims.exists(`bunny-${key}`)) this.anims.create({ key: `bunny-${key}`, frames: frames.map((frame) => ({ key: frame })), frameRate, repeat }); };
    animation('idle', ['bunny-idle-0','bunny-idle-1'], 2); animation('run', ['bunny-run-0','bunny-run-1'], 9);
    animation('jump', ['bunny-jump-0'], 1, 0); animation('fall', ['bunny-fall-0'], 1, 0); animation('hurt', ['bunny-hurt-0'], 1, 0);
    animation('celebrate', ['bunny-celebrate-0','bunny-celebrate-1'], 5); animation('respawn', ['bunny-respawn-0','bunny-idle-0'], 4, 0);
  }
}
