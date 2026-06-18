import { GRID_COLS, ROWS, GOAL_COLS, ROW_CONFIG, CELL_SIZE } from '../utils/constants.js';

const CELL_PX   = 8;
const W_PX      = GRID_COLS  * CELL_PX; // 104 px
const H_PX      = ROWS.TOTAL * CELL_PX; // 120 px
const COL_OFFSET = Math.floor(GRID_COLS / 2); // 6

// Canvas y for a given row (row 0 = frog start = bottom of minimap)
const rowY = (row) => (ROWS.TOTAL - 1 - row) * CELL_PX;

function zoneFill(type) {
  switch (type) {
    case 'road':  return 'rgba(255,255,255,0.14)';
    case 'river': return 'rgba(180,230,255,0.12)';
    case 'goal':  return 'rgba(180,255,220,0.12)';
    default:      return 'rgba(255,255,255,0.05)'; // grass
  }
}

export function createMinimap() {
  const wrapper = document.getElementById('minimap');

  const canvas = document.createElement('canvas');
  canvas.width  = W_PX;
  canvas.height = H_PX;
  canvas.style.display = 'block';
  wrapper.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  function drawZones() {
    ctx.clearRect(0, 0, W_PX, H_PX);
    for (let row = 0; row < ROWS.TOTAL; row++) {
      const type = ROW_CONFIG[row]?.type ?? 'grass';
      ctx.fillStyle = zoneFill(type);
      ctx.fillRect(0, rowY(row), W_PX, CELL_PX);

      // 1px divider between every row
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(0, rowY(row) + CELL_PX - 1, W_PX, 1);
    }
  }

  function drawSlots(filledSlots) {
    const cy = rowY(ROWS.GOAL) + CELL_PX / 2;
    GOAL_COLS.forEach((col, i) => {
      const cx = col * CELL_PX + CELL_PX / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, CELL_PX * 0.34, 0, Math.PI * 2);
      if (filledSlots[i]) {
        ctx.fillStyle = 'white';
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth   = 1;
        ctx.stroke();
      }
    });
  }

  function drawVehicles(vehicles) {
    for (const v of vehicles) {
      const cx = (v.x / CELL_SIZE + COL_OFFSET) * CELL_PX;
      const cy = rowY(v.row) + CELL_PX / 2;
      const w  = v.type === 'truck' ? 10 : 7;
      const h  = v.type === 'truck' ?  5 :  4;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    }
  }

  function drawPlatforms(platforms) {
    for (const p of platforms) {
      const cx = (p.x / CELL_SIZE + COL_OFFSET) * CELL_PX;
      const cy = rowY(p.row) + CELL_PX / 2;
      const w  = (p.halfLen * 2 / CELL_SIZE) * CELL_PX;

      // Submerged turtles: barely visible
      const submerged = p.type === 'turtle' && p.sinkPhase === 'underwater';
      ctx.fillStyle = submerged ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.62)';
      ctx.fillRect(cx - w / 2, cy - 2, w, 4);

      // Croc: two eye dots to mark it lethal
      if (p.type === 'croc') {
        ctx.fillStyle = 'white';
        const ex = cx + w / 2 - 3;
        ctx.fillRect(ex, cy - 2,   2, 2);
        ctx.fillRect(ex, cy + 1,   2, 2);
      }
    }
  }

  function drawFrog(frog) {
    const col = frog.worldX / CELL_SIZE + COL_OFFSET;
    const row = frog.state === 'jumping'
      ? frog.fromRow + (frog.toRow - frog.fromRow) * frog.jumpProgress
      : frog.row;

    const fx = col * CELL_PX + CELL_PX / 2;
    const fy = rowY(row) + CELL_PX / 2;

    ctx.beginPath();
    ctx.arc(fx, fy, CELL_PX * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  return {
    update(frog, filledSlots, vehicles, platforms) {
      drawZones();
      drawPlatforms(platforms);
      drawVehicles(vehicles);
      drawSlots(filledSlots);
      drawFrog(frog);
    },
  };
}
