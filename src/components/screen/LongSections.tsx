import { AnimatePresence, motion } from "motion/react"
import { useState, type CSSProperties, type ReactNode } from "react"

import { calendarDays, flowRows, monthRows, weekAhead } from "../../data/demoContent"
import { motionTokens } from "../../motion/tokens"

function SectionBlock({ id, title, children, nodeId }: { id?: string; title: string; children: ReactNode; nodeId?: string }) {
  return (
    <section className="content-section" id={id} data-node-id={nodeId}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass-card content-card ${className}`}>{children}</div>
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="metric"><span>{label}</span><strong className={accent ? "positive" : ""}>{value}</strong></div>
}

function Segmented<T extends string>({ options, value, onChange, label }: { options: readonly T[]; value: T; onChange: (value: T) => void; label: string }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label} style={{ "--count": options.length, "--index": options.indexOf(value) } as CSSProperties}>
      <i aria-hidden="true" />
      {options.map((option) => <button key={option} type="button" role="radio" aria-checked={option === value} onClick={() => onChange(option)}>{option}</button>)}
    </div>
  )
}

function DailySummary() {
  const [asking, setAsking] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const [question, setQuestion] = useState("Что подписать первым?")
  return (
    <SectionBlock title="Сводка дня" nodeId="3892:210488">
      <Card className="ai-card">
        <div className="ai-label"><img src="/assets/figma/ai-logo.svg" alt="" />Альфа-Интеллект</div>
        <p className="editorial-copy">Денег хватает: остаток группы <strong>12,84 млрд ₽</strong>, ночью крупный покупатель заплатил раньше графика. Ещё <strong>3 платежа</strong> ждут подписи, один — по новым реквизитам.</p>
        <p className="source-note">
          {showSource ? "Остатки 7 банков сверены с выписками, 1С холдинга и ЭДО." : "выписки 7 из 9 банков, 1С холдинга, ЭДО."}{" "}
          <button type="button" aria-expanded={showSource} onClick={() => setShowSource((value) => !value)}>{showSource ? "Скрыть расчёт" : "Как посчитано"}</button>
        </p>
        <button className="assistant-input pressable" type="button" aria-expanded={asking} onClick={() => setAsking((value) => !value)}>
          {question}<span className="wave" aria-hidden="true"><i /><i /><i /><i /></span>
        </button>
        <AnimatePresence initial={false}>
          {asking && <motion.div className="question-list" initial={{ opacity: 0, transform: "translateY(-4px)" }} animate={{ opacity: 1, transform: "translateY(0)" }} exit={{ opacity: 0 }} transition={{ duration: motionTokens.duration.state }}>
            {[
              "Покажи самый рискованный платёж",
              "Что изменилось со вчера?",
              "Хватит ли денег на неделю?",
            ].map((item) => <button type="button" key={item} onClick={() => { setQuestion(item); setAsking(false) }}>{item}</button>)}
          </motion.div>}
        </AnimatePresence>
      </Card>
    </SectionBlock>
  )
}

function InProgress() {
  const [reminded, setReminded] = useState(false)
  return (
    <SectionBlock title="Дела в работе" nodeId="3892:210505">
      <span className="section-subtitle">3 в работе, 2 застряли</span>
      <Card>
        <div className="work-row"><div><strong>Заявка на кредит, Газпромбанк, 2 млрд ₽</strong><span>Ждём Олега С.</span></div><button type="button" onClick={() => setReminded(true)}>{reminded ? "Напомнили" : "Напомнить"}</button></div>
        <div className="stage-track"><i className="done" /><span className="done" /><i className="current" /><span /><i /></div>
        <p className="caption">Кредитный комитет · ждём 6 дн.</p>
      </Card>
    </SectionBlock>
  )
}

function PaymentCalendar() {
  const [selected, setSelected] = useState(32)
  const weekdays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"]
  const day = calendarDays[selected]
  return (
    <SectionBlock id="calendar" title="Платёжный календарь" nodeId="3892:210536">
      <Card>
        <div className="card-kicker"><strong>Октябрь — ноябрь</strong><span>2026</span></div>
        <div className="calendar" role="grid" aria-label="Дни с 26 октября по 29 ноября">
          {weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
          {calendarDays.map(([number, event], index) => (
            <button key={`${number}-${index}`} type="button" aria-pressed={index === selected} onClick={() => setSelected(index)} className={event ? "has-event" : ""}>
              {number}<i />
            </button>
          ))}
        </div>
        <div className="calendar-detail" aria-live="polite"><div><strong>{day[0]} ноя</strong>{day[1] && <span>Пик оттока</span>}</div><p>{day[1] || "Без крупных платежей"}</p><div><span>Чистый поток дня</span><strong>{day[1] ? "−560 млн ₽" : "0 ₽"}</strong></div></div>
      </Card>
    </SectionBlock>
  )
}

function AiFinding() {
  const [expanded, setExpanded] = useState(false)
  const bars = [34, 36, 39, 43, 47]
  return (
    <SectionBlock title="Находка Альфа-Интеллект" nodeId="3892:210673">
      <Card className="ai-card">
        <p className="card-lead">Покупатели стали платить медленнее</p>
        <div className="hero-split"><div><span>Средний срок оплаты дебиторки</span><strong>47 <small>дней</small></strong></div><b>13 дн за 4 мес</b></div>
        <div className="bar-chart" aria-label="Рост среднего срока оплаты с июня по октябрь">
          {bars.map((value, index) => <div key={value}><span style={{ height: `${value * 2}px` }} className={index === bars.length - 1 ? "active" : ""}>{index === 0 || index === bars.length - 1 ? <em>{value}</em> : null}</span><small>{["июн", "июл", "авг", "сен", "окт"][index]}</small></div>)}
        </div>
        <div className="insight"><p>70% роста дают 3 покупателя из топ-10. В дебиторке заморожено ещё 1,6 млрд ₽.</p><span>Уверенность высокая</span></div>
        <button className="button button-muted pressable full" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>Кто платит медленнее</button>
        {expanded && <ul className="compact-list"><li><span>ООО «Терминал Восток»</span><strong>+9 дней</strong></li><li><span>Порт-Сервис</span><strong>+6 дней</strong></li><li><span>Альфа-Девелопмент</span><strong>+4 дня</strong></li></ul>}
      </Card>
    </SectionBlock>
  )
}

function CashForecast() {
  return (
    <SectionBlock title="Деньги на дату" nodeId="3892:210746">
      <Card>
        <div className="hero-split"><div><span>Базовый прогноз</span><strong>9,20 <small>млрд ₽</small></strong></div><b>28 окт → 20 янв</b></div>
        <svg className="forecast-chart" viewBox="0 0 337 180" role="img" aria-label="Прогноз остатка от 28 октября до 20 января">
          <defs><linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#18181b" stopOpacity=".14"/><stop offset="1" stopColor="#18181b" stopOpacity="0"/></linearGradient></defs>
          <path d="M4 40 C60 50 78 68 118 72 S180 91 225 106 S285 118 333 134 L333 164 L4 164Z" fill="url(#forecastFill)" />
          <path d="M4 40 C60 50 78 68 118 72 S180 91 225 106 S285 118 333 134" fill="none" stroke="#18181b" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M4 76 C80 82 130 104 190 116 S270 140 333 150" fill="none" stroke="#9f9fa9" strokeWidth="2" strokeDasharray="5 5" />
          <line x1="4" y1="146" x2="333" y2="146" stroke="#e82824" strokeDasharray="3 4" />
        </svg>
        <div className="forecast-legend"><Metric label="Нижняя граница · P10" value="7,80 млрд ₽" /><Metric label="Минимум" value="8,00 млрд ₽" /><Metric label="Дефицит по P10" value="0,20 млрд ₽" /></div>
      </Card>
    </SectionBlock>
  )
}

function GapCushion() {
  const [connected, setConnected] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  return (
    <SectionBlock title="Подушка от разрыва" nodeId="3892:210795">
      <Card>
        <div><span className="caption">Возможный разрыв 18 ноя</span><div className="big-number">200 млн <small>₽</small></div><p className="caption">ниже минимального остатка в пессимистичном сценарии</p></div>
        <div className="limit-card"><Metric label="Одобренный лимит" value="1,5 млрд ₽" /><div><i /></div><div className="two-cols"><Metric label="На покрытие" value="200 млн ₽" /><Metric label="Запас лимита" value="1,30 млрд ₽" /></div></div>
        <p className="scenario-row"><span>{Array.from({ length: 10 }, (_, index) => <i key={index} className={index < 3 ? "active" : ""} />)}</span>Разрыв в 3 из 10 сценариев · уверенность средняя</p>
        {!dismissed && <button className="button button-primary full pressable" type="button" aria-pressed={connected} onClick={() => setConnected((value) => !value)}>{connected ? "Отключить подушку" : "Подключить подушку"}</button>}
        <button className="quiet-button" type="button" aria-pressed={dismissed} onClick={() => { setDismissed((value) => !value); setConnected(false) }}>{dismissed ? "Вернуть предложение" : "Не актуально"}</button>
      </Card>
    </SectionBlock>
  )
}

function MonthlyBenefit() {
  return (
    <SectionBlock title="Выгода месяца" nodeId="3892:210850">
      <Card>
        <div className="two-cols benefit-metrics"><Metric label="Получено за октябрь" value="6,8 млн" /><Metric label="Ещё можно" value="4,2 млн" /></div>
        <div className="benefit-cells">{Array.from({ length: 11 }, (_, index) => <i key={index} className={index < 7 ? "filled" : ""} />)}</div>
        <p className="cell-caption"><span>1 ячейка — 1 млн ₽</span><span>из 11,0 млн ₽</span></p>
      </Card>
    </SectionBlock>
  )
}

function MonthOverMonth() {
  return (
    <SectionBlock title="Месяц к месяцу" nodeId="3892:210899">
      <Card className="ai-card">
        <div className="insight"><p>Октябрь лучше сентября по деньгам, но за счёт разовых ранних поступлений. Устойчивое ухудшение — сроки оплаты.</p><span>Уверенность высокая</span></div>
        <div className="comparison-table"><div><span>млрд ₽</span><span>сен</span><span>окт</span><span>Δ</span></div>{monthRows.map((row) => <div key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}</div>
        <p className="caption">Два главных различия</p>
        <ol className="numbered-insights"><li>Чистый поток вырос в 3,6 раза: два покупателя заплатили раньше графика</li><li>Срок оплаты дебиторки удлинился на 4 дня, тренд продолжается 4-й месяц</li></ol>
      </Card>
    </SectionBlock>
  )
}

function PreSignCheck() {
  const [requested, setRequested] = useState(false)
  const [expanded, setExpanded] = useState(false)
  return (
    <SectionBlock title="Проверка платежа" nodeId="3892:210990">
      <Card className="ai-card">
        <div><span className="caption">ООО «Порт» → ООО «Терминал Восток»</span><div className="big-number">184 млн <small>₽</small></div></div>
        <div className="warning-panel"><strong>Нужно проверить</strong><ul><li>Реквизиты получателя изменились 3 дня назад, новый счёт в другом банке</li><li>Сумма в 1,8 раза больше самого крупного платежа этому получателю</li><li>После платежа лимит загружен на 89% (порог 85%)</li></ul></div>
        <button type="button" className="expand-row" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>Получатель, история сумм, влияние <span>⌄</span></button>
        {expanded && <ul className="compact-list"><li><span>Получатель</span><strong>Новые реквизиты</strong></li><li><span>История сумм</span><strong>Выше диапазона</strong></li><li><span>Влияние</span><strong>Лимит выше порога</strong></li></ul>}
        <button type="button" className="button button-primary full pressable" disabled={requested} onClick={() => setRequested(true)}>{requested ? "Запрос отправлен" : "Запросить подтверждение"}</button>
      </Card>
    </SectionBlock>
  )
}

const planItems = [
  ["Подрядчики", "260 млн ₽ выше плана", "1,20 млрд ₽", "1,46 млрд ₽"],
  ["Налоги", "85,0 млн ₽ выше плана", "0,42 млрд ₽", "0,51 млрд ₽"],
  ["Проценты по кредитам", "58,0 млн ₽ ниже плана", "0,31 млрд ₽", "0,25 млрд ₽"],
  ["Закупка материалов", "170 млн ₽ ниже плана", "0,89 млрд ₽", "0,72 млрд ₽"],
] as const

function PlanFact() {
  const [flow, setFlow] = useState<"Расходы" | "Поступления">("Расходы")
  const [open, setOpen] = useState(0)
  return (
    <SectionBlock title="План-факт" nodeId="3892:211025">
      <Card>
        <div className="big-number">+233 млн <small>₽</small></div><p className="caption">к остатку по 5 статьям с отклонениями</p>
        <Segmented options={["Расходы", "Поступления"] as const} value={flow} onChange={setFlow} label="Направление потока" />
        <div className="accordion-list">{(flow === "Расходы" ? planItems : [["Поступления", "148 млн ₽ выше плана", "1,10 млрд ₽", "1,25 млрд ₽"]] as const).map((item, index) => <div key={item[0]}><button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}><span><strong>{item[0]}</strong><small>{item[1]}</small></span><b>⌄</b></button>{open === index && <div className="bar-pair"><Metric label="План" value={item[2]} /><i style={{ width: "78%" }} /><Metric label="Факт" value={item[3]} /><i className="dark" style={{ width: "96%" }} /></div>}</div>)}</div>
      </Card>
    </SectionBlock>
  )
}

function TaxBalance() {
  const [prepared, setPrepared] = useState(false)
  const [expanded, setExpanded] = useState(false)
  return (
    <SectionBlock title="Налоги и ЕНС" nodeId="3892:211085">
      <Card>
        <div className="hero-split"><div><span>Нужно пополнить ЕНС</span><strong>+22 <small>млн ₽</small></strong></div><b>до 28 окт</b></div>
        <div className="limit-card"><Metric label="Обязательства" value="74,0 млн ₽" /><div><i style={{ width: "70%" }} /></div><div className="two-cols"><Metric label="Есть на ЕНС" value="52,0 млн ₽" /><Metric label="Не хватает" value="22,0 млн ₽" /></div></div>
        <p className="caption">Демо · сальдо требует сверки. Созданный платёж на 74 млн ₽ ещё не исполнен.</p>
        <button className="expand-row" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>Обязательства и сверка <span>1</span></button>
        {expanded && <ul className="compact-list"><li><span>Обязательства</span><strong>74,0 млн ₽</strong></li><li><span>Сальдо ЕНС</span><strong>52,0 млн ₽</strong></li><li><span>К пополнению</span><strong>22,0 млн ₽</strong></li></ul>}
        <button className="button button-primary full pressable" type="button" aria-pressed={prepared} onClick={() => setPrepared((value) => !value)}>{prepared ? "Отменить черновик" : "Подготовить 22,0 млн ₽"}</button>
      </Card>
    </SectionBlock>
  )
}

function CashFlow() {
  const [period, setPeriod] = useState<"Неделя" | "Месяц" | "Квартал" | "Год">("Месяц")
  return (
    <SectionBlock title="Движение денег" nodeId="3892:211131">
      <Card>
        <Segmented options={["Неделя", "Месяц", "Квартал", "Год"] as const} value={period} onChange={setPeriod} label="Период" />
        <p className="caption">{period === "Месяц" ? "Октябрь" : period} · чистый поток</p><div className="big-number">+1,12 <small>млрд ₽</small></div>
        <p className="caption">Из чего сложился, млрд ₽</p>
        <ul className="flow-list">{flowRows.map(([label, value, width]) => <li key={label}><div><span>{label}</span><strong>{value}</strong></div><i><b style={{ width: `${width}%` }} /></i></li>)}</ul>
      </Card>
    </SectionBlock>
  )
}

function RateImpact() {
  const [direction, setDirection] = useState<1 | -1>(1)
  return (
    <SectionBlock title="Ставка ЦБ и вы" nodeId="3892:211199">
      <Card className="ai-card">
        <div className="two-button-toggle"><button type="button" aria-pressed={direction === 1} onClick={() => setDirection(1)}>+1 п.п.</button><button type="button" aria-pressed={direction === -1} onClick={() => setDirection(-1)}>−1 п.п.</button></div>
        <p className="caption">Изменение чистых расходов за год</p><div className="big-number">{direction === 1 ? "+13,2" : "−13,2"} <small>млн ₽</small></div><p className="caption">При неизменном объёме долга и остатков</p>
        <div className="metric-list"><Metric label="Проценты по долгу" value={direction === 1 ? "+28,2 млн ₽" : "−28,2 млн ₽"} /><Metric label="Доход на новые размещения" value={direction === 1 ? "+15,0 млн ₽" : "−15,0 млн ₽"} /></div>
        <div className="insight"><p>{direction === 1 ? "Дополнительный доход на остатки покрывает только часть роста расходов по долгу." : "Снижение расходов по долгу превышает потерю дохода от новых размещений."} База размещения — 17,2% годовых.</p><span>Уверенность средняя</span></div>
      </Card>
    </SectionBlock>
  )
}

function Counterparties() {
  return (
    <SectionBlock title="Контрагенты" nodeId="3892:211242">
      <div className="horizontal-cards" tabIndex={0} aria-label="Карточки контрагентов">
        {["ООО «Терминал Восток»", "Порт-Сервис"].map((name, index) => <Card key={name}><div className="counterparty-head"><b>ТВ</b><div><strong>{name}</strong><span>ИНН 2540118734</span></div></div><p className="risk-line">Риск растёт · два новых иска</p><div className="metric-list"><Metric label="Сумма исков" value={index ? "180 млн ₽" : "340 млн ₽"} /><Metric label="Доля притока" value={index ? "12%" : "18%"} /><Metric label="Поступления за октябрь" value={index ? "62,0 млн ₽" : "79,0 млн ₽"} /></div></Card>)}
      </div>
    </SectionBlock>
  )
}

function PayrollDay() {
  const [calculated, setCalculated] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  return (
    <SectionBlock title="Зарплатный день" nodeId="3892:211334">
      <Card>
        <p className="caption">Экономия после обслуживания</p><div className="big-number">244 000 <small>₽</small></div><p className="caption">За месяц · реестр на 25 окт</p>
        <div className="payroll-date"><b>25<span>окт</span></b><p><strong>1 240 сотрудников</strong><span>Реестр 186 млн ₽</span></p></div>
        <div className="comparison-bars"><Metric label="Сейчас · 0,15%" value="279 000 ₽" /><i /><Metric label="После переноса" value="35 000 ₽" /><i className="short" /></div>
        <p className="caption">Расчёт для одного месячного реестра. Выплата зарплаты из этой карточки недоступна.</p>
        {!dismissed && <button className="button button-primary full pressable" type="button" disabled={calculated} onClick={() => setCalculated(true)}>{calculated ? "Условия рассчитаны" : "Посчитать условия"}</button>}
        <button className="quiet-button" type="button" aria-pressed={dismissed} onClick={() => { setDismissed((value) => !value); setCalculated(false) }}>{dismissed ? "Вернуть расчёт" : "Не актуально"}</button>
      </Card>
    </SectionBlock>
  )
}

function SuggestedRule() {
  const [enabled, setEnabled] = useState(false)
  const [threshold, setThreshold] = useState(50)
  const rows = [["Условие", "Платёж получателю, сменившему реквизиты ≤ 7 дней назад"], ["Объект", "Все юрлица группы"], ["Порог", `Сумма больше ${threshold} млн ₽`], ["Канал", "Push и задержка подписи до подтверждения"]]
  return (
    <SectionBlock title="Предложенное правило" nodeId="3892:211383">
      <Card className="ai-card">
        <div className="insight"><p>Платежи новым получателям в первые 7 дней после смены реквизитов уже дважды оказывались ошибочными</p><span>Уверенность высокая</span></div>
        <dl className={`definition-list ${enabled ? "enabled" : ""}`}>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <p className="body-small">За 90 дней сработало бы <strong>3 раза</strong>, ложных — <strong>0</strong>. Два из трёх случаев потом потребовали отзыва платежа.</p>
        <label className="switch-row">{enabled ? "Правило включено" : "Включить правило"}<input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.currentTarget.checked)} /><i /></label>
        <button className="button button-muted full pressable" type="button" onClick={() => setThreshold((value) => value === 25 ? 50 : value === 50 ? 100 : 25)}>Порог: {threshold} млн ₽</button>
      </Card>
    </SectionBlock>
  )
}

function WeekAhead() {
  const [prepared, setPrepared] = useState(false)
  return (
    <SectionBlock id="ahead" title="Что впереди" nodeId="3892:211431">
      <Card>
        <div className="two-cols ahead-totals"><Metric label="Выплаты за 7 дней" value="−2,24 млрд" /><Metric label="Поступления" value="+1,32 млрд" accent /></div>
        <ol className="agenda">{weekAhead.map((row) => <li key={row.day}><div className="agenda-date"><strong>{row.day}</strong><span>{row.label}</span>{"peak" in row && row.peak && <b>пик</b>}</div><ul>{row.items.map(([name, value]) => <li key={name}><span>{name}</span><strong className={value.startsWith("+") ? "positive" : ""}>{value}</strong></li>)}</ul></li>)}</ol>
        <button className="button button-muted full pressable" type="button" aria-pressed={prepared} onClick={() => setPrepared((value) => !value)}>{prepared ? "Отменить подготовку" : "Подготовить платежи недели"}</button>
      </Card>
    </SectionBlock>
  )
}

export function LongSections() {
  return (
    <div id="sections">
      <DailySummary />
      <InProgress />
      <PaymentCalendar />
      <AiFinding />
      <CashForecast />
      <GapCushion />
      <MonthlyBenefit />
      <MonthOverMonth />
      <PreSignCheck />
      <PlanFact />
      <TaxBalance />
      <CashFlow />
      <RateImpact />
      <Counterparties />
      <PayrollDay />
      <SuggestedRule />
      <WeekAhead />
    </div>
  )
}
