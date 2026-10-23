<div align="center">

# V E S P E R

### A canvas beyond touch.

**An experimental gesture interface for making marks in space.**

<img alt="Experimental" src="https://img.shields.io/badge/EXPERIMENTAL-0B1220?style=flat-square&labelColor=0B1220&color=D5B879" />
<img alt="React" src="https://img.shields.io/badge/REACT-151E2D?style=flat-square&logo=react&logoColor=9DB9D5" />
<img alt="TypeScript" src="https://img.shields.io/badge/TYPESCRIPT-151E2D?style=flat-square&logo=typescript&logoColor=9DB9D5" />
<img alt="MediaPipe" src="https://img.shields.io/badge/MEDIAPIPE-151E2D?style=flat-square&logo=google&logoColor=D5B879" />

<img width="100%" alt="VESPER — gesture driven canvas" src="https://capsule-render.vercel.app/api?type=rect&color=0B1220&height=210&section=header&text=VESPER&fontColor=F0F2F6&fontSize=64&fontAlignY=44&desc=A%20canvas%20beyond%20touch.&descAlignY=72&descSize=16&animation=fadeIn" />

<sub>GESTURE / PERCEPTION / MARK</sub>

</div>

---

<div align="center">

### 01 — INTERACTION STUDY

# The hand becomes the instrument.

VESPER explores a simple idea: **what if a canvas responded to movement, not touch?**

A webcam observes the hand. A landmark model estimates its position. Gesture logic translates motion into intent. The canvas turns that intent into a stroke.

No stylus. No special hardware. Just movement, interpreted in real time.

</div>

---

## 02 — SYSTEM

```text
CAMERA INPUT
    ↓
HAND LANDMARKS
    ↓
GESTURE INTERPRETATION
    ↓
DRAWING STATE
    ↓
CANVAS / STROKE ENGINE
    ↓
ARTWORK
```

| Layer | Responsibility |
|:--|:--|
| **Perception** | Read webcam frames and estimate hand landmarks |
| **Interpretation** | Recognize drawing, pause, pinch, and tool intent |
| **Rendering** | Convert hand movement into smooth canvas strokes |
| **Workspace** | Expose tools, tracking feedback, and canvas controls |

The tracking pipeline and drawing engine are intentionally independent. A gesture should describe **what to do**, not how pixels are rendered.

---

## 03 — INTENDED CAPABILITIES

<details>
<summary><strong>01 / Spatial drawing</strong> · <code>TRACKING</code></summary>

Use the index fingertip as a pointer. Map its position into canvas coordinates and interpolate movement into continuous strokes.

</details>

<details>
<summary><strong>02 / Gesture vocabulary</strong> · <code>INTERACTION</code></summary>

Recognize intentional drawing and pause states, pinch interactions, and eraser behavior. Use stable transitions rather than reacting to isolated frames.

</details>

<details>
<summary><strong>03 / Instrument panel</strong> · <code>TOOLS</code></summary>

Choose color and brush size. Erase, undo, redo, clear the canvas, and export artwork.

</details>

<details>
<summary><strong>04 / Perception feedback</strong> · <code>CAMERA</code></summary>

Show a mirrored camera preview, tracking status, and optional landmark overlay. Provide camera start, stop, and permission recovery.

</details>

<details>
<summary><strong>05 / Direct manipulation fallback</strong> · <code>ACCESSIBILITY</code></summary>

Keep mouse drawing available so the canvas remains usable without camera access.

</details>

> **Development note:** VESPER is currently an early-stage project. These describe intended capabilities, not a claim that all features are implemented.

---

## 04 — VISUAL LANGUAGE

A restrained, nocturnal workspace. The interface stays quiet so the artwork and movement remain the focus.

<table>
<tr>
<td width="50%">

**MIDNIGHT**<br />
`#0B1220`<br />
<sub>Main environment</sub>

</td>
<td width="50%">

**OBSIDIAN**<br />
`#151E2D`<br />
<sub>Panels and instruments</sub>

</td>
</tr>
<tr>
<td>

**SLATE**<br />
`#243247`<br />
<sub>Edges and divisions</sub>

</td>
<td>

**VESPER GOLD**<br />
`#D5B879`<br />
<sub>Active states, sparingly</sub>

</td>
</tr>
<tr>
<td>

**IVORY**<br />
`#F7F5F0`<br />
<sub>Canvas surface</sub>

</td>
<td>

**MIST**<br />
`#E6EAF0`<br />
<sub>Light interface surfaces</sub>

</td>
</tr>
</table>

**Typography** — Bricolage Grotesque for the wordmark and display moments. Inter for interface labels, controls, and supporting text.

**Design principles** — generous negative space · quiet hierarchy · precise controls · warm canvas · minimal ornament

---

## 05 — TECHNOLOGY

| Component | Planned implementation |
|:--|:--|
| Application | React + TypeScript + Vite |
| Hand perception | MediaPipe Tasks Vision — Hand Landmarker |
| Drawing | HTML Canvas 2D |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Motion | Framer Motion |

---

## 06 — BUILD SEQUENCE

- [ ] Scaffold the application and design tokens
- [ ] Camera lifecycle, permission, and recovery
- [ ] Hand landmark inference
- [ ] Gesture state machine
- [ ] Canvas engine and stroke interpolation
- [ ] Tool controls and drawing history
- [ ] PNG export
- [ ] Responsive workspace and accessibility
- [ ] Tests, setup guide, and implementation notes

---

<div align="center">

### VESPER

<sub>THE SPACE BETWEEN INTENTION AND A LINE.</sub>

</div>
