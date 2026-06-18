import { describe, it, expect } from 'vitest';
import { lerp, clamp, arc, lerpAngle } from '../src/utils/math.js';

describe('lerp', () => {
  it('returns start at t=0, end at t=1', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
  });
  it('interpolates midpoint', () => {
    expect(lerp(2, 8, 0.5)).toBe(5);
  });
});

describe('clamp', () => {
  it('passes through in-range values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it('clamps below min', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
  it('clamps above max', () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('arc', () => {
  it('is 0 at both endpoints', () => {
    expect(arc(0)).toBeCloseTo(0);
    expect(arc(1)).toBeCloseTo(0);
  });
  it('peaks at 1 in the middle', () => {
    expect(arc(0.5)).toBeCloseTo(1);
  });
});

describe('lerpAngle', () => {
  it('interpolates forward', () => {
    expect(lerpAngle(0, Math.PI / 2, 0.5)).toBeCloseTo(Math.PI / 4);
  });

  it('reaches target at t=1', () => {
    expect(lerpAngle(0, Math.PI / 2, 1)).toBeCloseTo(Math.PI / 2);
  });

  it('takes the short path across the ±π boundary', () => {
    // From -π+0.1 to π-0.1: short path goes through ±π (distance 0.2),
    // long path goes the other way (distance 2π-0.2). Midpoint should be near ±π.
    const mid = lerpAngle(-Math.PI + 0.1, Math.PI - 0.1, 0.5);
    expect(Math.abs(mid)).toBeGreaterThan(Math.PI * 0.95);
  });
});
