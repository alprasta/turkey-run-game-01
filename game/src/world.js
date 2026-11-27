// The world Giblet runs through: scrolling hazards, corn, golden feathers,
// dust and sparks, and Farmer Bramwell's closing pressure.
// One job: own every entity that is not the turkey, and spawn it fairly.

import { GROUND_Y, STAGES, stageForFeet, FEET_PER_PX } from './config.js';
import { range, pick, chance } from './random.js';

const OBSTACLE_SHAPES = {
  fence: { w: 46, h: 82 },
  hay: { w: 88, h: 62 },
  pumpkin: { w: 72, h: 52 },
  oven: { w: 156, h: 122 },
  knife: { w: 54, h: 96 },
  pot: { w: 96, h: 58 },
  log: { w: 96, h: 58 },
  bush: { w: 84, h: 66 },
};

export class World {
  constructor(rng) {
    this.rng = rng;
    this.obstacles = [];
    this.pickups = [];
    this.particles = [];
    this.scrollX = 0;
    this.distancePx = 0;
    this.feet = 0;
    this.pressure = 12;
    this.spawnDebtPx = 0;
    this.nextGapPx = 520;
    this.knifeDrops = 0;
  }

  get stage() {
    return stageForFeet(this.feet);
  }

  reset(seedRng) {
    this.rng = seedRng;
    this.obstacles = [];
    this.pickups = [];
    this.particles = [];
    this.scrollX = 0;
    this.distancePx = 0;
    this.feet = 0;
    this.pressure = 12;
    this.spawnDebtPx = 0;
    this.nextGapPx = 520;
  }

  spawnObstacle(kind, x) {
    const shape = OBSTACLE_SHAPES[kind];
    const obstacle = {
      kind,
      x,
      y: GROUND_Y - shape.h,
      w: shape.w,
      h: shape.h,
      passed: false,
      hitDone: false,
      // Oven fire cycle: flames off, then on, then off again.
      fireTimer: range(this.rng, 0.4, 1.2),
      fireOn: false,
      fireWasOn: false,
      // Dropping knife state machine: hang -> telegraph -> falling -> stuck -> retract.
      knifeState: 'hang',
      knifeTimer: 0,
      knifeY: -140,
      seed: this.rng(),
    };
    if (kind === 'knife') obstacle.knifeY = -140;
    this.obstacles.push(obstacle);
    return obstacle;
  }

  spawnCornArc(x, baseY) {
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      this.pickups.push({
        kind: 'corn',
        x: x + t * 150,
        y: baseY - 40 - Math.sin(t * Math.PI) * 95,
        taken: false,
        bob: this.rng() * Math.PI * 2,
      });
    }
  }

  spawnCornLine(x, y, count) {
    for (let i = 0; i < count; i++) {
      this.pickups.push({
        kind: 'corn',
        x: x + i * 44,
        y,
        taken: false,
        bob: this.rng() * Math.PI * 2,
      });
    }
  }

  spawnFeather(x, y) {
    this.pickups.push({ kind: 'feather', x, y, taken: false, bob: 0 });
  }

  spawnPattern() {
    const stage = this.stage;
    const kind = pick(this.rng, stage.hazards);
    const x = 1280 + 80;
    this.spawnObstacle(kind, x);
    const roll = this.rng();
    if (kind === 'fence' || kind === 'hay' || kind === 'pumpkin' || kind === 'log' || kind === 'bush' || kind === 'pot') {
      if (roll < 0.55) this.spawnCornArc(x - 30, GROUND_Y);
      else if (roll < 0.75) this.spawnCornLine(x + 220, GROUND_Y - 46, 4);
    } else if (kind === 'oven') {
      if (roll < 0.6) this.spawnCornArc(x - 40, GROUND_Y);
    } else if (kind === 'knife') {
      if (roll < 0.5) this.spawnCornLine(x + 200, GROUND_Y - 46, 4);
    }
    if (chance(this.rng, 0.16)) {
      this.spawnFeather(x + range(this.rng, 260, 420), GROUND_Y - 260);
    }
    this.nextGapPx = range(this.rng, stage.gapMin, stage.gapMax);
  }

  burst(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
      const angle = this.rng() * Math.PI * 2;
      const velocity = range(this.rng, speed * 0.3, speed);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 60,
        life: 0,
        maxLife: range(this.rng, 0.35, 0.7),
        color,
        size: range(this.rng, 3, 7),
      });
    }
  }

  dust(x, y) {
    this.burst(x, y, '#d8c49a', 6, 120);
  }

  update(dt, speed, audio) {
    const dx = speed * dt;
    this.scrollX += dx;
    this.distancePx += dx;
    this.feet = this.distancePx * FEET_PER_PX;
    this.spawnDebtPx += dx;

    if (this.spawnDebtPx >= this.nextGapPx) {
      this.spawnDebtPx = 0;
      this.spawnPattern();
    }

    this.pressure = Math.max(0, this.pressure - 7 * dt);

    for (const obstacle of this.obstacles) {
      obstacle.x -= dx;
      if (obstacle.kind === 'oven') {
        obstacle.fireTimer -= dt;
        if (obstacle.fireTimer <= 0) {
          obstacle.fireOn = !obstacle.fireOn;
          obstacle.fireTimer = obstacle.fireOn ? 0.85 : 1.15;
          if (obstacle.fireOn && audio) audio.ovenRoar();
        }
      }
      if (obstacle.kind === 'knife') {
        this.updateKnife(obstacle, dt, speed, audio);
      }
    }
    this.obstacles = this.obstacles.filter((o) => o.x + o.w > -160);

    for (const pickup of this.pickups) {
      pickup.x -= dx;
      pickup.bob += dt * 4;
    }
    this.pickups = this.pickups.filter((p) => !p.taken && p.x > -60);

    for (const particle of this.particles) {
      particle.life += dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 500 * dt;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);
  }

  // A hanging cleaver: glints to warn, drops, sticks in the floorboards
  // as a jumpable blade, then yanks itself back up. The drop is timed by
  // speed so the blade always lands well ahead of the turkey (about 280
  // pixels clear of its beak), never on it: a player needs half a second
  // to see it land and jump, and the old trigger left almost none.
  updateKnife(knife, dt, speed, audio) {
    knife.knifeTimer -= dt;
    if (knife.knifeState === 'hang') {
      if (knife.x - 250 < speed * 1.3) {
        knife.knifeState = 'telegraph';
        knife.knifeTimer = 0.45;
      }
    } else if (knife.knifeState === 'telegraph') {
      if (knife.knifeTimer <= 0) {
        knife.knifeState = 'falling';
        if (audio) audio.knifeWhoosh();
      }
    } else if (knife.knifeState === 'falling') {
      knife.knifeY += 2600 * dt;
      if (knife.knifeY >= GROUND_Y - knife.h) {
        knife.knifeY = GROUND_Y - knife.h;
        knife.knifeState = 'stuck';
        knife.knifeTimer = 0.9;
        knife.y = knife.knifeY;
        this.dust(knife.x + knife.w / 2, GROUND_Y);
      }
    } else if (knife.knifeState === 'stuck') {
      if (knife.knifeTimer <= 0) {
        knife.knifeState = 'retract';
      }
    } else if (knife.knifeState === 'retract') {
      knife.knifeY -= 1500 * dt;
      knife.y = knife.knifeY;
      if (knife.knifeY < -160) {
        knife.knifeState = 'gone';
        knife.x = -9999;
      }
    }
  }

  farmerScreenX() {
    const t = Math.max(0, Math.min(1, this.pressure / 100));
    return -280 + t * (250 - 60 + 280);
  }

  stumble() {
    this.pressure = Math.min(100, this.pressure + 30);
  }

  featherRelief() {
    this.pressure = Math.max(0, this.pressure - 22);
  }
}
