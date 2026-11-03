import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useEnter } from '../../motion/useEnter';
import { revealVariants } from '../../motion/tokens';
import './ui.css';

type SectionCardProps = {
  title: string;
  /** Иконка слева от заголовка (Figma «Icon 28», 20×20) — путь к локальному ассету или узел */
  icon?: string | ReactNode;
  /** Подпись справа от заголовка (13/18, muted), например «3 в работе, 2 застряли» */
  subtitle?: string;
  /** Правый слот заголовка: счётчик, ссылка и т. п. */
  aside?: ReactNode;
  nodeId?: string;
  /** Доп. класс: у части секций в Figma другие отступы (pt 11–12, pb 24) */
  className?: string;
  /** Класс заголовка (например градиентный текст «Альфа-Интеллект») */
  titleClassName?: string;
  children: ReactNode;
};

/**
 * Figma «Section»: Header (px 20, min-h 24) + контент с боковым отступом 8 px.
 * Появляется, когда заметно въехала в экран; при prefers-reduced-motion — сразу.
 */
export default function SectionCard({ title, icon, subtitle, aside, nodeId, className, titleClassName, children }: SectionCardProps) {
  const reveal = { variants: revealVariants, ...useEnter() };

  return (
    <motion.section className={className ? `fx-section ${className}` : 'fx-section'} data-node-id={nodeId} {...reveal}>
      <header className="fx-section__header">
        <div className="fx-section__title-wrap">
          {typeof icon === 'string' ? (
            <span className="fx-section__icon">
              <img src={icon} alt="" width={20} height={20} />
            </span>
          ) : (
            icon
          )}
          <h2 className={titleClassName ? `fx-section__title ${titleClassName}` : 'fx-section__title'}>{title}</h2>
          {subtitle && <span className="fx-caption fx-section__subtitle">{subtitle}</span>}
        </div>
        {aside}
      </header>
      <div className="fx-section__body">{children}</div>
    </motion.section>
  );
}
