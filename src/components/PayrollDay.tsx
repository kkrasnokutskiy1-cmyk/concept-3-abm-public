import { useId, useState } from 'react';
import PressButton from './ui/PressButton';
import { LowerCard, LowerSection, Money, SourceAction } from './lower/Primitives';
import { dismissalReasons } from './lower/demoData';

export default function PayrollDay() {
  const [stage, setStage] = useState<'idle' | 'review' | 'prepared'>('idle');
  const [choosingReason, setChoosingReason] = useState(false);
  const [dismissedReason, setDismissedReason] = useState<string | null>(null);
  const reviewId = useId();
  return <LowerSection title="Зарплатный день" name="payroll-day" node="3930:213931">
    <LowerCard node="212498" gap={16}>
      {dismissedReason ? <p className="fx-caption" role="status">Предложение скрыто. Его можно вернуть ниже.</p> : <>
      <div className="lower-payroll-summary lower-stack-8"><p className="fx-caption">Экономия после обслуживания</p><Money>244 000</Money></div>
      <div className="lower-payroll-date"><div className="lower-calendar-tile"><strong>25</strong><span>окт</span></div><div className="lower-stack-4"><p className="lower-row-title">1 240 сотрудников</p><p className="fx-caption">Реестр 186 млн ₽</p></div></div>
      <figure className="lower-payroll-chart" aria-label="Стоимость месячного зарплатного реестра">
        <div><div className="lower-between"><span className="fx-caption">Сейчас · 0,15%</span><span className="lower-medium">279 000 ₽</span></div><div className="lower-payroll-track" aria-hidden="true"><span /></div></div>
        <div><div className="lower-between"><span className="fx-caption">После переноса</span><span className="lower-medium">35 000 ₽</span></div><div className="lower-payroll-track lower-payroll-track--after" aria-hidden="true"><span /></div></div>
      </figure>
      <p className="fx-caption lower-copy-320">Расчёт для одного месячного реестра. Выплата зарплаты из этой карточки недоступна.</p>
      </>}
      <footer className="lower-payroll-footer">
        {!dismissedReason && <>
          <p className="lower-medium lower-copy-320">Переводы 0% · обслуживание 35 000 ₽/мес.</p>
          {stage === 'idle' && <SourceAction primary small aria-expanded={false} aria-controls={reviewId} onClick={() => setStage('review')}>Посчитать условия</SourceAction>}
          {stage === 'review' && <div id={reviewId} role="region" aria-label="Проверка условий" className="lower-state-panel lower-state-stack">
            <p>Переводы 0% · обслуживание 35 000 ₽/мес. На реестре 186 млн ₽ расчётная экономия 244 000 ₽ за месяц. Перед переносом нужно проверить банки сотрудников, тариф внешних переводов и сроки зачисления.</p>
            <p className="fx-caption">Демонстрационные условия. Следующее действие подготовит черновик, без подключения и списания.</p>
            <SourceAction primary onClick={() => setStage('prepared')}>Подготовить черновик</SourceAction>
            <SourceAction onClick={() => setStage('idle')}>Отмена</SourceAction>
          </div>}
          {stage === 'prepared' && <div className="lower-state-stack"><p role="status">Черновик готов в демо. Условия требуют проверки; заявка не отправлена.</p><SourceAction onClick={() => setStage('idle')}>Удалить черновик</SourceAction></div>}
        </>}
        {dismissedReason ? <div className="lower-between lower-dismiss-result"><p className="fx-caption">Скрыли · {dismissedReason.toLowerCase()}</p><PressButton className="lower-dismiss" onClick={() => setDismissedReason(null)}>Вернуть</PressButton></div> : choosingReason ? <div className="lower-dismiss-reasons" role="group" aria-label="Почему не актуально">
          {dismissalReasons.map(reason => <PressButton className="lower-dismiss" key={reason} onClick={() => { setDismissedReason(reason); setChoosingReason(false); setStage('idle'); }}>{reason}</PressButton>)}
          <PressButton className="lower-dismiss" onClick={() => setChoosingReason(false)}>Отмена</PressButton>
        </div> : <PressButton className="lower-dismiss" onClick={() => setChoosingReason(true)}>Не актуально</PressButton>}
      </footer>
    </LowerCard>
  </LowerSection>;
}
