import { useId, useState } from 'react';
import { LowerCard, LowerSection, Money, SourceAction } from './lower/Primitives';

export default function TaxesEns() {
  const [prepared, setPrepared] = useState(false);
  const draftId = useId();
  return <LowerSection title="Налоги и ЕНС" name="taxes-ens" node="3930:213705">
    <LowerCard node="212272" gap={16} round>
      <div className="lower-between"><div className="lower-stack-8"><p className="fx-caption">Нужно пополнить ЕНС</p><Money>+22 млн</Money></div><span className="lower-date-chip">до 28 окт</span></div>
      <div className="lower-tax-chart">
        <div className="lower-between"><span className="fx-caption">Обязательства</span><span className="lower-medium">74,0 млн ₽</span></div>
        <div className="lower-tax-track" role="img" aria-label="На ЕНС 52 миллиона, не хватает 22 миллионов рублей"><span /></div>
        <div className="lower-between"><div><p className="fx-caption">Есть на ЕНС</p><p className="lower-medium">52,0 млн ₽</p></div><div className="lower-align-right"><p className="fx-caption">Не хватает</p><p className="lower-medium">22,0 млн ₽</p></div></div>
      </div>
      <SourceAction aria-expanded={prepared} aria-controls={draftId} onClick={() => setPrepared(value => !value)}>{prepared ? 'Убрать черновик' : 'Подготовить 22,0 млн ₽'}</SourceAction>
      {prepared && <div id={draftId} className="lower-state-panel lower-stack-4" role="status"><p className="lower-medium">Черновик пополнения готов</p><p className="fx-caption">22,0 млн ₽ · платёж не отправлен. Перед подписью нужны сверка ЕНС и проверка реквизитов.</p></div>}
    </LowerCard>
  </LowerSection>;
}
