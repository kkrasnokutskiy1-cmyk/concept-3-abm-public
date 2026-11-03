import { useReducedMotion, type TargetAndTransition, type VariantLabels } from 'motion/react';
import { REVEAL_AMOUNT, REVEAL_MARGIN } from './tokens';

type State = VariantLabels | TargetAndTransition;

/**
 * Пропсы «появиться, когда блок заметно въехал в экран» (а не в момент загрузки).
 * При prefers-reduced-motion элемент сразу рендерится в конечном состоянии —
 * без этого блоки ниже первого экрана остаются скрытыми, пока их не прокрутят.
 */
export function useEnter(hidden: State = 'hidden', shown: State = 'shown', amount = REVEAL_AMOUNT) {
  const reduce = useReducedMotion();
  return reduce
    ? ({ initial: false, animate: shown } as const)
    : ({ initial: hidden, whileInView: shown, viewport: { once: true, amount, margin: REVEAL_MARGIN } } as const);
}
