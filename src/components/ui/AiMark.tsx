import './ui.css';

const ICON = '/assets/figma/3892-211569-neural-assistant.svg';

type AiMarkProps = {
  /** «🔩 Shadow» под иконкой: ассет и его inset относительно бокса 31.43 px */
  shadow?: { src: string; inset: string };
};

/** Figma «Icon 28» → neural-assistant-sign-circle_m_color (20×20) */
export default function AiMark({ shadow }: AiMarkProps) {
  return (
    <span className="fx-ai-mark">
      {shadow && (
        <span className="fx-ai-mark__shadow" aria-hidden>
          <img src={shadow.src} alt="" style={{ inset: shadow.inset }} />
        </span>
      )}
      <img className="fx-ai-mark__icon" src={ICON} alt="" width={20} height={20} />
    </span>
  );
}
