# Frog Eye — TODO

## Milestone 1: Setup ✓
- [x] Vite + ESLint installieren (`npm init`, `vite`, `eslint`)
- [x] `eslint.config.js` mit `eslint:recommended`, `prefer-const`, `no-var`, Browser-Globals
- [x] `vite.config.js` (ES Modules, `/src` als Root)
- [x] `index.html` aufräumen: nur Canvas + HUD-Placeholder, `type="module"` Script
- [x] `src/main.js` als Einstiegspunkt, Three.js importieren
- [x] `src/scene.js`: Scene, Renderer, Resize-Handler, Lichter

## Milestone 2: Spielfeld
- [ ] `src/utils/constants.js`: Raster-Dimensionen, Reihen-Typen, Geschwindigkeiten
- [ ] `src/world/grid.js`: Raster-Logik, Reihen-Konfiguration, Koordinaten-Mapping
- [ ] `src/world/road.js`: Straßen-Geometrie (Low-Poly, flat-shaded)
- [ ] `src/world/river.js`: Fluss-Geometrie, animierte Wasser-Plane
- [ ] `src/world/goal.js`: Ziel-Slots (5 Seerosen-Felder), Slot-Status
- [ ] Mittleres Gras + Startzone Gras

## Milestone 3: Frosch & Kamera
- [ ] `src/frog/frog.js`: Grid-Position, Sprung-Logik (grid-basiert, geblockt während Sprung)
- [ ] `src/frog/frogCamera.js`: First-Person-Kamera, Sprung-Bogen-Animation (Y-Kurve)
- [ ] Keyboard-Input: WASD + Pfeiltasten, kein gleichzeitiger Input während Sprung
- [ ] Rand-Begrenzung: Frosch kann nicht aus dem Spielfeld springen

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
