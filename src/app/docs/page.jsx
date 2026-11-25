import React from 'react';
import {docs} from '../../content/site.mjs';
import {getPublishedDocs, docPath} from '../../content/docs/navigation.mjs';
import {linkHref} from '../../lib/paths.mjs';

export const metadata = {
  title: 'Документация — Enterprise Data Platform',
  description: 'Структура документации: архитектура, компоненты, безопасность и эксплуатация корпоративной платформы данных.',
  alternates: { canonical: '/docs/' },
};

export default function DocsPage() {
  return (
    <main id="main" className="docs-page">
        <section className="docs-hero">
          <div className="container">
            <nav className="docs-breadcrumb" aria-label="Хлебные крошки">
              <a href={linkHref('/')}>Главная</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Документация</span>
            </nav>
            <div className="eyebrow">
              <span className="section-no">DOCS</span> / REFERENCE MATERIAL
            </div>
            <h1>Документация</h1>
            <p>
              Материалы по архитектуре, компонентам, безопасности и эксплуатации
              Enterprise Data Platform. Каждый раздел описывает назначение,
              границы и ключевые решения.
            </p>
          </div>
        </section>

        <section className="docs-list">
          <div className="container">
            <div className="docs-grid">
              {docs.map(d => (
                <article className="docs-card" key={d.code}>
                  <div className="docs-card-head">
                    <span className="mono docs-code">{d.code}</span>
                    <h2>{d.title}</h2>
                  </div>
                  <p>{d.description}</p>
                  <div className="docs-topics">
                    {d.topics.map(t => (
                      <span key={t} className="docs-topic mono">{t}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="docs-published">
          <div className="container">
            <h2>Опубликованные материалы</h2>
            <ul className="docs-published-list">
              {getPublishedDocs().map(d => (
                <li key={d.slug}>
                  <a href={linkHref(docPath(d.slug))}>{d.title}</a>
                  <span className="mono docs-topic">{d.section}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="docs-note">
          <div className="container">
            <p>
              Разделы находятся в разработке. По мере готовности материалы
              будут публиковаться здесь. Для текущих вопросов используйте{' '}
              <a href={linkHref('#contact')}>контактный блок на главной странице</a>.
            </p>
          </div>
        </section>
    </main>
  );
}
