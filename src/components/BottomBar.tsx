import type { CSSProperties } from 'react';
import { lowerAsset } from './lower/Primitives';

const masks = [
  ['4f59c.svg', 0.32, '212586'], ['ab825.svg', 1.28, '212589'], ['9b68a.svg', 2.88, '212592'],
  ['90852.svg', 5.12, '212595'], ['60af6.svg', 8, '212598'], ['14a58.svg', 11.52, '212601'],
  ['22f8b.svg', 15.68, '212604'], ['5a765.svg', 20.48, '212607'], ['445a7.svg', 25.92, '212610'],
  ['248a1.svg', 32, '212613'],
] as const;
const destinations = [
  { label: 'В начало', asset: '1ac9a.svg', available: true, size: 28 },
  { label: 'Финансы', asset: 'e40a6.svg', available: false, size: 28 },
  { label: 'История', asset: '0be51.svg', available: false, size: 28 },
  { label: 'Все сервисы', asset: '67566.svg', available: false, size: 32 },
];

export default function BottomBar() {
  return <nav className="lower-bottom-bar" aria-label="Навигация по дашборду" data-node-id="3930:214017">
    <div className="lower-bottom-bar__glass" aria-hidden="true">{masks.map(([asset, blur, node]) => <div key={node} className="lower-bottom-bar__blur" data-node-id={'3892:' + node} style={{ '--blur-amount': blur + 'px', '--blur-mask': 'url("' + lowerAsset(asset) + '")' } as CSSProperties} />)}</div>
    {/* Другие экраны не входят в подтверждённый макет, случайные якоря не подставляем. */}
    <div className="lower-bottom-bar__tabs" data-node-id="3892:212614">{destinations.map(item => <button type="button" key={item.asset} aria-label={item.label} disabled={!item.available} onClick={() => {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
      // В корпусе телефона (десктоп) прокручивается .app, на мобильном — окно
      document.querySelector('.app')?.scrollTo({ top: 0, behavior });
      window.scrollTo({ top: 0, behavior });
    }}><img src={lowerAsset(item.asset)} width={item.size} height={item.size} alt="" /></button>)}</div>
    <div className="lower-bottom-bar__home" aria-hidden="true"><span /></div>
  </nav>;
}
