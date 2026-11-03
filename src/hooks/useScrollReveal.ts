import { useEffect, useState, type RefObject } from 'react';

/**
 * Сколько страница должна простоять без прокрутки, чтобы скрытое вернулось.
 * Короткие паузы и замедление инерции не в счёт — только настоящая остановка.
 */
const IDLE_MS = 1700;
/** Прокрутка вверх возвращает сразу, но только осознанная — от этого пути, а не дрожание пальца */
const UP_REVEAL_PX = 32;

/**
 * true — пока пользователь прокручивает вниз дальше `threshold`.
 * Прокрутка вверх на UP_REVEAL_PX или покой IDLE_MS — false.
 * Прокручивается окно (мобильный) или .app внутри корпуса телефона (десктоп), слушаем оба.
 */
export function useScrollReveal(ref: RefObject<HTMLElement | null>, threshold: number): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const scroller = ref.current?.closest<HTMLElement>('.app') ?? null;
    const readY = () => Math.max(window.scrollY, scroller?.scrollTop ?? 0);
    let lastY = readY();
    /** Начало текущего отрезка прокрутки вверх */
    let upFrom = lastY;
    let frame = 0;
    let idle = 0;

    const update = () => {
      frame = 0;
      const y = readY();
      if (y > lastY) {
        upFrom = y;
        setHidden(y > threshold);
      } else if (y < lastY && (upFrom - y >= UP_REVEAL_PX || y <= threshold)) {
        setHidden(false);
      }
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
      window.clearTimeout(idle);
      idle = window.setTimeout(() => setHidden(false), IDLE_MS);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    scroller?.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      scroller?.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      window.clearTimeout(idle);
    };
  }, [ref, threshold]);

  return hidden;
}
