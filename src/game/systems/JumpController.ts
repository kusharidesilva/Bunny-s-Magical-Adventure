/** Two deliberate presses per landing, including one recovery jump off a ledge. */
export class JumpController {
  private jumpsUsed = 0;
  private lastGroundedAt = -Infinity;

  updateGrounded(grounded: boolean, now: number): void {
    if (grounded) { this.jumpsUsed = 0; this.lastGroundedAt = now; }
  }

  get canJump(): boolean { return this.jumpsUsed < 2; }

  jump(now: number): 'ground' | 'air' | undefined {
    if (!this.canJump) return undefined;
    const groundJump = this.jumpsUsed === 0 && now - this.lastGroundedAt < 115;
    this.jumpsUsed = groundJump ? 1 : 2;
    this.lastGroundedAt = -Infinity;
    return groundJump ? 'ground' : 'air';
  }

  reset(): void { this.jumpsUsed = 0; this.lastGroundedAt = -Infinity; }
}
