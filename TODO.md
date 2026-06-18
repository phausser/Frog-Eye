# Frog Eye — TODO

## Milestone 1: Setup ✓
- [x] Vite + ESLint installieren (`npm init`, `vite`, `eslint`)
- [x] `eslint.config.js` mit `eslint:recommended`, `prefer-const`, `no-var`, Browser-Globals
- [x] `vite.config.js` (ES Modules, `/src` als Root)
- [x] `index.html` aufräumen: nur Canvas + HUD-Placeholder, `type="module"` Script
- [x] `src/main.js` als Einstiegspunkt, Three.js importieren
- [x] `src/scene.js`: Scene, Renderer, Resize-Handler, Lichter

## Milestone 2: Spielfeld ✓
- [x] `src/utils/constants.js`: Raster-Dimensionen, Reihen-Typen, Geschwindigkeiten, Farb-Palette
- [x] `src/world/grid.js`: rowToZ, colToX, gridToWorld, getRowType, isRoad/isRiver/isGoal/isGrass
- [x] `src/world/road.js`: Straßen-Fläche + Curbs + gestrichelte Spurmarkierungen (Low-Poly, flat-shaded)
- [x] `src/world/river.js`: Fluss-Fläche (28×28 Subdivisions) + Uferstreifen + `updateRiver(time)` Animation
- [x] `src/world/goal.js`: 5 Seerosen-Slots (CylinderGeometry + Torus-Rim) + Top-Bank + `fillSlot()`/`resetSlots()`
- [x] `src/world/environment.js`: Startzone Gras + Mittleres Gras (flat-shaded)
- [x] Kamera-Anpassung: Frog-Eye-Height (0.15) — in M3 leichte Abwärtskippung ergänzen

## Milestone 3: Frosch & Kamera ✓
- [x] `src/utils/math.js`: lerp, clamp, arc (sin-Kurve für Sprungbogen)
- [x] `src/frog/frog.js`: Grid-State, `tryJump` (geblockt während Sprung), `updateFrog`, `getFrogPos`, `resetFrog`
- [x] `src/frog/frogCamera.js`: First-Person-Kamera, `facingAngle` dreht Blickrichtung, LOOK_DOWN-Kippung
- [x] `src/input.js`: W=springen, A=links drehen, D=rechts drehen, S=keine Funktion
- [x] `rotateFrog(frog, dir)`: diskrete 90°-Drehung via CW/CCW Matrixrotation, blockiert während Sprung
- [x] Smooth camera rotation: exponentieller Decay (`ANGLE_SPEED=20`), kürzester Winkelweg via `lerpAngle`
- [x] Rand-Begrenzung: Row 0–14, Col 0–12 — Sprung wird verworfen wenn außerhalb

## Milestone 4: Verkehr
- [ ] `src/world/vehicle.js`: Auto + Lkw als Low-Poly Box-Komposition
- [ ] `src/world/road.js`: Fahrzeuge spawnen, Geschwindigkeit + Richtung pro Reihe
- [ ] `src/utils/pool.js`: Object Pool für Fahrzeuge (Performance)
- [ ] `src/utils/collision.js`: Grid-Kollision Frosch ↔ Fahrzeug → Leben verlieren

## Milestone 5: Fluss
- [ ] `src/world/platform.js`: Baumstamm + Schildkröte als Low-Poly Entity
- [ ] Schildkröte: taucht-unter-Zyklus (Interval + Tween)
- [ ] Frosch auf Plattform: mitbewegen, bei Fluss-Reihe ohne Plattform → ertrinken
- [ ] Krokodil-Kopf: selbe Form wie Stamm, tötet bei Berührung

## Milestone 6: Ziel & Level
- [ ] Frosch erreicht Ziel-Reihe + leeren Slot: Slot füllen, Frosch zurück
- [ ] Alle 5 Slots voll: Level-Up, Geschwindigkeiten erhöhen
- [ ] `src/world/goal.js`: visuelles Feedback wenn Slot besetzt

## Milestone 7: Frosch-Sicht (Vision Shader)
- [ ] `src/vision/frogEyePass.js`: Three.js `EffectComposer` + custom `ShaderPass`
- [ ] GLSL: Barrel-Distortion (Fisheye) für linke + rechte Bildschirmhälfte
- [ ] GLSL: Farbshift (Rot-Kanal → 20%, Grün/Blau → 100%)
- [ ] Nasenbereich in der Mitte (schwarze Maske, ~5% Bildbreite)

## Milestone 8: Motion Mask
- [ ] `src/vision/motionMask.js`: Frame-Differenz-Ansatz oder Objekt-Flag
- [ ] Statische Objekte (Straße, Boden, Bäume): Opacity auf ~15%
- [ ] Bewegte Objekte: volle Sichtbarkeit, optional Motion-Glow
- [ ] Fahrzeuge: Bewegungsrichtungs-Spur (kurzer Afterimage-Effekt)

## Milestone 9: HUD & Screens
- [ ] `src/ui/hud.js`: HTML-Overlay — Punkte, Leben (Frosch-Icons), Timer
- [ ] `src/ui/screens.js`: Start-Screen, Game-Over-Screen, Level-Up-Einblendung
- [ ] Timer: 60s Countdown, bei 0 = Leben verlieren

## Milestone 10: Polish
- [ ] Low-Poly Fahrzeuge ausarbeiten (Auto = 3 Boxen, Lkw = 2 Boxen + Kabine)
- [ ] Wasser-Animation: Vertex-Displacement im `animate()`-Loop
- [ ] Sprung-Feedback: kleiner Staubpuff (Partikel) beim Landen
- [ ] Sound: einfache Web Audio API Töne (Sprung, Tod, Ziel, Level-Up)
- [ ] Mobile: Touch-Swipe statt Keyboard

## Offen / Nice-to-Have
- [ ] Tag/Nacht-Zyklus: nach Level 5 Dämmerung (monochrome Frosch-Sicht)
- [ ] Highscore (localStorage)
- [ ] Krokodil-Kopf im Fluss
- [ ] Zungen-Animation wenn Ziel erreicht (Easter Egg)
