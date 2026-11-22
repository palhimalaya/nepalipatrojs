import {
  closePicker,
  createInitialState,
  isDestroyed,
  markDestroyed,
  nextMonth,
  openPicker,
  previousMonth,
  setSelected,
  setView,
  togglePicker,
} from '../../ui/state';

const today = { year: 2080, month: 1, day: 15 };

describe('DatePickerState (pure)', () => {
  it('initializes from today with closed, not destroyed', () => {
    const s = createInitialState(today);
    expect(s.open).toBe(false);
    expect(s.destroyed).toBe(false);
    expect(s.view).toEqual({ year: 2080, month: 1 });
    expect(s.selected).toEqual(today);
    expect(s.today).toEqual(today);
  });

  it('open / close / toggle', () => {
    let s = createInitialState(today);
    s = openPicker(s);
    expect(s.open).toBe(true);
    s = closePicker(s);
    expect(s.open).toBe(false);
    s = togglePicker(s);
    expect(s.open).toBe(true);
    s = togglePicker(s);
    expect(s.open).toBe(false);
  });

  it('previousMonth crosses year (Baisakh → Chaitra prior year)', () => {
    let s = createInitialState(today);
    s = setView(s, 2081, 1);
    s = previousMonth(s);
    expect(s.view).toEqual({ year: 2080, month: 12 });
  });

  it('nextMonth crosses year (Chaitra → Baisakh next year)', () => {
    let s = createInitialState(today);
    s = setView(s, 2080, 12);
    s = nextMonth(s);
    expect(s.view).toEqual({ year: 2081, month: 1 });
  });

  it('setSelected updates view to selected month', () => {
    let s = createInitialState(today);
    s = setSelected(s, { year: 2079, month: 5, day: 10 });
    expect(s.selected).toEqual({ year: 2079, month: 5, day: 10 });
    expect(s.view).toEqual({ year: 2079, month: 5 });
  });

  it('destroyed state ignores further transitions', () => {
    let s = createInitialState(today);
    s = markDestroyed(s);
    expect(isDestroyed(s)).toBe(true);
    expect(s.open).toBe(false);
    const frozen = { ...s };
    s = openPicker(s);
    s = nextMonth(s);
    s = setSelected(s, { year: 2082, month: 2, day: 1 });
    expect(s).toEqual(frozen);
  });
});
