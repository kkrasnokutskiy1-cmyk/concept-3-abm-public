import { useRef, useState } from 'react';
import SectionCard from './ui/SectionCard';
import CardStack from './ui/CardStack';
import PressButton from './ui/PressButton';
import { decisionItems, type DecisionItem } from '../data/stackContent';
import './sections.css';
import './stack.css';

type Done = { item: DecisionItem; verb: string };
/** Figma 3930:212961. Свайп влево только откладывает; подпись — два нажатия. */
export default function AwaitingDecision() {
  const [gone, setGone] = useState<Done[]>([]);
  const [armed, setArmed] = useState(false);
  const stackRef = useRef<HTMLDivElement>(null);
  const queue = decisionItems.filter((item) => !gone.some((entry) => entry.item.id === item.id));
  const top = queue[0];
  const last = gone.at(-1);
  const restoreFocus = () => requestAnimationFrame(() => stackRef.current?.querySelector<HTMLElement>('[tabindex="0"], button')?.focus({ preventScroll: true }));
  const finish = (verb: string) => {
    if (!top) return;
    const hadFocus = stackRef.current?.contains(document.activeElement);
    setGone((items) => items.some((entry) => entry.item.id === top.id) ? items : [...items, { item: top, verb }]);
    setArmed(false);
    if (hadFocus) restoreFocus();
  };
  const undo = () => { setGone((items) => items.slice(0, -1)); setArmed(false); restoreFocus(); };
  // Задние слои стопки — те же карточки следующих решений, только неактивные.
  const decisionCard = (item: DecisionItem, primary: string | undefined, active = false) => (
    <article className="card card--p20 decision fx-glass" data-node-id={active ? '3930:212971' : undefined} data-decision-id={active ? item.id : undefined}>
      <div className="decision__body">
        <h3 className="fx-caption">{item.title}</h3>
        <p className="fx-amount"><span className="fx-amount__value">{item.amount}</span>{(item.unit ?? '₽') && <span className="fx-amount__currency">{item.unit ?? '₽'}</span>}</p>
        <p className="fx-caption decision__note">{item.detail}</p>
      </div>
      <div className="btn-row">
        <PressButton className="fx-btn fx-btn--primary" onClick={active ? () => (item.confirm && !armed ? setArmed(true) : finish(item.done)) : undefined} aria-live={active ? 'polite' : undefined}>{primary}</PressButton>
        <PressButton className="fx-btn fx-btn--secondary" onClick={active ? () => finish('Отложено до завтра') : undefined}>Отложить</PressButton>
      </div>
    </article>
  );
  return (
    <SectionCard title="Ждёт вашего решения" nodeId="3930:212961" aside={<span className="fx-badge" aria-label={`Решений: ${queue.length}`}>{queue.length}</span>}>
      <div ref={stackRef}>
        {top ? (
          <CardStack width={336.571} count={queue.length} activeKey={top.id} label={`${top.title}. Смахните влево, чтобы отложить; с клавиатуры — стрелка влево.`} onSwipe={() => finish('Отложено до завтра')} swipeHint={{ left: 'Отложить до завтра' }} backCards={queue.slice(1, 3).map((item) => decisionCard(item, item.primary))}>
            {decisionCard(top, armed ? top.confirm : top.primary, true)}
          </CardStack>
        ) : <p className="card card--p20 fx-solid text-13" role="status">Всё решено · следующая проверка 14:00</p>}
        {last && <div className="stack-feedback"><p className="fx-caption" role="status">{last.verb} · {last.item.title}</p><PressButton className="stack-feedback__undo" onClick={undo}>Вернуть</PressButton></div>}
      </div>
    </SectionCard>
  );
}
