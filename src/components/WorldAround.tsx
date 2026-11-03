import { useRef, useState, type PointerEvent } from 'react';
import { motion } from 'motion/react';
import SectionCard from './ui/SectionCard';
import PressButton from './ui/PressButton';
import { DURATION, EASE_OUT } from '../motion/tokens';
import './sections.css';
import './world-around.css';

const A = '/assets/figma';

type WorldEvent = {
  id: string;
  topic: string;
  text: string;
  /** Влияние на компанию за год, млн ₽ */
  impact: number;
  tag: string;
  /** Мягкий переход в связанный блок экрана; без якоря действие недоступно */
  next?: { label: string; href?: string };
};

/** Демонстрационные события для блока «Мир вокруг вас» */
const EVENTS: WorldEvent[] = [
  { id: 'e-rate', topic: 'Ставка ЦБ', text: 'Совет директоров 25 октября: рынок ждёт снижения на 1 п.п.', impact: -64, tag: 'ваш долг', next: { label: 'Пересчитать долг', href: '#key-rate-impact' } },
  { id: 'e-cny', topic: 'Курс CNY', text: 'Юань +3,2% за неделю, оплата оборудования 28 октября', impact: -67, tag: 'ваш импорт', next: { label: 'Сравнить хедж' } },
  { id: 'e-law', topic: 'Закон', text: 'С 1 января НДС 22%: выше платёж и потребность в оборотке', impact: -38, tag: 'ваши налоги' },
  { id: 'e-cp', topic: 'Контрагент', text: 'ООО «Терминал Восток»: второй иск за месяц', impact: -21, tag: 'ваша дебиторка' },
  { id: 'e-steel', topic: 'Сырьё', text: 'Металлопрокат −6% за месяц', impact: 17, tag: 'ваши закупки' },
].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

const NET = EVENTS.reduce((s, e) => s + e.impact, 0);
const NEG_MAX = Math.max(0, ...EVENTS.map((e) => -e.impact));
const POS_MAX = Math.max(0, ...EVENTS.map((e) => e.impact));
const SCALE = NEG_MAX + POS_MAX;
/** Ноль шкалы: минус влево, плюс вправо (в макете 124.42 из 156 px) */
const ZERO = (NEG_MAX / SCALE) * 100;
const AGAINST = EVENTS.filter((e) => e.impact < 0).length;
const FOR = EVENTS.filter((e) => e.impact > 0).length;

const mln = (n: number) => `${n < 0 ? '−' : n > 0 ? '+' : ''}${Math.abs(n)} млн`;
const SWIPE = 40;

/**
 * Figma 3930:213032 — «Мир вокруг вас». Итог за год, расходящиеся столбцы
 * на одной шкале и карточка события в фокусе. Касание строки или свайп
 * по карточке (и стрелки) меняют событие; «Взять на контроль» — с возвратом.
 */
export default function WorldAround() {
  const [index, setIndex] = useState(0);
  const [watched, setWatched] = useState<string[]>([]);
  const [changed, setChanged] = useState(false);
  const start = useRef<number | null>(null);

  const e = EVENTS[index];
  const isWatched = watched.includes(e.id);
  const go = (i: number) => {
    setChanged(true);
    setIndex((i + EVENTS.length) % EVENTS.length);
  };

  const onPointerDown = (ev: PointerEvent<HTMLDivElement>) => {
    if (ev.isPrimary) start.current = ev.clientX;
  };
  const onPointerUp = (ev: PointerEvent<HTMLDivElement>) => {
    if (start.current === null) return;
    const dx = ev.clientX - start.current;
    start.current = null;
    if (Math.abs(dx) > SWIPE) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <SectionCard title="Мир вокруг вас" nodeId="3930:213032" className="fx-section--pt11">
      <div className="card card--p20 world fx-solid" data-node-id="3930:213036">
        <div className="world__head" data-node-id="3930:213037">
          <div className="world__total">
            <p className="fx-caption">Итог за год для компании</p>
            <p className="world__amount">
              <span className="world__amount-value">{mln(NET)}</span>
              <span className="world__amount-currency">₽</span>
            </p>
          </div>
          <p className="fx-caption world__score">
            <span className="world__score-num">{AGAINST}</span> против ·{' '}
            <span className="world__score-num world__score-num--for">{FOR}</span> за
          </p>
        </div>

        <ul className="world__list" data-node-id="3930:213047">
          {EVENTS.map((ev, i) => {
            const on = i === index;
            const w = (Math.abs(ev.impact) / SCALE) * 100;
            const tone = ev.impact > 0 ? 'world__bar--for' : on ? 'world__bar--on' : '';
            return (
              <li key={ev.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  className={on ? 'world__row world__row--on' : 'world__row'}
                  onClick={() => i !== index && go(i)}
                >
                  <span className="world__topic">{ev.topic}</span>
                  <span className="world__scale" aria-hidden>
                    <span className="world__zero" style={{ left: `${ZERO}%` }} />
                    <span
                      className={`world__bar ${tone}${on ? ' world__bar--active' : ''}`}
                      style={
                        ev.impact < 0
                          ? { right: `${100 - ZERO}%`, width: `${w}%` }
                          : { left: `${ZERO}%`, width: `${w}%` }
                      }
                    />
                  </span>
                  <span className={ev.impact > 0 ? 'world__value world__value--for' : 'world__value'}>{mln(ev.impact)}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div
          className="world__event"
          data-node-id="3930:213093"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (start.current = null)}
        >
          <motion.div
            key={e.id}
            className="world__event-body"
            initial={changed ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.fast, ease: EASE_OUT }}
          >
            <div className="world__event-top">
              <span className="world__tag">{e.tag}</span>
              <span className="world__pager">
                <PressButton className="world__nav" aria-label="Предыдущее событие" onClick={() => go(index - 1)}>
                  <img src={`${A}/3930-213100-chevron-left-muted.svg`} alt="" width={16} height={16} />
                </PressButton>
                <span className="world__count" aria-live="polite">
                  {index + 1}/{EVENTS.length}
                </span>
                <PressButton className="world__nav" aria-label="Следующее событие" onClick={() => go(index + 1)}>
                  <img src={`${A}/lower/9353a.svg`} alt="" width={16} height={16} />
                </PressButton>
              </span>
            </div>
            <p className="title-15 world__text">{e.text}</p>
            <p className="fx-caption">
              {e.topic} ·{' '}
              <span className={e.impact > 0 ? 'world__score-num--for' : 'world__em'}>{mln(e.impact)} ₽</span> за год
            </p>
            {isWatched ? (
              <p className="fx-caption world__done" aria-live="polite">
                <span>На контроле</span>
                <PressButton className="world__action" onClick={() => setWatched((w) => w.filter((x) => x !== e.id))}>
                  Вернуть
                </PressButton>
              </p>
            ) : (
              <div className="world__actions">
                <PressButton className="world__action" onClick={() => setWatched((w) => [...w, e.id])}>
                  Взять на контроль
                </PressButton>
                {e.next &&
                  (e.next.href ? (
                    <a className="world__action" href={e.next.href}>
                      {e.next.label}
                    </a>
                  ) : (
                    <button type="button" className="world__action" disabled>
                      {e.next.label}
                    </button>
                  ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </SectionCard>
  );
}
