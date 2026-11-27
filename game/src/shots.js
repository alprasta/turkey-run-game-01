// Deterministic screenshot staging for Giblet's Great Escape.
// One job: given ?shot=start|play|chase|end (and ?seed=), put the game into
// the exact scene a screenshot needs, then freeze it so the capture is
// stable. Never used during normal play.

import { GROUND_Y, TURKEY_H } from './config.js';
import { makeRng } from './random.js';

function seedWorld(game, seed) {
  const rng = makeRng(seed);
  game.world.reset(rng);
  game.turkey.reset();
  game.score = 0;
  game.hearts = 3;
  game.combo = 0;
  game.cornCollected = 0;
  game.feathersCollected = 0;
  game.time = 4.2;
  return rng;
}

export function stageShot(game, shot, seed = 7) {
  const rng = seedWorld(game, seed);
  game.shotMode = true;

  if (shot === 'start') {
    game.state = 'title';
    game.bestFeet = 2140;
    game.world.spawnObstacle('fence', 700);
    game.world.spawnObstacle('hay', 980);
    game.world.spawnCornLine(760, GROUND_Y - 46, 4);
    game.world.pressure = 18;
  } else if (shot === 'play') {
    game.state = 'playing';
    game.world.distancePx = 650 * 14;
    game.world.feet = 650;
    game.score = 684;
    game.combo = 4;
    game.cornCollected = 23;
    game.world.spawnObstacle('fence', 560);
    game.world.spawnObstacle('hay', 880);
    game.world.spawnObstacle('pumpkin', 1120);
    game.world.spawnCornArc(530, GROUND_Y);
    game.world.spawnCornLine(1000, GROUND_Y - 46, 4);
    game.turkey.y = GROUND_Y - TURKEY_H - 95;
    game.turkey.vy = -260;
    game.turkey.grounded = false;
    game.turkey.jumpsUsed = 1;
    game.world.pressure = 34;
  } else if (shot === 'chase') {
    game.state = 'playing';
    game.world.distancePx = 1480 * 14;
    game.world.feet = 1480;
    game.score = 1520;
    game.combo = 2;
    game.cornCollected = 41;
    game.hearts = 1;
    const oven = game.world.spawnObstacle('oven', 600);
    oven.fireOn = true;
    oven.fireTimer = 0.5;
    // The cleaver has already dropped and stuck in the floorboards ahead.
    const knife = game.world.spawnObstacle('knife', 920);
    knife.knifeState = 'stuck';
    knife.knifeTimer = 0.9;
    knife.knifeY = GROUND_Y - 96;
    knife.y = knife.knifeY;
    game.world.spawnObstacle('pot', 1180);
    game.world.spawnCornLine(1060, GROUND_Y - 46, 3);
    game.world.pressure = 88;
    game.turkey.runCycle = 2.1;
  } else if (shot === 'end') {
    game.state = 'over';
    game.result = {
      escaped: false,
      score: 1932,
      feet: 1873,
      corn: 52,
      feathers: 2,
      newBest: false,
    };
    game.world.distancePx = 1873 * 14;
    game.world.feet = 1873;
    game.world.pressure = 100;
    game.world.spawnObstacle('oven', 900);
    game.world.spawnObstacle('fence', 1120);
    game.turkey.y = GROUND_Y - TURKEY_H;
    game.turkey.grounded = true;
  } else {
    game.state = 'title';
  }

  game.frozen = true;
  game.render();
}
