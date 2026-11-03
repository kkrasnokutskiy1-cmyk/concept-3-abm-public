import { useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import SectionCard from './ui/SectionCard';
import { DURATION, EASE_OUT, PRESS_SCALE, pressTransition, stateSpring } from '../motion/tokens';
import './sections.css';
import './payment-calendar.css';

type Day = {
  n: number;
  date: string;
  flow: string;
  /** Крупный платёж дня — у таких дней в Figma точка и подложка */
  label?: string;
  muted?: boolean;
  /** Поток нулевой — «Операций не запланировано» */
  empty?: boolean;
};

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

// Figma 3930:213124 «Дни с 26 октября по 29 ноября»: потоки — из aria-label кнопок,
// цвет числа (muted) и отметки крупных платежей — из макета.
const DAYS: Day[] = [
  { n: 26, date: '26 окт', flow: '+120 млн ₽', muted: true },
  { n: 27, date: '27 окт', flow: '−340 млн ₽', muted: true },
  { n: 28, date: '28 окт', flow: '−910 млн ₽', label: 'НДС' },
  { n: 29, date: '29 окт', flow: '+80,0 млн ₽', muted: true },
  { n: 30, date: '30 окт', flow: '+260 млн ₽', muted: true },
  { n: 31, date: '31 окт', flow: '0,0 млн ₽', muted: true, empty: true },
  { n: 1, date: '1 ноя', flow: '0,0 млн ₽', muted: true, empty: true },
  { n: 2, date: '2 ноя', flow: '−180 млн ₽' },
  { n: 3, date: '3 ноя', flow: '+410 млн ₽' },
  { n: 4, date: '4 ноя', flow: '−120 млн ₽' },
  { n: 5, date: '5 ноя', flow: '−60,0 млн ₽', label: 'Купон' },
  { n: 6, date: '6 ноя', flow: '+520 млн ₽' },
  { n: 7, date: '7 ноя', flow: '0,0 млн ₽', muted: true, empty: true },
  { n: 8, date: '8 ноя', flow: '−60,0 млн ₽', label: 'Купон' },
  { n: 9, date: '9 ноя', flow: '−240 млн ₽' },
  { n: 10, date: '10 ноя', flow: '−680 млн ₽', label: 'Дивиденды' },
  { n: 11, date: '11 ноя', flow: '+90,0 млн ₽' },
  { n: 12, date: '12 ноя', flow: '+140 млн ₽' },
  { n: 13, date: '13 ноя', flow: '−110 млн ₽' },
  { n: 14, date: '14 ноя', flow: '0,0 млн ₽', muted: true, empty: true },
  { n: 15, date: '15 ноя', flow: '0,0 млн ₽', muted: true, empty: true },
  { n: 16, date: '16 ноя', flow: '+310 млн ₽' },
  { n: 17, date: '17 ноя', flow: '−150 млн ₽' },
  { n: 18, date: '18 ноя', flow: '−420 млн ₽' },
  { n: 19, date: '19 ноя', flow: '+380 млн ₽' },
  { n: 20, date: '20 ноя', flow: '+220 млн ₽' },
  { n: 21, date: '21 ноя', flow: '0,0 млн ₽', muted: true, empty: true },
  { n: 22, date: '22 ноя', flow: '0,0 млн ₽', muted: true, empty: true },
  { n: 23, date: '23 ноя', flow: '+60,0 млн ₽' },
  { n: 24, date: '24 ноя', flow: '−90,0 млн ₽' },
  { n: 25, date: '25 ноя', flow: '−1,48 млрд ₽', label: 'Погашение кредита + НДФЛ' },
  { n: 26, date: '26 ноя', flow: '−210 млн ₽' },
  { n: 27, date: '27 ноя', flow: '−560 млн ₽', label: 'Налог на прибыль' },
  { n: 28, date: '28 ноя', flow: '0,0 млн ₽', muted: true, empty: true },
  { n: 29, date: '29 ноя', flow: '0,0 млн ₽', muted: true, empty: true },
];

const INITIAL = DAYS.findIndex((d) => d.date === '27 ноя');
/** День с наибольшим оттоком */
const HEAVY = DAYS.findIndex((d) => d.date === '25 ноя');

/** Подпись дня: крупный платёж, иначе общий характер дня */
const describe = (d: Day) => d.label ?? (d.empty ? 'Операций не запланировано' : 'Без крупных платежей');

/**
 * Figma 3930:213116 — «Платежный календарь». Выбрать можно любой день: у дней с
 * крупными платежами (точка) показывается платёж, у остальных — характер дня
 * и чистый поток. Стрелки клавиатуры двигают выбор по сетке.
 */
export default function PaymentCalendar() {
  const [selected, setSelected] = useState(INITIAL);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const day = DAYS[selected];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (step === undefined) return;
    const next = selected + step;
    if (next < 0 || next >= DAYS.length) return;
    event.preventDefault();
    setSelected(next);
    refs.current[next]?.focus();
  };

  return (
    <SectionCard title="Платежный календарь" nodeId="3930:213116" className="fx-section--pt11">
      <div className="card card--p20 cal fx-solid" data-node-id="3930:213120">
        <div className="cal__head">
          <p className="cal__month">Октябрь — ноябрь</p>
          <p className="cal__year">2026</p>
        </div>
        <div className="cal__grid" role="group" aria-label="Дни с 26 октября по 29 ноября" onKeyDown={onKeyDown}>
          {WEEKDAYS.map((w) => (
            <span key={w} className="cal__wd" aria-hidden>
              {w}
            </span>
          ))}
          {DAYS.map((d, i) => {
            const isSelected = i === selected;
            const cls = [
              'cal__day',
              d.muted && 'cal__day--muted',
              d.label && 'cal__day--event',
              isSelected && 'cal__day--selected',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <motion.button
                key={d.date}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                className={cls}
                tabIndex={isSelected ? 0 : -1}
                aria-pressed={isSelected}
                aria-label={`${d.date}: ${d.flow}${d.label ? `, ${d.label}` : ''}`}
                onClick={() => setSelected(i)}
                whileTap={{ scale: PRESS_SCALE }}
                transition={pressTransition}
              >
                {isSelected && <motion.span layoutId="cal-selection" className="cal__selection" transition={stateSpring} />}
                <span className="cal__day-num">{d.n}</span>
                <span className="cal__day-dot" />
              </motion.button>
            );
          })}
        </div>
        <div className="cal__detail" data-node-id="3930:213245" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={day.date}
              className="cal__detail-body"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: DURATION.fast, ease: EASE_OUT }}
            >
              <div className="cal__detail-head">
                <div className="cal__detail-date">
                  <p className="title-15">{day.date}</p>
                  {selected === HEAVY && <span className="fx-caption">Пик оттока</span>}
                </div>
                <p className="text-13 nowrap">{describe(day)}</p>
              </div>
              <div className="cal__flow">
                <span className="fx-caption">Чистый поток дня</span>
                <span className="cal__flow-value">{day.flow}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SectionCard>
  );
}
