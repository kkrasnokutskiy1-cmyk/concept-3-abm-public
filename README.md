# Дашборд финансиста — мобильный прототип

React + Vite + TypeScript + Motion. Вёрстка 1:1 по Figma-фрейму «Main-full»
(`hBT4KPR113TtiJBWTvyAbV`, узел `3930:212853`, 393×9938).

## Команды

```bash
NODE_ENV=development npm install --include=dev   # в окружении стоит NODE_ENV=production
npm run dev            # dev-сервер
npm run lint           # ESLint
npm run typecheck      # tsc -b
npm test               # vitest: unit-тесты модели состояния прежнего прототипа
npm run build          # tsc + production-сборка в dist/
npm run test:visual    # Playwright: новый экран (геометрия vs Figma, ассеты, overflow, скриншоты)
                       # + tests/e2e — прежний прототип на /?version=prev
```

Перед первым запуском тестов: `npx playwright install chromium` (для проектов `webkit-393` и `firefox-393` прежнего прототипа — ещё `webkit firefox`).

## Структура

- `src/App.tsx` — порядок блоков = порядок детей фрейма Main-full; шаг между блоками 10px.
- `src/components/*` — по компоненту на Figma-блок; корневой элемент несёт `data-node-id="<nodeId>"`.
- `src/styles/tokens.css` — токены из Figma variables; `src/styles/global.css` — reset и раскладка.
- `public/assets/figma/` — ассеты, выгруженные из Figma (локально, без временных URL).
- `docs/figma/<nodeId>.png` — эталонные скриншоты; `test-results/compare/` — скриншоты сборки для сверки.
- `tests/figma-layout.ts` — y/height блоков из `get_metadata`, по ним проверяется геометрия.

## Поведение

Начальный вид — Figma. Работают: включение правила,
периоды «Движения денег», шок ставки ±1 п.п., раскрытия План-факта,
детали проверки платежа, черновик пополнения ЕНС, зарплатные черновики с отменой и возвратом.
Поведение компонентов описано в `docs/lower-behavior-source.md`, проверки — в `docs/lower-verification.md`.

## Ограничения

- Только мобильная колонка: базовая ширина 393px, адаптация 320–430px, шире — колонка по центру.
- Данные демонстрационные, бэкенда нет; состояния сбрасываются после перезагрузки.
- Отключены, поскольку для них нет реализованного действия или экрана назначения:
  «Запросить подтверждение» в «Проверке платежа», переходы строк «Месяц к месяцу»,
  три раздела нижней панели (кроме «В начало»).

## Прежний прототип

Версия по Figma-экрану `3892:210354` (393×852 в «телефонной» рамке) сохранена и открывается по адресу
`/?version=prev`: `src/LegacyApp.tsx`, `src/components/screen/*`, `src/model/screenState.ts`,
`src/hooks/usePointerGesture.ts`, `src/data/demoContent.ts`, стили `src/styles/screen.css`
и `src/styles/legacy-global.css` (грузятся отдельным чанком только на этом адресе).
Карта узлов — `docs/source-map.md`.

Жесты и состояния прежнего прототипа:

- карточку решения можно смахнуть влево; подпись с подтверждением требует двух касаний;
- последнее решение можно вернуть;
- «Внимание» раскрывает четыре контрольные оси;
- календарь, plan/fact, период движения денег и сценарий ставки переключаются на месте;
- нижняя навигация ведёт к разделам внутри длинного мобильного экрана;
- перезагрузка всегда возвращает исходное демонстрационное состояние.

## Деплой

Vercel-проект `finexpert-mobile-prototype` → https://finexpert-mobile-prototype.vercel.app

Deployment может быть защищён Vercel Authentication; для автоматизированной проверки используется `vercel curl`, без отключения защиты.
