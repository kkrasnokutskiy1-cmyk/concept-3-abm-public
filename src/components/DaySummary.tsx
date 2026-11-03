import SectionCard from './ui/SectionCard';
import AiMark from './ui/AiMark';
import StarGlow from './ui/StarGlow';
import PressButton from './ui/PressButton';
import './sections.css';

const A = '/assets/figma';

/** Figma 3930:212984 — «Сводка дня» от Альфа-Интеллекта */
export default function DaySummary() {
  return (
    <SectionCard title="Сводка дня" nodeId="3930:212984" className="fx-section--end">
      <div className="card card--p20 summary fx-glass fx-ai-glass" data-node-id="3930:212988">
        <div className="summary__top">
          <div className="fx-ai-label">
            <AiMark shadow={{ src: `${A}/3892-211704-ai-shadow.svg`, inset: '-113.64%' }} />
            <span className="fx-ai-label__text fx-ai-text">Альфа-Интеллект</span>
          </div>
          <div className="summary__text">
            <p className="summary__lead">
              Денег хватает: остаток группы <span className="summary__link">12,84 млрд ₽</span>, ночью крупный покупатель
              заплатил раньше графика. Ещё <span className="summary__link">3 платежа</span> ждут подписи, один — по новым
              реквизитам
            </p>
            <p className="caption-12 summary__source">
              <span>выписки 7 из 9 банков, 1С холдинга, ЭДО. </span>
              <span className="summary__link">Как посчитано</span>
            </p>
          </div>
        </div>
        <PressButton className="ask" data-node-id="3930:212997">
          <span className="ask__text">Что подписать первым?</span>
          <img src={`${A}/3892-211712-sound-wave-line.svg`} alt="Голосовой режим" width={20} height={20} />
        </PressButton>
        <StarGlow
          src={`${A}/3892-211713-star-24.png`}
          box={{ right: 64.08, top: -317.66, width: 700.103, height: 650.13 }}
          layer={{ width: 542.635, height: 606.174 }}
          inset="-12.37% -13.82%"
          imgWidth={692.635}
          imgHeight={756.174}
        />
      </div>
    </SectionCard>
  );
}
