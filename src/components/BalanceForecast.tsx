import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import SectionCard from './ui/SectionCard';
import PressButton from './ui/PressButton';
import { DURATION, EASE_OUT } from '../motion/tokens';
import './sections.css';
import './balance-forecast.css';

const A = '/assets/figma';

type Layer = { src: string; inset: string; inner?: string };

/** Figma 3930:213382 — слои графика (recharts → SVG) в порядке отрисовки */
const LAYERS: Layer[] = [
  { src: '3930-213388-balance-band.svg', inset: '13.92% 1.25% 22.69% 38.39%' },
  { src: '3930-213391-balance-today.svg', inset: '2.5% 61.61% 18.75% 38.39%', inner: '0 -0.5px' },
  { src: '3930-213393-balance-min.svg', inset: '61.56% 1.25% 38.44% 1.25%', inner: '-0.5px 0' },
  { src: '3930-213396-balance-fact.svg', inset: '13.92% 61.61% 68.95% 1.25%', inner: '-3% -0.46% -3.65% -0.41%' },
  { src: '3930-213399-balance-base.svg', inset: '13.92% 1.25% 44.34% 38.39%', inner: '-1.41% -0.17% -1.5% -0.16%' },
  { src: '3930-213402-balance-breach.svg', inset: '61.25% 41.84% 33.75% 55.79%', inner: '-12.5%' },
];

const TICKS: { label: string; inset: string }[] = [
  { label: '9 сен', inset: '84.26% 84.93% 7.62% 6%' },
  { label: '21 окт', inset: '84.26% 56.29% 7.62% 33.08%' },
  { label: '2 дек', inset: '84.26% 29.22% 7.62% 61.72%' },
  { label: '6 янв', inset: '84.26% 6% 7.62% 84.93%' },
];

/**
 * Figma 3930:213362 — «Прогноз остатка». Запас в днях, график факт/прогноз
 * с коридором P10–P90 и датой пробоя. «Как считается прогноз» раскрывает
 * пояснение о расчёте прогноза.
 */
export default function BalanceForecast() {
  const [open, setOpen] = useState(false);

  return (
    <SectionCard title="Прогноз остатка" nodeId="3930:213362" className="fx-section--pt11">
      <div className="card balance fx-solid" data-node-id="3930:213366">
        <div className="balance__head" data-node-id="3930:213367">
          <p className="fx-caption">Запас ликвидности</p>
          <p className="fx-amount">
            <span className="fx-amount__value">47</span>
            <span className="fx-amount__currency">дней</span>
          </p>
        </div>

        <div className="balance__body" data-node-id="3930:213373">
          <div className="balance__plot" data-node-id="3930:213374">
            <div className="balance__legend" aria-hidden>
              <span className="balance__legend-fact">Факт</span>
              <span className="balance__legend-forecast">Прогноз</span>
            </div>
            <div
              className="balance__chart"
              role="img"
              aria-label="Остаток: факт до 21 окт, далее прогноз. Минимум 8 млрд ₽, пробой в пессимистичном сценарии 18 ноя."
              data-node-id="3930:213382"
            >
              {LAYERS.map(({ src, inset, inner }) => (
                <div key={src} className="chart__layer" style={{ inset }}>
                  {inner ? (
                    <span className="chart__pad" style={{ inset: inner }}>
                      <img src={`${A}/${src}`} alt="" />
                    </span>
                  ) : (
                    <img src={`${A}/${src}`} alt="" />
                  )}
                </div>
              ))}
              {TICKS.map((t) => (
                <span key={t.label} className="balance__tick" style={{ inset: t.inset }} aria-hidden>
                  {t.label}
                </span>
              ))}
              <span className="balance__min" aria-hidden>
                мин. 8 млрд
              </span>
            </div>
          </div>
          <p className="text-13 balance__note">
            В пессимистичном сценарии остаток ООО «Порт» опустится ниже минимума{' '}
            <span className="balance__breach">
              <b>18 ноя</b>.
            </span>
          </p>
        </div>

        <div className="balance__footer" data-node-id="3930:213415">
          <PressButton
            className="fx-btn fx-btn--secondary balance__more"
            aria-expanded={open}
            aria-controls="balance-forecast-details"
            onClick={() => setOpen((v) => !v)}
          >
            Как считается прогноз
          </PressButton>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id="balance-forecast-details"
                className="balance__details"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: DURATION.fast, ease: EASE_OUT }}
              >
                <p className="fx-caption">
                  Пунктир — базовый прогноз по платёжному календарю. Заливка — коридор P10–P90: в 8 из 10 сценариев
                  остаток окажется внутри. Пробой считаем по нижней границе P10.
                </p>
                <p className="fx-caption">
                  Минимальный остаток <span className="balance__em">8 млрд ₽</span> — по политике казначейства.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionCard>
  );
}
