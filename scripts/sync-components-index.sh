#!/bin/sh
# Пересобирает src/components/index.ts: реальный export для существующих
# src/components/<Name>.tsx, заглушка () => null — для ещё не свёрстанных.
# Запуск из корня проекта: sh scripts/sync-components-index.sh
OUT=src/components/index.ts
NAMES="TopBar Header HeroCarousel PagerDots AttentionBanner AwaitingDecision DaySummary TasksInProgress WorldAround PaymentCalendar AiInsight CashOnDate BalanceForecast CashCushion MonthBenefit MonthOverMonth PaymentCheck PlanFact TaxesEns CashFlow KeyRateImpact Counterparties PayrollDay SuggestedRule BottomBar"
missing=0
for n in $NAMES; do [ -f "src/components/$n.tsx" ] || missing=1; done
{
  echo "// Публичный реестр блоков экрана в порядке Figma (Main 3930:212853)."
  echo "// Генерируется scripts/sync-components-index.sh."
  if [ $missing = 1 ]; then echo "const Stub = () => null;"; echo; fi
  for n in $NAMES; do
    if [ -f "src/components/$n.tsx" ]; then echo "export { default as $n } from './$n';"
    else echo "export const $n = Stub;"; fi
  done
} > "$OUT"
