import { motion } from 'motion/react';
import { PRESS_SCALE, pressTransition } from '../motion/tokens';
import './top.css';

const A = '/assets/figma';

/** Figma 3930:212862 — аватар компании, выбор организации, уведомления */
export default function Header() {
  return (
    <div className="header" data-node-id="3930:212862">
      <div className="header__row">
        <div className="avatar" data-node-id="3930:212864">
          <div className="avatar__inner">
            <img className="avatar__bg" src={`${A}/3892-211580-avatar-bg.png`} alt="" />
            <img className="avatar__photo" src={`${A}/3892-211581-image-421.png`} alt="" />
            <div className="avatar__ring">
              <img src={`${A}/3892-211583-image-1926988435.png`} alt="Центрсвет" width={77} height={77} />
            </div>
          </div>
        </div>
        <motion.button
          type="button"
          className="org-pill fx-glass"
          data-node-id="3930:212877"
          whileTap={{ scale: PRESS_SCALE }}
          transition={pressTransition}
        >
          <span className="org-pill__name">Центрсвет Бутово</span>
          <span className="org-pill__role">Финансовый эксперт</span>
        </motion.button>
        <motion.button
          type="button"
          className="round-btn fx-glass"
          aria-label="Уведомления"
          data-node-id="3930:212880"
          whileTap={{ scale: PRESS_SCALE }}
          transition={pressTransition}
        >
          <img src={`${A}/3892-211594-bell.svg`} alt="" width={18} height={18} />
        </motion.button>
      </div>
    </div>
  );
}
