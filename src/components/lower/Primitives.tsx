import type { ComponentProps, ReactNode } from 'react';
import SectionCard from '../ui/SectionCard';
import SourceStarGlow from '../ui/StarGlow';
import PressButton from '../ui/PressButton';
import './lower.css';

export const lowerAsset = (name: string) => '/assets/figma/lower/' + name;

/** Обёртка сохраняет геометрию нижних Section из Figma: 12 / 22 / 16 / card / 24. */
export function LowerSection({ title, name, node, ai = false, children }: {
  title: string; name: string; node: string; ai?: boolean; children: ReactNode;
}) {
  return (
    <div id={name} className={'fx-lower fx-lower--' + name + (ai ? ' fx-lower--ai' : '')}>
      <SectionCard title={title} nodeId={node.includes(':') ? node : '3892:' + node} icon={ai ? lowerAsset('ef453.svg') : undefined}>
        {children}
      </SectionCard>
    </div>
  );
}

export function LowerCard({ children, node, gap = 20, round = false, glass = false, aiGlass = false }: {
  children: ReactNode; node: string; gap?: 12 | 16 | 20; round?: boolean; glass?: boolean; aiGlass?: boolean;
}) {
  return <div data-node-id={'3892:' + node} className={'fx-card lower-card lower-gap-' + gap + (round ? ' lower-card--round' : '') + (glass || aiGlass ? ' fx-glass' : ' lower-card--white') + (aiGlass ? ' fx-ai-glass' : '')}>{children}</div>;
}

export function Money({ children, semibold = false }: { children: ReactNode; semibold?: boolean }) {
  return <p className={'fx-amount' + (semibold ? ' lower-money--semibold' : '')}><span className="fx-amount__value">{children}</span><span className="fx-amount__currency">₽</span></p>;
}

/** Оригинальный растровый Star, с исходными размерами, поворотом и clipping. */
export function StarGlow({ small = false, rate = false, node }: { small?: boolean; rate?: boolean; node: string }) {
  return <div aria-hidden="true" data-node-id={'3892:' + node} className="lower-glow-anchor">
    <SourceStarGlow src={lowerAsset(small ? 'e4f8c.png' : '23d27.png')}
      box={small ? { right: rate ? 74.99 : 77.99, top: rate ? -323.05 : -325.05, width: 677.468, height: 629.111 } : { right: 64.08, top: -347.69, width: 700.103, height: 650.13 }}
      layer={small ? { width: 525.091, height: 586.576 } : { width: 542.635, height: 606.174 }}
      inset={small ? '-12.79% -14.28%' : '-12.37% -13.82%'}
      imgWidth={small ? 675.091 : 692.635} imgHeight={small ? 736.576 : 756.174} />
  </div>;
}

export function AiExplanation({ children, node, glowNode, rate = false }: { children: ReactNode; node: string; glowNode: string; rate?: boolean }) {
  return <div className="lower-explanation fx-glass fx-ai-glass" data-node-id={'3892:' + node}>
    <p className="lower-explanation__text">{children}</p>
    <div className="lower-confidence"><span aria-hidden="true" className="lower-confidence__bars"><i /><i /><i /></span><span>Уверенность высокая</span></div>
    <StarGlow small rate={rate} node={glowNode} />
  </div>;
}

/** Действия включаются только при наличии подтверждённого локального сценария. */
export function SourceAction({ children, primary = false, small = false, disabled, ...rest }: ComponentProps<typeof PressButton> & { primary?: boolean; small?: boolean }) {
  return <PressButton {...rest} disabled={disabled ?? !rest.onClick} className={'fx-btn lower-action ' + (primary ? 'fx-btn--primary' : 'fx-btn--secondary') + (small ? ' lower-action--small' : '')}>{children}</PressButton>;
}

export function SourceTabs({ items, selected, onSelect, label = 'Период или вид показателей' }: { items: readonly { label: string; count?: string }[]; selected: number; onSelect?: (index: number) => void; label?: string }) {
  return <div className="lower-tabs" role="group" aria-label={label}>
    {items.map((item, i) => <button type="button" key={item.label} disabled={!onSelect && i !== selected} onClick={() => onSelect?.(i)} aria-pressed={i === selected} className={i === selected ? 'lower-tabs__item lower-tabs__item--active' : 'lower-tabs__item'}>{item.label}{item.count && <span>{item.count}</span>}</button>)}
  </div>;
}

export function Chevron({ down = true }: { down?: boolean }) {
  return <img className="lower-chevron" src={lowerAsset(down ? '8740b.svg' : '9353a.svg')} width={16} height={16} alt="" />;
}
