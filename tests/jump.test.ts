import { describe, expect, it } from 'vitest';
import { JumpController } from '../src/game/systems/JumpController';

describe('double jumping', () => {
  it('allows two presses, rejects a third, and recharges on landing', () => {
    const jumps = new JumpController();
    jumps.updateGrounded(true, 0);
    expect(jumps.jump(10)).toBe('ground');
    jumps.updateGrounded(false, 50);
    expect(jumps.jump(200)).toBe('air');
    expect(jumps.jump(220)).toBeUndefined();
    jumps.updateGrounded(true, 900);
    expect(jumps.jump(920)).toBe('ground');
    expect(jumps.jump(1000)).toBe('air');
  });

  it('preserves coyote time and one air recovery after walking off a ledge', () => {
    const jumps = new JumpController();
    jumps.updateGrounded(true, 100);
    jumps.updateGrounded(false, 120);
    expect(jumps.jump(180)).toBe('ground');
    jumps.reset();
    jumps.updateGrounded(true, 500);
    jumps.updateGrounded(false, 600);
    expect(jumps.jump(700)).toBe('air');
    expect(jumps.canJump).toBe(false);
  });

  it('clears spent jumps on respawn', () => {
    const jumps = new JumpController();
    jumps.updateGrounded(true, 0);
    jumps.jump(10); jumps.jump(20);
    jumps.reset();
    jumps.updateGrounded(true, 1000);
    expect(jumps.jump(1020)).toBe('ground');
    expect(jumps.jump(1200)).toBe('air');
  });
});
