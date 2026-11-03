import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import SectionCard from './ui/SectionCard';
import { PRESS_SCALE, pressTransition, stateSpring } from '../motion/tokens';
import './sections.css';
import './cash-on-date.css';

const A = '/assets/figma';

/**
 * Демонстрационные значения для графика, млрд ₽. P10 = база − разброс.
 */
const LABELS = ['28 окт', '4 ноя', '11 ноя', '18 ноя', '25 ноя', '2 дек', '9 дек', '16 дек', '23 дек', '30 дек', '6 янв', '13 янв', '20 янв'];
const BASE = [12.4, 11.6, 10.4, 9.2, 8.7, 9.1, 9.6, 10.1, 9.4, 8.6, 9.0, 9.5, 9.9];
const SPREAD = [0.25, 0.5, 0.85, 1.4, 1.6, 1.75, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5];
const LOW = BASE.map((v, i) => +(v - SPREAD[i]).toFixed(2));
const MIN_BALANCE = 8;
const LAST = LABELS.length - 1;
/** В макете выбрана дата первого пробоя минимума по P10 — 18 ноя */
const INITIAL = 3;

/**
 * Горизонталь курсора и бегунка: x = (12 + 23·i) / 300 ширины.
 * Для 18 ноя это 81/300 = 91/337 — ровно положение курсора и бегунка в Figma.
 */
const xFrac = (f: number) => (12 + 23 * f) / 300;
const X0 = xFrac(INITIAL);

/**
 * Линии графика в Figma растянуты на всю ширину: вершина i — на i/12, высота
 * y = 161.6 − 9.75·v px (снято с векторов 3930:213330/213331). Точки двигаются
 * по этим линиям; смещение считается от положения в макете, поэтому исходный
 * кадр совпадает с Figma.
 */
const lineY = (series: number[], f: number) => {
  const u = Math.min(LAST, Math.max(0, xFrac(f) * LAST));
  const i = Math.min(LAST - 1, Math.floor(u));
  const v = series[i] + (series[i + 1] - series[i]) * (u - i);
  return 161.6 - 9.75 * v;
};
const BASE_Y0 = lineY(BASE, INITIAL);
const LOW_Y0 = lineY(LOW, INITIAL);

const nf1 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const bln = (v: number) => `${nf2.format(Math.abs(v))} млрд ₽`;

type Layer = { src: string; inset: string; inner?: string };

const STATIC_LAYERS: Layer[] = [
  { src: '3892-211948-forecast-band.svg', inset: '24.03% 0 40.37% 0' },
  { src: '3892-211949-forecast-min-line.svg', inset: '49.37% 4% 50.63% 4%', inner: '-0.53px 0' },
  { src: '3892-211950-forecast-base.svg', inset: '24.18% 0 53.86% 0', inner: '-2.78% 0 -2.94% 0' },
  { src: '3892-211951-forecast-p10.svg', inset: '25.81% 0 40.37% 0', inner: '-1.32% 0 -1.43% 0' },
];
const CURSOR: Layer = { src: '3892-211952-forecast-cursor.svg', inset: '7.59% 73% 5.06% 27%', inner: '0 -1px' };
const DOT_BASE: Layer = { src: '3892-211953-forecast-dot-base.svg', inset: '40.05% 71.51% 54.01% 25.52%', inner: '-10.67%' };
const DOT_P10: Layer = { src: '3892-211954-forecast-dot-p10.svg', inset: '50.14% 71.51% 43.93% 25.52%', inner: '-10.67%' };

function ChartLayer({ src, inset, inner }: Layer) {
  return (
    <div className="chart__layer" style={{ inset }}>
      {inner ? (
        <span className="chart__pad" style={{ inset: inner }}>
          <img src={`${A}/${src}`} alt="" />
        </span>
      ) : (
        <img src={`${A}/${src}`} alt="" />
      )}
    </div>
  );
}

const clampF = (f: number) => Math.min(LAST, Math.max(0, f));

/**
 * Figma 3930:213306 — «Деньги на дату». Одна выбранная дата синхронно меняет
 * заголовок, базовый прогноз, курсор и точки на кривых, P10 и запас/дефицит.
 * Дату можно тянуть по графику или ползунку (точки едут по кривым, при
 * отпускании — привязка к ближайшей дате), листать стрелками и с клавиатуры.
 */
export default function CashOnDate() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const f = useMotionValue(INITIAL);
  const [index, setIndex] = useState(INITIAL);

  // Во время перетягивания дата следует за пальцем; кнопки и клавиши задают её сразу
  useMotionValueEvent(f, 'change', (v) => {
    if (dragging.current) setIndex(Math.round(clampF(v)));
  });

  const thumbLeft = useTransform(f, (v) => `${xFrac(v) * 100}%`);
  const fillWidth = useTransform(f, (v) => `max(0px, calc(${xFrac(v) * 100}% - 5px))`);
  const cursorX = useTransform(f, (v) => `${(xFrac(v) - X0) * 100}%`);
  const baseY = useTransform(f, (v) => lineY(BASE, v) - BASE_Y0);
  const lowY = useTransform(f, (v) => lineY(LOW, v) - LOW_Y0);

  const go = (i: number) => {
    const target = Math.round(clampF(i));
    setIndex(target);
    animate(f, target, stateSpring);
  };

  const fromPointer = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return clampF((((clientX - rect.left) / rect.width) * 300 - 12) / 23);
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary || e.button !== 0) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    animate(f, fromPointer(e.clientX), stateSpring);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    f.stop();
    f.set(fromPointer(e.clientX));
  };
  const onPointerEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    go(Math.round(f.get()));
  };
  const drag = { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowUp: index + 1,
      ArrowLeft: index - 1,
      ArrowDown: index - 1,
      Home: 0,
      End: LAST,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    go(keys[e.key]);
  };

  const label = LABELS[index];
  const base = BASE[index];
  const low = LOW[index];
  const gap = low - MIN_BALANCE;

  return (
    <SectionCard title="Деньги на дату" nodeId="3930:213306" className="fx-section--pt11">
      <div className="card card--p20 forecast fx-solid" data-node-id="3930:213310">
        <div className="cod-nav" data-node-id="3930:213311">
          <motion.button
            type="button"
            className="cod-nav__btn"
            aria-label="Предыдущая дата"
            disabled={index === 0}
            onClick={() => go(index - 1)}
            whileTap={{ scale: PRESS_SCALE }}
            transition={pressTransition}
          >
            <img src={`${A}/3930-213313-chevron-left.svg`} alt="" width={16} height={16} />
          </motion.button>
          <p className="cod-nav__date" aria-live="polite">
            {label}
          </p>
          <motion.button
            type="button"
            className="cod-nav__btn cod-nav__btn--end"
            aria-label="Следующая дата"
            disabled={index === LAST}
            onClick={() => go(index + 1)}
            whileTap={{ scale: PRESS_SCALE }}
            transition={pressTransition}
          >
            <img src={`${A}/3930-213318-chevron-right.svg`} alt="" width={16} height={16} />
          </motion.button>
        </div>
        <div className="amount-block" aria-live="polite">
          <p className="fx-caption">Базовый прогноз</p>
          <p className="fx-amount">
            <span className="fx-amount__value">{nf1.format(base)} млрд</span>
            <span className="fx-amount__currency">₽</span>
          </p>
        </div>
        <div className="cod-plot" {...drag}>
          <div
            className="chart"
            role="img"
            aria-label={`Прогноз ${label}: база ${bln(base)}, P10 ${bln(low)}, минимум ${bln(MIN_BALANCE)}`}
          >
            {STATIC_LAYERS.map((l) => (
              <ChartLayer key={l.src} {...l} />
            ))}
            <motion.div className="chart__cursor" style={{ x: cursorX }}>
              <ChartLayer {...CURSOR} />
              <motion.div className="chart__cursor" style={{ y: baseY }}>
                <ChartLayer {...DOT_BASE} />
              </motion.div>
              <motion.div className="chart__cursor" style={{ y: lowY }}>
                {gap < 0 ? (
                  <ChartLayer {...DOT_P10} />
                ) : (
                  <div className="chart__layer" style={{ inset: DOT_P10.inset }}>
                    <span className="cod-dot" />
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
          <div className="forecast__axis">
            <span className="caption-11">{LABELS[0]}</span>
            <span className="caption-11">{LABELS[LAST]}</span>
          </div>
        </div>
        <div
          ref={trackRef}
          className="slider cod-slider"
          role="slider"
          tabIndex={0}
          aria-label="Дата прогноза"
          aria-valuemin={0}
          aria-valuemax={LAST}
          aria-valuenow={index}
          aria-valuetext={label}
          onKeyDown={onKeyDown}
          {...drag}
        >
          <motion.div className="slider__fill" style={{ width: fillWidth }} />
          <motion.div className="slider__thumb" style={{ left: thumbLeft }} />
        </div>
        <div className="kv-grid kv-grid--top">
          <div className="kv">
            <p className="fx-caption">Нижняя граница · P10</p>
            <p className="text-13 text-13--semibold kv__value">{bln(low)}</p>
          </div>
          <div className="kv">
            <p className="fx-caption">Минимум</p>
            <p className="text-13 text-13--semibold kv__value">{bln(MIN_BALANCE)}</p>
          </div>
        </div>
        <div className={`fx-inset deficit cod-gap${gap < 0 ? ' cod-gap--deficit' : ''}`} data-node-id="3930:213357" aria-live="polite">
          <p className="text-13" style={{ lineHeight: '19.5px' }}>
            {gap < 0 ? 'Дефицит по P10' : 'Запас по P10'}
          </p>
          <p className="deficit__value">{bln(gap)}</p>
        </div>
      </div>
    </SectionCard>
  );
}
