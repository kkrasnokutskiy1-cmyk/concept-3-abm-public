# Карта источников и поведения

Figma: `hBT4KPR113TtiJBWTvyAbV`, page `3892:210265`, экран `3892:210354`. Page является canvas нулевого размера, поэтому реализация построена по high-fidelity контекстам дочерних слоёв. `get_motion_context(recursive=true)` для экрана вернул пустой inventory — исходных motion-треков нет; применены только короткие интерфейсные переходы по `emil-design-eng`.

| Figma node | Компонент | Состояние / жест | Проверка |
| --- | --- | --- | --- |
| `3892:210355` | `AssistantHeader` | Статичный header | Screenshot 393×852 |
| `3892:210363` | `CompanySwitcher` | Press feedback | Screenshot 393×852 |
| `3892:210384` | `MoneyCard` | Выбор банка | Interaction test |
| `3892:210447` | `Pager` | Первый слайд активен | Screenshot 393×852 |
| `3892:210452`, `3892:212708` | `Attention` | Tap раскрывает четыре оси | Interaction test |
| `3892:210463` | `DecisionCard` | Двойное подтверждение; swipe-left; undo | Unit + interaction test |
| `3892:210488` | `DailySummary` | Tap по вопросу раскрывает подсказки | Interaction test |
| `3892:210505` | `InProgress` | «Напомнить» → подтверждение | Manual/interaction |
| `3892:210536` | `PaymentCalendar` | Выбор дня меняет детализацию | Interaction test |
| `3892:210673` | `AiFinding` | Раскрытие плательщиков | Interaction test |
| `3892:210746` | `CashForecast` | Статический график | Visual |
| `3892:210795` | `GapCushion` | Подключение лимита | Interaction |
| `3892:210850` | `MonthlyBenefit` | Статическая матрица | Visual |
| `3892:210899` | `MonthOverMonth` | Сравнение и выводы | Visual |
| `3892:210990` | `PreSignCheck` | Запрос подтверждения | Interaction |
| `3892:211025` | `PlanFact` | Segment + accordion | Interaction |
| `3892:211085` | `TaxBalance` | Создание/отмена черновика | Interaction |
| `3892:211131` | `CashFlow` | Выбор периода | Interaction |
| `3892:211199` | `RateImpact` | Сценарий `+1/−1 п.п.` | Interaction |
| `3892:211242` | `Counterparties` | Горизонтальный swipe-scroll | Interaction |
| `3892:211334` | `PayrollDay` | Расчёт условий | Interaction |
| `3892:211383` | `SuggestedRule` | Switch правила | Interaction |
| `3892:211431` | `WeekAhead` | Подготовка черновиков | Interaction |
| `3892:211517` | `BottomNav` | Переход к якорям; fixed overlay | Screenshot + interaction |

Figma определяет внешний вид и состав экрана; дополнительные интерактивные состояния описаны в документации компонентов.
