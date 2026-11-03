/** Демонстрационные данные интерактивных состояний нижних секций. */
export const cashPeriods = [
  { label: 'Неделя', title: '15–21 окт', start: 12.1, steps: [1.62, -1.18, -0.12, 0.6, -0.18] },
  { label: 'Месяц', title: 'Октябрь', start: 11.72, steps: [6.4, -5.1, -0.9, 1.2, -0.48] },
  { label: 'Квартал', title: 'IV квартал', start: 10.95, steps: [18.3, -15.2, -2.1, 2.6, -1.71] },
  { label: 'Год', title: 'С начала года', start: 9.8, steps: [58.4, -49.6, -6.2, 5.1, -4.66] },
] as const;

const flowLabels = ['Операционные поступления', 'Операционные платежи', 'Инвестиции, сальдо', 'Финансовые поступления', 'Финансовые платежи'];
const decimals = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function flowNumber(value: number, signed = false) {
  return `${value < 0 ? '−' : signed && value > 0 ? '+' : ''}${decimals.format(Math.abs(value))}`;
}

export function cashPeriodFlow(index: number) {
  const period = cashPeriods[index];
  let balance = period.start as number;
  const rows = [{ label: 'Остаток на начало', value: balance, from: 0, to: balance, kind: 'total' }];
  period.steps.forEach((value, i) => {
    const previous = balance;
    balance = Number((balance + value).toFixed(2));
    rows.push({ label: flowLabels[i], value, from: Math.min(previous, balance), to: Math.max(previous, balance), kind: value >= 0 ? 'inflow' : 'outflow' });
  });
  rows.push({ label: 'Остаток на конец', value: balance, from: 0, to: balance, kind: 'total' });
  return { rows, max: Math.max(...rows.map(row => row.to)), net: Number((balance - period.start).toFixed(2)) };
}

// Суммы в млн ₽. Порядок соответствует исходному Figma.
export const planDeviations = [
  { title: 'Подрядчики', plan: 1200, fact: 1460, kind: 'outflow', detail: '260 млн ₽ выше плана' },
  { title: 'Налоги', plan: 820, fact: 905, kind: 'outflow', detail: '85,0 млн ₽ выше плана' },
  { title: 'Проценты по кредитам', plan: 410, fact: 352, kind: 'outflow', detail: '58,0 млн ₽ ниже плана' },
  { title: 'Закупка материалов', plan: 1550, fact: 1380, kind: 'outflow', detail: '170 млн ₽ ниже плана' },
  { title: 'Поступления от покупателей', plan: 6100, fact: 6450, kind: 'inflow', detail: '350 млн ₽ выше плана' },
] as const;

export function millionAmount(value: number) {
  return value >= 1000 ? `${decimals.format(value / 1000)} млрд ₽` : `${new Intl.NumberFormat('ru-RU', { minimumFractionDigits: value >= 100 ? 0 : 1 }).format(value)} млн ₽`;
}

export const dismissalReasons = ['Уже есть в другом банке', 'Не сейчас', 'Не подходят условия', 'Расчёт неверный'] as const;
export const paymentHistory = [22, 28, 31, 34, 36, 38, 41, 43, 44, 47, 49, 52, 54, 55, 58, 61, 63, 67, 71, 74, 78, 86, 92, 104];
export const paymentImpact = [
  { label: 'Свободный остаток', before: '9,10 млрд', after: '8,92 млрд' },
  { label: 'Лимит на контрагента', before: '71%', after: '89%' },
  { label: 'Мин. остаток «Порт»', before: '412 млн', after: '228 млн' },
];
