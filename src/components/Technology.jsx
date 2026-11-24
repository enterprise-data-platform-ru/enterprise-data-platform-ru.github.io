import React from 'react';
import {principles} from '../content/site.mjs';
import {Icon} from './Icon.jsx';

const STACK = ['Apache Kafka','Apache Iceberg','Apache Spark','Trino','ClickHouse','Apache Airflow','Kubernetes','Argo CD','Keycloak','Open Policy Agent'];

export default function Technology(){
  return <section className="section technology" id="technology">
    <div className="container">
      <div className="section-heading">
        <div>
          <div className="eyebrow"><span className="section-no">04</span> / ИНЖЕНЕРНЫЕ ПРИНЦИПЫ</div>
          <h2>Спроектировано<br/>для развития.</h2>
        </div>
        <p>Архитектурные принципы важнее конкретного вендора. Технологии выбираются под эксплуатационные и бизнес-требования.</p>
      </div>
      <div className="principle-grid">
        {principles.map(p => (
          <article className="principle" key={p.title}>
            <Icon name={p.icon} size={28}/>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
          </article>
        ))}
      </div>
      <div className="stack-title mono">ТЕХНОЛОГИЧЕСКАЯ ЭКОСИСТЕМА / ПРИМЕРЫ КОМПОНЕНТОВ</div>
      <div className="stack-list">
        {STACK.map(t => <span key={t}>{t}</span>)}
      </div>
    </div>
  </section>;
}
