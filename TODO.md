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

## CI / CD / Dependabot ✓
- [x] `tests/math.test.js`, `tests/grid.test.js`, `tests/frog.test.js` — 39 Tests, Vitest
- [x] `.github/workflows/ci.yml` — Lint + Tests auf Node 22, bei Push + PR auf main
- [x] `.github/workflows/cd.yml` — Vite Build + GitHub Pages Deploy, `VITE_BASE_URL` dynamisch gesetzt
- [x] `.github/dependabot.yml` — npm (gruppiert) + github-actions, montags wöchentlich

## Milestone 4: Verkehr ✓
- [x] `src/world/vehicle.js`: Auto (rot) + Lkw (blau) als Low-Poly Box-Komposition (Body + Kabine)
- [x] `src/world/road.js`: `spawnTraffic(scene)` + `updateTraffic(vehicles, delta)` — 11 Fahrzeuge, X-Wrap, Geschwindigkeit aus ROW_CONFIG × VEHICLE_SPEED_BASE
- [x] `src/utils/pool.js`: Generischer Object Pool, genutzt für Fahrzeug-Meshes
- [x] `src/utils/collision.js`: AABB Frosch ↔ Fahrzeug (animierte X-Position, logische Row)
- [x] `src/main.js`: Leben-System (3 ♥), `deathCooldown` verhindert Mehrfach-Treffer, `resetFrog` bei Tod

## Milestone 5: Fluss ✓
- [x] `src/world/platform.js`: Log (braun) + Turtle (grün, CylinderGeometry hex) + Croc (oliv + Augen)
- [x] Schildkröte: 4-Phasen-Zyklus surface→sinking→underwater→rising (3/1.5/2/1.5 s), Y-Lerp-Animation
- [x] `frog.worldX`: kontinuierliche X-Position; `carryFrog(frog, dx)` trägt Frosch mit Plattform
- [x] `findPlatformUnderFrog` / `isFrogDrowning` / `checkFrogCroc` in collision.js
- [x] Frosch ertrinkt wenn: keine Plattform unter ihm, Schildkröte underwater, Krokodil, vom Screen getragen

## Milestone 6: Ziel & Level ✓
- [x] `checkGoalReached(frog)`: Frosch auf Ziel-Reihe + freier Slot → Slot-Index, sonst -1
- [x] `markSlotFilled(index)`: visuelles Feedback (hellgrün), `filledSlots[]` State-Tracking
- [x] Alle 5 Slots voll → Level-Up: `level++`, alle Fahrzeug/Plattform-Speeds ×1.25, Slots reset
- [x] Score: +10 pro Vorwärts-Sprung, +50 pro Ziel-Slot; HUD-Anzeige (Score + Level)
- [x] Wasser zwischen Slots / besetzter Slot → `loseLife()` (klassisches Frogger-Verhalten)

## Dual-Eye Vision ✓ (vorgezogen aus M7)
- [x] `createFrogCameraSystem()`: zwei Kameras, je EYE_FOV=120°, EYE_OFFSET=50° nach außen
- [x] `renderDualEye()`: Scissor + Viewport, `autoClear=false`, manuelle clear pro Frame
- [x] Nasenstreifen (12px schwarzes Div) trennt linkes und rechtes Auge
- [x] EYE_FOV + EYE_OFFSET in constants.js; Kamera-Aspect wird jede Frame aus window.innerWidth/2 gesetzt

## Milestone 7: Frosch-Sicht (Vision Shader) ✓
- [x] `src/vision/frogEyePass.js`: GLSL Barrel-Distortion (echter Fisheye-Effekt) pro Auge
- [x] GLSL: Farbshift (Rot-Kanal → 20%, Grün/Blau → 100%) — Dichromat
- [x] Post-Processing via custom FBO + ShaderMaterial (kein EffectComposer — split-screen inkompatibel)

## Milestone 8: Motion Mask ✓
- [x] `src/vision/motionMask.js`: Objekt-Flag via Three.js Layers (Layer 1 = statisch, Layer 2 = bewegend)
- [x] Statische Objekte (Straße, Boden, Fluss, Ziel): Opacity ~15%
- [x] Bewegte Objekte (Fahrzeuge, Plattformen): volle Sichtbarkeit
- [ ] Fahrzeuge: Bewegungsrichtungs-Spur (kurzer Afterimage-Effekt) — verschoben auf M10 Polish

## Milestone 9: HUD & Screens ✓
- [x] `src/ui/hud.js`: HTML-Overlay — Punkte, Leben (♥), Level, Timer; alle weiß
- [x] `src/ui/minimap.js`: Canvas-Minimap (bottom-right) — Zonen, Goal-Slots, Frosch-Dot
- [x] `src/world/goal.js`: `getFilledSlots()` für Minimap-State
- [x] Timer: 60s Countdown, bei 0 = Leben verlieren; blinkt bei ≤10s
- [x] UI komplett als Overlay mit weißer Schrift/Drawings, semitransparenter HUD-Bar
- [ ] `src/ui/screens.js`: Start-Screen, Game-Over-Screen, Level-Up-Einblendung — verschoben auf M10

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
