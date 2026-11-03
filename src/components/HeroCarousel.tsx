import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { chartSegmentReveal, chartStagger, EASE_OUT, PRESS_SCALE, pressTransition } from '../motion/tokens';
import { useChartEnter } from '../motion/useChartEnter';
import './ui/ui.css';
import './top.css';
import './hero-carousel.css';

const A = '/assets/figma';
const colors = [
  { color: 'var(--fx-text-primary)', halo: 'rgba(24, 24, 27, 0.1)' },
  { color: 'var(--fx-chart-outflow)', halo: 'rgba(159, 159, 169, 0.1)' },
  { color: 'var(--fx-chart-muted)', halo: 'rgba(212, 212, 216, 0.1)' },
  { color: 'var(--fx-chart-faint)', halo: 'rgba(236, 236, 236, 0.1)' },
];

// Содержимое и геометрия сегментов: Figma 3930:212883, 4125:94531, 4125:94594.
const slides = [
  { label: 'Юрлица', widths: [221.891, 69.109, 22, 15], rows: [
    ['АО «УК Холдинг»', '4,10 млрд ₽'], ['ООО «Порт»', '3,06 млрд ₽'],
    ['ООО «Девелопмент»', '2,30 млрд ₽'], ['ООО «Агро»', '1,52 млрд ₽'],
  ] },
  { label: 'Банки', widths: [165, 84, 56, 23], rows: [
    ['Альфа-Банк', '4,62 млрд ₽'], ['ВТБ', '3,86 млрд ₽'],
    ['Сбербанк', '2,20 млрд ₽'], ['Еще 3 банка', '1,52 млрд ₽'],
  ] },
  { label: 'Валюты', widths: [246, 46, 22, 14], rows: [
    ['RUB', '8,84 млрд ₽'], ['CNY', '2,36 млрд ₽'],
    ['USD', '1,04 млрд ₽'], ['EUR', '600 млн ₽'],
  ] },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduced = useReducedMotion();
  const chartEnter = useChartEnter();
  const select = (next: number) => {
    if (next < 0 || next >= slides.length || next === index) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };
  const slide = slides[index];

  return (
    <>
      <div className="hero" data-node-id="3930:212883" role="region" aria-label="Деньги группы" aria-roledescription="карусель"
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); select(index + 1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); select(index - 1); }
        }}>
        <motion.div className="hero__card fx-solid" data-node-id="3930:212884"
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} dragMomentum={false}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 60 || (Math.abs(info.offset.x) > 24 && Math.abs(info.velocity.x) > 500)) {
              select(index + (info.offset.x < 0 ? 1 : -1));
            }
          }}>
          <div className="hero__summary">
            <div className="hero__head">
              <div className="hero__meta">
                <p className="fx-caption">Деньги группы</p>
                <div className="hero__delta"><span className="hero__delta-value"><img src={`${A}/3892-211604-arrow-up.svg`} alt="" width={8} height={8} />0,6 млрд</span><span className="fx-caption">к вчера</span></div>
              </div>
              <p className="fx-amount"><span className="fx-amount__value">12,84 млрд</span><span className="fx-amount__currency">₽</span></p>
            </div>
            <motion.div className="hero__bar" variants={chartStagger} {...chartEnter} aria-label={`Распределение: ${slide.label}`}>
              {slide.widths.map((width, i) => (
                <motion.div key={i} className={`hero__bar-seg${i === 0 ? ' hero__bar-seg--main' : ''}`}
                  layout={!reduced} transition={{ layout: { duration: 0.32, ease: EASE_OUT } }}
                  style={{ flex: `${width} 1 0`, background: i ? colors[i].color : undefined }} variants={chartSegmentReveal} />
              ))}
            </motion.div>
          </div>
          <div className="hero-carousel__list-wrap">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.ul key={slide.label} className="hero__list"
                initial={{ opacity: 0, x: reduced ? 0 : direction * 12 }}
                animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : direction * -12 }}
                transition={{ duration: reduced ? 0 : 0.28, ease: EASE_OUT }}>
                {slide.rows.map(([name, amount], i) => (
                  <li key={name}>
                    <motion.button type="button" className="mf-bank-row fx-glass" whileTap={{ scale: PRESS_SCALE }} transition={pressTransition} aria-label={`Приблизить: ${name}, ${amount}`}>
                      <span className="mf-bank-row__dot" style={{ background: colors[i].color, boxShadow: `0 0 0 2.5px ${colors[i].halo}` }} />
                      <span className="mf-bank-row__name">{name}</span><span className="mf-bank-row__amount">{amount}</span>
                      <img src={`${A}/3892-211625-arrow-up-right.svg`} alt="" width={16} height={16} />
                    </motion.button>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </motion.div>
        <span className="sr-only" aria-live="polite">{slide.label}, {index + 1} из {slides.length}</span>
      </div>
      <div className="mf-pager hero-carousel__pager" aria-label="Разрез денег группы">
        {slides.map((item, i) => <button key={item.label} type="button" className="hero-carousel__page" aria-label={item.label} aria-current={index === i ? 'true' : undefined} onClick={() => select(i)}><span className={`mf-pager__dot${index === i ? ' mf-pager__dot--active' : ''}`} /></button>)}
      </div>
    </>
  );
}
