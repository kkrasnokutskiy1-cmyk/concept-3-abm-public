import { AiExplanation, Chevron, LowerCard, LowerSection, lowerAsset } from './lower/Primitives';

const rows = [
  { label: 'Поступления', before: '8,42', now: '9,15', delta: '0,73', icon: '1a162.svg', down: false, bad: false },
  { label: 'Списания', before: '7,96', now: '7,51', delta: '0,45', icon: '061c9.svg', down: true, bad: false },
  { label: 'Чистый поток', before: '0,46', now: '1,64', delta: '1,18', icon: '1a162.svg', down: false, bad: false },
  { label: 'Срок, дн', before: '43', now: '47', delta: '4', icon: 'b6b5a.svg', down: false, bad: true },
];

export default function MonthOverMonth() {
  return <LowerSection title="Месяц к месяцу" name="month-over-month" node="3930:213521">
    <LowerCard node="212088" round>
      <AiExplanation node="212089" glowNode="212099">Октябрь лучше сентября по деньгам, но за счёт разовых ранних поступлений. Устойчивое ухудшение — сроки оплаты.</AiExplanation>
      <table className="lower-comparison"><thead><tr><th scope="col">млрд ₽</th><th scope="col">сен</th><th scope="col">окт</th><th scope="col">Δ</th></tr></thead><tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.before}</td><td>{row.now}</td><td><span className={row.bad ? 'lower-delta lower-delta--bad' : 'lower-delta'}><img src={lowerAsset(row.icon)} alt={row.down ? 'Снижение на' : 'Рост на'} width={8} height={8} className={row.down ? 'is-down' : undefined} />{row.delta}</span></td></tr>)}</tbody></table>
      <div className="lower-differences"><p className="fx-caption">Два главных различия</p><ol>
        <li><span className="lower-difference-number">1</span><p>Чистый поток вырос в 3,6 раза: «Альфа-Девелопмент» и «Порт-Сервис» заплатили раньше графика</p><Chevron down={false} /></li>
        <li><span className="lower-difference-number lower-difference-number--muted">2</span><p>Срок оплаты дебиторки удлинился на 4 дня, тренд продолжается 4-й месяц</p><Chevron down={false} /></li>
      </ol></div>
    </LowerCard>
  </LowerSection>;
}
