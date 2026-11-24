'use client';

import {useState} from 'react';

export default function ScenarioSwitcher({scenarios}) {
  const [active, setActive] = useState(0);
  const s = scenarios[active];

  return (
    <div className="scenario-switcher">
      <div className="scenario-tabs" role="tablist" aria-label="Сценарии использования">
        {scenarios.map((sc, i) => (
          <button
            key={sc.id}
            role="tab"
            id={`scenario-tab-${sc.id}`}
            aria-selected={i === active}
            aria-controls={`scenario-panel-${sc.id}`}
            className={`scenario-tab${i === active ? ' active' : ''}`}
            onClick={() => setActive(i)}
          >
            <span className="mono">{sc.label}</span>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`scenario-panel-${s.id}`}
        aria-labelledby={`scenario-tab-${s.id}`}
        className="scenario-panel"
      >
        <h3>{s.title}</h3>
        <p>{s.description}</p>

        <div className="flow-strip">
          {s.flow.map((step, i) => (
            <span key={step}>
              {step}
              {i < s.flow.length - 1 && <em className="flow-arrow">→</em>}
            </span>
          ))}
        </div>

        <ul className="scenario-outcomes">
          {s.outcomes.map(o => <li key={o}>{o}</li>)}
        </ul>
      </div>
    </div>
  );
}
