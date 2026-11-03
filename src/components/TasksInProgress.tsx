import { useId, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from 'motion/react';
import SectionCard from './ui/SectionCard';
import CardStack from './ui/CardStack';
import PressButton from './ui/PressButton';
import { progressCases } from '../data/stackContent';
import { DURATION, EASE_OUT, stateSpring } from '../motion/tokens';
import './sections.css';
import './stack.css';

/*
 * Бесшовная смена стопка ⇄ список. Первая карточка списка — текущая карточка
 * стопки, на одном месте. Новый вид сначала проявляется поверх старого, и только
 * потом старый гаснет, поэтому кадра без карточек нет. Высота блока тянется пружиной.
 */
const CROSS = DURATION.fast * 0.6;
/** Новый вид — поверх (zIndex 1), уходящий опускается под него */
const viewVariants: Variants = {
  hidden: { opacity: 0, zIndex: 1 },
  shown: { opacity: 1, zIndex: 1, transition: { duration: CROSS, ease: EASE_OUT } },
  exit: { opacity: 0, zIndex: 0, transition: { duration: CROSS, ease: EASE_OUT, delay: CROSS } },
};
/** Остальные дела выезжают из-под первой карточки, при сворачивании прячутся обратно */
const restVariants: Variants = {
  hidden: { opacity: 0, y: -24 },
  shown: (i: number) => ({ opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT, delay: 0.04 + i * 0.06 } }),
  exit: { opacity: 0, y: -16, transition: { duration: CROSS, ease: EASE_OUT } },
};
/** prefers-reduced-motion: виды сменяются без перехода (MotionConfig гасит только transform) */
const viewInstant: Variants = {
  hidden: { opacity: 1 },
  shown: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0 } },
};
const instant: Transition = { duration: 0 };

type Task = (typeof progressCases)[number];
type CardProps = { task: Task; reminded: boolean; detail: boolean; onAction: () => void; back?: boolean };

/**
 * Figma 3930:213001. Два режима: стопка (свайп листает дела по одному) и
 * раскрытый список по шеврону — все дела сразу. Перелистывание не меняет статус дела.
 */
export default function TasksInProgress() {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [reminded, setReminded] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const reduced = useReducedMotion();
  const views = reduced ? viewInstant : viewVariants;
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const [morphing, setMorphing] = useState(false);
  const task = progressCases[index];
  // Список начинается с текущего дела стопки, дальше — та же очередь, что под ней
  const queue = progressCases.map((_, i) => progressCases[(index + i) % progressCases.length]);

  useLayoutEffect(() => {
    const node = stackRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const move = (direction: 'left' | 'right') => {
    const hadFocus = stackRef.current?.contains(document.activeElement);
    setIndex((i) => (i + (direction === 'left' ? 1 : -1) + progressCases.length) % progressCases.length);
    setDetailId(null);
    if (hadFocus) requestAnimationFrame(() => stackRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus({ preventScroll: true }));
  };
  const card = (item: Task, back = false) => (
    <TaskCard
      back={back} task={item} reminded={reminded.includes(item.id)} detail={detailId === item.id}
      onAction={() => item.action === 'Открыть'
        ? setDetailId((id) => (id === item.id ? null : item.id))
        : setReminded((ids) => (ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id]))}
    />
  );
  return (
    <SectionCard title="Дела в работе" nodeId="3930:213001" subtitle="3 в работе, 2 застряли" className="tasks-stack-section"
      aside={
        <PressButton className="tasks-stack-toggle" aria-label={expanded ? 'Свернуть дела в стопку' : 'Показать все дела'} aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded(!expanded)}>
          <motion.img src="/assets/figma/3930-212959-chevron-down.svg" alt="" width={16} height={16} animate={{ rotate: expanded ? 180 : 0 }} transition={stateSpring} />
        </PressButton>
      }
    >
      <motion.div
        className={morphing ? 'tasks-morph tasks-morph--active' : 'tasks-morph'} id={listId}
        initial={false} animate={{ height }} transition={reduced ? instant : stateSpring}
        onAnimationStart={() => setMorphing(true)} onAnimationComplete={() => setMorphing(false)}
      >
        <div ref={stackRef} className="tasks-morph__inner">
          <AnimatePresence initial={false} mode="popLayout">
            {expanded ? (
              <motion.ul key="list" className="tasks-list tasks-morph__view" aria-label="Все дела в работе" variants={views} initial="hidden" animate="shown" exit="exit">
                {queue.map((item, i) => i === 0
                  ? <li key={item.id}>{card(item)}</li>
                  : <motion.li key={item.id} custom={i} variants={reduced ? undefined : restVariants}>{card(item)}</motion.li>)}
              </motion.ul>
            ) : (
              <motion.div key="stack" className="tasks-morph__view" variants={views} initial="hidden" animate="shown" exit="exit">
                <CardStack width={335} count={progressCases.length} activeKey={task.id} label={`Дело ${index + 1} из ${progressCases.length}: ${task.title}. Листайте свайпом или стрелками.`} allowRight onSwipe={move}
                  swipeHint={{ left: 'Следующее дело', right: 'Предыдущее дело' }}
                  backCards={[1, 2].map((step) => card(progressCases[(index + step) % progressCases.length], true))}
                  reverseBackCards={[1, 2].map((step) => card(progressCases[(index - step + progressCases.length) % progressCases.length], true))}>
                  {card(task)}
                </CardStack>
                <span className="sr-only" aria-live="polite">Дело {index + 1} из {progressCases.length}: {task.title}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </SectionCard>
  );
}

function TaskCard({ task, reminded, detail, onAction, back = false }: CardProps) {
  return (
    <article className="card card--p20 tasks__card fx-glass" data-node-id={back ? undefined : '3930:213010'} data-task-id={back ? undefined : task.id}>
      <div className="tasks__top">
        <div className="tasks__info"><h3 className="title-15">{task.title}</h3><p className="fx-caption">{task.owner}</p></div>
        <PressButton className="tasks__remind" onClick={onAction}>
          {task.action === 'Открыть' ? detail ? 'Свернуть' : 'Открыть' : reminded ? 'Отменить' : task.action}
        </PressButton>
      </div>
      <div className="tasks__progress">
        <div className={`steps${task.stuckDays ? '' : ' steps--neutral'}`} role="img" aria-label={`Этапы: ${task.current + 1} из ${task.stages.length}, текущий — ${task.stages[task.current]}`}>
          <span className="steps__dot steps__dot--done" />
          {task.stages.slice(1).map((stage, i) => <span className="steps__seg" key={stage}><span className={`steps__line ${i < task.current ? 'steps__line--done' : 'steps__line--next'}`} /><span className={`steps__dot steps__dot--${i + 1 === task.current ? 'current' : 'next'}`} /></span>)}
        </div>
        <p className="fx-caption tasks__stage">{task.stages[task.current]}{task.stuckDays > 0 && <> · <strong>ждём {task.stuckDays} дн.</strong></>}</p>
      </div>
      {reminded && <p className="fx-caption" role="status">Напомнили · ответ придёт сюда</p>}
      {detail && <ol className="task-stage-details">{task.stages.map((stage, i) => <li key={stage} className="text-13">{stage} · {i < task.current ? 'Готово' : i === task.current ? 'В работе' : 'Далее'}</li>)}</ol>}
    </article>
  );
}
