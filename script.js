/**
 * Project: Heart of Words (heart-of-words)
 * Description: Interactive mathematical heart shape animation formed entirely of love words
 * Author: @wastav.irl
 * License: MIT
 * Engineering Quality & Audit Pass: 60fps Batch Render, Focus Trap, URL Safety & Mobile Polish
 */

const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const heartCanvas = document.getElementById('heartCanvas');
const ctx = heartCanvas.getContext('2d');

// Viewport & High-DPI resolution
let width = window.innerWidth;
let height = window.innerHeight;
let centerX = width / 2;
let centerY = height / 2;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

// Accessibility: Reduced Motion
const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = prefersReducedMotionQuery.matches;
prefersReducedMotionQuery.addEventListener('change', e => {
  prefersReducedMotion = e.matches;
  initHeartParticles();
});

// Color Themes Palette Definitions
const THEMES = {
  crimson: {
    name: 'Crimson',
    primary: '#ff2a6d',
    glow: 'rgba(255, 42, 109, 0.75)',
    shades: ['#ff1758', '#ff2a6d', '#ff5285', '#ff789e', '#ffa8c0', '#ffd6e3', '#ffffff']
  },
  rose: {
    name: 'Rose Pink',
    primary: '#ff6b9d',
    glow: 'rgba(255, 107, 157, 0.75)',
    shades: ['#e63975', '#ff5285', '#ff6b9d', '#ff85b3', '#ffa3c8', '#ffd6e3', '#ffffff']
  },
  violet: {
    name: 'Cyber Violet',
    primary: '#c77dff',
    glow: 'rgba(199, 125, 255, 0.75)',
    shades: ['#7b2cbf', '#9d4edd', '#b5179e', '#c77dff', '#e0aaff', '#eed6ff', '#ffffff']
  },
  amber: {
    name: 'Sunset Gold',
    primary: '#ffd166',
    glow: 'rgba(255, 178, 102, 0.75)',
    shades: ['#ff4d6d', '#ff758f', '#ff9e64', '#ffb3c1', '#ffd166', '#ffe8a3', '#ffffff']
  }
};

const DEFAULT_MESSAGE = 'I Love You';
const DEFAULT_THEME_KEY = 'crimson';
const DEFAULT_SPEED = 1.0;

// Application State
let currentMessage = DEFAULT_MESSAGE;
let currentThemeKey = DEFAULT_THEME_KEY;
let currentTheme = THEMES[currentThemeKey];
let speedMultiplier = DEFAULT_SPEED;
let currentFontSize = 10;

let particles = [];
let bgParticles = [];
let mouse = { x: -1000, y: -1000 };

let animationStartTime = performance.now();
let totalAnimationDuration = 0;
let isCompleted = false;
let completionTime = 0;
let lastBeatAudioIndex = -1;

let isPaused = false;
let pauseStartTime = 0;
let lastFocusedElement = null;

// --- Web Audio API Procedural Ambient Music & Heartbeat Synthesis ---
let audioCtx = null;
let audioGainNode = null;
let isAudioActive = false;
let ambientInterval = null;
const CELESTIAL_NOTES = [349.23, 440.00, 523.25, 659.25, 392.00, 523.25]; // F4, A4, C5, E5, G4, C5
let currentNoteIndex = 0;

function initAudioSystem() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      audioGainNode = audioCtx.createGain();
      audioGainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      audioGainNode.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playCelestialNote(freq) {
  if (!isAudioActive || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.045, now + 0.1);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(audioGainNode);

    osc.start(now);
    osc.stop(now + 1.9);
  } catch (err) {
    // Ignore audio context glitches
  }
}

function playHeartbeatThump(isSecondBeat = false) {
  if (!isAudioActive || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const thumpGain = audioCtx.createGain();

    osc.type = 'sine';
    const startFreq = isSecondBeat ? 48 : 56;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.18);

    const maxVol = isSecondBeat ? 0.05 : 0.07;
    thumpGain.gain.setValueAtTime(0, now);
    thumpGain.gain.linearRampToValueAtTime(maxVol, now + 0.02);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(thumpGain);
    thumpGain.connect(audioGainNode);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {
    // Ignore audio context glitches
  }
}

function toggleAudio() {
  initAudioSystem();
  isAudioActive = !isAudioActive;

  const audioBtn = document.getElementById('audioBtn');
  const audioBtnLabel = document.getElementById('audioBtnLabel');
  const audioIcon = document.getElementById('audioIcon');

  if (isAudioActive) {
    audioBtn.classList.add('playing');
    audioBtnLabel.textContent = 'Mute';
    audioBtn.setAttribute('aria-label', 'Mute audio');
    audioIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';

    if (ambientInterval) clearInterval(ambientInterval);
    playCelestialNote(CELESTIAL_NOTES[0]);
    ambientInterval = setInterval(() => {
      if (isAudioActive && !isPaused) {
        currentNoteIndex = (currentNoteIndex + 1) % CELESTIAL_NOTES.length;
        playCelestialNote(CELESTIAL_NOTES[currentNoteIndex]);
      }
    }, 1600);
    showToast('Ambient Sound: Enabled 🎵');
  } else {
    audioBtn.classList.remove('playing');
    audioBtnLabel.textContent = 'Sound';
    audioBtn.setAttribute('aria-label', 'Enable sound');
    audioIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
    if (ambientInterval) clearInterval(ambientInterval);
    showToast('Ambient Sound: Muted 🔇');
  }
}

// --- High-DPI Canvas Setup ---
function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  centerX = width / 2;
  centerY = height / 2;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  bgCanvas.width = Math.floor(width * dpr);
  bgCanvas.height = Math.floor(height * dpr);
  bgCanvas.style.width = width + 'px';
  bgCanvas.style.height = height + 'px';

  heartCanvas.width = Math.floor(width * dpr);
  heartCanvas.height = Math.floor(height * dpr);
  heartCanvas.style.width = width + 'px';
  heartCanvas.style.height = height + 'px';
}

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

// Point-in-polygon raycasting algorithm
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

// Generate the heart particle targets
function initHeartParticles() {
  particles = [];
  isCompleted = false;
  completionTime = 0;
  lastBeatAudioIndex = -1;

  const completionBanner = document.getElementById('completionBanner');
  if (completionBanner) completionBanner.classList.remove('show');

  if (isPaused) {
    togglePause();
  }

  const minDim = Math.min(width, height);
  const isMobile = minDim < 600;

  // Responsive scale factor and typography
  const scale = isMobile ? minDim / 38 : minDim / 34;
  currentFontSize = isMobile ? 9 : 10;

  // Measure text width dynamically
  ctx.save();
  ctx.font = `600 ${currentFontSize}px 'Outfit', sans-serif`;
  const textWidth = ctx.measureText(currentMessage).width;
  ctx.restore();

  const wordWidth = Math.max(isMobile ? 54 : 64, Math.ceil(textWidth + (isMobile ? 16 : 22)));
  const rowHeight = isMobile ? 22 : 25;

  // Centroid offset (+2.5 * scale) aligns bounding box center with viewport centerY
  const yOffset = 2.5 * scale;

  // Build continuous heart polygon for boundary detection
  const heartPolygon = [];
  const polygonSteps = 200;
  for (let i = 0; i < polygonSteps; i++) {
    const t = (i / polygonSteps) * Math.PI * 2;
    const pt = getHeartPoint(t, scale);
    heartPolygon.push({ x: pt.x, y: pt.y - yOffset });
  }

  // 1. OUTLINE PARTICLES (Sequential around perimeter)
  const outlinePoints = [];
  const fineSteps = 3000;
  let lastPt = null;

  const minOutlineDist = Math.max(isMobile ? 24 : 30, Math.ceil(textWidth * 0.52));
  const minOutlineDx = Math.max(isMobile ? 22 : 26, Math.ceil(textWidth * 0.48));
  const minOutlineDy = isMobile ? 10 : 12;

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
      if (dist >= minOutlineDist && (Math.abs(dx) >= minOutlineDx || Math.abs(dy) >= minOutlineDy)) {
        outlinePoints.push({ x: currX, y: currY });
        lastPt = { x: currX, y: currY };
      }
    }
  }

  const baseOutlineStep = prefersReducedMotion ? 0 : 110;
  const outlineDelayStep = baseOutlineStep / speedMultiplier;

  for (let i = 0; i < outlinePoints.length; i++) {
    const opt = outlinePoints[i];
    const targetX = centerX + opt.x;
    const targetY = centerY + opt.y;
    const delay = i * outlineDelayStep;
    createParticle(targetX, targetY, true, delay, currentFontSize);
  }

  const outlineEndTime = prefersReducedMotion ? 0 : outlinePoints.length * outlineDelayStep + (350 / speedMultiplier);

  // 2. INTERIOR PARTICLES (Airy spacing matching outline)
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

      if (isInsideHeartPolygon(testX, testY, heartPolygon)) {
        let tooCloseToOutline = false;
        const marginX = Math.max(isMobile ? 28 : 36, Math.ceil(textWidth * 0.5));
        const marginY = isMobile ? 14 : 16;
        for (let k = 0; k < outlinePoints.length; k++) {
          const odx = testX - outlinePoints[k].x;
          const ody = testY - outlinePoints[k].y;
          if (Math.abs(odx) < marginX && Math.abs(ody) < marginY) {
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

  // 3. ORDER INTERIOR PARTICLES: Top-to-Bottom cascade
  interiorTargets.sort((a, b) => a.y - b.y);

  const minYTarget = Math.min(...interiorTargets.map(it => it.y));
  const maxYTarget = Math.max(...interiorTargets.map(it => it.y));
  const yRange = (maxYTarget - minYTarget) || 1;
  const baseCascadeDuration = prefersReducedMotion ? 0 : 4200;
  const cascadeDuration = baseCascadeDuration / speedMultiplier;

  for (let i = 0; i < interiorTargets.length; i++) {
    const it = interiorTargets[i];
    const targetX = centerX + it.x;
    const targetY = centerY + it.y;
    const normalizedY = (it.y - minYTarget) / yRange;
    const delay = prefersReducedMotion ? 0 : outlineEndTime + normalizedY * cascadeDuration + (Math.random() * 80) / speedMultiplier;
    createParticle(targetX, targetY, false, delay, currentFontSize);
  }

  totalAnimationDuration = prefersReducedMotion ? 0 : outlineEndTime + cascadeDuration + (550 / speedMultiplier) + 100;
  animationStartTime = performance.now();
}

function createParticle(targetX, targetY, isOutline, delay, fontSize) {
  const shades = currentTheme.shades;
  const color = shades[Math.floor(Math.random() * shades.length)];

  const dx = targetX - centerX;
  const dy = targetY - centerY;
  const distFromCenter = Math.sqrt(dx * dx + dy * dy);

  const baseDuration = isOutline ? 380 : 550;
  const duration = prefersReducedMotion ? 1 : Math.max(150, baseDuration / speedMultiplier);

  const startX = prefersReducedMotion ? targetX : (isOutline ? targetX - 8 : targetX);
  const startY = prefersReducedMotion ? targetY : (isOutline ? targetY : targetY - 14);

  particles.push({
    startX: startX,
    startY: startY,
    currX: startX,
    currY: startY,
    targetX: targetX,
    targetY: targetY,
    distFromCenter: distFromCenter,
    text: currentMessage,
    fontSize: fontSize,
    color: color,
    glowIntensity: isOutline ? 6 : 5,
    isOutline: isOutline,
    delay: delay,
    duration: duration,
    alpha: prefersReducedMotion ? 1 : 0
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

// --- Main Heart Canvas Render Loop (Optimized Batch Rendering) ---
function renderHeart(currentTime) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const effectiveTime = isPaused ? pauseStartTime : currentTime;
  const elapsed = effectiveTime - animationStartTime;

  // Completion detection for subtle heartbeat pulse & completion message
  if (elapsed >= totalAnimationDuration && !isCompleted) {
    isCompleted = true;
    completionTime = effectiveTime;

    const completionBanner = document.getElementById('completionBanner');
    const completionText = document.getElementById('completionText');
    if (completionBanner && completionText) {
      const phrase = currentMessage === DEFAULT_MESSAGE ? 'you' : currentMessage;
      completionText.textContent = `Every word beats for ${phrase} ✨`;
      completionBanner.classList.add('show');
    }
  }

  // Subtle restrained heartbeat pulse (lub-dub rhythm) once fully formed
  let heartbeatScale = 1;
  let heartbeatGlowBonus = 0;

  if (isCompleted && !prefersReducedMotion) {
    const cycle = ((effectiveTime - completionTime) * 0.0012) % 1.5;
    if (cycle < 0.18) {
      // First beat (lub)
      const beatProgress = Math.sin((cycle / 0.18) * Math.PI);
      heartbeatScale = 1 + beatProgress * 0.022;
      heartbeatGlowBonus = beatProgress * 4;

      if (lastBeatAudioIndex !== 1) {
        lastBeatAudioIndex = 1;
        playHeartbeatThump(false);
      }
    } else if (cycle > 0.28 && cycle < 0.44) {
      // Second beat (dub)
      const beatProgress = Math.sin(((cycle - 0.28) / 0.16) * Math.PI);
      heartbeatScale = 1 + beatProgress * 0.014;
      heartbeatGlowBonus = beatProgress * 2.5;

      if (lastBeatAudioIndex !== 2) {
        lastBeatAudioIndex = 2;
        playHeartbeatThump(true);
      }
    } else if (cycle >= 0.48) {
      lastBeatAudioIndex = 0;
    }
  }

  // Set invariant text and shadow states ONCE to avoid hundreds of redundant save/restore calls per frame
  ctx.font = `600 ${currentFontSize}px 'Outfit', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = currentTheme.glow;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    if (elapsed < p.delay) {
      continue;
    }

    const pElapsed = elapsed - p.delay;
    const progress = Math.min(1, pElapsed / p.duration);
    const eased = prefersReducedMotion ? 1 : easeOutBack(progress);

    let posX = p.startX + (p.targetX - p.startX) * eased;
    let posY = p.startY + (p.targetY - p.startY) * eased;

    if (progress >= 1) {
      posX = p.targetX;
      posY = p.targetY;
      p.alpha = 1;

      // Apply subtle heartbeat pulse from centroid
      if (isCompleted && heartbeatScale !== 1) {
        posX = centerX + (posX - centerX) * heartbeatScale;
        posY = centerY + (posY - centerY) * heartbeatScale;
      }
    } else {
      p.alpha = Math.min(1, progress * 1.3);
    }

    // Interactive mouse repulsion with zero-distance epsilon guard
    if (mouse.x > 0 && mouse.y > 0) {
      const mdx = posX - mouse.x;
      const mdy = posY - mouse.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      const maxEffectDist = 100;

      if (mDist > 0.001 && mDist < maxEffectDist) {
        const force = (1 - mDist / maxEffectDist) * 20;
        posX += (mdx / mDist) * force;
        posY += (mdy / mDist) * force;
      }
    }

    p.currX = posX;
    p.currY = posY;

    // Fast inline draw
    ctx.globalAlpha = p.alpha;
    ctx.shadowBlur = p.glowIntensity + heartbeatGlowBonus;
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, posX, posY);
  }

  // Reset alpha & shadow
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  requestAnimationFrame(renderHeart);
}

// Background Canvas Render Loop
function renderBackground(currentTime) {
  bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  bgCtx.clearRect(0, 0, width, height);

  bgCtx.fillStyle = '#000000';
  bgCtx.fillRect(0, 0, width, height);

  const effectiveTime = isPaused ? pauseStartTime : currentTime;

  for (let i = 0; i < bgParticles.length; i++) {
    const star = bgParticles[i];
    if (!prefersReducedMotion && !isPaused) {
      star.y += star.speedY;
      star.x += star.speedX;

      if (star.y < -10) star.y = height + 10;
      if (star.x < -10) star.x = width + 10;
      if (star.x > width + 10) star.x = -10;
    }

    const twinkle = prefersReducedMotion ? 0.7 : (Math.sin(effectiveTime * star.twinkleSpeed + star.phase) + 1) * 0.5;
    const currentAlpha = star.alpha * (0.3 + twinkle * 0.7);

    bgCtx.save();
    bgCtx.globalAlpha = currentAlpha;
    bgCtx.beginPath();
    bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    bgCtx.fillStyle = '#ffffff';
    bgCtx.shadowColor = currentTheme.glow;
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

// Click anywhere on canvas to re-bloom (ignoring modal, banner, dock)
window.addEventListener('click', e => {
  if (e.target.closest('.floating-dock') || e.target.closest('.modal-card') || e.target.closest('.completion-banner') || modalOverlay.classList.contains('active')) {
    return;
  }
  initHeartParticles();
});

// Touch support with passive listeners & UI guard
window.addEventListener('touchstart', e => {
  if (e.target.closest('.floating-dock') || e.target.closest('.modal-card') || e.target.closest('.completion-banner')) {
    return;
  }
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener('touchmove', e => {
  if (e.target.closest('.floating-dock') || e.target.closest('.modal-card') || e.target.closest('.completion-banner')) {
    return;
  }
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

window.addEventListener('touchcancel', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

// Debounced Window Resize Handling
let resizeDebounceTimer = null;
function handleResize() {
  resizeCanvas();
  initBackgroundParticles();
  initHeartParticles();
}

window.addEventListener('resize', () => {
  if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
  resizeDebounceTimer = setTimeout(handleResize, 150);
});

// --- UI Controls & Modal Wiring ---
const replayBtn = document.getElementById('replayBtn');
const pauseBtn = document.getElementById('pauseBtn');
const pauseBtnLabel = document.getElementById('pauseBtnLabel');
const pauseIcon = document.getElementById('pauseIcon');
const audioBtn = document.getElementById('audioBtn');
const shareBtn = document.getElementById('shareBtn');
const modalShareBtn = document.getElementById('modalShareBtn');
const openCustomizeBtn = document.getElementById('openCustomizeBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const messageInput = document.getElementById('messageInput');
const charCount = document.getElementById('charCount');
const applyMessageBtn = document.getElementById('applyMessageBtn');
const themeChips = document.querySelectorAll('.theme-chip');
const speedChips = document.querySelectorAll('.speed-chip');
const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
const toastNotification = document.getElementById('toastNotification');
const dismissBannerBtn = document.getElementById('dismissBannerBtn');
const completionBanner = document.getElementById('completionBanner');

let toastTimer = null;
function showToast(text) {
  if (!toastNotification) return;
  toastNotification.textContent = text;
  toastNotification.classList.add('active');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastNotification.classList.remove('active');
  }, 3200);
}

// Copy Shareable URL (Robust with file:// fallback)
function copyShareableLink() {
  const isFileProto = window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null';
  const baseUrl = isFileProto
    ? 'https://wastavnagture97-pixel.github.io/Heart-Of-Words/'
    : (window.location.origin + window.location.pathname);

  const url = new URL(baseUrl);
  url.searchParams.set('m', currentMessage);
  url.searchParams.set('t', currentThemeKey);
  url.searchParams.set('s', speedMultiplier.toString());

  const fullUrl = url.toString();

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullUrl).then(() => {
      showToast('Link copied to clipboard! Share the love 💖');
    }).catch(() => {
      fallbackCopy(fullUrl);
    });
  } else {
    fallbackCopy(fullUrl);
  }
}

function fallbackCopy(text) {
  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  tempInput.style.position = 'fixed';
  tempInput.style.opacity = '0';
  document.body.appendChild(tempInput);
  tempInput.select();
  try {
    document.execCommand('copy');
    showToast('Link copied to clipboard! Share the love 💖');
  } catch (err) {
    showToast('URL ready in address bar 💖');
  }
  document.body.removeChild(tempInput);
}

// Toggle Pause / Resume
function togglePause() {
  if (isPaused) {
    isPaused = false;
    const pausedDuration = performance.now() - pauseStartTime;
    animationStartTime += pausedDuration;
    if (completionTime > 0) completionTime += pausedDuration;
    pauseBtnLabel.textContent = 'Pause';
    pauseBtn.setAttribute('aria-label', 'Pause animation');
    pauseIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  } else {
    isPaused = true;
    pauseStartTime = performance.now();
    pauseBtnLabel.textContent = 'Resume';
    pauseBtn.setAttribute('aria-label', 'Resume animation');
    pauseIcon.innerHTML = '<polygon points="6 3 20 12 6 21 6 3"/>';
  }
}

// Modal open/close with Accessible Focus Trap & Return
function openModal() {
  lastFocusedElement = document.activeElement;
  modalOverlay.classList.add('active');
  modalOverlay.setAttribute('aria-hidden', 'false');
  messageInput.value = currentMessage;
  updateCharCounter();
  messageInput.focus();
}

function closeModal() {
  modalOverlay.classList.remove('active');
  modalOverlay.setAttribute('aria-hidden', 'true');
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

// Focus Trap inside Modal
modalOverlay.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    const focusable = modalOverlay.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;

    const firstElem = focusable[0];
    const lastElem = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElem) {
        e.preventDefault();
        lastElem.focus();
      }
    } else {
      if (document.activeElement === lastElem) {
        e.preventDefault();
        firstElem.focus();
      }
    }
  }
});

function updateCharCounter() {
  charCount.textContent = `${messageInput.value.length}/24`;
}

// Apply Message
function applyCustomMessage() {
  const sanitized = messageInput.value.trim();
  currentMessage = sanitized.length > 0 ? sanitized.substring(0, 24) : DEFAULT_MESSAGE;
  messageInput.value = currentMessage;
  updateCharCounter();
  initHeartParticles();
  closeModal();
}

// Apply Theme
function setTheme(themeKey) {
  if (!THEMES[themeKey]) return;
  currentThemeKey = themeKey;
  currentTheme = THEMES[themeKey];

  document.documentElement.style.setProperty('--primary-color', currentTheme.primary);
  document.documentElement.style.setProperty('--primary-glow', currentTheme.glow);

  themeChips.forEach(chip => {
    const isSelected = chip.getAttribute('data-theme') === themeKey;
    chip.classList.toggle('active', isSelected);
    chip.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  for (let i = 0; i < particles.length; i++) {
    particles[i].color = currentTheme.shades[Math.floor(Math.random() * currentTheme.shades.length)];
  }
}

// Apply Speed
function setSpeed(speedVal) {
  speedMultiplier = parseFloat(speedVal) || 1.0;
  speedChips.forEach(chip => {
    const isSelected = Math.abs(parseFloat(chip.getAttribute('data-speed')) - speedMultiplier) < 0.05;
    chip.classList.toggle('active', isSelected);
    chip.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });
  initHeartParticles();
}

// Restore Defaults
function resetToDefaults() {
  currentMessage = DEFAULT_MESSAGE;
  messageInput.value = DEFAULT_MESSAGE;
  updateCharCounter();
  setTheme(DEFAULT_THEME_KEY);
  setSpeed(DEFAULT_SPEED);
  closeModal();
}

// Safe URL Parsing with URIError guards
function parseURLParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const rawMsg = params.get('m') || params.get('msg');
    const rawTheme = params.get('t') || params.get('theme');
    const rawSpeed = params.get('s') || params.get('speed');

    if (rawMsg) {
      let decoded = rawMsg;
      try {
        decoded = decodeURIComponent(rawMsg);
      } catch (err) {
        decoded = rawMsg;
      }
      decoded = decoded.trim().substring(0, 24);
      if (decoded.length > 0) {
        currentMessage = decoded;
        messageInput.value = decoded;
        updateCharCounter();
      }
    }

    if (rawTheme && THEMES[rawTheme.toLowerCase()]) {
      setTheme(rawTheme.toLowerCase());
    }

    if (rawSpeed) {
      const parsedSpeed = parseFloat(rawSpeed);
      if (!isNaN(parsedSpeed) && parsedSpeed >= 0.5 && parsedSpeed <= 2.0) {
        setSpeed(parsedSpeed);
      }
    }
  } catch (err) {
    // Graceful fallback to defaults
  }
}

// Event Listeners for UI
replayBtn.addEventListener('click', () => {
  initHeartParticles();
});

pauseBtn.addEventListener('click', () => {
  togglePause();
});

audioBtn.addEventListener('click', () => {
  toggleAudio();
});

shareBtn.addEventListener('click', copyShareableLink);
modalShareBtn.addEventListener('click', copyShareableLink);

openCustomizeBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});

messageInput.addEventListener('input', updateCharCounter);
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    applyCustomMessage();
  }
});

applyMessageBtn.addEventListener('click', applyCustomMessage);

themeChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const chosenTheme = chip.getAttribute('data-theme');
    setTheme(chosenTheme);
  });
});

speedChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const chosenSpeed = chip.getAttribute('data-speed');
    setSpeed(chosenSpeed);
  });
});

resetDefaultsBtn.addEventListener('click', resetToDefaults);

if (dismissBannerBtn && completionBanner) {
  dismissBannerBtn.addEventListener('click', () => {
    completionBanner.classList.remove('show');
  });
}

// Initialize App
resizeCanvas();
parseURLParams();
initBackgroundParticles();
initHeartParticles();
requestAnimationFrame(renderBackground);
requestAnimationFrame(renderHeart);
