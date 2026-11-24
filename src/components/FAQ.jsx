import React from 'react';
import {faq} from '../content/site.mjs';

export default function FAQ(){
  return <section className="section faq" id="faq">
    <div className="container faq-grid">
      <div>
        <div className="eyebrow"><span className="section-no">05</span> / FAQ</div>
        <h2>Вопросы<br/>и ответы.</h2>
        <p>О концепции, технологиях и вариантах внедрения платформы.</p>
      </div>
      <div className="faq-list">
        {faq.map(([q, a]) => (
          <details key={q}>
            <summary>{q}<span aria-hidden="true"/></summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>;
}
