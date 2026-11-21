# API — Datepicker (draft)

## v1

```ts
new NepaliDatePicker(input: HTMLInputElement, options?: {
  format?: string
  theme?: 'light' | 'dark'
  language?: 'en' | 'np'
  zIndex?: number
})
picker.destroy()
picker.setZIndex(n)
```

Writes formatted value to the input and dispatches `change`.

## Planned v2

Modular vanilla picker with dual calendar, constraints, a11y, predictable positioning. See architecture docs — **not implemented yet**.
