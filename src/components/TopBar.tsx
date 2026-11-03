import { useRef } from 'react';
import AiMark from './ui/AiMark';
import StarGlow from './ui/StarGlow';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './top.css';

const A = '/assets/figma';

/** Сколько шапка уезжает вверх, пряча «Альфа-Интеллект»: строка 20 + padding-bottom 16 (= --topbar-collapse) */
const COLLAPSE = 36;

/**
 * Figma 3930:212854 — статус-бар iPhone + подпись «Альфа-Интеллект» на стеклянной подложке.
 * Время закреплено всегда; подпись прячется при прокрутке вниз и возвращается после 3 с покоя или при заметной прокрутке вверх.
 */
export default function TopBar() {
  const ref = useRef<HTMLDivElement>(null);
  const compact = useScrollReveal(ref, COLLAPSE);
  return (
    <div ref={ref} className={compact ? 'topbar topbar--compact fx-glass' : 'topbar fx-glass'} data-node-id="3930:212854">
      <div className="topbar__surface">
        <div className="statusbar" data-node-id="3930:212855">
          <div className="statusbar__time">
            <span>9:41</span>
          </div>
          <div className="statusbar__levels">
            <img src={`${A}/3892-211567-cellular.svg`} alt="" width={19.2} height={12.226} />
            <img src={`${A}/3892-211567-wifi.svg`} alt="" width={17.142} height={12.328} />
            <img src={`${A}/3892-211567-battery.svg`} alt="" width={27.328} height={13} />
          </div>
        </div>
        <div className="topbar__ai fx-ai-label" data-node-id="3930:212856" aria-hidden={compact || undefined}>
          <AiMark />
          <span className="fx-ai-label__text fx-ai-text">Альфа-Интеллект</span>
        </div>
        <StarGlow
          src={`${A}/3892-211572-star-23.png`}
          box={{ right: 0, top: -299.6, width: 778, height: 633.48 }}
          layer={{ width: 508.585, height: 692.334 }}
          inset="-10.83% -14.75%"
          imgWidth={658.585}
          imgHeight={842.334}
        />
      </div>
    </div>
  );
}
