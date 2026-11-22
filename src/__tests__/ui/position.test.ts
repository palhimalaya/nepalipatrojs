/**
 * Stage 3.4 / ISS-012 — pure positioning + z-index policy.
 * Geometry tests use explicit rects (mocked layout), not real browser layout.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  DEFAULT_POPUP_Z_INDEX,
  POPUP_GAP_PX,
  applyPopupPositionStyles,
  computePopupPosition,
  resolveZIndex,
} from '../../ui/position';

describe('resolveZIndex precedence', () => {
  it('prefers runtime override over constructor and default', () => {
    expect(
      resolveZIndex({
        runtimeOverride: 42,
        constructorOption: 100,
        defaultZIndex: 999,
      })
    ).toEqual({ value: 42, source: 'runtime' });
  });

  it('prefers constructor over default', () => {
    expect(
      resolveZIndex({ constructorOption: 12345 })
    ).toEqual({ value: 12345, source: 'constructor' });
  });

  it('uses library default when nothing configured', () => {
    expect(resolveZIndex({})).toEqual({
      value: DEFAULT_POPUP_Z_INDEX,
      source: 'default',
    });
  });
});

describe('computePopupPosition (mocked geometry)', () => {
  const viewport = {
    width: 800,
    height: 600,
    scrollX: 0,
    scrollY: 0,
  };
  const popup = { width: 320, height: 360 };

  it('places below the input by default', () => {
    const input = {
      top: 100,
      left: 50,
      bottom: 124,
      right: 250,
      width: 200,
      height: 24,
    };
    const pos = computePopupPosition(input, popup, viewport);
    expect(pos.placement).toBe('below');
    expect(pos.top).toBe(124 + POPUP_GAP_PX);
    expect(pos.left).toBe(50);
  });

  it('flips above when there is no room below', () => {
    const input = {
      top: 500,
      left: 40,
      bottom: 524,
      right: 240,
      width: 200,
      height: 24,
    };
    const pos = computePopupPosition(input, popup, viewport);
    expect(pos.placement).toBe('above');
    expect(pos.top).toBe(500 - popup.height - POPUP_GAP_PX);
  });

  it('aligns to input right when left would overflow viewport', () => {
    const input = {
      top: 100,
      left: 700,
      bottom: 124,
      right: 780,
      width: 80,
      height: 24,
    };
    const pos = computePopupPosition(input, popup, viewport);
    expect(pos.left).toBe(780 - popup.width);
  });

  it('accounts for document scroll offsets', () => {
    const scrolled = {
      width: 800,
      height: 600,
      scrollX: 100,
      scrollY: 200,
    };
    const input = {
      top: 50,
      left: 20,
      bottom: 74,
      right: 220,
      width: 200,
      height: 24,
    };
    const pos = computePopupPosition(input, popup, scrolled);
    expect(pos.top).toBe(74 + 200 + POPUP_GAP_PX);
    expect(pos.left).toBe(20 + 100);
  });

  it('applyPopupPositionStyles writes absolute coords and z-index', () => {
    const el = document.createElement('div');
    applyPopupPositionStyles(el, { top: 10, left: 20, placement: 'below' }, 55);
    expect(el.style.position).toBe('absolute');
    expect(el.style.top).toBe('10px');
    expect(el.style.left).toBe('20px');
    expect(el.style.zIndex).toBe('55');
  });
});

describe('ISS-012 source: no full-DOM z-index scan', () => {
  it('NepaliDatePicker has no querySelectorAll("*") z-index walk', () => {
    const src = readFileSync(
      join(__dirname, '../../ui/NepaliDatePicker.ts'),
      'utf8'
    );
    expect(src).not.toMatch(/querySelectorAll\s*\(\s*['"]\*['"]\s*\)/);
    expect(src).not.toMatch(/getHighestZIndex/);
    expect(src).not.toMatch(/calculateZIndex/);
  });

  it('position module has no document-wide element scan', () => {
    const src = readFileSync(join(__dirname, '../../ui/position.ts'), 'utf8');
    expect(src).not.toMatch(/querySelectorAll/);
    expect(src).not.toMatch(/getComputedStyle/);
  });
});
