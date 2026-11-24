import React from 'react';
import {stages, scenarios} from '../content/site.mjs';
import {Icon} from './Icon.jsx';
import ScenarioSwitcher from './ScenarioSwitcher.jsx';

export default function Architecture() {
  return (
    <section className="section architecture" id="architecture">
      <div className="container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="section-no">02</span> / REFERENCE ARCHITECTURE
            </div>
            <h2>Путь данных.<br/>От источника до решения.</h2>
          </div>
          <p>Логическая схема показывает возможный состав платформы. Компоненты можно внедрять поэтапно и заменять с учётом требований проекта.</p>
        </div>

        <div className="arch-board">
          <div className="board-header mono">
            <span><i className="status-dot" /> EDP / LOGICAL TOPOLOGY</span>
            <span>REFERENCE · v0.1</span>
          </div>
          <div className="arch-band">
            <Icon name="shield" size={20} />
            <strong>Data Governance &amp; Security</strong>
            <span>Каталог · Качество · IAM · Политики доступа</span>
          </div>
          <div className="stage-grid">
            {stages.map((s, i) => (
              <div className="stage" key={s.label}>
                <div className="mono stage-label">{s.label}</div>
                <h3>{s.title}</h3>
                <div className="stage-items">
                  {s.items.map(item => <div key={item}>{item}</div>)}
                </div>
                {i < stages.length - 1 && <span className="stage-arrow"><Icon name="arrow" size={18} /></span>}
              </div>
            ))}
          </div>
          <div className="arch-band arch-bottom">
            <Icon name="nodes" size={20} />
            <strong>Infrastructure &amp; Operations</strong>
            <span>Kubernetes · GitOps · Observability · Backup</span>
          </div>
          <div className="board-footer mono">
            <span>DATA FLOW →</span>
            <span>BATCH + STREAMING</span>
          </div>
        </div>

        <ScenarioSwitcher scenarios={scenarios} />

        <p className="arch-note">Схема концептуальная: состав, версии, интеграции и требования к отказоустойчивости определяются при проектировании.</p>
      </div>
    </section>
  );
}
