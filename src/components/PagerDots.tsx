import './top.css';

/** Figma 3930:212945 — индикатор страниц hero-карусели (активна первая) */
export default function PagerDots() {
  return (
    <div className="mf-pager" data-node-id="3930:212945" role="presentation">
      <span className="mf-pager__dot mf-pager__dot--active" />
      <span className="mf-pager__dot" />
      <span className="mf-pager__dot" />
      <span className="mf-pager__dot" />
    </div>
  );
}
