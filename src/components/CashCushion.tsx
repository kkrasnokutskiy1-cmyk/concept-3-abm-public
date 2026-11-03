import { useState } from 'react';
import { motion } from 'motion/react';
import SectionCard from './ui/SectionCard';
import PressButton from './ui/PressButton';
import { chartCellReveal, chartFillGrow, chartStagger } from '../motion/tokens';
import { useChartEnter } from '../motion/useChartEnter';
import { dismissalReasons } from './lower/demoData';
import './sections.css';
import './lower/lower.css';

const HITS = 3;

/** Figma 3930:213419 — «Подушка от разрыва»; плашка лимита — 3958:214825 (плоская подложка) */
export default function CashCushion() {
  const [choosingReason, setChoosingReason] = useState(false);
  const [dismissedReason, setDismissedReason] = useState<string | null>(null);
  const enter = useChartEnter();
  const grow = useChartEnter();
  return (
    <SectionCard title="Подушка от разрыва" nodeId="3930:213419" className="fx-section--loose fx-section--end">
      <div className="card card--p20-16 cushion fx-solid" data-node-id="3892:211986">
        {dismissedReason ? <p className="fx-caption" role="status">Предложение скрыто. Его можно вернуть ниже.</p> : <div className="cushion__main">
          <div className="amount-block">
            <p className="fx-caption">Возможный разрыв 18 ноя</p>
            <div className="cushion__amount">
              <p className="fx-amount">
                <span className="fx-amount__value">200 млн</span>
                <span className="fx-amount__currency">₽</span>
              </p>
              <p className="fx-caption" style={{ maxWidth: 320 }}>
                ниже минимального остатка в пессимистичном сценарии
              </p>
            </div>
          </div>
          <figure className="fx-inset cushion__figure" data-node-id="3958:214825">
            <figcaption className="cushion__caption">
              <span className="text-13 nowrap">Одобренный лимит</span>
              <span className="text-13 text-13--medium nowrap">1,5 млрд ₽</span>
            </figcaption>
            <motion.div className="limit" role="img" aria-label="Использовано 200 млн ₽ из 1,5 млрд ₽" variants={chartStagger} {...grow}>
              <motion.div
                className="limit__used"
                variants={chartFillGrow}
              />
            </motion.div>
            <div className="kv-grid">
              <div className="kv">
                <span className="fx-caption nowrap">На покрытие</span>
                <span className="text-13 text-13--medium nowrap">200 млн ₽</span>
              </div>
              <div className="kv kv--end">
                <span className="fx-caption nowrap">Запас лимита</span>
                <span className="text-13 text-13--medium nowrap">1,30 млрд ₽</span>
              </div>
            </div>
          </figure>
          <div className="scenarios">
            <motion.div
              className="scenarios__grid"
              aria-hidden
              variants={chartStagger}
              {...enter}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <motion.i
                  key={i}
                  className={i < HITS ? 'is-hit' : undefined}
                  variants={chartCellReveal}
                />
              ))}
            </motion.div>
            <p className="fx-caption" style={{ flex: '1 0 0', minWidth: 0 }}>
              Разрыв в 3 из 10 сценариев · уверенность средняя
            </p>
          </div>
        </div>}
        <div className="cushion__footer">
          {!dismissedReason && <PressButton className="fx-btn fx-btn--primary btn-13 btn-full">Подключить подушку</PressButton>}
          {dismissedReason ? (
            <div className="lower-between lower-dismiss-result">
              <p className="fx-caption">Скрыли · {dismissedReason.toLowerCase()}</p>
              <PressButton className="lower-dismiss" onClick={() => setDismissedReason(null)}>Вернуть</PressButton>
            </div>
          ) : choosingReason ? (
            <div className="lower-dismiss-reasons" role="group" aria-label="Почему не актуально">
              {dismissalReasons.map(reason => (
                <PressButton className="lower-dismiss" key={reason} onClick={() => { setDismissedReason(reason); setChoosingReason(false); }}>{reason}</PressButton>
              ))}
              <PressButton className="lower-dismiss" onClick={() => setChoosingReason(false)}>Отмена</PressButton>
            </div>
          ) : <PressButton className="ghost" onClick={() => setChoosingReason(true)}>Не актуально</PressButton>}
        </div>
      </div>
    </SectionCard>
  );
}
