import { useState, type CSSProperties } from 'react';
import { LowerCard, LowerSection, Money, SourceTabs } from './lower/Primitives';
import { cashPeriods, cashPeriodFlow, flowNumber } from './lower/demoData';

// Координаты каждого сегмента получены из Figma (исходная шкала 320 px).
const flow = [
  { label: 'Остаток на начало', value: '11,72', start: 0, width: 206.969, kind: 'total' },
  { label: 'Операционные поступления', value: '+6,40', start: 206.97, width: 113.023, kind: 'inflow' },
  { label: 'Операционные платежи', value: '−5,10', start: 229.93, width: 90.063, kind: 'outflow' },
  { label: 'Инвестиции, сальдо', value: '−0,90', start: 214.04, width: 15.891, kind: 'outflow' },
  { label: 'Финансовые поступления', value: '+1,20', start: 214.04, width: 21.188, kind: 'inflow' },
  { label: 'Финансовые платежи', value: '−0,48', start: 226.75, width: 8.477, kind: 'outflow' },
  { label: 'Остаток на конец', value: '12,84', start: 0, width: 226.75, kind: 'total' },
];

export default function CashFlow() {
  const [selected, setSelected] = useState(1);
  const period = cashPeriods[selected];
  const { rows, max, net } = cashPeriodFlow(selected);
  // Месячный график сохраняет исходные дробные координаты Figma.
  const displayedFlow = selected === 1 ? flow : rows.map(row => ({
    label: row.label, value: flowNumber(row.value, row.kind !== 'total'),
    start: row.from / max * 320, width: (row.to - row.from) / max * 320, kind: row.kind,
  }));
  return <LowerSection title="Движение денег" name="cash-flow" node="3930:213739">
    <LowerCard node="212306" round>
      <SourceTabs items={cashPeriods} selected={selected} onSelect={setSelected} label="Период движения денег" />
      <div className="lower-stack-8" aria-live="polite"><p className="fx-caption">{period.title} · чистый поток</p><Money>{flowNumber(net, true)} млрд</Money></div>
      <ol className="lower-waterfall" aria-label={`Движение денег, ${period.title}, млрд рублей`}>{displayedFlow.map(row => <li key={row.label} className={'lower-waterfall__row lower-waterfall__row--' + row.kind}>
        <div className="lower-between"><span>{row.label}</span><span>{row.value}</span></div>
        <div className="lower-waterfall__track" aria-hidden="true"><span style={{ '--bar-start': row.start / 320 * 100 + '%', '--bar-width': selected === 1 ? row.width / 320 * 100 + '%' : `max(3px, ${row.width / 320 * 100}%)` } as CSSProperties} /></div>
      </li>)}</ol>
    </LowerCard>
  </LowerSection>;
}
