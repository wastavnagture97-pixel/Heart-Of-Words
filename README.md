<div align="center">

  # 💖 Heart of Words
  
  **An interactive, mathematically-driven typographic canvas animation powered by pure Vanilla JavaScript.**

  <p align="center">
    <a href="#-overview">Overview</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#-interactive-controls">Controls</a> •
    <a href="#-mathematics">Mathematics</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-customization-guide">Customization</a> •
    <a href="#-contributing">Contributing</a>
  </p>

</div>

---

## 📖 Overview

**Heart of Words** is a bespoke creative-coding experiment that merges mathematics, typographic art, and interactive particle physics. 

Unlike conventional particle effects that rely on static imagery or distorted text, **Heart of Words** computes the exact parametric coordinates of a cardioid curve in real time. It first choreographs a sequential perimeter trace using microscopic *"I Love You"* typographic units, followed by a graceful cascading fill that gently sweeps from the top lobes to the lower apex.

Set against a sleek, pitch-black backdrop accented with subtle twinkling stardust, each phrase preserves strict horizontal orientation, pristine typography, and fluid physics-based mouse deflection.

---

## ✨ Key Features

- **📐 Precise Parametric Geometry**  
  Employs classical parametric differential equations to render a flawless, aesthetically balanced heart silhouette without geometric clipping or distortion.

- **🎬 Two-Stage Choreographed Bloom**  
  - **Stage 1 (Perimeter Tracing):** Words sprout sequentially along the heart's perimeter, starting from the upper cleft and outlining the silhouette with precise temporal pacing.
  - **Stage 2 (Top-Down Cascade):** Upon outline closure, inner typographic particles cascade systematically downwards in a staggered, vertical waterfall motion.

- **🔤 Clean & Legible Typography**  
  Eliminates messy angular rotations. Every typographic particle sits perfectly horizontal with custom letter spacing and brick-offset collision avoidance, maximizing readability on displays of all pixel densities.

- **🌌 Pitch-Black Canvas with Deep Space Glow**  
  A modern, high-contrast `#000000` backdrop with dynamic twinkling particles, glowing neon-crimson bloom shadows, and soft alpha-depth staging.

- **⚡ Reactive Cursor & Touch Physics**  
  Words intelligently repel away from cursor and touch inputs with spring-back physics, giving the formation an organic, living heartbeat.

- **📱 Fully Responsive & Device-Agnostic**  
  Automatically scales viewport dimensions, centroid offsets, and font sizes across desktop, tablet, and mobile screens.

- **🪶 Zero Dependencies & Ultra-Lightweight**  
  Built strictly with native HTML5 Canvas, modern CSS, and ES6+ Vanilla JavaScript. No bundlers, no build steps, and no third-party runtimes.

---

## 🎮 Interactive Controls

| Input Action | Target | Behavior |
| :--- | :--- | :--- |
| **Mouse Hover / Drag** | Viewport | Repels nearby words organically using radial vector forces |
| **Single Click / Tap** | Anywhere | Re-triggers the full animation cycle and re-blooms from the center |
| **Touch Drag** | Mobile Screen | Smooth finger tracking and repulsive dynamic displacement |
| **Window Resize** | Browser | Automatically recalculates scale factors and realigns the centroid |

---

## 🧮 Mathematical Formulation

The heart's perimeter and interior boundaries are evaluated using the parametric cardioid equations:

$$
\begin{cases}
x(t) = 16 \sin^3(t) \\
y(t) = -\left(13 \cos(t) - 5 \cos(2t) - 2 \cos(3t) - \cos(4t)\right)
\end{cases}
$$

Where:
- $t \in [0, 2\pi]$ represents the parametric angle.
- The negative inversion on $y(t)$ accounts for the inverted vertical axis of the HTML5 Canvas coordinate space ($y \downarrow$).
- A vertical centroid correction factor of $+2.5 \times \text{scale}$ is dynamically applied to align the bounding box center with the exact viewport center $(W/2, H/2)$.

---

## 🏗️ Architecture & Dual-Canvas Pipeline

```text
┌───────────────────────────────────────────────────────────┐
│                     Viewport (Window)                     │
├───────────────────────────────────────────────────────────┤
│  Layer 1 (Z: 1)  │  #bgCanvas     │  Twinkling Stars      │
│                  │                │  Pitch-black backdrop │
├──────────────────┼────────────────┼───────────────────────┤
│  Layer 2 (Z: 2)  │  #heartCanvas   │  Parametric Particles │
│                  │                │  Typographic Engine   │
└───────────────────────────────────────────────────────────┘
```

Separating the ambient backdrop into an independent canvas layer ensures the highest possible render performance ($60\text{fps}+$), preventing unnecessary particle clears while maintaining clean compositing.

---

## 🚀 Getting Started

No installation, Node.js, or build pipeline is required. You can run this project instantly in any environment.

### Option 1: Direct Open
1. **Clone the repository:**
   ```bash
   git clone https://github.com/wastavnagture-irl/Heart-of-Words.git
   cd Heart-of-Words
   ```
2. Double click **`index.html`** or drag it into any modern web browser.

### Option 2: Local Development Server
For the best experience with live reload:
```bash
# Using Python
python -m http.server 3000

# OR using Node.js
npx serve .
```
Navigate to `http://localhost:3000` in your browser.

---

## ⚙️ Customization Guide

All parameters are exposed in [`script.js`](script.js) with clean configuration variables:

### 1. Custom Text Message
Customize the repeated message to any string or person's name:
```javascript
// script.js (Line 19)
const MESSAGE = 'I Love You'; // E.g., 'Forever Yours', 'Always With You'
```

### 2. Color Palette & Glow
Modify the gradient shades and glow bloom color:
```javascript
// script.js (Lines 20-21)
const SHADES = [
  '#ff1758', '#ff2a6d', '#ff5285', 
  '#ff789e', '#ffa8c0', '#ffd6e3', '#ffffff'
];
const GLOW_COLOR = 'rgba(255, 42, 109, 0.75)';
```

### 3. Animation Timing & Speed
Adjust the tempo of the perimeter trace and cascading interior:
```javascript
// Outline trace speed (milliseconds per perimeter step)
const outlineDelayStep = 110; 

// Total interior cascade duration (lower = faster fill)
const delay = outlineEndTime + normalizedY * 4200; 
```

---

## 🌐 Browser Compatibility

| Browser | Supported Version | Status |
| :--- | :--- | :--- |
| **Google Chrome** | 60+ | Full Support (Hardware Accelerated) |
| **Mozilla Firefox** | 55+ | Full Support |
| **Apple Safari** | 11+ | Full Support |
| **Microsoft Edge** | 79+ | Full Support |
| **Mobile Browsers (iOS / Android)** | Modern | Full Touch & Retina Support |

---

## 🤝 Contributing

Contributions, bug reports, and creative variations are warmly welcomed!

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing new particle pulse'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full details.

---

<div align="center">
  <p>Crafted with ❤️ and code by <b><a href="https://github.com/wastavnagture-irl">@wastav.irl</a></b> (@wastav.irl)</p>
  <p><i>If you enjoyed this project, please consider giving it a ⭐ on GitHub!</i></p>
</div>
