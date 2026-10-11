import Phaser from 'phaser';
import { Bunny } from '../entities/Bunny';
import { getLevel } from '../levels/levelData';
import { getWorld } from '../levels/worldData';
import { audioManager } from '../systems/AudioManager';
import { eventBus, Events } from '../systems/EventBus';
import { InputManager } from '../systems/InputManager';
import { progressManager } from '../systems/ProgressManager';
import type { HudState, LevelCompletePayload, LevelData, LevelId, Point } from '../types/game';
import { gardenDecoration, platformArt } from '../utils/scenery';

interface EnemySprite extends Phaser.Physics.Arcade.Sprite { patrolStart: number; patrolRange: number; patrolSpeed: number }

export class GameScene extends Phaser.Scene {
  private level!: LevelData;
  private bunny!: Bunny;
  private inputManager!: InputManager;
  private stars = 0;
  private gems = 0;
  private hearts = 3;
  private checkpoint!: Point;
  private ending = false;
  private tutorialCopy = '';
  private enemies!: Phaser.Physics.Arcade.Group;
  private pauseKeys!: Phaser.Input.Keyboard.Key[];
  private readonly pauseListener = (): void => this.pauseGame();
  private readonly resumeListener = (): void => this.resumeGame();
  private readonly restartListener = (): void => { this.scene.restart({ levelId: this.level.id }); };

  constructor() { super('GameScene'); }

  init(data: { levelId?: LevelId }): void {
    this.level = getLevel(data.levelId ?? 1);
    this.stars = 0; this.gems = 0; this.hearts = 3; this.ending = false;
    this.tutorialCopy = '';
    this.checkpoint = { ...this.level.spawn };
  }

  create(): void {
    const world = getWorld(this.level.worldId);
    this.physics.world.setBounds(0, 0, this.level.width, 760);
    this.cameras.main.setBounds(0, 0, this.level.width, 720).setBackgroundColor(world.colors.sky);
    this.createParallax();
    const staticPlatforms = this.physics.add.staticGroup();
    const movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const data of this.level.platforms) {
      const platform = data.moving ? movingPlatforms.create(data.x, data.y, 'platform') as Phaser.Physics.Arcade.Image : staticPlatforms.create(data.x, data.y, 'platform') as Phaser.Physics.Arcade.Image;
      platform.setDisplaySize(data.width, data.height ?? 36).setDepth(8);
      platform.setVisible(false);
      const artwork = platformArt(this, data.width, data.height ?? 36, this.level.worldId).setPosition(data.x, data.y);
      if (data.moving) {
        (platform.body as Phaser.Physics.Arcade.Body).setAllowGravity(false).setImmovable(true);
        this.tweens.add({ targets: platform, [data.moving.axis]: platform[data.moving.axis] + data.moving.distance, duration: data.moving.duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onUpdate: () => artwork.setPosition(platform.x, platform.y) });
      } else platform.refreshBody();
    }

    this.bunny = new Bunny(this, this.level.spawn.x, this.level.spawn.y, (kind) => {
      progressManager.learn('jump');
      if (kind === 'air') { progressManager.learn('doubleJump'); this.burst(this.bunny.x, this.bunny.y + 20, 0xc08e3a, 6); }
      this.updateTutorial();
    });
    this.inputManager = new InputManager(this);
    this.physics.add.collider(this.bunny, staticPlatforms);
    this.physics.add.collider(this.bunny, movingPlatforms);
    this.createCollectibles();
    this.createEnemies(staticPlatforms, movingPlatforms);
    this.createHazards();
    this.createCheckpoints();
    this.createPortal();

    const camera = this.cameras.main;
    camera.startFollow(this.bunny, true, .09, .12, -110, 50);
    camera.setDeadzone(220, 140).setLerp(.09, .12);
    audioManager.startMusic(this.level.worldId);
    eventBus.emit(Events.HIDE_OVERLAYS);
    this.updateTutorial();
    this.emitHud();

    const keyboard = this.input.keyboard;
    this.pauseKeys = keyboard ? [keyboard.addKey('ESC'), keyboard.addKey('P')] : [];
    this.pauseKeys.forEach((key) => key.on('down', this.pauseListener));
    eventBus.on(Events.PAUSE, this.pauseListener);
    eventBus.on(Events.RESUME, this.resumeListener);
    eventBus.on(Events.RESTART, this.restartListener);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  update(): void {
    if (this.ending) return;
    this.inputManager.update();
    if (this.inputManager.horizontal) progressManager.learn('move');
    this.bunny.update(this.inputManager, progressManager.settings.reducedMotion);
    this.updateTutorial();
    const body = this.bunny.body as Phaser.Physics.Arcade.Body;
    const targetOffset = body.velocity.x === 0 ? -90 : (body.velocity.x > 0 ? -140 : -40);
    this.cameras.main.followOffset.x = Phaser.Math.Linear(this.cameras.main.followOffset.x, targetOffset, .025);
    for (const child of this.enemies.getChildren()) {
      const enemy = child as EnemySprite;
      if (enemy.x <= enemy.patrolStart - enemy.patrolRange) enemy.setVelocityX(enemy.patrolSpeed).setFlipX(false);
      else if (enemy.x >= enemy.patrolStart + enemy.patrolRange) enemy.setVelocityX(-enemy.patrolSpeed).setFlipX(true);
    }
    if (this.bunny.y > 745) this.damageAndRespawn();
  }

  private createParallax(): void {
    const colors = getWorld(this.level.worldId).colors;
    const art = this.level.worldId === 2 ? 'candy-art' : this.level.worldId === 3 ? 'moonlight-art' : 'forest-art';
    this.add.image(640, 360, art).setDisplaySize(1280, 720).setScrollFactor(.04, .18).setDepth(-100);
    for (const platform of this.level.platforms) {
      if ((platform.height ?? 36) < 60) continue;
      for (let x = platform.x - platform.width / 2 + 240; x < platform.x + platform.width / 2 - 60; x += 340) {
        gardenDecoration(this, x, platform.y - (platform.height ?? 36) / 2, this.level.worldId);
      }
    }
    for (let i = 0; i < 18; i += 1) {
      const mote = this.add.circle(Phaser.Math.Between(0, this.level.width), Phaser.Math.Between(100, 570), Phaser.Math.Between(2, 4), colors.accent, .45).setDepth(-40);
      if (!progressManager.settings.reducedMotion) this.tweens.add({ targets: mote, y: mote.y - Phaser.Math.Between(20, 55), alpha: .1, duration: Phaser.Math.Between(1800, 3600), yoyo: true, repeat: -1 });
    }
  }

  private createCollectibles(): void {
    const group = this.physics.add.staticGroup();
    for (const item of this.level.collectibles) {
      const collectible = group.create(item.x, item.y, item.type) as Phaser.Physics.Arcade.Image;
      collectible.setDataEnabled().setData('type', item.type).setData('value', item.value ?? 1).setDepth(12);
      if (!progressManager.settings.reducedMotion) this.tweens.add({ targets: collectible, angle: item.type === 'star' ? 8 : 0, y: item.y - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.physics.add.overlap(this.bunny, group, (_player, object) => {
      const collectible = object as Phaser.Physics.Arcade.Image;
      if (!collectible.active || collectible.getData('collected')) return;
      collectible.setData('collected', true).disableBody(true, true);
      const type = collectible.getData('type') as 'star' | 'gem';
      if (type === 'star') { this.stars += 1; audioManager.play('star'); } else { this.gems += Number(collectible.getData('value')); audioManager.play('gem'); }
      this.burst(collectible.x, collectible.y, type === 'star' ? 0xc08e3a : 0xc66b3d);
      this.emitHud();
    });
  }

  private createEnemies(staticPlatforms: Phaser.Physics.Arcade.StaticGroup, movingPlatforms: Phaser.Physics.Arcade.Group): void {
    this.enemies = this.physics.add.group({ bounceX: 1 });
    for (const data of this.level.enemies) {
      const enemy = this.enemies.create(data.x, data.y, 'enemy') as EnemySprite;
      enemy.patrolStart = data.x; enemy.patrolRange = data.range; enemy.patrolSpeed = data.speed;
      enemy.setVelocityX(data.speed).setCollideWorldBounds(false).setDepth(14); (enemy.body as Phaser.Physics.Arcade.Body).setSize(46, 37).setOffset(4, 10);
    }
    this.physics.add.collider(this.enemies, staticPlatforms);
    this.physics.add.collider(this.enemies, movingPlatforms);
    this.physics.add.overlap(this.bunny, this.enemies, () => this.damageAndRespawn(false));
  }

  private createHazards(): void {
    const group = this.physics.add.staticGroup();
    this.level.hazards.forEach((hazard) => { const spike = group.create(hazard.x, hazard.y, 'spike') as Phaser.Physics.Arcade.Image; spike.setDisplaySize(hazard.width, 38).refreshBody().setDepth(10); });
    this.physics.add.overlap(this.bunny, group, () => this.damageAndRespawn(false));
  }

  private createCheckpoints(): void {
    const group = this.physics.add.staticGroup();
    this.level.checkpoints.forEach((point) => { const marker = group.create(point.x, point.y, 'checkpoint-off') as Phaser.Physics.Arcade.Image; marker.setDataEnabled().setData('point', point).setDepth(9).refreshBody(); });
    this.physics.add.overlap(this.bunny, group, (_player, object) => {
      const marker = object as Phaser.Physics.Arcade.Image;
      if (marker.getData('active')) return;
      group.getChildren().forEach((child) => (child as Phaser.Physics.Arcade.Image).setTexture('checkpoint-off').setData('active', false));
      marker.setTexture('checkpoint-on').setData('active', true);
      this.checkpoint = { ...(marker.getData('point') as Point) }; audioManager.play('checkpoint'); this.burst(marker.x, marker.y, 0xc08e3a);
    });
  }

  private createPortal(): void {
    const portal = this.physics.add.staticImage(this.level.portal.x, this.level.portal.y, 'portal').setDepth(9);
    if (!progressManager.settings.reducedMotion) this.tweens.add({ targets: portal, alpha: .62, scaleX: 1.06, scaleY: .98, duration: 1050, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.physics.add.overlap(this.bunny, portal, () => this.completeLevel());
  }

  private updateTutorial(): void {
    const nearLedge = this.level.platforms.some((platform) => (platform.height ?? 36) < 60 && Math.abs(platform.x - this.bunny.x) < 370);
    const touch = this.sys.game.device.input.touch;
    let copy = '';
    if (!progressManager.hasLearned('move')) copy = touch ? 'Move: hold Left or Right.' : 'Move: A / D or Left / Right arrows.';
    else if (!progressManager.hasLearned('jump') && nearLedge) copy = touch ? 'Tap Jump to reach the next ledge.' : 'Jump: press Up, Space, or W.';
    else if (!progressManager.hasLearned('doubleJump') && nearLedge) copy = touch ? 'Jump higher: tap Jump again while in the air.' : 'Jump higher: press Up twice. Space or W works too.';
    if (copy === this.tutorialCopy) return;
    this.tutorialCopy = copy;
    eventBus.emit(Events.TUTORIAL, copy);
  }

  private damageAndRespawn(force = true): void {
    if (!force && !this.bunny.hurt()) return;
    if (force) this.bunny.hurt();
    this.hearts -= 1; audioManager.play('hurt'); this.emitHud();
    if (this.hearts <= 0) {
      this.ending = true; this.physics.pause(); this.inputManager.clear(); eventBus.emit(Events.SHOW_GAME_OVER, { levelId: this.level.id }); return;
    }
    this.time.delayedCall(420, () => { if (!this.ending) this.bunny.respawn(this.checkpoint.x, this.checkpoint.y); });
  }

  private completeLevel(): void {
    if (this.ending) return;
    this.ending = true; this.physics.pause(); this.inputManager.clear(); this.bunny.celebrate(); audioManager.play('complete');
    this.burst(this.bunny.x, this.bunny.y - 25, 0xc08e3a, 18);
    const { isBest } = progressManager.completeLevel(this.level.id, this.stars, this.gems);
    const payload: LevelCompletePayload = { levelId: this.level.id, stars: this.stars, gems: this.gems, isBest };
    this.time.delayedCall(550, () => eventBus.emit(this.level.id === 6 ? Events.SHOW_VICTORY : Events.SHOW_COMPLETE, payload));
  }

  private burst(x: number, y: number, color: number, count = 8): void {
    const amount = progressManager.settings.reducedMotion ? Math.min(3, count) : count;
    for (let i = 0; i < amount; i += 1) {
      const dot = this.add.circle(x, y, Phaser.Math.Between(3, 6), color).setDepth(40);
      const angle = (Math.PI * 2 * i) / amount;
      this.tweens.add({ targets: dot, x: x + Math.cos(angle) * Phaser.Math.Between(26, 62), y: y + Math.sin(angle) * Phaser.Math.Between(26, 62), alpha: 0, scale: .2, duration: 360, onComplete: () => dot.destroy() });
    }
  }

  private emitHud(): void {
    const world = getWorld(this.level.worldId);
    const hud: HudState = { levelId: this.level.id, worldName: world.name, levelName: this.level.name, stars: this.stars, gems: this.gems, hearts: this.hearts };
    eventBus.emit(Events.HUD, hud);
  }

  private pauseGame(): void {
    if (this.ending || this.scene.isPaused()) return;
    this.inputManager.clear(); this.scene.pause(); eventBus.emit(Events.SHOW_PAUSE, { levelId: this.level.id });
  }
  private resumeGame(): void { if (this.scene.isPaused()) { this.scene.resume(); eventBus.emit(Events.HIDE_OVERLAYS); this.emitHud(); } }
  private cleanup(): void {
    eventBus.emit(Events.TUTORIAL, '');
    audioManager.stopMusic();
    this.pauseKeys?.forEach((key) => key.off('down', this.pauseListener));
    eventBus.off(Events.PAUSE, this.pauseListener); eventBus.off(Events.RESUME, this.resumeListener); eventBus.off(Events.RESTART, this.restartListener);
  }
}
