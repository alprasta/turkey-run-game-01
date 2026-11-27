// Giblet's Great Escape — the game loop and state machine.
// One job: own the run (title -> playing -> paused -> caught/escaped),
// wire input, world, turkey, sound and drawing together, and keep score.

import {
  VIEW, GROUND_Y, TURKEY_X, ESCAPE_FEET, START_HEARTS,
  SCORE_CORN, SCORE_FEATHER, SCORE_FOOT, SCORE_DASH_CORN,
  speedForFeet, stageForFeet, DASH_MULTIPLIER,
} from './config.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { World } from './world.js';
import { Turkey, rectsOverlap, obstacleHitbox, ovenFlameHitbox } from './physics.js';
import {
  drawBackground, drawGround, drawTurkey, drawFarmer,
  drawObstacle, drawPickup, drawParticles,
} from './render.js';
import { drawHud, drawTitleScreen, drawPauseScreen, drawEndScreen } from './hud.js';
import { makeRng } from './random.js';
import { stageShot } from './shots.js';

const BEST_KEY = 'giblets-great-escape-best-feet';

export class Game {
  constructor(canvas, statusElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.statusElement = statusElement;
    this.input = new Input(canvas);
    this.sounds = new SoundBank();
    this.world = new World(makeRng((Date.now() % 100000) | 0));
    this.turkey = new Turkey();
    this.state = 'title';
    this.score = 0;
    this.hearts = START_HEARTS;
    this.combo = 0;
    this.cornCollected = 0;
    this.feathersCollected = 0;
    this.result = null;
    this.time = 0;
    this.speed = 0;
    this.hitFreeze = 0;
    this.frozen = false;
    this.shotMode = false;
    this.bestFeet = 0;
    try {
      this.bestFeet = Number(window.localStorage.getItem(BEST_KEY) || 0) || 0;
    } catch {
      this.bestFeet = 0;
    }
    this.input.onFirstGesture = () => this.sounds.ensure();
    this.announce('Giblet\u2019s Great Escape. Press Enter to run.');
  }

  announce(text) {
    if (this.statusElement) this.statusElement.textContent = text;
  }

  startRun() {
    this.world.reset(makeRng((Date.now() % 100000) | 0));
    this.turkey.reset();
    this.score = 0;
    this.hearts = START_HEARTS;
    this.combo = 0;
    this.cornCollected = 0;
    this.feathersCollected = 0;
    this.result = null;
    this.state = 'playing';
    this.hitFreeze = 0;
    this.sounds.gobble();
    this.announce('Running! Jump the fences, dodge the oven, outrun Farmer Bramwell.');
  }

  endRun(escaped) {
    this.state = 'over';
    const feet = Math.floor(this.world.feet);
    const newBest = feet > this.bestFeet;
    if (newBest) {
      this.bestFeet = feet;
      try {
        window.localStorage.setItem(BEST_KEY, String(feet));
      } catch {
        // Private browsing: the best distance just does not persist.
      }
    }
    this.result = {
      escaped,
      score: this.score,
      feet,
      corn: this.cornCollected,
      feathers: this.feathersCollected,
      newBest,
    };
    if (escaped) {
      this.sounds.escapeFanfare();
      this.announce(`Escaped! ${feet} feet, score ${this.score}. Press R to run again.`);
    } else {
      this.sounds.caughtSting();
      this.announce(`Caught! ${feet} feet, score ${this.score}. Press R to run again.`);
    }
  }

  stumble() {
    if (this.turkey.invulnerable) return;
    this.hearts -= 1;
    this.combo = 0;
    this.world.stumble();
    this.turkey.grantMercy();
    this.sounds.stumble();
    this.world.burst(TURKEY_X + 40, GROUND_Y - 40, '#ffd75e', 14, 260);
    this.hitFreeze = 0.22;
    if (this.hearts <= 0) {
      this.endRun(false);
    } else {
      this.announce(`Ouch! ${this.hearts} ${this.hearts === 1 ? 'heart' : 'hearts'} left. Keep running!`);
    }
  }

  collectPickups() {
    const box = this.turkey.hitbox();
    for (const pickup of this.world.pickups) {
      if (pickup.taken) continue;
      const dx = pickup.x - (box.x + box.w / 2);
      const dy = pickup.y - (box.y + box.h / 2);
      if (dx * dx + dy * dy > 46 * 46) continue;
      pickup.taken = true;
      if (pickup.kind === 'corn') {
        this.cornCollected += 1;
        this.combo += 1;
        this.score += SCORE_CORN + (this.turkey.dashing ? SCORE_DASH_CORN : 0);
        this.sounds.pickup(this.combo);
        this.world.burst(pickup.x, pickup.y, '#f2c14e', 6, 160);
      } else {
        this.feathersCollected += 1;
        this.combo += 2;
        this.score += SCORE_FEATHER;
        this.world.featherRelief();
        this.sounds.feather();
        this.world.burst(pickup.x, pickup.y, '#ffd75e', 16, 240);
      }
    }
  }

  checkHazards() {
    if (this.turkey.invulnerable) return;
    const box = this.turkey.hitbox();
    for (const obstacle of this.world.obstacles) {
      if (obstacle.hitDone) continue;
      const hit = obstacleHitbox(obstacle);
      if (hit && rectsOverlap(box, hit)) {
        obstacle.hitDone = true;
        this.stumble();
        return;
      }
      const flame = ovenFlameHitbox(obstacle);
      if (flame && rectsOverlap(box, flame)) {
        obstacle.hitDone = true;
        this.stumble();
        return;
      }
    }
    if (this.world.pressure >= 100) {
      this.stumble();
    }
  }

  update(dt) {
    if (this.state === 'title') {
      this.time += dt;
      this.world.scrollX += 24 * dt;
      if (this.input.startPressed()) {
        this.sounds.click();
        this.startRun();
      }
    } else if (this.state === 'playing') {
      if (this.input.pausePressed()) {
        this.state = 'paused';
        this.announce('Paused. Press P to keep running.');
        return;
      }
      if (this.hitFreeze > 0) {
        this.hitFreeze -= dt;
        this.render();
        return;
      }
      const feetBefore = this.world.feet;
      this.speed = speedForFeet(this.world.feet) * (this.turkey.dashing ? DASH_MULTIPLIER : 1);
      this.turkey.update(dt, this.input, this.sounds);
      this.world.update(dt, this.speed, this.sounds);
      this.score += Math.max(0, Math.floor((this.world.feet - feetBefore) * SCORE_FOOT));
      if (this.turkey.justLanded) this.world.dust(TURKEY_X + 40, GROUND_Y);
      if (this.world.pressure > 70) this.sounds.alarm();
      this.collectPickups();
      this.checkHazards();
      if (this.state !== 'playing') return;
      if (this.world.feet >= ESCAPE_FEET) {
        this.endRun(true);
        return;
      }
      this.time += dt;
    } else if (this.state === 'paused') {
      if (this.input.pausePressed() || this.input.startPressed()) {
        this.state = 'playing';
        this.announce('Running!');
      }
    } else if (this.state === 'over') {
      this.time += dt;
      if (this.input.restartPressed() || this.input.startPressed()) {
        this.sounds.click();
        this.startRun();
      }
    }
    if (this.input.mutePressed()) {
      const muted = this.sounds.toggleMute();
      this.announce(muted ? 'Sound off.' : 'Sound on.');
    }
  }

  render() {
    const ctx = this.ctx;
    const stage = stageForFeet(this.world.feet);
    ctx.clearRect(0, 0, VIEW.width, VIEW.height);
    drawBackground(ctx, stage, this.world.scrollX, this.time);
    drawGround(ctx, stage, this.world.scrollX);
    for (const pickup of this.world.pickups) drawPickup(ctx, pickup, this.time);
    for (const obstacle of this.world.obstacles) drawObstacle(ctx, obstacle, this.time);
    drawParticles(ctx, this.world.particles);
    drawFarmer(ctx, this.world.farmerScreenX(), this.time, this.world.pressure);
    drawTurkey(ctx, this.turkey, this.time);

    if (this.state === 'title') {
      drawTitleScreen(ctx, this.bestFeet, this.sounds.muted);
    } else if (this.state === 'playing' || this.state === 'paused') {
      drawHud(ctx, {
        score: this.score,
        feet: this.world.feet,
        hearts: this.hearts,
        stage,
        speed: this.speed,
        pressure: this.world.pressure,
        combo: this.combo,
        dashReady: this.turkey.dashCooldown <= 0,
      });
      if (this.state === 'paused') drawPauseScreen(ctx);
    } else if (this.state === 'over' && this.result) {
      drawEndScreen(ctx, this.result);
    }
  }

  frame(now) {
    const dt = Math.min(1 / 30, (now - (this.lastNow ?? now)) / 1000 || 0.016);
    this.lastNow = now;
    if (!this.frozen) {
      this.update(dt);
      this.render();
    }
    this.input.endFrame();
  }

  run() {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    if (shot) {
      const seed = Number(params.get('seed') || 7);
      stageShot(this, shot, seed);
      return;
    }
    const loop = (now) => {
      this.frame(now);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

const canvas = document.getElementById('game');
const statusElement = document.getElementById('status');
const game = new Game(canvas, statusElement);
game.run();
