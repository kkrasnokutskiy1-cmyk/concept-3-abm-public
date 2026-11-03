import { EASE_OUT } from './tokens';

/** Завершение нового свайпа: ≤150 мс. Существующие появления секций не меняем. */
export const SWIPE_TRANSITION = { duration: 0.15, ease: EASE_OUT } as const;

/** Поведение Vaul/Sonner адаптировано для карточек, без dismiss по одному касанию. */
export const SWIPE = {
  lockDistance: 8,
  axisRatio: 1.15,
  distanceRatio: 0.24,
  minFlickDistance: 28,
  velocity: 0.5,
  sampleWindow: 100,
  resistance: 0.18,
  resistanceLimit: 36,
  blur: 2,
  fade: 0.35,
} as const;
