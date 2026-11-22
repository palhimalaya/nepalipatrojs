/**
 * Stage 3.4 — datepicker positioning / z-index integration (jsdom + mocked rects).
 * Does not claim real-browser layout correctness.
 */

import { NepaliDatePicker } from '../../ui/NepaliDatePicker';
import { DEFAULT_POPUP_Z_INDEX } from '../../ui/position';

type Rect = {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

function mockRect(el: Element, rect: Rect): void {
  const value = {
    ...rect,
    x: rect.left,
    y: rect.top,
    toJSON: () => rect,
  } as DOMRect;
  Object.defineProperty(el, 'getBoundingClientRect', {
    configurable: true,
    value: () => value,
  });
}

describe('Stage 3.4 positioning integration', () => {
  let input: HTMLInputElement;
  let rafSpy: jest.SpyInstance;

  beforeEach(() => {
    document.body.innerHTML = '<input id="dateInput" />';
    input = document.getElementById('dateInput') as HTMLInputElement;
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'scrollX', {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    });
    rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });
  });

  afterEach(() => {
    rafSpy.mockRestore();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  function openWithGeometry(dpInput: HTMLInputElement = input): {
    dp: NepaliDatePicker;
    popup: HTMLElement;
  } {
    const dp = new NepaliDatePicker(dpInput, {
      format: 'YYYY-MM-DD',
      language: 'en',
    });
    mockRect(dpInput, {
      top: 80,
      left: 40,
      bottom: 104,
      right: 240,
      width: 200,
      height: 24,
    });
    dpInput.click();
    const popup = document.querySelector('.nepali-datepicker') as HTMLElement;
    mockRect(popup, {
      top: 0,
      left: 0,
      bottom: 360,
      right: 320,
      width: 320,
      height: 360,
    });
    // Re-apply after popup exists with mocked size
    window.dispatchEvent(new Event('resize'));
    return { dp, popup };
  }

  it('positions relative to the input (below + left-aligned)', () => {
    const { dp, popup } = openWithGeometry();
    expect(popup.style.position).toBe('absolute');
    expect(popup.style.top).toBe('108px'); // 104 + 4
    expect(popup.style.left).toBe('40px');
    expect(popup.parentElement).toBe(document.body);
    dp.destroy();
  });

  it('applies constructor zIndex and keeps it across reopen', () => {
    const dp = new NepaliDatePicker(input, { zIndex: 4242 });
    mockRect(input, {
      top: 10,
      left: 10,
      bottom: 30,
      right: 100,
      width: 90,
      height: 20,
    });
    input.click();
    let popup = document.querySelector('.nepali-datepicker') as HTMLElement;
    mockRect(popup, {
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      width: 100,
      height: 100,
    });
    window.dispatchEvent(new Event('resize'));
    expect(popup.style.zIndex).toBe('4242');

    document.body.click();
    input.click();
    popup = document.querySelector('.nepali-datepicker') as HTMLElement;
    expect(popup.style.zIndex).toBe('4242');
    dp.destroy();
  });

  it('setZIndex overrides constructor and sticks across opens', () => {
    const dp = new NepaliDatePicker(input, { zIndex: 100 });
    mockRect(input, {
      top: 10,
      left: 10,
      bottom: 30,
      right: 100,
      width: 90,
      height: 20,
    });
    input.click();
    dp.setZIndex(7777);
    let popup = document.querySelector('.nepali-datepicker') as HTMLElement;
    expect(popup.style.zIndex).toBe('7777');
    document.body.click();
    input.click();
    popup = document.querySelector('.nepali-datepicker') as HTMLElement;
    expect(popup.style.zIndex).toBe('7777');
    dp.destroy();
  });

  it('default z-index is stable and does not escalate on repeated opens', () => {
    const dp = new NepaliDatePicker(input);
    mockRect(input, {
      top: 10,
      left: 10,
      bottom: 30,
      right: 100,
      width: 90,
      height: 20,
    });
    const values: string[] = [];
    for (let i = 0; i < 3; i++) {
      input.click();
      const popup = document.querySelector('.nepali-datepicker') as HTMLElement;
      values.push(popup.style.zIndex);
      document.body.click();
    }
    expect(values).toEqual([
      String(DEFAULT_POPUP_Z_INDEX),
      String(DEFAULT_POPUP_Z_INDEX),
      String(DEFAULT_POPUP_Z_INDEX),
    ]);
    dp.destroy();
  });

  it('repositions on resize and scroll', () => {
    const { dp, popup } = openWithGeometry();
    mockRect(popup, {
      top: 0,
      left: 0,
      bottom: 360,
      right: 320,
      width: 320,
      height: 360,
    });
    mockRect(input, {
      top: 200,
      left: 60,
      bottom: 224,
      right: 260,
      width: 200,
      height: 24,
    });
    window.dispatchEvent(new Event('resize'));
    expect(popup.style.top).toBe('228px');
    expect(popup.style.left).toBe('60px');

    mockRect(input, {
      top: 210,
      left: 70,
      bottom: 234,
      right: 270,
      width: 200,
      height: 24,
    });
    window.dispatchEvent(new Event('scroll'));
    expect(popup.style.top).toBe('238px');
    expect(popup.style.left).toBe('70px');
    dp.destroy();
  });

  it('removes scroll/resize listeners when closed', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { dp } = openWithGeometry();
    const resizeAdds = addSpy.mock.calls.filter((c) => c[0] === 'resize');
    const scrollAdds = addSpy.mock.calls.filter((c) => c[0] === 'scroll');
    expect(resizeAdds.length).toBeGreaterThan(0);
    expect(scrollAdds.length).toBeGreaterThan(0);

    document.body.click();
    const resizeRemoves = removeSpy.mock.calls.filter((c) => c[0] === 'resize');
    const scrollRemoves = removeSpy.mock.calls.filter((c) => c[0] === 'scroll');
    expect(resizeRemoves.length).toBeGreaterThan(0);
    expect(scrollRemoves.length).toBeGreaterThan(0);
    dp.destroy();
  });

  it('destroy while open cleans listeners and DOM', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { dp } = openWithGeometry();
    dp.destroy();
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
    expect(
      removeSpy.mock.calls.some((c) => c[0] === 'resize')
    ).toBe(true);
    expect(
      removeSpy.mock.calls.some((c) => c[0] === 'scroll')
    ).toBe(true);
  });

  it('multiple instances position against their own inputs', () => {
    document.body.innerHTML = '<input id="a" /><input id="b" />';
    const a = document.getElementById('a') as HTMLInputElement;
    const b = document.getElementById('b') as HTMLInputElement;
    const dpA = new NepaliDatePicker(a, { zIndex: 1111 });
    const dpB = new NepaliDatePicker(b, { zIndex: 2222 });

    mockRect(a, {
      top: 20,
      left: 10,
      bottom: 40,
      right: 110,
      width: 100,
      height: 20,
    });
    a.click();
    let popup = document.querySelector('.nepali-datepicker') as HTMLElement;
    mockRect(popup, {
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      width: 100,
      height: 100,
    });
    window.dispatchEvent(new Event('resize'));
    expect(popup.style.zIndex).toBe('1111');
    expect(popup.style.left).toBe('10px');

    mockRect(b, {
      top: 50,
      left: 300,
      bottom: 70,
      right: 400,
      width: 100,
      height: 20,
    });
    b.click();
    popup = document.querySelector('.nepali-datepicker') as HTMLElement;
    mockRect(popup, {
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      width: 100,
      height: 100,
    });
    window.dispatchEvent(new Event('resize'));
    expect(document.querySelectorAll('.nepali-datepicker').length).toBe(1);
    expect(popup.style.zIndex).toBe('2222');
    expect(popup.style.left).toBe('300px');

    dpA.destroy();
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    dpB.destroy();
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
  });
});
