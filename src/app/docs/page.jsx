import React from 'react';
import {docs} from '../../content/site.mjs';
import {
  getPublishedDocs,
  getSectionStatus,
  getGettingStarted,
  docPath,
} from '../../content/docs/navigation.mjs';
import {linkHref} from '../../lib/paths.mjs';

export const metadata = {
  title: 'Документация — Enterprise Data Platform',
  description: 'Структура документации: архитектура, компоненты, безопасность и эксплуатация корпоративной платформы данных.',
  alternates: { canonical: '/docs/' },
};

export default function DocsPage() {
  const start = getGettingStarted();
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

        {start && (
          <section className="docs-start" aria-label="Начать работу">
            <div className="container">
              <div className="eyebrow">
                <span className="section-no">01</span> / GETTING STARTED
              </div>
              <h2>Начать работу</h2>
              <p>
                Начните с обзора платформы — краткое введение в цели, уровни и
                принципы Enterprise Data Platform.
              </p>
              <a className="docs-start-link" href={linkHref(docPath(start.slug))}>
                {start.title}
                <span aria-hidden="true"> →</span>
              </a>
            </div>
          </section>
        )}

        <section className="docs-list">
          <div className="container">
            <div className="docs-grid">
              {docs.map((card) => {
                const status = getSectionStatus(card.slug);
                const published = status === 'published';
                const body = (
                  <>
                    <div className="docs-card-head">
                      <span className="mono docs-code">{card.code}</span>
                      <h2>{card.title}</h2>
                      {!published && (
                        <span className="docs-soon">Скоро</span>
                      )}
                    </div>
                    <p>{card.description}</p>
                    <div className="docs-topics">
                      {card.topics.map(t => (
                        <span key={t} className="docs-topic mono">{t}</span>
                      ))}
                    </div>
                    {published && (
                      <span className="docs-card-cta" aria-hidden="true">
                        Читать <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </>
                );
                return published ? (
                  <a
                    key={card.code}
                    className="docs-card docs-card-link"
                    href={linkHref(docPath(card.slug))}
                  >
                    {body}
                  </a>
                ) : (
                  <article key={card.code} className="docs-card">
                    {body}
                  </article>
                );
              })}
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
              Часть разделов ещё в разработке и отмечена пометкой «Скоро». По
              мере готовности материалы будут публиковаться здесь. Для текущих
              вопросов используйте{' '}
              <a href={linkHref('#contact')}>контактный блок на главной странице</a>.
            </p>
          </div>
        </section>
    </main>
  );
}
