import { LowerCard, LowerSection } from './lower/Primitives';

/** Figma 3930:213472 — полученная и доступная выгода без округления диаграммы. */
export default function MonthBenefit() {
  return <LowerSection title="Выгода месяца" name="month-benefit" node="3930:213472">
    <LowerCard node="212039">
      <div className="lower-benefit-totals">
        <div><p className="fx-caption">Получено за октябрь</p><p className="lower-benefit-value">6,8 млн</p><p className="fx-caption">62% возможной</p></div>
        <div><p className="fx-caption">Ещё можно</p><p className="lower-benefit-value lower-muted">4,2 млн</p><p className="fx-caption">до конца месяца</p></div>
      </div>
      <figure className="lower-benefit-chart" aria-label="Получено 6,8 из 11 миллионов рублей">
        <div className="lower-benefit-cells" aria-hidden="true">{Array.from({ length: 11 }, (_, i) => <span key={i} className={i < 6 ? 'is-filled' : i === 6 ? 'is-partial' : ''} />)}</div>
        <figcaption><span>1 ячейка — 1 млн ₽</span><span>из 11,0 млн ₽</span></figcaption>
      </figure>
    </LowerCard>
  </LowerSection>;
}
