import type { CSSProperties, PointerEvent } from 'react';
import { useRef } from 'react';
import { LowerSection } from './lower/Primitives';

const counterparties = [
  { name: 'ООО «Терминал Восток»', initials: 'ТВ', inn: '2540118734', risk: 'Риск растёт · два новых иска', claims: '340 млн ₽', share: '18%', income: '79,0 млн ₽', heights: [29.313, 36.023, 25.648, 30.836, 37.25, 35.719, 40, 38.469, 33.281, 29.922, 26.563, 24.117] },
  { name: 'Порт-Сервис', initials: 'ПС', inn: '—', risk: 'Риск растёт · два новых иска', claims: '180 млн ₽', share: '12%', income: '62,0 млн ₽', heights: [28, 32, 26, 31, 35, 30, 36, 34, 32, 29, 27, 25] },
  // Демонстрационный контрагент: источник данных для третьей карточки не предоставлен.
  { name: 'ООО «Пример Логистики»', initials: 'ПЛ', inn: '—', risk: 'Проверка данных · статус уточняется', claims: '45 млн ₽', share: '7%', income: '34,0 млн ₽', heights: [21, 25, 23, 27, 26, 30, 28, 32, 30, 33, 31, 35] },
];

export default function Counterparties() {
  const gesture = useRef<{ id: number; x: number; scroll: number } | null>(null);
  const start = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    gesture.current = { id: event.pointerId, x: event.clientX, scroll: event.currentTarget.scrollLeft };
    event.currentTarget.dataset.dragging = 'true';
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.id === event.pointerId) event.currentTarget.scrollLeft = gesture.current.scroll + gesture.current.x - event.clientX;
  };
  const end = (event: PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null;
    delete event.currentTarget.dataset.dragging;
  };
  return <LowerSection title="Контрагенты" name="counterparties" node="3930:213839">
    <div className="lower-counterparties" tabIndex={0} role="region" aria-label="Карточки контрагентов, прокручиваются по горизонтали" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onKeyDown={event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      event.currentTarget.scrollLeft += (event.key === 'ArrowRight' ? 1 : -1) * event.currentTarget.clientWidth;
    }}>
      {counterparties.map((item, index) => <article className="fx-card lower-counterparty" key={item.name} data-node-id={index === 0 ? '3892:212406' : undefined}>
        <header><span className="lower-counterparty__avatar">{item.initials}</span><div className="lower-stack-8"><h3>{item.name}</h3><p className="fx-caption">ИНН {item.inn}</p></div></header>
        <p className="lower-counterparty__risk"><span aria-hidden="true" />{item.risk}</p>
        <dl className="lower-counterparty__metrics"><div><dt>Сумма исков</dt><dd>{item.claims}</dd></div><div><dt>Доля притока</dt><dd>{item.share}</dd></div></dl>
        <div className="lower-between"><div className="lower-stack-4"><p className="fx-caption">Поступления за октябрь</p><p className="lower-counterparty__income">{item.income}</p></div><div className="lower-sparkbars" aria-hidden="true">{item.heights.map((height, i) => <span key={i} className={i > 8 ? 'is-recent' : undefined} style={{ '--bar-height': height + 'px' } as CSSProperties} />)}</div></div>
      </article>)}
    </div>
  </LowerSection>;
}
