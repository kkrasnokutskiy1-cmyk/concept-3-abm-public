import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PRESS_SCALE, pressTransition, stateSpring } from '../motion/tokens';
import { riskAxes } from '../data/stackContent';
import './ui/ui.css';
import './top.css';
import './attention.css';

const collapse = { height: 0, opacity: 0 };
const reveal = { height: 'auto', opacity: 1 };

/** Figma 3930:212950 (свёрнуто) и 3930:214065 (раскрыто): оси лежат внутри той же стеклянной карточки. */
export default function AttentionBanner() {
  const [expanded, setExpanded] = useState(false);
  const [axisKey, setAxisKey] = useState<string | null>(null);
  const panelId = useId();
  return (
    <div className="mf-attention" data-node-id="3930:212950">
      <div className="mf-attention__card fx-glass" data-node-id="3930:214067">
        <motion.button
          type="button" className="mf-attention__btn" data-node-id="3930:214068"
          aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpanded(!expanded)}
          whileTap={{ scale: PRESS_SCALE }} transition={pressTransition}
        >
          <span className="mf-attention__text">
            <span className="mf-attention__title"><span className="mf-attention__dot" />Внимание</span>
            <span className="fx-caption">Одна ось у порога: ковенант DSCR</span>
          </span>
          <motion.img
            className="mf-attention__icon" src="/assets/figma/3930-212959-chevron-down.svg" alt="" width={16} height={16}
            animate={{ rotate: expanded ? 180 : 0 }} transition={stateSpring}
          />
        </motion.button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="axes" id={panelId} className="risk-axes" aria-label="Оси риска" data-node-id="3930:214077"
              initial={collapse} animate={reveal} exit={collapse} transition={stateSpring}
            >
              <ul>
                {riskAxes.map((axis) => {
                  const open = axisKey === axis.key;
                  const warning = axis.level >= axis.threshold;
                  const detailId = `${panelId}-${axis.key}`;
                  return (
                    <li key={axis.key}>
                      <button type="button" className={`risk-axis${warning ? ' risk-axis--warning' : ''}`} aria-expanded={open} aria-controls={detailId} onClick={() => setAxisKey(open ? null : axis.key)}>
                        <span className="risk-axis__heading"><span>{axis.label}</span><span className="risk-axis__value">{axis.value}</span></span>
                        <span className="risk-axis__gauge" role="img" aria-label={`${axis.label}: ${axis.level} из 5, порог ${axis.threshold}`}>
                          {Array.from({ length: 5 }, (_, i) => <span key={i} className={`risk-axis__segment${i < axis.level ? ' risk-axis__segment--filled' : ''}`} />)}
                          {warning && <span className="risk-axis__threshold" style={{ left: `${((axis.threshold - 1) / 5) * 100}%` }} />}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div key="reason" id={detailId} className="risk-axis__reason" initial={collapse} animate={reveal} exit={collapse} transition={stateSpring}>
                            <p className="fx-caption">{axis.reason}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
