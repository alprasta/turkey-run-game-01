// Turkey physics and collisions for Giblet's Great Escape.
// One job: move the turkey (run, jump, double-flap, duck, dash), and decide
// exactly when it touches a hazard or a pickup. Hitboxes are forgiving:
// smaller than the drawings, so a near miss reads as a near miss.

import {
  GRAVITY, JUMP_SPEED, DOUBLE_JUMP_SPEED, MAX_FALL, GROUND_Y,
  TURKEY_X, TURKEY_W, TURKEY_H, DASH_TIME, DASH_COOLDOWN,
  INVULNERABLE_TIME,
} from './config.js';

export class Turkey {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = TURKEY_X;
    this.y = GROUND_Y - TURKEY_H;
    this.vy = 0;
    this.grounded = true;
    this.jumpsUsed = 0;
    this.ducking = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.invulnerableTimer = 0;
    this.runCycle = 0;
    this.wasGrounded = true;
    this.justLanded = false;
  }

  get height() {
    return this.ducking && this.grounded ? 48 : TURKEY_H;
  }

  hitbox() {
    const shrinkX = 14;
    const shrinkTop = 12;
    const h = this.height;
    const top = this.grounded ? GROUND_Y - h : this.y + shrinkTop;
    return {
      x: this.x + shrinkX,
      y: top,
      w: TURKEY_W - shrinkX * 2,
      h: h - shrinkTop,
    };
  }

  update(dt, input, audio) {
    this.justLanded = false;
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);

    if (input.jumpPressed()) {
      if (this.grounded) {
        this.vy = -JUMP_SPEED;
        this.grounded = false;
        this.jumpsUsed = 1;
        if (audio) audio.jump();
      } else if (this.jumpsUsed < 2) {
        this.vy = -DOUBLE_JUMP_SPEED;
        this.jumpsUsed = 2;
        if (audio) audio.flap();
      }
    }

    this.ducking = input.duckHeldNow() && this.grounded;

    if (input.dashPressed() && this.dashCooldown <= 0 && this.dashTimer <= 0) {
      this.dashTimer = DASH_TIME;
      this.dashCooldown = DASH_COOLDOWN;
      if (audio) audio.dash();
    }
    this.dashTimer = Math.max(0, this.dashTimer - dt);

    if (!this.grounded) {
      this.vy = Math.min(MAX_FALL, this.vy + GRAVITY * dt);
      this.y += this.vy * dt;
      if (this.y >= GROUND_Y - TURKEY_H) {
        this.y = GROUND_Y - TURKEY_H;
        this.vy = 0;
        this.grounded = true;
        this.jumpsUsed = 0;
        this.justLanded = true;
      }
    }

    this.runCycle += dt * (this.grounded ? 14 : 6);
  }

  get dashing() {
    return this.dashTimer > 0;
  }

  get invulnerable() {
    return this.invulnerableTimer > 0;
  }

  grantMercy() {
    this.invulnerableTimer = INVULNERABLE_TIME;
  }
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// The solid part of an obstacle: slightly smaller than its drawing.
export function obstacleHitbox(obstacle) {
  if (obstacle.kind === 'knife') {
    if (obstacle.knifeState !== 'falling' && obstacle.knifeState !== 'stuck') return null;
    return { x: obstacle.x + 16, y: obstacle.knifeY + 10, w: 22, h: obstacle.h - 10 };
  }
  const shrink = obstacle.kind === 'oven' ? 8 : 10;
  return {
    x: obstacle.x + shrink,
    y: obstacle.y + 8,
    w: obstacle.w - shrink * 2,
    h: obstacle.h - 8,
  };
}

// The oven's flame jets, live only while the fire is on: they lick out of
// the oven door at ground level, so a turkey that leaps the oven clears
// them, and one that runs at it gets singed.
export function ovenFlameHitbox(obstacle) {
  if (obstacle.kind !== 'oven' || !obstacle.fireOn) return null;
  return {
    x: obstacle.x - 72,
    y: GROUND_Y - 52,
    w: 72,
    h: 52,
  };
}
