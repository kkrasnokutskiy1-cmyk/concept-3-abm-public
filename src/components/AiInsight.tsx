import { motion } from 'motion/react';
import SectionCard from './ui/SectionCard';
import AiMark from './ui/AiMark';
import StarGlow from './ui/StarGlow';
import PressButton from './ui/PressButton';
import { barGrow, chartStagger } from '../motion/tokens';
import { useChartEnter } from '../motion/useChartEnter';
import './sections.css';

const A = '/assets/figma';

const BARS = [
  { month: 'июн', h: 51, value: '34' },
  { month: 'июл', h: 53 },
  { month: 'авг', h: 61 },
  { month: 'сен', h: 70 },
  { month: 'окт', h: 78, value: '47', accent: true },
];

/** Figma 3930:213253 — «Находка Альфа-Интеллект» */
export default function AiInsight() {
  const enter = useChartEnter();
  return (
    <SectionCard
      title="Находка Альфа-Интеллект"
      nodeId="3930:213253"
      className="fx-section--loose fx-section--gap9"
      titleClassName="fx-ai-text mf-insight-title"
      icon={<AiMark shadow={{ src: `${A}/3892-211884-ai-shadow.svg`, inset: '0' }} />}
    >
      <div className="card card--p20-16 mf-insight fx-solid" data-node-id="3930:213258">
        <h3 className="title-15 nowrap">Покупатели стали платить медленнее</h3>
        <div className="mf-insight__stats">
          <div className="mf-insight__metric">
            <p className="fx-caption nowrap">Средний срок оплаты дебиторки</p>
            <p className="mf-insight__value">
              <b>47</b>
              <span>дней</span>
            </p>
          </div>
          <p className="mf-insight__trend">
            <img src={`${A}/3892-211899-arrow-up-red.svg`} alt="" width={8} height={8} />
            13 дн за 4 мес
          </p>
        </div>
        <motion.div
          className="bars"
          variants={chartStagger}
          {...enter}
          role="img"
          aria-label="Срок оплаты по месяцам: июнь 34 дня, октябрь 47 дней"
        >
          {BARS.map((b) => (
            <div key={b.month} className="bars__col">
              {b.value && <span className="bars__value">{b.value}</span>}
              <motion.span
                className={b.accent ? 'bars__bar bars__bar--accent' : 'bars__bar'}
                style={{ height: b.h }}
                variants={barGrow}
              />
              <span className="bars__label">{b.month}</span>
            </div>
          ))}
        </motion.div>
        <div className="fx-glass fx-ai-glass fx-inset note" data-node-id="3930:213291">
          <p className="text-13 note__text">70% роста дают 3 покупателя из топ-10. В дебиторке заморожено ещё 1,6 млрд ₽.</p>
          <div className="note__confidence">
            <span className="mf-signal" aria-hidden>
              <i style={{ height: 5 }} />
              <i style={{ height: 7 }} />
              <i style={{ height: 9 }} />
            </span>
            <span className="caption-12 nowrap">Уверенность высокая</span>
          </div>
          <StarGlow
            src={`${A}/3892-211930-star-23.png`}
            box={{ right: 77.99, top: -325.05, width: 677.468, height: 629.111 }}
            layer={{ width: 525.091, height: 586.576 }}
            inset="-12.79% -14.28%"
            imgWidth={675.091}
            imgHeight={736.576}
          />
        </div>
        <div className="mf-insight__footer btn-row">
          <PressButton className="fx-btn fx-btn--secondary btn-13">Кто платит медленнее</PressButton>
        </div>
      </div>
    </SectionCard>
  );
}
