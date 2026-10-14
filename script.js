/**
 * Project: Heart of Words (heart-of-words)
 * Description: Interactive mathematical heart shape animation formed entirely of love words
 * Author: @wastav.irl
 * License: MIT
 */

const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const heartCanvas = document.getElementById('heartCanvas');
const ctx = heartCanvas.getContext('2d');

let width = (heartCanvas.width = bgCanvas.width = window.innerWidth);
let height = (heartCanvas.height = bgCanvas.height = window.innerHeight);
let centerX = width / 2;
let centerY = height / 2;

// Particles & State
const MESSAGE = 'I Love You';
const SHADES = ['#ff1758', '#ff2a6d', '#ff5285', '#ff789e', '#ffa8c0', '#ffd6e3', '#ffffff'];
const GLOW_COLOR = 'rgba(255, 42, 109, 0.75)';

let particles = [];
let bgParticles = [];
let mouse = { x: -1000, y: -1000 };
let animationStartTime = performance.now();

// Parametric Heart Equations:
// x = 16 * sin^3(t)
// y = -(13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t))
function getHeartPoint(t, scale = 1) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return {
    x: x * scale,
    y: y * scale
  };
}

// Check if a point is inside the heart boundary polygon
function isInsideHeartPolygon(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Generate the heart particle targets:
// Phase 1: Draw the full heart outline sequentially from one side (one by one)
// Phase 2: Once the outline is complete, fill the interior with "I Love You" texts
function initHeartParticles() {
  particles = [];
  const minDim = Math.min(width, height);
  // Scale the heart to be prominent and balanced
  const scale = minDim < 600 ? minDim / 38 : minDim / 34;

  // Shifting up by 2.5 * scale perfectly centers the bounding box at centerY
  const yOffset = 2.5 * scale;

  // Build the continuous heart polygon for boundary detection
  const heartPolygon = [];
  const polygonSteps = 200;
  for (let i = 0; i < polygonSteps; i++) {
    const t = (i / polygonSteps) * Math.PI * 2;
    const pt = getHeartPoint(t, scale);
    heartPolygon.push({ x: pt.x, y: pt.y - yOffset });
  }

  // 1. OUTLINE PARTICLES (Sequential around the perimeter)
  // Step through perimeter from t = 0 to 2*PI
  const outlinePoints = [];
  const fineSteps = 3000;
  let lastPt = null;

  for (let i = 0; i <= fineSteps; i++) {
    const t = (i / fineSteps) * Math.PI * 2;
    const pt = getHeartPoint(t, scale);
    const currX = pt.x;
    const currY = pt.y - yOffset;

    if (!lastPt) {
      outlinePoints.push({ x: currX, y: currY });
      lastPt = { x: currX, y: currY };
    } else {
      const dx = currX - lastPt.x;
      const dy = currY - lastPt.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Ensure comfortable spacing along perimeter so words don't bunch up
      if (dist >= 35 && (Math.abs(dx) >= 32 || Math.abs(dy) >= 12)) {
        outlinePoints.push({ x: currX, y: currY });
        lastPt = { x: currX, y: currY };
      }
    }
  }

  // Create outline particles with sequential timing (one by one, slower and clearly visible)
  const outlineDelayStep = 110; // ms per word (slower, deliberate pacing)
  for (let i = 0; i < outlinePoints.length; i++) {
    const opt = outlinePoints[i];
    const targetX = centerX + opt.x;
    const targetY = centerY + opt.y;
    const delay = i * outlineDelayStep;
    createParticle(targetX, targetY, true, delay);
  }

  // Time when outline completes its full closed loop
  const outlineEndTime = outlinePoints.length * outlineDelayStep + 400;

  // 2. INTERIOR PARTICLES (Airy spacing matching the outline)
  // wordWidth 72px and rowHeight 25px give the exact same breathing room as the outline
  const wordWidth = 72;
  const rowHeight = 25;
  const halfW = 16.5 * scale;
  const minY = -12.5 * scale - yOffset;
  const maxY = 17 * scale - yOffset;

  const interiorTargets = [];
  let row = 0;
  for (let y = minY + 18; y <= maxY - 18; y += rowHeight) {
    const rowOffset = (row % 2 === 0) ? 0 : (wordWidth / 2);
    row++;

    for (let x = -halfW + rowOffset; x <= halfW; x += wordWidth) {
      const jx = (Math.random() - 0.5) * 3;
      const jy = (Math.random() - 0.5) * 2;
      const testX = x + jx;
      const testY = y + jy;

      // Inside heart polygon and keeping a clean margin from outline
      if (isInsideHeartPolygon(testX, testY, heartPolygon)) {
        let tooCloseToOutline = false;
        for (let k = 0; k < outlinePoints.length; k++) {
          const odx = testX - outlinePoints[k].x;
          const ody = testY - outlinePoints[k].y;
          if (Math.abs(odx) < 40 && Math.abs(ody) < 16) {
            tooCloseToOutline = true;
            break;
          }
        }
        if (!tooCloseToOutline) {
          interiorTargets.push({ x: testX, y: testY });
        }
      }
    }
  }

  // 3. ORDER INTERIOR PARTICLES: Fill smoothly from TOP to BOTTOM
  // Sort from top to bottom so words cascade down row by row
  interiorTargets.sort((a, b) => a.y - b.y);

  const minYTarget = Math.min(...interiorTargets.map(it => it.y));
  const maxYTarget = Math.max(...interiorTargets.map(it => it.y));
  const yRange = (maxYTarget - minYTarget) || 1;

  for (let i = 0; i < interiorTargets.length; i++) {
    const it = interiorTargets[i];
    const targetX = centerX + it.x;
    const targetY = centerY + it.y;
    // Progression from top (0) to bottom (1) at a calm, graceful pace
    const normalizedY = (it.y - minYTarget) / yRange;
    const delay = outlineEndTime + normalizedY * 4200 + Math.random() * 80;
    createParticle(targetX, targetY, false, delay);
  }

  animationStartTime = performance.now();
}

function createParticle(targetX, targetY, isOutline, delay) {
  const color = SHADES[Math.floor(Math.random() * SHADES.length)];
  const fontSize = 10;

  const dx = targetX - centerX;
  const dy = targetY - centerY;
  const distFromCenter = Math.sqrt(dx * dx + dy * dy);

  // Outline slides in horizontally;
  // Interior appears right inside, descending softly from above (top to bottom fill)
  const startX = isOutline ? targetX - 8 : targetX;
  const startY = isOutline ? targetY : targetY - 14;
  const duration = isOutline ? 380 : 550;

  particles.push({
    startX: startX,
    startY: startY,
    currX: startX,
    currY: startY,
    targetX: targetX,
    targetY: targetY,
    distFromCenter: distFromCenter,
    text: MESSAGE,
    fontSize: fontSize,
    color: color,
    glowIntensity: isOutline ? 6 : 5,
    isOutline: isOutline,
    delay: delay,
    duration: duration,
    alpha: 0
  });
}

// Background subtle twinkling stars
function initBackgroundParticles() {
  bgParticles = [];
  const count = Math.floor(Math.min(width, height) / 10);
  for (let i = 0; i < count; i++) {
    bgParticles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.6 + 0.2,
      speedY: -(Math.random() * 0.3 + 0.1),
      speedX: (Math.random() - 0.5) * 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2
    });
  }
}

// Blooming animation easing (smooth elastic arrival)
function easeOutBack(x) {
  const c1 = 1.35;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// --- Main Heart Canvas Render Loop ---
function renderHeart(currentTime) {
  ctx.clearRect(0, 0, width, height);

  const elapsed = currentTime - animationStartTime;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    if (elapsed < p.delay) {
      continue;
    }

    const pElapsed = elapsed - p.delay;
    const progress = Math.min(1, pElapsed / p.duration);
    const eased = easeOutBack(progress);

    // Current position expanding from center to target
    let posX = p.startX + (p.targetX - p.startX) * eased;
    let posY = p.startY + (p.targetY - p.startY) * eased;

    // Once formed, settle steadily without any pulsing
    if (progress >= 1) {
      posX = p.targetX;
      posY = p.targetY;
      p.alpha = 1;
    } else {
      p.alpha = Math.min(1, progress * 1.3);
    }

    // Subtle mouse repulsion
    if (mouse.x > 0 && mouse.y > 0) {
      const mdx = posX - mouse.x;
      const mdy = posY - mouse.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      const maxEffectDist = 100;

      if (mDist < maxEffectDist) {
        const force = (1 - mDist / maxEffectDist) * 20;
        posX += (mdx / mDist) * force;
        posY += (mdy / mDist) * force;
      }
    }

    p.currX = posX;
    p.currY = posY;

    // Render tiny "I Love You" text strictly horizontally
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.font = `600 ${p.fontSize}px 'Outfit', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = GLOW_COLOR;
    ctx.shadowBlur = p.glowIntensity;
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, posX, posY);
    ctx.restore();
  }

  requestAnimationFrame(renderHeart);
}

// Background Canvas Render Loop
function renderBackground(currentTime) {
  bgCtx.clearRect(0, 0, width, height);

  // Pure black backdrop
  bgCtx.fillStyle = '#000000';
  bgCtx.fillRect(0, 0, width, height);

  // Ambient twinkling stars
  for (let i = 0; i < bgParticles.length; i++) {
    const star = bgParticles[i];
    star.y += star.speedY;
    star.x += star.speedX;

    if (star.y < -10) star.y = height + 10;
    if (star.x < -10) star.x = width + 10;
    if (star.x > width + 10) star.x = -10;

    const twinkle = (Math.sin(currentTime * star.twinkleSpeed + star.phase) + 1) * 0.5;
    const currentAlpha = star.alpha * (0.3 + twinkle * 0.7);

    bgCtx.save();
    bgCtx.globalAlpha = currentAlpha;
    bgCtx.beginPath();
    bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    bgCtx.fillStyle = '#ffffff';
    bgCtx.shadowColor = GLOW_COLOR;
    bgCtx.shadowBlur = 4;
    bgCtx.fill();
    bgCtx.restore();
  }

  requestAnimationFrame(renderBackground);
}

// Mouse interactions
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

// Click anywhere to re-bloom from center
window.addEventListener('click', () => {
  initHeartParticles();
});

// Touch support
window.addEventListener('touchmove', e => {
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

// Window resize
window.addEventListener('resize', () => {
  width = heartCanvas.width = bgCanvas.width = window.innerWidth;
  height = heartCanvas.height = bgCanvas.height = window.innerHeight;
  centerX = width / 2;
  centerY = height / 2;
  initHeartParticles();
  initBackgroundParticles();
});

// Initialize
initBackgroundParticles();
initHeartParticles();
requestAnimationFrame(renderBackground);
requestAnimationFrame(renderHeart);
