import Phaser from 'phaser';
import type { InputManager } from '../systems/InputManager';
import { audioManager } from '../systems/AudioManager';
import { JumpController } from '../systems/JumpController';

export class Bunny extends Phaser.Physics.Arcade.Sprite {
  private visual: Phaser.GameObjects.Sprite;
  private jumps = new JumpController();
  private wasGrounded = false;
  private animationState = '';
  private activeJump: 'ground' | 'air' = 'ground';
  private invulnerableUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, private onJump?: (kind: 'ground' | 'air') => void) {
    super(scene, x, y, 'bunny-idle-0');
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setCollideWorldBounds(false).setVisible(false);
    this.visual = scene.add.sprite(x, y, 'bunny-idle-0').setDepth(20);
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncVisual, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncVisual, this);
      this.visual.destroy();
    });
    (this.body as Phaser.Physics.Arcade.Body).setSize(38, 66).setOffset(16, 14);
    this.setMaxVelocity(340, 1050).setDragX(1450);
    this.playState('idle');
  }

  update(input: InputManager, reducedMotion: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const grounded = body.blocked.down || body.touching.down;
    this.jumps.updateGrounded(grounded && body.velocity.y >= 0, this.scene.time.now);
    const horizontal = input.horizontal;
    if (horizontal) {
      this.setAccelerationX(horizontal * 1450);
      this.setFlipX(horizontal < 0);
    } else this.setAccelerationX(0);

    if (this.jumps.canJump && input.consumeBufferedJump()) {
      const kind = this.jumps.jump(this.scene.time.now)!;
      this.activeJump = kind;
      this.scene.tweens.killTweensOf(this.visual);
      this.setVelocityY(kind === 'air' ? -950 : -575); audioManager.play('jump'); this.playState('jump');
      this.onJump?.(kind);
      if (!reducedMotion) this.visual.setScale(1.08, .92);
    }
    // Keep a tapped air boost full-height so even the tallest ledges are reachable.
    if (this.activeJump === 'ground' && !input.jumpHeld && body.velocity.y < -210) body.setVelocityY(-210);

    if (grounded && body.velocity.y >= 0 && !this.wasGrounded && !reducedMotion) {
      this.scene.tweens.add({ targets: this.visual, scaleX: 1.12, scaleY: .88, duration: 75, yoyo: true, onComplete: () => this.visual.setScale(1) });
    }
    if (this.scene.time.now >= this.invulnerableUntil) this.visual.setAlpha(1);
    if (!grounded) this.playState(body.velocity.y < 0 ? 'jump' : 'fall');
    else if (Math.abs(body.velocity.x) > 35) this.playState('run');
    else this.playState('idle');
    this.wasGrounded = grounded;
  }

  hurt(): boolean {
    if (this.scene.time.now < this.invulnerableUntil) return false;
    this.invulnerableUntil = this.scene.time.now + 1150; this.playState('hurt');
    this.setVelocityY(-300); this.setVelocityX(this.flipX ? 210 : -210);
    this.scene.tweens.add({ targets: this.visual, alpha: .28, duration: 90, yoyo: true, repeat: 5 });
    return true;
  }

  celebrate(): void { this.setAcceleration(0).setVelocity(0); this.playState('celebrate'); }
  respawn(x: number, y: number): void { this.jumps.reset(); this.wasGrounded = false; this.scene.tweens.killTweensOf(this.visual); this.setPosition(x, y).setVelocity(0); this.visual.setScale(1).setAlpha(1); this.playState('respawn'); }

  private syncVisual(): void { this.visual.setPosition(this.x, this.y).setFlipX(this.flipX); }

  private playState(next: string): void {
    if (this.animationState === next) return;
    this.animationState = next;
    if (this.scene.anims.exists(`bunny-${next}`)) this.visual.play(`bunny-${next}`, true);
  }
}
