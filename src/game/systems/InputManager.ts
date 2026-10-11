import Phaser from 'phaser';
import { eventBus, Events } from './EventBus';

export type InputAction = 'left' | 'right' | 'jump';

export class InputManager {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<'a' | 'd' | 'w' | 'space', Phaser.Input.Keyboard.Key>;
  private touch = { left: false, right: false, jump: false };
  private jumpPressedAt = -Infinity;
  private wasJumpDown = false;
  private readonly listener: (payload: { action: InputAction; pressed: boolean }) => void;

  constructor(private scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is unavailable');
    this.cursors = keyboard.createCursorKeys();
    this.keys = {
      a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A), d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W), space: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };
    this.listener = ({ action, pressed }) => { this.touch[action] = pressed; if (action === 'jump' && pressed) this.jumpPressedAt = scene.time.now; };
    eventBus.on(Events.INPUT, this.listener);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => eventBus.off(Events.INPUT, this.listener));
  }

  update(): void {
    const jumpDown = this.touch.jump || this.keys.w.isDown || this.keys.space.isDown || this.cursors.up.isDown;
    if (jumpDown && !this.wasJumpDown) this.jumpPressedAt = this.scene.time.now;
    this.wasJumpDown = jumpDown;
  }
  get horizontal(): number { return (this.touch.left || this.keys.a.isDown || this.cursors.left.isDown ? -1 : 0) + (this.touch.right || this.keys.d.isDown || this.cursors.right.isDown ? 1 : 0); }
  get jumpHeld(): boolean { return this.touch.jump || this.keys.w.isDown || this.keys.space.isDown || this.cursors.up.isDown; }
  consumeBufferedJump(windowMs = 140): boolean { if (this.scene.time.now - this.jumpPressedAt <= windowMs) { this.jumpPressedAt = -Infinity; return true; } return false; }
  clear(): void { this.touch = { left: false, right: false, jump: false }; }
}
