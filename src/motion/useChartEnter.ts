import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { CHART_AMOUNT, CHART_DWELL_MS, CHART_MARGIN } from './tokens';

/** Наблюдаем контейнер, а не растущий столбик с начальным scale(0).
 * Быстрый пролист отменяет таймер; шапка и нижняя навигация не считаются
 * зоной чтения. На десктопе учитываем прокрутку внутри рамки телефона.
 */
export function useChartEnter() {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!node || reduce || entered) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    const cancel = () => {
      clearTimeout(timer);
      timer = undefined;
    };
    const sync = () => {
      cancel();
      if (visible && !document.hidden) {
        timer = setTimeout(() => setEntered(true), CHART_DWELL_MS);
      }
    };
    const app = node.closest('.app');
    const root = app && /auto|scroll/.test(getComputedStyle(app).overflowY) ? app : null;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= CHART_AMOUNT;
      sync();
    }, { root, rootMargin: CHART_MARGIN, threshold: CHART_AMOUNT });

    observer.observe(node);
    document.addEventListener('visibilitychange', sync);
    return () => {
      cancel();
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [node, entered, reduce]);

  return {
    ref: setNode,
    inherit: false,
    initial: reduce || entered ? false : 'hidden',
    animate: reduce || entered ? 'shown' : 'hidden',
  } as const;
}
