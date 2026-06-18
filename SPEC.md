# Frog Eye — Specification

## Konzept

**Frogger — aus den Augen des Frosches.**

Der Spieler sieht die Welt durch Froschaugen: ein verzerrtes 320°-Panorama, in dem nur bewegte Objekte scharf wahrgenommen werden. Das klassische Frogger-Gameplay (Straße überqueren, Fluss überqueren, Ziel erreichen) bleibt erhalten — aber die First-Person-Perspektive und die biologisch korrekte Frosch-Optik machen jede Runde zu einem neuen Erlebnis.

---

## Frosch-Sehsystem → Spielmechanik

### 1. Gesichtsfeld: ~320° panoramisch
Froschaugen sitzen seitlich-oben am Kopf. Optische Achse zeigt ~**75° seitlich** von der Vorwärtsrichtung. Jedes Auge deckt ~**170° horizontal** ab. Binokularer Überlapp direkt vorne: **~20°**. Die Schnauze verursacht einen ~20° toten Winkel. Gesamtfeld: ~320°.

**Im Spiel — aktuell (ohne Fisheye-Shader):**
Zwei Perspektivkameras, je `EYE_OFFSET=75°`, `EYE_FOV=140°` → ~135° horizontales FOV pro Auge → **~270° Gesamtabdeckung**, ~15° Nasen-Toter-Winkel (durch Nasenstreifen verdeckt). Autos von links und rechts klar sichtbar.

**Im Spiel — Milestone 7 (Fisheye-Shader):**
GLSL Barrel-Distortion bildet die 135° Perspektive auf 170° ab → **~320°** mit biologisch korrektem 20° binokularen Vorderfeld.

### 2. Bewegungsdetektion: Nur bewegte Objekte sind sichtbar
Das Frosch-Retina enthält spezialisierte „Bug Detector"-Neuronen. **Statische Objekte werden kaum wahrgenommen** — ein Frosch ignoriert tote Fliegen.

**Im Spiel:**
- Statische Objekte (Straße, Boden, Bäume): fast unsichtbar, nur als schwaches Schatten-Polygon
- Bewegte Objekte (Autos, Lkws, Baumstämme, Schildkröten): klar sichtbar
- **Unteres Sehfeld** = Boden/Wasseroberfläche → Baumstämme und Plattformen
- **Oberes Sehfeld** = Schatten von oben → kein Predator in Frogger, aber Lichtstimmung
- Autos leuchten als helle, schnelle Bewegungsstreifen auf — je schneller, desto intensiver

### 3. Farbwahrnehmung: Dichromat + Dämmerungssehen
Frösche haben zwei Zapfentypen (blau-sensitiv, grün-sensitiv). Rot wird kaum wahrgenommen. Nachts: monochrom, aber hochkontrastreich.

**Im Spiel:**
- Post-Processing-Shader: Farbpalette auf Blau-Grün reduziert; Rote Autos → dunkelgrau/schwarz
- Autos sind durch Form und Bewegung erkennbar, nicht durch Farbe — erhöht Spannung
- Optional: Tag-/Dämmerungs-Modus als Level-Variante (nachts alles grünlich, aber kontrastreicher)

### 4. Auflösung: Low-Poly = narrativ motiviert
Froschaugen sind grobkörnig. Der Low-Poly-Stil ist kein ästhetischer Kompromiss — es ist buchstäblich, wie der Frosch die Welt sieht.

### 5. Binokulares Fenster: Sprungziel-Aiming
Nur im ~20°-Überlappbereich direkt vorne hat der Frosch Tiefenwahrnehmung.

**Im Spiel:** Das Sprungziel (nächste freie Kachel, Baumstamm) muss im zentralen Bereich sein. Ein subtiler Fokus-Indikator zeigt an, worauf der Frosch zielt.

---

## Frogger-Gameplay

### Spielziel
Von der Startzone (Gras unten) über die Straße, durch den Fluss, zu den Ziel-Slots (Seerosenfelder oben) — 5 Slots füllen = Level gewonnen.

### Spielfeld (aus Frosch-Sicht: Straße liegt VOR ihm)
```
[Ziel-Seerosenfelder]     ← Reihen 13–15 (Gras)
[Fluss: Stämme, Schildkröten]  ← Reihen 7–12
[Mittleres Gras]          ← Reihe 6
[Straße: Autos, Lkws]    ← Reihen 1–5
[Startzone Gras]          ← Reihe 0  ← Frosch startet hier
```

### Steuerung
| Aktion | Input |
|--------|-------|
| Vorwärts springen | W / Pfeil-Oben |
| Rückwärts springen | S / Pfeil-Unten |
| Links springen | A / Pfeil-Links |
| Rechts springen | D / Pfeil-Rechts |
| Kamera drehen (optional) | Maus-Drag / Touch |

### Hindernisse & Plattformen
| Objekt | Zone | Verhalten |
|--------|------|-----------|
| Auto | Straße | fährt horizontal, tötet bei Berührung |
| Lkw | Straße | breiter, langsamer |
| Baumstamm | Fluss | trägt den Frosch, bewegt sich |
| Schildkröte | Fluss | taucht periodisch unter → Frosch ertrinkt |
| Krokodil-Kopf | Fluss | sieht aus wie Stamm, tötet |
| Seerose (Ziel) | Oben | Ziel-Slot, muss leer sein |

### Kamera-Verhalten (First-Person)
- Die Kamera sitzt auf Augenhöhe des Frosches (~10 cm über dem Boden)
- Beim Sprung: leichte vertikale Bogenanimation der Kamera
- Blickrichtung: immer in Sprungrichtung (dreht sich bei Links/Rechts-Sprung)
- Frosch-Körper: NICHT sichtbar (First Person) — nur evtl. Zungenanimation

### Scoring
- Pro Vorwärts-Sprung: +10 Punkte
- Ziel-Slot erreicht: +50 Punkte + Zeit-Bonus
- Alle 5 Slots: Level-Up, alles schneller
- Zeitlimit pro Leben: 60 Sekunden (Countdown oben)

### Leben
3 Leben. Verlust bei:
- Überfahren (Straße)
- Im Fluss ertrunken (kein Stamm / Schildkröte taucht)
- Zeit abgelaufen
- Vom Bildschirmrand gefallen

---

## Technische Architektur

### Stack
- **Three.js** — 3D Rendering, Low-Poly Szene
- **Vanilla JavaScript (ES Modules)** — kein Framework
- **Vite** — Dev-Server + Build
- **ESLint** — `eslint.config.js`

### Dateistruktur
```
src/
  main.js              — Einstiegspunkt, Game-Loop
  scene.js             — Three.js Scene, Renderer, Lichter, Resize
  frog/
    frog.js            — Frosch-Entity, Position, Sprung-Physik
    frogCamera.js      — First-Person-Kamera, Sprungbogen-Animation
  vision/
    frogEyePass.js     — Fisheye-Distortion + Farbshift Post-Processing
    motionMask.js      — Bewegungs-Sichtbarkeit (statisch = ausgeblendet)
  world/
    grid.js            — Spielfeld-Raster, Reihen-Konfiguration
    road.js            — Straßen-Reihen, Auto-Spawning
    river.js           — Fluss-Reihen, Stamm/Schildkröten-Spawning
    vehicle.js         — Auto/Lkw Entity
    platform.js        — Baumstamm/Schildkröte Entity
    goal.js            — Ziel-Slots, Gewinn-Check
  ui/
    hud.js             — Punkte, Leben, Timer (HTML-Overlay)
    screens.js         — Start, Game Over, Level-Up Screens
  utils/
    pool.js            — Object Pooling für Fahrzeuge/Plattformen
    collision.js       — Grid-basierte Kollisionsprüfung
    constants.js       — Spielfeld-Dimensionen, Geschwindigkeiten, Farben
index.html
eslint.config.js
vite.config.js
```

### Vision-Rendering Pipeline
```
Szene rendern → Off-Screen FBO
  ↓
Fisheye-Shader (barrel distortion, linkes + rechtes Auge)
  ↓
Farbshift-Shader (Rot-Kanal unterdrücken, Grün/Blau boosten)
  ↓
Motion-Fade (statische Objekte auf ~15% Opacity)
  ↓
Composite auf Screen
```

### Low-Poly Art Style
- Geometrien: flache `BufferGeometry`, keine Subdivisions, manuelle Vertices
- Materialien: `MeshPhongMaterial` mit `flatShading: true` — keine Texturen
- Farben: knappe Palette (Grün, Blau, Grau, Dunkelgrün)
- Schatten: harte Schatten, `PCFSoftShadowMap` ausgeschaltet
- Fahrzeuge: einfache Box-Kompositionen, charakteristisch durch Form
- Wasser: animierte flache Plane mit Vertex-Displacement (kein Shader-Komplex)

---

## Code-Stil

- **Kurze Funktionen**: max. ~20 Zeilen, eine Aufgabe
- **Pure functions** wo möglich, Seiteneffekte explizit
- **ES Modules**: named exports, kein Default-Export-Chaos
- **Keine Kommentare für Offensichtliches**: nur wenn das *Warum* nicht klar ist
- **Naming**: `camelCase` Vars/Funktionen, `PascalCase` Klassen, `UPPER_SNAKE` Konstanten
- **Keine globalen Variablen**: alles in Modulen gekapselt
- **ESLint**: `eslint:recommended`, `prefer-const`, `no-var`, `no-unused-vars`

---

## Milestones

| # | Milestone | Deliverable |
|---|-----------|-------------|
| 1 | Setup | Vite + ESLint + Three.js, leere Szene im Browser |
| 2 | Welt | Spielfeld-Raster, Straße + Fluss + Ziel sichtbar |
| 3 | Frosch | Frosch springt grid-basiert, Kamera springt mit |
| 4 | Verkehr | Autos + Lkws fahren, Kollision = Tod |
| 5 | Fluss | Stämme + Schildkröten, Frosch mitreißen, Ertrinken |
| 6 | Ziel | Ziel-Slots, Gewinn-Check, Level-Up |
| 7 | Vision | Fisheye-Shader + Farbshift aktiv |
| 8 | Motion Mask | Statische Objekte ausblenden, Bewegung betonen |
| 9 | HUD & Screens | Timer, Punkte, Leben, Game Over, Start |
| 10 | Polish | Low-Poly Fahrzeuge, Wasser-Animation, Sounds |
