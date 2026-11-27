// Giblet's Great Escape — tuning constants.
// One job: every number the game balances on lives here, so tuning never
// means hunting through the update or draw code.

export const VIEW = { width: 1280, height: 720 };
export const GROUND_Y = 612;
export const TURKEY_X = 250;
export const TURKEY_W = 92;
export const TURKEY_H = 78;

export const GRAVITY = 2600;
export const JUMP_SPEED = 930;
export const MAX_FALL = 1400;
export const DOUBLE_JUMP_SPEED = 820;

export const BASE_SPEED = 360;
export const SPEED_PER_FOOT = 0.085;
export const MAX_SPEED = 660;
export const DASH_MULTIPLIER = 1.55;
export const DASH_TIME = 0.38;
export const DASH_COOLDOWN = 1.25;

export const FEET_PER_PX = 1 / 14;
export const ESCAPE_FEET = 3000;
export const START_HEARTS = 3;

export const FARMER_CATCH_PRESSURE = 100;
export const PRESSURE_PER_STUMBLE = 30;
export const PRESSURE_DECAY_PER_SEC = 7;
export const FEATHER_PRESSURE_RELIEF = 22;

export const SCORE_CORN = 10;
export const SCORE_FEATHER = 50;
export const SCORE_FOOT = 1;
export const SCORE_DASH_CORN = 5;

export const INVULNERABLE_TIME = 1.6;
export const HIT_FREEZE_TIME = 0.22;

// Stage table: the run crosses three places on the way to freedom.
// farmyard -> farmhouse kitchen -> pine forest. Each stage brings its own
// backdrop, its own hazards and its own pace.

export const STAGES = [
  {
    id: 'farmyard',
    name: 'THE FARMYARD',
    fromFeet: 0,
    toFeet: 1100,
    skyTop: '#f7b267',
    skyBottom: '#f4845f',
    sunColor: '#ffd97a',
    groundTop: '#8a6b3d',
    groundBottom: '#5d4526',
    grass: '#7d9b4a',
    accent: '#c96f2e',
    hazards: ['fence', 'hay', 'pumpkin'],
    gapMin: 430,
    gapMax: 780,
  },
  {
    id: 'kitchen',
    name: 'THE FARMHOUSE KITCHEN',
    fromFeet: 1100,
    toFeet: 2200,
    skyTop: '#e8a87c',
    skyBottom: '#b85c38',
    sunColor: '#ffe9b0',
    groundTop: '#9c6644',
    groundBottom: '#6b4226',
    grass: '#a9713f',
    accent: '#d64541',
    hazards: ['oven', 'knife', 'pot'],
    gapMin: 460,
    gapMax: 820,
  },
  {
    id: 'forest',
    name: 'THE PINE FOREST',
    fromFeet: 2200,
    toFeet: ESCAPE_FEET,
    skyTop: '#f2a65a',
    skyBottom: '#7a9e7e',
    sunColor: '#ffdf8a',
    groundTop: '#5d6b3a',
    groundBottom: '#33401f',
    grass: '#4e7a3a',
    accent: '#2f5233',
    hazards: ['log', 'fence', 'bush'],
    gapMin: 440,
    gapMax: 720,
  },
];

export function stageForFeet(feet) {
  for (const stage of STAGES) {
    if (feet < stage.toFeet) return stage;
  }
  return STAGES[STAGES.length - 1];
}

export function speedForFeet(feet) {
  return Math.min(MAX_SPEED, BASE_SPEED + feet * SPEED_PER_FOOT);
}

export function progressToEscape(feet) {
  return Math.max(0, Math.min(1, feet / ESCAPE_FEET));
}
