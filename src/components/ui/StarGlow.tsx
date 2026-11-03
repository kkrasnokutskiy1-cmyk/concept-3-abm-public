import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './ui.css';

type StarGlowProps = {
  src: string;
  /** Внешний бокс (Figma: absolute, right/top, w×h) */
  box: { right: number; top: number; width: number; height: number };
  /** Повёрнутый слой (w×h до поворота на −78.79°) */
  layer: { width: number; height: number };
  /** Отступы картинки внутри слоя: inset в процентах (y, x) */
  inset: string;
  imgWidth: number;
  imgHeight: number;
};

/** Исходный слой «Star»; композиция и медленный перелив описаны в ui.css. */
export default function StarGlow({ src, box, layer, inset, imgWidth, imgHeight }: StarGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  // Фаза перелива — от геометрии: соседние Star переливаются не синхронно
  const phase = `${-(Math.abs(box.top + box.right) % 6).toFixed(2)}s`;
  const boxStyle = { right: box.right, top: box.top, width: box.width, height: box.height, '--fx-star-phase': phase } as CSSProperties;

  useEffect(() => {
    // Бокс звезды гораздо больше карточки: наблюдаем видимую поверхность.
    const surface = ref.current?.closest('.fx-ai-glass, .fx-card, .topbar') ?? ref.current?.parentElement;
    if (!surface) return;
    let visible = false;
    const sync = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(surface);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <div ref={ref} className="fx-star" style={boxStyle} data-animate={active} aria-hidden>
      <div className="fx-star__rotate">
        <div className="fx-star__layer" style={{ width: layer.width, height: layer.height }}>
          <img src={src} alt="" width={imgWidth} height={imgHeight} style={{ inset }} decoding="async" />
        </div>
      </div>
    </div>
  );
}
