import { useState } from 'react';
import PressButton from './ui/PressButton';
import { AiExplanation, LowerCard, LowerSection, Money, StarGlow } from './lower/Primitives';

export default function KeyRateImpact() {
  const [direction, setDirection] = useState(1);
  const sign = direction === 1 ? '+' : '−';
  return <LowerSection title="Влияние ставки ЦБ" name="key-rate-impact" node="3930:213803">
    <LowerCard node="212370">
      <StarGlow node="212371" />
      <div className="lower-rate-choices" role="group" aria-label="Изменение ключевой ставки">{[1, -1].map(value => <PressButton key={value} className={'fx-btn ' + (direction === value ? 'fx-btn--primary' : 'fx-btn--secondary')} aria-pressed={direction === value} onClick={() => setDirection(value)}>{value === 1 ? '+1 п.п.' : '−1 п.п.'}</PressButton>)}</div>
      <div className="lower-rate-values" aria-live="polite"><div className="lower-stack-8"><p className="fx-caption">Изменение чистых расходов за год</p><Money>{`${sign}13,2 млн`}</Money></div><dl className="lower-rate-details"><div><dt>Проценты по долгу</dt><dd>{`${sign}28,2 млн ₽`}</dd></div><div><dt>Доход на новые размещения</dt><dd>{`${sign}15,0 млн ₽`}</dd></div></dl></div>
      <AiExplanation node="212391" glowNode="212401" rate>{(direction === 1 ? 'Дополнительный доход на остатки покрывает только часть роста расходов по долгу.' : 'Снижение расходов по долгу превышает потерю дохода от новых размещений.') + ' База размещения — 17,2% годовых.'}</AiExplanation>
    </LowerCard>
  </LowerSection>;
}
