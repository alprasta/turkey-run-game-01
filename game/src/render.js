// Canvas drawing for Giblet's Great Escape: the farmyard, the kitchen, the
// forest, the turkey, Farmer Bramwell and every hazard — all drawn in code,
// no image files. One job: turn game state into a picture.

import { VIEW, GROUND_Y, TURKEY_X, TURKEY_W, TURKEY_H } from './config.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function skyGradient(ctx, stage) {
  const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  gradient.addColorStop(0, stage.skyTop);
  gradient.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW.width, GROUND_Y);
}

function drawSun(ctx, stage, scrollX) {
  const x = VIEW.width - 210 - (scrollX * 0.02) % 60;
  const y = 110;
  ctx.fillStyle = stage.sunColor;
  ctx.beginPath();
  ctx.arc(x, y, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 233, 176, 0.35)';
  ctx.beginPath();
  ctx.arc(x, y, 74, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 26 * scale, 0, Math.PI * 2);
  ctx.arc(x + 30 * scale, y - 10 * scale, 30 * scale, 0, Math.PI * 2);
  ctx.arc(x + 62 * scale, y, 24 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawBarn(ctx, x, baseY, scale) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#a63a2e';
  ctx.fillRect(-90, -120, 180, 120);
  ctx.beginPath();
  ctx.moveTo(-104, -118);
  ctx.lineTo(0, -178);
  ctx.lineTo(104, -118);
  ctx.closePath();
  ctx.fillStyle = '#7e2a20';
  ctx.fill();
  ctx.fillStyle = '#f3e6c8';
  ctx.fillRect(-26, -58, 52, 58);
  ctx.strokeStyle = '#f3e6c8';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-26, -58);
  ctx.lineTo(26, 0);
  ctx.moveTo(26, -58);
  ctx.lineTo(-26, 0);
  ctx.stroke();
  ctx.fillStyle = '#f3e6c8';
  ctx.fillRect(-70, -100, 34, 30);
  ctx.fillRect(36, -100, 34, 30);
  ctx.restore();
}

function drawPine(ctx, x, baseY, height, color) {
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x - 5, baseY - 18, 10, 18);
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const tierY = baseY - 14 - i * (height / 3.4);
    const tierW = 66 - i * 18;
    ctx.beginPath();
    ctx.moveTo(x - tierW / 2, tierY);
    ctx.lineTo(x, tierY - height / 3.2);
    ctx.lineTo(x + tierW / 2, tierY);
    ctx.closePath();
    ctx.fill();
  }
}

function drawFarmhouseWall(ctx, stage) {
  ctx.fillStyle = '#c98d5f';
  ctx.fillRect(0, 0, VIEW.width, GROUND_Y);
  ctx.fillStyle = '#b57a4e';
  for (let y = 0; y < GROUND_Y; y += 46) {
    ctx.fillRect(0, y, VIEW.width, 3);
  }
  // Window with the sunset outside.
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(880, 90, 260, 210);
  const glow = ctx.createLinearGradient(880, 90, 1140, 300);
  glow.addColorStop(0, '#ffd97a');
  glow.addColorStop(1, '#f4845f');
  ctx.fillStyle = glow;
  ctx.fillRect(894, 104, 232, 182);
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(1002, 104, 12, 182);
  ctx.fillRect(894, 188, 232, 12);
  // Hanging pots and pans.
  ctx.strokeStyle = '#5d3a22';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(120, 0);
  ctx.lineTo(120, 60);
  ctx.moveTo(220, 0);
  ctx.lineTo(220, 60);
  ctx.moveTo(330, 0);
  ctx.lineTo(330, 60);
  ctx.stroke();
  ctx.fillStyle = '#3f3a36';
  ctx.beginPath();
  ctx.arc(120, 96, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a6f4d';
  ctx.beginPath();
  ctx.arc(220, 100, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b5533c';
  ctx.beginPath();
  ctx.arc(330, 92, 28, 0, Math.PI * 2);
  ctx.fill();
  // Framed picture: a prize turkey, of course.
  ctx.fillStyle = '#6b4226';
  ctx.fillRect(560, 110, 130, 100);
  ctx.fillStyle = '#f3e6c8';
  ctx.fillRect(570, 120, 110, 80);
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(625, 168, 26, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c96f2e';
  ctx.beginPath();
  ctx.arc(650, 148, 10, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBackground(ctx, stage, scrollX, time) {
  if (stage.id === 'kitchen') {
    drawFarmhouseWall(ctx, stage);
    return;
  }
  skyGradient(ctx, stage);
  drawSun(ctx, stage, scrollX);
  const cloudDrift = (time * 12 + scrollX * 0.05) % 1400;
  const wrapX = (base, period) => ((base % period) + period) % period - 60;
  drawCloud(ctx, wrapX(300 - cloudDrift, 1400), 90, 1.1, 'rgba(255, 240, 210, 0.75)');
  drawCloud(ctx, wrapX(900 - time * 8 - scrollX * 0.03, 1500), 150, 0.9, 'rgba(255, 240, 210, 0.55)');
  drawCloud(ctx, wrapX(620 - time * 5 - scrollX * 0.02, 1500), 60, 0.7, 'rgba(255, 240, 210, 0.45)');

  // Far silhouettes.
  ctx.save();
  ctx.globalAlpha = 0.55;
  const farOffset = scrollX * 0.25;
  if (stage.id === 'farmyard') {
    drawBarn(ctx, 420 - (farOffset % 1600), GROUND_Y, 0.9);
    drawBarn(ctx, 420 - (farOffset % 1600) + 1600, GROUND_Y, 0.9);
    drawPine(ctx, 1050 - (farOffset % 1400), GROUND_Y, 150, '#6b7a3a');
    drawPine(ctx, 1050 - (farOffset % 1400) + 1400, GROUND_Y, 150, '#6b7a3a');
  } else {
    for (let i = 0; i < 6; i++) {
      const x = i * 260 - (farOffset % 260);
      drawPine(ctx, x, GROUND_Y, 190 + (i % 2) * 40, '#2f5233');
    }
  }
  ctx.restore();

  // Mid silhouettes: fence posts and haystacks drifting by.
  const midOffset = scrollX * 0.55;
  ctx.save();
  ctx.globalAlpha = 0.8;
  if (stage.id === 'farmyard') {
    for (let i = 0; i < 9; i++) {
      const x = i * 170 - (midOffset % 170);
      ctx.fillStyle = '#7a5a30';
      ctx.fillRect(x, GROUND_Y - 66, 8, 66);
      ctx.fillRect(x - 26, GROUND_Y - 58, 60, 6);
      ctx.fillRect(x - 26, GROUND_Y - 40, 60, 6);
    }
  } else {
    for (let i = 0; i < 8; i++) {
      const x = i * 190 - (midOffset % 190);
      ctx.fillStyle = '#3d5a2a';
      ctx.beginPath();
      ctx.ellipse(x, GROUND_Y - 12, 46, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawGround(ctx, stage, scrollX) {
  const gradient = ctx.createLinearGradient(0, GROUND_Y, 0, VIEW.height);
  gradient.addColorStop(0, stage.groundTop);
  gradient.addColorStop(1, stage.groundBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, GROUND_Y, VIEW.width, VIEW.height - GROUND_Y);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, GROUND_Y, VIEW.width, 10);
  // Scuff marks scrolling with the ground.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  const offset = scrollX % 90;
  for (let x = -offset; x < VIEW.width; x += 90) {
    ctx.fillRect(x, GROUND_Y + 34, 34, 5);
    ctx.fillRect(x + 48, GROUND_Y + 66, 22, 4);
  }
  if (stage.id === 'kitchen') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let x = -((scrollX * 1) % 120); x < VIEW.width; x += 120) {
      ctx.fillRect(x, GROUND_Y, 3, VIEW.height - GROUND_Y);
    }
  }
}

// Giblet, the turkey: tail fan, brown body, red wattle, worried eye.
// The legs pedal with the run cycle; the body bobs a little as it runs.
export function drawTurkey(ctx, turkey, time) {
  const x = turkey.x;
  const feetY = turkey.grounded ? GROUND_Y : turkey.y + TURKEY_H;
  const squash = turkey.ducking ? 0.62 : 1;
  const bob = turkey.grounded ? Math.sin(turkey.runCycle) * 3 : 0;
  const bodyY = feetY - 34 * squash + bob;
  const blink = turkey.invulnerable && Math.floor(time * 14) % 2 === 0;

  ctx.save();
  if (blink) ctx.globalAlpha = 0.35;
  ctx.translate(x, bodyY);

  // Tail fan: five feathers fanning out behind.
  const fanColors = ['#d64541', '#e07b39', '#c96f2e', '#a63a2e', '#e07b39'];
  for (let i = 0; i < 5; i++) {
    const angle = -2.35 + i * 0.42;
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = fanColors[i];
    ctx.beginPath();
    ctx.ellipse(-38, -14, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f3e6c8';
    ctx.beginPath();
    ctx.ellipse(-52, -14, 7, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Legs, pedalling.
  const legSwing = turkey.grounded ? Math.sin(turkey.runCycle) * 12 : 8;
  ctx.strokeStyle = '#e09f3e';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 26 * squash);
  ctx.lineTo(-6 + legSwing, feetY - bodyY);
  ctx.moveTo(8, 26 * squash);
  ctx.lineTo(8 - legSwing, feetY - bodyY);
  ctx.stroke();

  // Body.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 30 * squash, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b4226';
  ctx.beginPath();
  ctx.ellipse(-4, 6 * squash, 28, 20 * squash, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing, flapping a touch when airborne.
  const wingLift = turkey.grounded ? Math.sin(turkey.runCycle) * 2 : -8;
  ctx.fillStyle = '#5d3a1a';
  ctx.beginPath();
  ctx.ellipse(-6, -2 + wingLift, 22, 13 * squash, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Neck and head.
  const headX = 34;
  const headY = -34 * squash;
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(24, -12 * squash);
  ctx.lineTo(headX - 4, headY + 8);
  ctx.stroke();
  ctx.fillStyle = '#a9713f';
  ctx.beginPath();
  ctx.arc(headX, headY, 13, 0, Math.PI * 2);
  ctx.fill();
  // Beak.
  ctx.fillStyle = '#e07b39';
  ctx.beginPath();
  ctx.moveTo(headX + 8, headY - 2);
  ctx.lineTo(headX + 24, headY + 3);
  ctx.lineTo(headX + 8, headY + 7);
  ctx.closePath();
  ctx.fill();
  // Wattle.
  ctx.fillStyle = '#d64541';
  ctx.beginPath();
  ctx.ellipse(headX + 6, headY + 12, 5, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Eye: wide with worry.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(headX + 3, headY - 4, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1a16';
  ctx.beginPath();
  ctx.arc(headX + 4.5, headY - 4, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Farmer Bramwell: straw hat, plaid shirt, overalls, cleaver in hand,
// gaining on the turkey whenever the pressure meter climbs.
export function drawFarmer(ctx, farmerX, time, pressure) {
  if (farmerX < -160) return;
  const feetY = GROUND_Y;
  const runPhase = time * 13;
  const lean = 0.12 + (pressure / 100) * 0.1;
  ctx.save();
  ctx.translate(farmerX, feetY);
  ctx.rotate(lean * 0.3);

  const legSwing = Math.sin(runPhase) * 16;
  ctx.strokeStyle = '#2e4a6b';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -58);
  ctx.lineTo(-8 + legSwing, 0);
  ctx.moveTo(0, -58);
  ctx.lineTo(8 - legSwing, 0);
  ctx.stroke();

  // Overalls and plaid shirt.
  ctx.fillStyle = '#2e4a6b';
  ctx.fillRect(-16, -92, 32, 40);
  ctx.fillStyle = '#a63a2e';
  ctx.fillRect(-20, -128, 40, 40);
  ctx.strokeStyle = '#f3e6c8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, -116);
  ctx.lineTo(20, -116);
  ctx.moveTo(-20, -102);
  ctx.lineTo(20, -102);
  ctx.moveTo(-6, -128);
  ctx.lineTo(-6, -88);
  ctx.moveTo(8, -128);
  ctx.lineTo(8, -88);
  ctx.stroke();

  // Reaching arm with the cleaver.
  const armSwing = Math.sin(runPhase) * 6;
  ctx.strokeStyle = '#c98d5f';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(14, -118);
  ctx.lineTo(44, -96 + armSwing);
  ctx.stroke();
  ctx.fillStyle = '#c8ccd2';
  ctx.beginPath();
  ctx.moveTo(44, -104 + armSwing);
  ctx.lineTo(70, -92 + armSwing);
  ctx.lineTo(70, -76 + armSwing);
  ctx.lineTo(44, -86 + armSwing);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(38, -100 + armSwing, 10, 8);

  // Head, nose and straw hat.
  ctx.fillStyle = '#e8b88a';
  ctx.beginPath();
  ctx.arc(4, -146, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8b88a';
  ctx.beginPath();
  ctx.arc(20, -144, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(10, -150, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1a16';
  ctx.beginPath();
  ctx.arc(11, -150, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8c832';
  ctx.beginPath();
  ctx.ellipse(4, -158, 34, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d4a017';
  ctx.beginPath();
  ctx.ellipse(4, -162, 18, 10, 0, Math.PI, 0);
  ctx.fill();
  ctx.restore();

  // Shout bubble when he is close enough to smell the stuffing.
  if (pressure > 62) {
    ctx.save();
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    const text = pressure > 85 ? 'GOTCHA!' : 'COME BACK HERE!';
    const w = ctx.measureText(text).width + 24;
    const bx = farmerX + 40;
    const by = feetY - 215;
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, bx - w / 2, by, w, 34, 16);
    ctx.fill();
    ctx.strokeStyle = '#a63a2e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#a63a2e';
    ctx.fillText(text, bx, by + 23);
    ctx.restore();
  }
}

function drawFence(ctx, o) {
  ctx.fillStyle = '#7a5a30';
  ctx.fillRect(o.x, o.y + 6, 8, o.h - 6);
  ctx.fillRect(o.x + o.w - 8, o.y + 6, 8, o.h - 6);
  ctx.fillRect(o.x - 4, o.y + 16, o.w + 8, 7);
  ctx.fillRect(o.x - 4, o.y + 42, o.w + 8, 7);
  ctx.fillStyle = '#8a6b3d';
  ctx.beginPath();
  ctx.moveTo(o.x, o.y + 6);
  ctx.lineTo(o.x + 4, o.y - 4);
  ctx.lineTo(o.x + 8, o.y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(o.x + o.w - 8, o.y + 6);
  ctx.lineTo(o.x + o.w - 4, o.y - 4);
  ctx.lineTo(o.x + o.w, o.y + 6);
  ctx.closePath();
  ctx.fill();
}

function drawHay(ctx, o) {
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.ellipse(o.x + o.w / 2, o.y + o.h - 8, o.w / 2, o.h / 2 - 4, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#b57f24';
  ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(o.x + o.w / 2 + i * 12, o.y + 14);
    ctx.quadraticCurveTo(o.x + o.w / 2 + i * 16, o.y + o.h / 2, o.x + o.w / 2 + i * 12, o.y + o.h - 8);
    ctx.stroke();
  }
}

function drawPumpkin(ctx, o, seed) {
  const cx = o.x + o.w / 2;
  const cy = o.y + o.h - 14;
  ctx.fillStyle = '#e07b39';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.ellipse(cx + i * 14, cy, 18, 26, i * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#b85c1e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy - 24);
  ctx.quadraticCurveTo(cx - 6, cy, cx - 12, cy + 24);
  ctx.moveTo(cx + 12, cy - 24);
  ctx.quadraticCurveTo(cx + 6, cy, cx + 12, cy + 24);
  ctx.stroke();
  ctx.fillStyle = '#4e7a3a';
  ctx.fillRect(cx - 3, cy - 34, 6, 12);
  ctx.fillStyle = '#1d1a16';
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 6);
  ctx.lineTo(cx - 2, cy + 2);
  ctx.lineTo(cx + 4, cy - 6);
  ctx.closePath();
  ctx.fill();
}

function drawOven(ctx, o, time) {
  // A big farmhouse oven, black iron with a glowing door.
  ctx.fillStyle = '#2e2a26';
  roundRect(ctx, o.x, o.y, o.w, o.h, 8);
  ctx.fill();
  ctx.fillStyle = '#4a4238';
  ctx.fillRect(o.x + 10, o.y + 8, o.w - 20, 26);
  ctx.fillStyle = '#1d1a16';
  ctx.fillRect(o.x + 18, o.y + 46, o.w - 36, 52);
  const glowPulse = o.fireOn ? 0.75 + Math.sin(time * 18) * 0.25 : 0.25;
  ctx.fillStyle = `rgba(255, ${Math.floor(120 + glowPulse * 80)}, 40, ${0.55 + glowPulse * 0.4})`;
  ctx.fillRect(o.x + 24, o.y + 52, o.w - 48, 40);
  ctx.fillStyle = '#c8ccd2';
  ctx.fillRect(o.x + 18, o.y + 42, o.w - 36, 5);
  ctx.fillStyle = '#8a8078';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(o.x + 34 + i * 18, o.y + 21, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#1d1a16';
  ctx.fillRect(o.x - 6, o.y - 14, o.w + 12, 14);
  // Chimney pipe.
  ctx.fillStyle = '#4a4238';
  ctx.fillRect(o.x + o.w / 2 - 12, o.y - 44, 24, 32);
  if (o.fireOn) {
    // Flame jets licking out of the oven door, toward the runner.
    for (let i = 0; i < 3; i++) {
      const fy = o.y + 62 + i * 18;
      const flameLen = 52 + Math.sin(time * 22 + i * 1.7) * 14;
      const flame = ctx.createLinearGradient(o.x, 0, o.x - flameLen, 0);
      flame.addColorStop(0, 'rgba(255, 200, 60, 0.95)');
      flame.addColorStop(0.6, 'rgba(255, 110, 30, 0.85)');
      flame.addColorStop(1, 'rgba(255, 60, 20, 0)');
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.moveTo(o.x, fy - 9);
      ctx.quadraticCurveTo(o.x - flameLen - 16, fy, o.x, fy + 9);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT!', o.x + o.w / 2, o.y - 22);
  }
}

function drawKnife(ctx, o, time) {
  if (o.knifeState === 'gone') return;
  const bladeY = o.knifeY;
  const glint = o.knifeState === 'telegraph' && Math.floor(time * 12) % 2 === 0;
  if (o.knifeState === 'hang' || o.knifeState === 'telegraph') {
    // Rope from the ceiling beam.
    ctx.strokeStyle = '#8a6f4d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.x + o.w / 2, 0);
    ctx.lineTo(o.x + o.w / 2, 120);
    ctx.stroke();
  }
  if (glint) {
    ctx.fillStyle = 'rgba(255, 240, 150, 0.9)';
    ctx.beginPath();
    ctx.arc(o.x + o.w / 2, 130, 26 + Math.sin(time * 20) * 6, 0, Math.PI * 2);
    ctx.fill();
  }
  // The cleaver: steel blade, wooden handle.
  ctx.save();
  ctx.translate(o.x + o.w / 2, bladeY + o.h / 2);
  ctx.fillStyle = '#c8ccd2';
  ctx.beginPath();
  ctx.moveTo(-14, -o.h / 2 + 18);
  ctx.lineTo(14, -o.h / 2 + 18);
  ctx.lineTo(14, o.h / 2 - 6);
  ctx.lineTo(-14, o.h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#9aa0a8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, o.h / 2 - 14);
  ctx.lineTo(14, o.h / 2 - 18);
  ctx.stroke();
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(-16, -o.h / 2, 32, 18);
  ctx.restore();
}

function drawPot(ctx, o) {
  ctx.fillStyle = '#8a6f4d';
  ctx.beginPath();
  ctx.ellipse(o.x + o.w / 2, o.y + o.h - 6, o.w / 2, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b5533c';
  ctx.fillRect(o.x + 8, o.y + 10, o.w - 16, o.h - 16);
  ctx.fillStyle = '#d4694e';
  ctx.beginPath();
  ctx.ellipse(o.x + o.w / 2, o.y + 12, (o.w - 16) / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(o.x - 8, o.y + 22, 10, 8);
  ctx.fillRect(o.x + o.w - 2, o.y + 22, 10, 8);
}

function drawLog(ctx, o) {
  ctx.fillStyle = '#6b4226';
  roundRect(ctx, o.x, o.y + 8, o.w, o.h - 8, 12);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(o.x + 8, o.y + o.h / 2 + 4, 10, (o.h - 8) / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a9713f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(o.x + 8, o.y + o.h / 2 + 4, 5, (o.h - 16) / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBush(ctx, o) {
  ctx.fillStyle = '#2f5233';
  ctx.beginPath();
  ctx.arc(o.x + 18, o.y + o.h - 18, 22, 0, Math.PI * 2);
  ctx.arc(o.x + 44, o.y + o.h - 30, 26, 0, Math.PI * 2);
  ctx.arc(o.x + 68, o.y + o.h - 18, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c96f2e';
  ctx.beginPath();
  ctx.arc(o.x + 30, o.y + o.h - 34, 4, 0, Math.PI * 2);
  ctx.arc(o.x + 56, o.y + o.h - 26, 4, 0, Math.PI * 2);
  ctx.fill();
}

export function drawObstacle(ctx, obstacle, time) {
  if (obstacle.kind === 'knife' && obstacle.knifeState === 'hang') {
    // Hanging blade, swaying gently above the kitchen.
    const sway = Math.sin(time * 1.4 + obstacle.seed * 6) * 6;
    drawKnife(ctx, { ...obstacle, knifeY: 120, x: obstacle.x + sway }, time);
    return;
  }
  if (obstacle.kind === 'knife') {
    drawKnife(ctx, obstacle, time);
    return;
  }
  const drawer = {
    fence: drawFence,
    hay: drawHay,
    pumpkin: drawPumpkin,
    oven: drawOven,
    pot: drawPot,
    log: drawLog,
    bush: drawBush,
  }[obstacle.kind];
  if (drawer) drawer(ctx, obstacle, time);
}

export function drawPickup(ctx, pickup, time) {
  const bobY = Math.sin(pickup.bob) * 4;
  if (pickup.kind === 'corn') {
    ctx.save();
    ctx.translate(pickup.x, pickup.y + bobY);
    ctx.rotate(0.5);
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9a441';
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        ctx.beginPath();
        ctx.arc(c * 4, r * 7, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#4e7a3a';
    ctx.beginPath();
    ctx.moveTo(-4, 14);
    ctx.lineTo(4, 14);
    ctx.lineTo(0, 22);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else {
    // Golden feather: glowing, spinning slowly, worth the risk.
    ctx.save();
    ctx.translate(pickup.x, pickup.y + bobY);
    ctx.rotate(Math.sin(time * 2) * 0.3);
    ctx.fillStyle = 'rgba(255, 215, 90, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd75e';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 20, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 14);
    ctx.lineTo(6, -16);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
