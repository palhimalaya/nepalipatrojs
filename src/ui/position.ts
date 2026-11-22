/**
 * Popup positioning and z-index policy (Phase 3 Stage 3.4 / ISS-012).
 * Pure geometry helpers — no calendar state, no full-DOM scans.
 */

/** Library default when neither constructor option nor setZIndex is used. */
export const DEFAULT_POPUP_Z_INDEX = 999999;

/** Gap between input and popup (px). */
export const POPUP_GAP_PX = 4;

/** Viewport inset used when clamping to avoid edge overflow (px). */
export const VIEWPORT_MARGIN_PX = 4;

export interface ClientRectLike {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

export interface ViewportMetrics {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
}

export interface PopupSize {
  width: number;
  height: number;
}

export interface PopupPosition {
  /** Document (page) Y coordinate for `position: absolute` */
  top: number;
  /** Document (page) X coordinate for `position: absolute` */
  left: number;
  placement: 'below' | 'above';
}

export type ZIndexSource = 'runtime' | 'constructor' | 'default';

/**
 * Precedence (highest wins):
 * 1. Runtime `setZIndex()` override
 * 2. Constructor `options.zIndex`
 * 3. Library default (`DEFAULT_POPUP_Z_INDEX`)
 *
 * Values are sticky — opening the popup must not re-resolve or escalate.
 */
export function resolveZIndex(options: {
  runtimeOverride?: number;
  constructorOption?: number;
  defaultZIndex?: number;
}): { value: number; source: ZIndexSource } {
  if (
    options.runtimeOverride !== undefined &&
    Number.isFinite(options.runtimeOverride)
  ) {
    return { value: options.runtimeOverride, source: 'runtime' };
  }
  if (
    options.constructorOption !== undefined &&
    Number.isFinite(options.constructorOption)
  ) {
    return { value: options.constructorOption, source: 'constructor' };
  }
  const fallback =
    options.defaultZIndex !== undefined
      ? options.defaultZIndex
      : DEFAULT_POPUP_Z_INDEX;
  return { value: fallback, source: 'default' };
}

/**
 * Compute absolute document coordinates for a popup anchored to an input.
 *
 * Strategy:
 * - Prefer below the input (`POPUP_GAP_PX`).
 * - Flip above when there is insufficient space below and enough space above.
 * - Prefer left-aligned to the input; if that overflows the viewport right edge,
 *   align to the input's right edge.
 * - Clamp into the viewport with `VIEWPORT_MARGIN_PX` when the popup fits.
 *
 * Uses provided rects only — callers supply getBoundingClientRect / viewport.
 */
export function computePopupPosition(
  input: ClientRectLike,
  popup: PopupSize,
  viewport: ViewportMetrics,
  gap: number = POPUP_GAP_PX
): PopupPosition {
  const spaceBelow = viewport.height - input.bottom;
  const spaceAbove = input.top;
  const placeAbove =
    spaceBelow < popup.height + gap && spaceAbove > popup.height + gap;

  let top: number;
  let placement: 'below' | 'above';
  if (placeAbove) {
    placement = 'above';
    top = input.top + viewport.scrollY - popup.height - gap;
  } else {
    placement = 'below';
    top = input.bottom + viewport.scrollY + gap;
  }

  let left = input.left + viewport.scrollX;
  if (viewport.width - input.left < popup.width) {
    left = input.right + viewport.scrollX - popup.width;
  }

  const minLeft = viewport.scrollX + VIEWPORT_MARGIN_PX;
  const maxLeft =
    viewport.scrollX + viewport.width - popup.width - VIEWPORT_MARGIN_PX;
  if (maxLeft >= minLeft) {
    left = Math.min(Math.max(left, minLeft), maxLeft);
  }

  const minTop = viewport.scrollY + VIEWPORT_MARGIN_PX;
  const maxTop =
    viewport.scrollY + viewport.height - popup.height - VIEWPORT_MARGIN_PX;
  if (maxTop >= minTop) {
    top = Math.min(Math.max(top, minTop), maxTop);
  }

  return { top, left, placement };
}

/** Read viewport metrics once (caller may mock in tests). */
export function readViewport(
  win: Window = window
): ViewportMetrics {
  return {
    width: win.innerWidth,
    height: win.innerHeight,
    scrollX: win.scrollX,
    scrollY: win.scrollY,
  };
}

/**
 * Apply absolute positioning styles. Writes only — measure before calling.
 */
export function applyPopupPositionStyles(
  popup: HTMLElement,
  position: PopupPosition,
  zIndex: number
): void {
  popup.style.position = 'absolute';
  popup.style.zIndex = String(zIndex);
  popup.style.top = `${position.top}px`;
  popup.style.left = `${position.left}px`;
}

const SCROLLABLE_OVERFLOW = /^(auto|scroll|overlay)$/i;

function overflowCanScroll(value: string): boolean {
  return SCROLLABLE_OVERFLOW.test(value.trim());
}

/**
 * Walk ancestors of `start` and return elements that may scroll
 * (`overflow` / `overflow-x` / `overflow-y` is auto|scroll|overlay).
 *
 * Element `scroll` events do not reach `window`, so callers must attach
 * listeners to these nodes directly (ISS-025). Does not include `start`
 * itself. Viewport scrolling remains the caller's `window` listener.
 */
export function collectScrollableAncestors(
  start: Element,
  getStyles: (el: Element) => CSSStyleDeclaration = (el) =>
    getComputedStyle(el)
): Element[] {
  const found: Element[] = [];
  let current: Element | null = start.parentElement;
  while (current) {
    const style = getStyles(current);
    if (
      overflowCanScroll(style.overflow) ||
      overflowCanScroll(style.overflowX) ||
      overflowCanScroll(style.overflowY)
    ) {
      found.push(current);
    }
    current = current.parentElement;
  }
  return found;
}
