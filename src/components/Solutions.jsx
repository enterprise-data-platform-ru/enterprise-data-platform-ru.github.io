import React from 'react';
import {scenarios} from '../content/site.mjs';
import {Icon} from './Icon.jsx';

export default function Solutions(){
  return <section className="section" id="solutions">
    <div className="container">
      <div className="section-heading">
        <div>
          <div className="eyebrow"><span className="section-no">03</span> / СЦЕНАРИИ</div>
          <h2>От задачи бизнеса<br/>к архитектуре.</h2>
        </div>
        <p>Начните с одного сценария и расширяйте платформу по мере появления новых требований к данным.</p>
      </div>
      <div className="scenario-grid">
        {scenarios.map((s, i) => (
          <article className="scenario-card" key={s.id}>
            <div className="mono scenario-label">
              <span>0{i + 1} / {s.label}</span>
              <Icon name="diagonal" size={19}/>
            </div>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
            <div className="flow-strip" aria-label="Поток данных">
              {s.flow.map((f, j) => (
                <React.Fragment key={f}>
                  <span>{f}</span>
                  {j < s.flow.length - 1 && <Icon name="arrow" size={15}/>}
                </React.Fragment>
              ))}
            </div>
            <details className="scenario-details">
              <summary>Что даёт этот подход</summary>
              <ul>
                {s.outcomes.map(o => <li key={o}>{o}</li>)}
              </ul>
            </details>
          </article>
        ))}
      </div>
    </div>
  </section>;
}
