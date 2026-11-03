import { useId, useState } from 'react';
import { Chevron, LowerCard, LowerSection, Money, SourceAction, StarGlow } from './lower/Primitives';
import { paymentHistory, paymentImpact } from './lower/demoData';

function PaymentHistory() {
  // Линейная шкала 6…320 и выборка 24 платежей.
  const position = (value: number) => 6 + value / (184 * 1.04) * 314;
  return <svg className="lower-history-chart" viewBox="0 0 326 44" role="img" aria-label="Сумма относительно истории платежей: максимум 104 млн, текущая сумма 184 млн рублей">
    <line className="lower-history-axis" x1={6} x2={320} y1={24} y2={24} />
    <line className="lower-history-range" x1={position(22)} x2={position(104)} y1={24} y2={24} />
    {paymentHistory.map(value => <circle className="lower-history-point" key={value} cx={position(value)} cy={24} r={3} />)}
    <line className="lower-history-limit" x1={position(104)} x2={position(104)} y1={14} y2={34} />
    <circle className="lower-history-current" cx={position(184)} cy={24} r={10} opacity={0.2} />
    <circle className="lower-history-current" cx={position(184)} cy={24} r={5.5} />
    <text x={position(184)} y={10} textAnchor="end">184 млн</text><text x={6} y={43}>22,0 млн</text><text x={position(104)} y={43} textAnchor="middle">макс. 104 млн</text>
  </svg>;
}

export default function PaymentCheck() {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  return <LowerSection title="Проверка платежа" name="payment-check" node="3930:213612" ai>
    <LowerCard node="212180" gap={12} aiGlass>
      <div className="lower-stack-8"><p className="fx-caption">ООО «Порт» → ООО «Терминал Восток»</p><Money>184 млн</Money></div>
      <div className="lower-stack-4">
        <ul className="lower-risk-list">
          <li>Реквизиты получателя изменились 3 дня назад, новый счёт в другом банке</li>
          <li>Сумма в 1,8 раза больше самого крупного платежа этому получателю</li>
          <li>После платежа лимит на контрагента загружен на 89% (порог 85%)</li>
        </ul>
        <button type="button" className="lower-disclosure" aria-expanded={expanded} aria-controls={detailsId} onClick={() => setExpanded(value => !value)}><span>Получатель, история сумм, влияние</span><Chevron /></button>
        {expanded && <div id={detailsId} className="lower-payment-details">
          <div className="lower-payment-history"><p className="fx-caption">Сумма среди 24 прошлых платежей</p><PaymentHistory /></div>
          <dl className="lower-payment-impact">{paymentImpact.map(row => <div key={row.label}><dt>{row.label}</dt><dd><span className="lower-muted">{row.before} → </span><strong>{row.after}</strong></dd></div>)}</dl>
        </div>}
      </div>
      <SourceAction small>Запросить подтверждение</SourceAction>
      <StarGlow node="212209" />
    </LowerCard>
  </LowerSection>;
}
