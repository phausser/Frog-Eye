# Frog Eye

Frogger — aus den Augen des Frosches.

Du siehst die Welt durch ein 320°-Panorama, in dem sich nur bewegte Dinge scharf abzeichnen. Überquere die Straße, überquere den Fluss, erreiche die Seerosenfelder — als Frosch.

## Frosch-Vision

- **320° Gesichtsfeld** — Dual-Fisheye, du siehst fast alles gleichzeitig
- **Nur Bewegung zählt** — Straße, Boden, Bäume sind kaum sichtbar; Autos und Stämme leuchten auf
- **Dichromat-Farbsicht** — Rot existiert nicht; Autos erkennst du an Form und Bewegung
- **Low-Poly** — kein ästhetischer Kompromiss, so grobkörnig sieht ein Frosch wirklich

## Stand

Milestones 1–9 abgeschlossen. Milestone 10 (Polish) läuft: Fahrzeuge mit Rädern, detaillierte Plattformen (Log-Zylinder, Schildkröte mit Panzer, Krokodil mit Segmenten), verbessertes Wasser.

## Setup

```bash
npm install
npm run dev
```

Dann [http://localhost:5173](http://localhost:5173) öffnen.

## Steuerung

| Taste | Aktion |
|-------|--------|
| W / ↑ | Vorwärts springen |
| S / ↓ | Rückwärts springen |
| A / ← | Links springen |
| D / → | Rechts springen |

## Entwicklung

```bash
npm run lint    # ESLint
npm run build   # Produktions-Build → dist/
```

Architektur und Konventionen: siehe [AGENTS.md](AGENTS.md)  
Spieldesign und Vision-System: siehe [SPEC.md](SPEC.md)  
Entwicklungsfortschritt: siehe [TODO.md](TODO.md)
