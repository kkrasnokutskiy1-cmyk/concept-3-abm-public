import { useId, useState, type CSSProperties } from 'react';
import { Chevron, LowerCard, LowerSection, Money, SourceTabs } from './lower/Primitives';
import { millionAmount, planDeviations } from './lower/demoData';

export default function PlanFact() {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const detailsId = useId();
  const deviations = planDeviations.filter(item => item.kind === (selected === 0 ? 'outflow' : 'inflow'));
  return <LowerSection title="План-факт" name="plan-fact" node="3930:213647">
    <LowerCard node="212214" gap={16} round>
      <div className="lower-stack-8"><Money>+233 млн</Money><p className="fx-caption">к остатку по 5 статьям с отклонениями</p></div>
      <div className="lower-stack-20">
        <SourceTabs items={[{ label: 'Расходы', count: '4' }, { label: 'Поступления', count: '1' }]} selected={selected} label="Направление потока" onSelect={index => {
          setSelected(index);
          setOpen(planDeviations.find(item => item.kind === (index === 0 ? 'outflow' : 'inflow'))?.title ?? null);
        }} />
        <ul className="lower-deviations">{deviations.map((item, index) => {
          const expanded = open === item.title;
          const difference = item.fact - item.plan;
          const impact = item.kind === 'inflow' ? difference : -difference;
          const id = `${detailsId}-${index}`;
          return <li key={item.title}>
            <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setOpen(expanded ? null : item.title)}><span className="lower-stack-4"><span className="lower-row-title">{item.title}</span><span className={'fx-caption' + (impact < 0 ? ' lower-negative' : '')}>{item.detail}</span></span><Chevron /></button>
            <div id={id} hidden={!expanded}>
              <div className="lower-plan-details">
                {[{ label: 'План', value: item.plan }, { label: 'Факт', value: item.fact }].map(row => <div key={row.label} className="lower-stack-4">
                  <div className="lower-between"><span className="fx-caption">{row.label}</span><span className="lower-medium">{millionAmount(row.value)}</span></div>
                  <div className={'lower-plan-track' + (row.label === 'Факт' ? ' lower-plan-track--fact' : '')} aria-hidden="true"><span style={{ '--bar-width': `${row.value / Math.max(item.plan, item.fact) * 100}%` } as CSSProperties} /></div>
                </div>)}
                <p className="fx-caption">{new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(Math.abs(difference / item.plan * 100))}% к плану · {impact < 0 ? 'уменьшает' : 'увеличивает'} остаток на {millionAmount(Math.abs(impact))}</p>
              </div>
            </div>
          </li>;
        })}</ul>
      </div>
    </LowerCard>
  </LowerSection>;
}
