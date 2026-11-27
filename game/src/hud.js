// HUD and screens for Giblet's Great Escape: the in-run bar (score,
// distance to the forest, hearts, stage, speed) and the title, pause and
// end screens. One job: everything that is text and panels, not world art.

import { VIEW, ESCAPE_FEET, progressToEscape } from './config.js';

const PANEL = 'rgba(28, 18, 10, 0.72)';
const CREAM = '#fff3d6';
const GOLD = '#ffd75e';

export function drawHud(ctx, state) {
  const { score, feet, hearts, stage, speed, pressure, combo, dashReady } = state;

  ctx.fillStyle = PANEL;
  roundRectPath(ctx, 16, 14, 1248, 64, 14);
  ctx.fill();

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = CREAM;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${score}`, 34, 46);

  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillStyle = combo > 1 ? GOLD : 'rgba(255, 243, 214, 0.75)';
  ctx.fillText(combo > 1 ? `CORN STREAK x${combo}` : 'GRAB THE CORN!', 34, 68);

  // Distance to the forest: the progress bar is the whole point of the run.
  const barX = 330;
  const barY = 30;
  const barW = 460;
  ctx.fillStyle = CREAM;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${Math.floor(feet)} ft`, barX, 52);
  ctx.fillStyle = 'rgba(255, 243, 214, 0.25)';
  roundRectPath(ctx, barX + 92, barY, barW - 92, 20, 10);
  ctx.fill();
  ctx.fillStyle = '#7d9b4a';
  roundRectPath(ctx, barX + 92, barY, (barW - 92) * progressToEscape(feet), 20, 10);
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText('FOREST', barX + barW - 62, 52);

  // Stage name and speed.
  ctx.textAlign = 'center';
  ctx.fillStyle = CREAM;
  ctx.font = 'bold 19px Georgia, serif';
  ctx.fillText(stage.name, 1030, 40);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = dashReady ? '#9fe08a' : 'rgba(255, 243, 214, 0.65)';
  ctx.fillText(dashReady ? 'DASH READY  [SHIFT]' : 'DASH…', 1030, 64);

  // Hearts.
  ctx.textAlign = 'right';
  for (let i = 0; i < 3; i++) {
    drawHeart(ctx, 1180 + i * 30 - 30, 46, i < hearts);
  }

  // Farmer pressure: a thin red bar under the HUD that screams when full.
  const pressureW = 1248 * Math.min(1, pressure / 100);
  ctx.fillStyle = pressure > 70 ? '#d64541' : 'rgba(214, 69, 65, 0.55)';
  roundRectPath(ctx, 16, 82, pressureW, 7, 3);
  ctx.fill();
  if (pressure > 70) {
    ctx.fillStyle = 'rgba(28, 18, 10, 0.8)';
    roundRectPath(ctx, 12, 92, 470, 26, 12);
    ctx.fill();
    ctx.fillStyle = '#ff6b5e';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('FARMER BRAMWELL IS RIGHT BEHIND YOU!', 22, 110);
  }
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHeart(ctx, x, y, full) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = full ? '#d64541' : 'rgba(255, 243, 214, 0.3)';
  ctx.beginPath();
  ctx.moveTo(0, 7);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -5);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 7);
  ctx.fill();
  ctx.restore();
}

function centerText(ctx, text, y, font, color) {
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(text, VIEW.width / 2, y);
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(28, 18, 10, 0.78)';
  roundRectPath(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 94, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function drawTitleScreen(ctx, bestFeet, muted) {
  ctx.fillStyle = 'rgba(28, 18, 10, 0.45)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  panel(ctx, 240, 96, 800, 528);

  centerText(ctx, 'GIBLET\u2019S', 190, 'bold 72px Georgia, serif', GOLD);
  centerText(ctx, 'GREAT ESCAPE', 258, 'bold 72px Georgia, serif', GOLD);
  centerText(ctx, 'A Thanksgiving turkey run', 296, 'italic 24px Georgia, serif', CREAM);
  centerText(ctx, 'Farmer Bramwell wants you for dinner. The oven is hot,', 344, '21px Georgia, serif', CREAM);
  centerText(ctx, 'the carving knife is out, and the forest is 3,000 feet away.', 372, '21px Georgia, serif', CREAM);

  centerText(ctx, 'JUMP / DOUBLE-FLAP  —  SPACE, \u2191 or CLICK', 428, 'bold 20px Georgia, serif', CREAM);
  centerText(ctx, 'DASH  —  SHIFT or X      DUCK  —  \u2193 or S', 458, 'bold 20px Georgia, serif', CREAM);
  centerText(ctx, 'PAUSE  —  P      MUTE  —  M', 488, 'bold 20px Georgia, serif', CREAM);
  centerText(ctx, 'Jump fences, hay and pumpkins. Leap the oven over', 528, '19px Georgia, serif', 'rgba(255, 243, 214, 0.85)');
  centerText(ctx, 'its flame jets. Leap the knife after it sticks.', 554, '19px Georgia, serif', 'rgba(255, 243, 214, 0.85)');

  const pulse = 0.7 + Math.sin(Date.now() / 280) * 0.3;
  ctx.globalAlpha = pulse;
  centerText(ctx, 'PRESS ENTER OR CLICK TO RUN', 606, 'bold 26px Georgia, serif', '#fff');
  ctx.globalAlpha = 1;

  if (bestFeet > 0) {
    centerText(ctx, `Best escape so far: ${Math.floor(bestFeet)} ft`, 646, '18px Georgia, serif', GOLD);
  }
  if (muted) {
    centerText(ctx, 'SOUND OFF  (M to unmute)', 646, '16px Georgia, serif', 'rgba(255, 243, 214, 0.7)');
  }
}

export function drawPauseScreen(ctx) {
  ctx.fillStyle = 'rgba(28, 18, 10, 0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  panel(ctx, 440, 250, 400, 200);
  centerText(ctx, 'PAUSED', 330, 'bold 52px Georgia, serif', GOLD);
  centerText(ctx, 'Giblet is catching his breath.', 372, '20px Georgia, serif', CREAM);
  centerText(ctx, 'Press P or click to keep running.', 404, '18px Georgia, serif', CREAM);
}

export function drawEndScreen(ctx, result) {
  ctx.fillStyle = 'rgba(28, 18, 10, 0.5)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  panel(ctx, 290, 130, 700, 460);

  if (result.escaped) {
    centerText(ctx, 'ESCAPED!', 228, 'bold 76px Georgia, serif', '#9fe08a');
    centerText(ctx, 'Giblet made it to the pine forest.', 272, '24px Georgia, serif', CREAM);
    centerText(ctx, 'Thanksgiving is officially cancelled.', 304, '24px Georgia, serif', CREAM);
    centerText(ctx, 'Farmer Bramwell is still looking in the kitchen.', 336, '19px Georgia, serif', 'rgba(255, 243, 214, 0.85)');
  } else {
    centerText(ctx, 'CAUGHT!', 228, 'bold 76px Georgia, serif', '#ff6b5e');
    centerText(ctx, 'Farmer Bramwell got his turkey.', 272, '24px Georgia, serif', CREAM);
    centerText(ctx, 'The oven was already warm. So close!', 304, '24px Georgia, serif', CREAM);
    centerText(ctx, 'Three strikes and dinner is served.', 336, '19px Georgia, serif', 'rgba(255, 243, 214, 0.85)');
  }

  centerText(ctx, `SCORE  ${result.score}`, 400, 'bold 30px Georgia, serif', GOLD);
  centerText(ctx, `DISTANCE  ${Math.floor(result.feet)} ft  /  ${ESCAPE_FEET} ft`, 442, 'bold 24px Georgia, serif', CREAM);
  centerText(ctx, `CORN  ${result.corn}      GOLDEN FEATHERS  ${result.feathers}`, 476, '20px Georgia, serif', CREAM);
  if (result.newBest) {
    centerText(ctx, 'NEW BEST DISTANCE!', 512, 'bold 22px Georgia, serif', GOLD);
  }
  const pulse = 0.7 + Math.sin(Date.now() / 280) * 0.3;
  ctx.globalAlpha = pulse;
  centerText(ctx, 'PRESS R OR CLICK TO RUN AGAIN', 562, 'bold 24px Georgia, serif', '#fff');
  ctx.globalAlpha = 1;
}
