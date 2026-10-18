<div align="center">

  # 💖 Heart of Words

  **An interactive, mathematically-driven typographic canvas animation powered by pure Vanilla JavaScript.**

  <p align="center">
    <a href="https://wastavnagture97-pixel.github.io/Heart-Of-Words/"><img src="https://img.shields.io/badge/Live%20Demo-Visit%20Website-ff2a6d?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" /></a>
    <a href="https://github.com/wastavnagture97-pixel/Heart-Of-Words"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" /></a>
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
  </p>

  <p align="center">
    <a href="#-overview">Overview</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#-interactive-controls">Controls</a> •
    <a href="#-color-themes">Themes</a> •
    <a href="#-shareable-links">Share Links</a> •
    <a href="#-mathematics">Mathematics</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-license">License</a>
  </p>

</div>

---

## 📖 Overview

**Heart of Words** is a bespoke creative-coding experiment that merges mathematics, typographic art, and interactive particle physics. 

Unlike conventional particle effects that rely on static imagery or distorted text, **Heart of Words** computes the exact parametric coordinates of a cardioid curve in real time. It first choreographs a sequential perimeter trace using microscopic typographic units, followed by a graceful cascading fill that gently sweeps from the top lobes to the lower apex. Once assembled, the heart settles into a subtle, living **heartbeat rhythm** with reactive ambient glow.

Set against a sleek, pitch-black backdrop accented with subtle twinkling stardust, each phrase preserves strict horizontal orientation, pristine typography, and fluid physics-based cursor deflection.

---

## ✨ Key Features

- **📐 Precise Parametric Geometry**  
  Employs classical parametric differential equations to render a flawless, aesthetically balanced heart silhouette without geometric clipping or distortion.

- **🎬 Choreographed Two-Stage Bloom & Living Heartbeat**  
  - **Stage 1 (Perimeter Tracing):** Words sprout sequentially along the heart's perimeter, starting from the cleft and tracing the silhouette with deliberate temporal pacing.
  - **Stage 2 (Top-Down Cascade):** Upon outline closure, inner typographic particles cascade systematically downwards in a staggered waterfall motion.
  - **Living Pulse:** After completion, the heart gently beats in an organic dual-pulse ("lub-dub") rhythm accompanied by breathing neon glow.

- **💬 Real-Time Personalization & Dynamic Spacing**  
  Customize the typographic message to any phrase or name (up to 24 characters). Word metrics are dynamically calculated using Canvas `measureText()` to ensure flawless brick spacing without overlap.

- **🎨 4 Glowing Themes**  
  Instantly switch between **Crimson Passion**, **Rose Pink**, **Cyber Violet**, and **Sunset Gold**. Theme shifts dynamically recalculate particle shaders, canvas glow, and UI accents.

- **🎵 Procedural Ambient Harmony & Heartbeat Audio**  
  Built strictly with the native HTML5 Web Audio API. Procedural celestial chimes and a synced sub-bass heartbeat thump play without external audio files, copyright restrictions, or broken links (off by default).

- **🔗 Shareable Custom Links**  
  Personalized configurations serialize cleanly into URL query parameters (`?m=Name&t=violet&s=1.0`). 1-click clipboard copying gives users instant shareable links with toast feedback.

- **🖥️ High-DPI & Retina Sharpness**  
  Backing canvas buffers scale dynamically by `devicePixelRatio` (capped at 2x), eliminating blurry text on modern smartphones, 4K displays, and Retina Macs.

- **♿ Accessible & Device-Agnostic**  
  Full `prefers-reduced-motion` support, keyboard-accessible modals (Tab, Enter, Escape), zero-distance cursor guards, and smooth mobile touch gestures.

- **🪶 Zero Dependencies & Ultra-Lightweight**  
  Built strictly with native HTML5 Canvas, modern CSS, and ES6+ Vanilla JavaScript. No bundlers, no frameworks, and no third-party runtimes.

---

## 🎮 Interactive Controls

| Control | Location | Function |
| :--- | :--- | :--- |
| **Hover / Drag** | Viewport | Repels nearby words organically using radial vector physics (with zero-distance $\epsilon$-guard) |
| **Tap / Click** | Background Canvas | Re-triggers the animation cycle and re-blooms from the center |
| **Replay (↺)** | Floating Dock | Restarts the animation cycle cleanly without duplicate render loops |
| **Pause / Resume (⏸/▶)** | Floating Dock | Freezes and resumes particle physics smoothly without temporal jumping |
| **Sound Toggle (🔊/🔇)** | Floating Dock | Activates procedural celestial chime harmony and heartbeat audio (off by default) |
| **Share (🔗)** | Floating Dock / Modal | Generates a custom shareable link and copies it to clipboard with toast notification |
| **Customize (✨)** | Floating Dock | Opens the glassmorphism customization drawer for message, themes, and speed |

---

## 🎨 Color Themes

| Theme | Dominant Shades | Glow Accent | Vibe |
| :--- | :--- | :--- | :--- |
| **Crimson Passion** | `#ff1758`, `#ff2a6d`, `#ffffff` | `rgba(255, 42, 109, 0.75)` | Classic neon romantic red |
| **Rose Pink** | `#e63975`, `#ff6b9d`, `#ffd6e3` | `rgba(255, 107, 157, 0.75)` | Soft pastel romance |
| **Cyber Violet** | `#7b2cbf`, `#c77dff`, `#eed6ff` | `rgba(199, 125, 255, 0.75)` | Electric futuristic neon purple |
| **Sunset Gold** | `#ff4d6d`, `#ff9e64`, `#ffd166` | `rgba(255, 178, 102, 0.75)` | Warm golden amber twilight |

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
- A vertical centroid correction factor of $+2.5 \times \text{scale}$ is applied to center the bounding box exactly at $(W/2, H/2)$.
- Boundary detection uses a raycasting Jordan curve polygon algorithm (`isInsideHeartPolygon`).

---

## 🏗️ Architecture & Dual-Canvas Pipeline

```text
┌───────────────────────────────────────────────────────────┐
│                     Viewport (Window)                     │
├───────────────────────────────────────────────────────────┤
│  Layer 1 (Z: 1)  │  #bgCanvas     │  Twinkling Stars      │
│                  │                │  High-DPI Compositor  │
├──────────────────┼────────────────┼───────────────────────┤
│  Layer 2 (Z: 2)  │  #heartCanvas   │  Parametric Particles │
│                  │                │  Typographic Engine   │
├──────────────────┼────────────────┼───────────────────────┤
│  Layer 3 (Z: 20) │  .floating-dock│  Controls & Modal UI  │
└───────────────────────────────────────────────────────────┘
```

Separating the ambient backdrop into an independent canvas layer ensures the highest possible render performance ($60\text{fps}+$), preventing unnecessary particle clears while maintaining clean compositing.

---

## 🚀 Getting Started

No installation, Node.js, or build pipeline is required. You can run this project instantly in any environment.

### Option 1: Direct Open
1. **Clone the repository:**
   ```bash
   git clone https://github.com/wastavnagture97-pixel/Heart-Of-Words.git
   cd Heart-Of-Words
   ```
2. Double click **`index.html`** or open it in any modern browser.

### Option 2: Local Development Server
```bash
# Using Python 3
python -m http.server 3000

# OR using Node.js
npx serve .
```
Open `http://localhost:3000` in your browser.

---

## 🌐 Browser Compatibility

| Browser | Supported Version | Status |
| :--- | :--- | :--- |
| **Google Chrome** | 60+ | Full Support (Hardware Accelerated) |
| **Mozilla Firefox** | 55+ | Full Support |
| **Apple Safari** | 11+ | Full Support |
| **Microsoft Edge** | 79+ | Full Support |
| **Mobile (iOS & Android)** | Modern | Full Touch, Retina & High-DPI Support |

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full details.

---

<div align="center">
  <p>Crafted with ❤️ and code by <b><a href="https://github.com/wastavnagture97-pixel">@wastav.irl</a></b></p>
  <p><i>If you enjoyed this project, consider giving it a ⭐ on GitHub!</i></p>
</div>
