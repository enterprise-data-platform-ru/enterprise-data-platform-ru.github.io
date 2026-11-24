import React from 'react';
const paths = {
  stream: <><path d="M3 6h5l4 6h9M3 12h5l4-6h9M3 18h5l4-6"/><path d="m18 3 3 3-3 3m0 0 3 3-3 3"/></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
  compute: <><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/><rect x="9" y="9" width="6" height="6" rx="1"/></>,
  chart: <><path d="M3 3v18h18M7 17v-5m5 5V7m5 10v-8"/><path d="m7 8 5-4 5 2"/></>,
  shield: <><path d="m12 2 8 4v6c0 4-3 8-8 10-5-2-8-6-8-10V6l8-4Z"/><path d="m8 12 3 3 5-6"/></>,
  nodes: <><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/></>,
  arrow: <><path d="M4 12h15m-6-6 6 6-6 6"/></>,
  diagonal: <><path d="M6 18 18 6M8 6h10v10"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
};
export function Icon({name, size=24, className}) { return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.layers}</svg>; }
export function Logo(){return <a className="brand" href="#top" aria-label="Enterprise Data Platform — начало страницы"><svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 3 37 12v16L20 37 3 28V12L20 3Z" stroke="currentColor" strokeWidth="2"/><path d="m3 12 17 9 17-9M20 21v16M11.5 7.5l17 9v7.5L20 29" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg><span>enterprise<span className="brand-sub">data platform<span className="brand-dot">.</span></span></span></a>}
