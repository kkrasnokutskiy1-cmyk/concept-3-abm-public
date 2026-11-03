// Геометрия верхнеуровневых блоков фрейма Main (Figma 3930:212853, 393×9938),
// снята через get_metadata. y — от верха фрейма, height — высота фрейма в px.
export const FIGMA_FRAME = { id: '3930:212853', width: 393, height: 9938 } as const;

// Осознанное отступление от Figma: в 3930:213124 строки дней по 43px при колонках
// (377 − 2×20 − 6×4) / 7 ≈ 44.71px, то есть ячейки не квадратные. По правке заказчика
// ячейки квадратные, поэтому календарь выше на 5 строк × (44.71 − 43), а блоки ниже
// него сдвинуты на ту же величину.
const CAL_CELL = (377 - 2 * 20 - 6 * 4) / 7;
const CAL_SQUARE_DELTA = 5 * (CAL_CELL - 43);

const FIGMA_SOURCE: ReadonlyArray<{ id: string; name: string; y: number; height: number }> = [
  { id: '3930:212854', name: 'TopBar', y: 0, height: 98 },
  { id: '3930:212862', name: 'Header', y: 108, height: 64 },
  { id: '3930:212883', name: 'HeroCarousel', y: 182, height: 400.5 },
  { id: '3930:212945', name: 'PagerDots', y: 592.5, height: 6 },
  { id: '3930:212950', name: 'AttentionBanner', y: 608.5, height: 108 },
  { id: '3930:212961', name: 'AwaitingDecision', y: 726.5, height: 310 },
  { id: '3930:212984', name: 'DaySummary', y: 1046.5, height: 436 },
  { id: '3930:213001', name: 'TasksInProgress', y: 1492.5, height: 246 },
  { id: '3930:213032', name: 'WorldAround', y: 1748.5, height: 553 },
  { id: '3930:213116', name: 'PaymentCalendar', y: 2311.5, height: 539 },
  { id: '3930:213253', name: 'AiInsight', y: 2860.5, height: 507.5 },
  { id: '3930:213306', name: 'CashOnDate', y: 3378, height: 672.53 },
  { id: '3930:213362', name: 'BalanceForecast', y: 4060.53, height: 475 },
  { id: '3930:213419', name: 'CashCushion', y: 4545.53, height: 532 },
  { id: '3930:213472', name: 'MonthBenefit', y: 5087.53, height: 280 },
  { id: '3930:213521', name: 'MonthOverMonth', y: 5377.53, height: 586.5 },
  { id: '3930:213612', name: 'PaymentCheck', y: 5974.03, height: 434 },
  { id: '3930:213647', name: 'PlanFact', y: 6418.03, height: 497 },
  { id: '3930:213705', name: 'TaxesEns', y: 6925.03, height: 376 },
  { id: '3930:213739', name: 'CashFlow', y: 7311.03, height: 506 },
  { id: '3930:213803', name: 'KeyRateImpact', y: 7827.03, height: 440.5 },
  { id: '3930:213839', name: 'Counterparties', y: 8277.53, height: 369 },
  { id: '3930:213931', name: 'PayrollDay', y: 8656.53, height: 568 },
  { id: '3930:213974', name: 'SuggestedRule', y: 9234.53, height: 575.5 },
];

const CALENDAR_INDEX = FIGMA_SOURCE.findIndex((b) => b.name === 'PaymentCalendar');

export const FIGMA_BLOCKS: ReadonlyArray<{ id: string; name: string; y: number; height: number }> = FIGMA_SOURCE.map((b, i) =>
  i === CALENDAR_INDEX ? { ...b, height: b.height + CAL_SQUARE_DELTA } : i > CALENDAR_INDEX ? { ...b, y: b.y + CAL_SQUARE_DELTA } : b,
);

// Нижняя панель (Progressive Blur + таб-бар) зафиксирована у низа viewport.
export const FIGMA_BOTTOM_BAR = { id: '3930:214017', name: 'BottomBar', height: 114 } as const;
