import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { SWIPE, SWIPE_TRANSITION } from '../../motion/swipe';
import '../sections.css';
import '../stack.css';

type Direction = 'left' | 'right';
type Props = {
  width: number;
  count: number;
  activeKey: string;
  label: string;
  children: ReactNode;
  onSwipe: (direction: Direction) => void;
  allowRight?: boolean;
  /** Следующие карточки очереди (до двух): их нижние края и есть «полосы» стопки. */
  backCards?: ReactNode[];
  /** Карточки, которые придут при свайпе вправо (если отличаются от backCards). */
  reverseBackCards?: ReactNode[];
  /** Видимый результат жеста: откладывание и листание имеют разную семантику. */
  swipeHint?: { left: string; right?: string };
};

/** Видимые края задних карточек ниже передней (Figma: 16 = 9 + 7). */
const EDGE_1 = 9;
const EDGE_2 = 16;
const BACK_2_WIDTH = 304;
const FIGMA_CARD_WIDTH = 377;
/** Запас обрезки по бокам и снизу, чтобы не срезать тень стекла. */
const SHADOW = 24;
/** --fx-radius-card */
const CARD_RADIUS = 20;
const lerp = (from: number, to: number, p: number) => from + (to - from) * p;
// Задние карточки начинают подниматься сразу и мягко замедляются к концу жеста.
const stackProgress = (dx: number, width: number) => {
  const p = width ? Math.min(1, Math.abs(dx) / width) : 0;
  return 1 - (1 - p) ** 2;
};

/**
 * Задние слои — настоящие следующие карточки, уменьшенные и обрезанные до
 * видимого края. Пока передняя уезжает, следующая поднимается на её место,
 * поэтому края никогда не остаются «висеть» отдельно от карточки.
 */
export default function CardStack(props: Props) {
  // Новая передняя карточка — новый жест и задние слои в исходном положении.
  return <StackLayers key={props.activeKey} {...props} />;
}

function StackLayers({ width, count, label, children, onSwipe, allowRight = false, backCards = [], reverseBackCards, swipeHint }: Props) {
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const frontRef = useRef<HTMLDivElement>(null);
  const backRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frontH = useMotionValue(0);
  const frontW = useMotionValue(0);
  const back1H = useMotionValue(0);
  const back2H = useMotionValue(0);
  const [direction, setDirection] = useState<Direction>('left');
  const depth = Math.min(2, count - 1, backCards.length);
  const cards = (direction === 'right' && reverseBackCards ? reverseBackCards : backCards).slice(0, depth);
  const pad = depth === 0 ? 0 : depth === 1 ? EDGE_1 : EDGE_2;
  const s1 = width / FIGMA_CARD_WIDTH;
  const s2 = BACK_2_WIDTH / FIGMA_CARD_WIDTH;
  const travel = useTransform(x, (value) => allowRight ? value : Math.min(0, value));
  const progress = useTransform([travel, frontW], ([dx, w]: number[]) => w ? Math.min(1, Math.abs(dx) / w) : 0);
  const frontOpacity = useTransform(progress, (p) => reduced ? 1 : 1 - SWIPE.fade * p);
  const frontFilter = useTransform(progress, (p) => !p || reduced ? 'none' : `blur(${SWIPE.blur * p}px)`);
  const nextFilter = useTransform(progress, (p) => !p || reduced || p >= 0.8 ? 'none' : `blur(${SWIPE.blur * Math.min(1, p / 0.08) * (1 - p / 0.8)}px)`);
  const hintOpacity = useTransform(progress, [0, 0.08, 0.24, 0.7, 1], [0, 0, 1, 1, 0]);
  const hint = swipeHint?.[direction];

  useLayoutEffect(() => {
    const measure = () => {
      if (frontRef.current) { frontH.set(frontRef.current.offsetHeight); frontW.set(frontRef.current.offsetWidth); }
      back1H.set(backRefs.current[0]?.offsetHeight ?? 0);
      back2H.set(backRefs.current[1]?.offsetHeight ?? 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    [frontRef.current, ...backRefs.current].forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [depth, direction, frontH, frontW, back1H, back2H]);

  useEffect(() => x.on('change', (value) => {
    if (value !== 0) setDirection(value > 0 ? 'right' : 'left');
  }), [x]);

  // Прогресс ухода передней карточки: 0 — покой, 1 — следующая встала на её место.
  // Нижний край задних слоёв привязан к низу контейнера (frontH + pad), масштаб — от низа.
  const layer1 = useLayer([travel, frontW, frontH, back1H], ([dx, w, h, own]) => {
    const p = stackProgress(dx, w);
    const scale = lerp(s1, 1, p);
    const bottom = lerp(h + EDGE_1, own, p);
    // Слой виден только там, где его не закрывает передняя: ниже неё и сбоку
    // от уехавшего края. Сквозь полупрозрачное стекло ничего не просвечивает.
    const below = own - (bottom - h) / scale;
    if (!dx) return { scale, y: bottom - h - pad, clip: `inset(${below}px ${-SHADOW}px ${-SHADOW}px)` };
    const edge = w / 2 + ((dx < 0 ? w + dx : dx) - w / 2) / scale;
    const top = -SHADOW, right = w + SHADOW, end = own + SHADOW;
    // Угол выреза повторяет скругление нижнего угла передней карточки.
    const r = CARD_RADIUS / scale;
    const arc = Array.from({ length: 7 }, (_, i) => {
      const t = (Math.PI / 2) * (i / 6);
      return dx < 0
        ? [edge - r + r * Math.sin(t), below - r + r * Math.cos(t)]
        : [edge + r - r * Math.cos(t), below - r + r * Math.sin(t)];
    });
    const points = dx < 0
      ? [[edge, top], [right, top], [right, end], [-SHADOW, end], [-SHADOW, below], ...arc]
      : [[-SHADOW, top], [edge, top], ...arc, [right, below], [right, end], [-SHADOW, end]];
    return { scale, y: bottom - h - pad, clip: `polygon(${points.map(([px, py]) => `${px}px ${py}px`).join(', ')})` };
  });
  const layer2 = useLayer([travel, frontW, frontH, back1H, back2H], ([dx, w, h, h1, own]) => {
    const p = stackProgress(dx, w);
    const scale = lerp(s2, s1, p);
    const bottom = lerp(h + EDGE_2, h1 + EDGE_1, p);
    // Видна только часть ниже края первой задней карточки.
    const above = lerp(h + EDGE_1, h1, p);
    return { scale, y: bottom - h - pad, clip: `inset(${Math.max(0, own - (bottom - above) / scale)}px ${-SHADOW}px ${-SHADOW}px)` };
  });

  return (
    <div className="fx-card-stack" data-count={depth + 1}>
      <SwipeCard x={x} opacity={frontOpacity} filter={frontFilter} frontRef={frontRef} label={label} onSwipe={onSwipe} allowRight={allowRight}>{children}</SwipeCard>
      {cards.map((card, i) => {
        const layer = i === 0 ? layer1 : layer2;
        return (
          <motion.div
            key={i} ref={(node) => { backRefs.current[i] = node; }}
            className={`fx-card-stack__back fx-card-stack__back--${i + 1}`} aria-hidden="true" inert
            style={{ y: layer.y, scale: layer.scale, clipPath: layer.clip, filter: i === 0 ? nextFilter : undefined, zIndex: 1 - i }}
          >{card}</motion.div>
        );
      })}
      {hint && <motion.div className={`fx-card-stack__hint fx-card-stack__hint--${direction} fx-glass fx-caption`} style={{ opacity: hintOpacity }} aria-hidden="true">
        <span aria-hidden="true">{direction === 'left' ? '←' : '→'}</span>{hint}
      </motion.div>}
    </div>
  );
}

type LayerState = { scale: number; y: number; clip: string };
function useLayer(inputs: MotionValue<number>[], compute: (values: number[]) => LayerState) {
  const state = useTransform(inputs, (values: number[]) => compute(values));
  return {
    scale: useTransform(state, (s) => s.scale),
    y: useTransform(state, (s) => s.y),
    clip: useTransform(state, (s) => s.clip),
  };
}

type SwipeProps = Pick<Props, 'label' | 'children' | 'onSwipe' | 'allowRight'> & {
  x: MotionValue<number>;
  opacity: MotionValue<number>;
  filter: MotionValue<string>;
  frontRef: RefObject<HTMLDivElement | null>;
};

type Gesture = {
  id: number; x: number; y: number; origin: number; locked: boolean;
  samples: { x: number; time: number }[];
};

function SwipeCard({ x, opacity, filter, frontRef, label, children, onSwipe, allowRight }: SwipeProps) {
  const reduced = useReducedMotion();
  const busy = useRef(false);
  const suppressClick = useRef(false);
  const gesture = useRef<Gesture | null>(null);
  const [moving, setMoving] = useState(false);
  useEffect(() => () => x.stop(), [x]);
  const settle = () => {
    animate(x, 0, { ...(reduced ? { duration: 0 } : SWIPE_TRANSITION), onComplete: () => setMoving(false) });
  };
  const leave = (direction: Direction, width: number, keyboard = false) => {
    if (busy.current || (direction === 'right' && !allowRight)) return;
    busy.current = true;
    if (reduced || keyboard) { onSwipe(direction); return; }
    const target = (direction === 'left' ? -1 : 1) * (width + 24);
    // Дальний жест завершается быстрее: не растягиваем короткий остаток на 150 мс.
    const remaining = Math.min(1, Math.abs(target - x.get()) / (width + 24));
    animate(x, target, {
      ...SWIPE_TRANSITION, duration: Math.max(0.05, SWIPE_TRANSITION.duration * remaining), onComplete: () => onSwipe(direction),
    });
  };
  const releaseCapture = (node: HTMLDivElement, id: number) => {
    if (node.hasPointerCapture(id)) node.releasePointerCapture(id);
  };
  const cancel = () => {
    const current = gesture.current;
    gesture.current = null;
    // После отменённого drag не пропускаем синтетический click в кнопку.
    if (current?.locked) suppressClick.current = true;
    if (current && frontRef.current) releaseCapture(frontRef.current, current.id);
    settle();
  };
  const sample = (current: Gesture, event: PointerEvent<HTMLDivElement>) => {
    current.samples = current.samples.filter((point) => event.timeStamp - point.time <= SWIPE.sampleWindow);
    current.samples.push({ x: event.clientX, time: event.timeStamp });
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || busy.current || gesture.current) return;
    suppressClick.current = false;
    if ((event.target as HTMLElement).closest('button, a, input, select, textarea')) return;
    x.stop();
    // Повторный захват продолжается с текущей позиции, даже посреди возврата.
    const position = x.get();
    const origin = !allowRight && position > 0
      ? position / (SWIPE.resistance * Math.max(0.01, 1 - position / SWIPE.resistanceLimit))
      : position;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, origin, locked: false, samples: [{ x: event.clientX, time: event.timeStamp }] };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.locked) {
      if (Math.abs(dy) > SWIPE.lockDistance && Math.abs(dy) > Math.abs(dx)) { cancel(); return; }
      if (Math.abs(dx) < SWIPE.lockDistance || Math.abs(dx) < Math.abs(dy) * SWIPE.axisRatio) return;
      start.locked = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      suppressClick.current = true;
      setMoving(true);
    }
    sample(start, event);
    const offset = start.origin + dx;
    // Запрещённое направление отвечает сопротивлением, не раскрывая следующую карточку.
    x.set(!allowRight && offset > 0
      ? SWIPE.resistanceLimit * (1 - 1 / (1 + offset * SWIPE.resistance / SWIPE.resistanceLimit))
      : offset);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    gesture.current = null;
    releaseCapture(event.currentTarget, event.pointerId);
    sample(start, event);
    const dx = start.origin + event.clientX - start.x;
    const first = start.samples[0];
    const velocity = (event.clientX - first.x) / Math.max(1, event.timeStamp - first.time);
    const reversing = Math.abs(velocity) > SWIPE.velocity && velocity * dx < 0;
    const flick = Math.abs(dx) >= SWIPE.minFlickDistance && Math.abs(velocity) > SWIPE.velocity;
    const far = Math.abs(dx) >= event.currentTarget.clientWidth * SWIPE.distanceRatio;
    if (start.locked && !reversing && (far || flick) && (dx < 0 || allowRight)) {
      leave(dx < 0 ? 'left' : 'right', event.currentTarget.clientWidth);
    } else settle();
  };
  return (
    <motion.div
      ref={frontRef}
      className="fx-card-stack__front" data-moving={moving || undefined} style={{ x, opacity, filter }} role="group" aria-roledescription="стопка карточек" aria-label={label} tabIndex={0}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      onPointerCancel={(event) => { if (gesture.current?.id === event.pointerId) cancel(); }}
      onLostPointerCapture={(event) => {
        // При передаче неявного touch-capture от текста к обёртке всплывает
        // lostpointercapture дочернего узла — это не отмена текущего жеста.
        if (event.target === event.currentTarget && gesture.current?.id === event.pointerId) cancel();
      }}
      onClickCapture={(event) => { if (suppressClick.current || busy.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}
      onKeyDown={(event) => {
        suppressClick.current = false;
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Escape' && gesture.current) { event.preventDefault(); cancel(); return; }
        if (event.key === 'ArrowLeft' || (allowRight && event.key === 'ArrowRight')) {
          event.preventDefault();
          leave(event.key === 'ArrowLeft' ? 'left' : 'right', event.currentTarget.clientWidth, true);
        }
      }}
    >{children}</motion.div>
  );
}
