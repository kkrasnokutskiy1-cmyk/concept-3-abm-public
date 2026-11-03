import { useState } from 'react';
import { AiExplanation, LowerCard, LowerSection, SourceAction } from './lower/Primitives';

const conditions = [
  ['Условие', 'Платёж получателю, сменившему реквизиты ≤ 7 дней назад'],
  ['Объект', 'Все юрлица группы'],
  ['Порог', 'Сумма больше 50 млн ₽'],
  ['Канал', 'Push и задержка подписи до подтверждения'],
];

export default function SuggestedRule() {
  const [enabled, setEnabled] = useState(false);
  return <LowerSection title="Предложенное правило" name="suggested-rule" node="3930:213974" ai>
    <LowerCard node="212545" gap={16} round>
      <AiExplanation node="212546" glowNode="212556">Платежи новым получателям в первые 7 дней после смены реквизитов уже дважды оказывались ошибочными</AiExplanation>
      <dl className="lower-rule-conditions">{conditions.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <p className="lower-copy-320">За 90 дней сработало бы <strong>3 раза</strong>, ложных — <strong>0</strong>. Два из трёх случаев потом потребовали отзыва платежа.</p>
      <SourceAction aria-pressed={enabled} onClick={() => setEnabled(value => !value)}>{enabled ? 'Правило включено' : 'Включить правило'}</SourceAction>
    </LowerCard>
  </LowerSection>;
}
