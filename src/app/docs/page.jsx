import React from 'react';
import {docs} from '../../content/site.mjs';
import {getPublishedDocs, getGettingStarted, getSectionStatus, docPath} from '../../content/docs/navigation.mjs';
import {linkHref} from '../../lib/paths.mjs';

// FIX-03: каталог документации (/docs/) больше не содержит собственных
// layout-обёрток (docs-shell, docs-sidebar). Единая сетка предоставляется
// DocsLayout из родительского src/app/docs/layout.jsx.
export default function DocsIndexPage() {
  const published = getPublishedDocs();
  const start = getGettingStarted();
  const statusOf = getSectionStatus;

  return (
    <div className="docs-catalog">
      <section className="docs-hero" aria-labelledby="docs-heading">
        <div className="container">
          <p className="eyebrow">Документация</p>
          <h1 id="docs-heading">Корпоративная платформа данных</h1>
          <p className="lead">
            Единая система хранения, обработки и анализа данных для
            корпоративных задач: витрины, дашборды, отчёты, интеграции и
            поддержка принятия решений.
          </p>
        </div>
      </section>

      <section className="docs-start" aria-labelledby="docs-start">
        <div className="container">
          <h2 id="docs-start">Начать работу</h2>
          {start ? (
            <a className="docs-start-link" href={linkHref(docPath(start.slug))}>
              <span>{start.title}</span>
              <small>Первый шаг по документации</small>
              <span className="arrow" aria-hidden="true">→</span>
            </a>
          ) : (
            <p className="docs-start-empty">Материал находится в работе.</p>
          )}
        </div>
      </section>

      <section className="docs-list" aria-labelledby="docs-catalog">
        <div className="container">
          <h2 id="docs-catalog">Содержание документации</h2>
          <p className="docs-list-intro">
            Разделы платформы. Публикуемые материалы открываются по ссылке,
            планируемые обозначены как предстоящие.
          </p>
          <div className="docs-cards">
            {docs.map((c) => {
              const status = statusOf(c.slug);
              const href = status === 'published' ? linkHref(docPath(c.slug)) : null;
              const inner = (
                <>
                  <span className="docs-card-tag">{c.code}</span>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  <span className="docs-card-status" aria-label={`Раздел: ${status === 'published' ? 'опубликован' : 'в планах'}`}>
                    {status === 'published' ? 'Доступно' : 'В планах'}
                  </span>
                </>
              );
              return href ? (
                <a key={c.code} className="docs-card" href={href}>
                  {inner}
                </a>
              ) : (
                <div key={c.code} className="docs-card" aria-disabled="true">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="docs-published" aria-labelledby="docs-published">
        <div className="container">
          <h2 id="docs-published">Опубликованные материалы</h2>
          <p>
            Сейчас доступно {published.length} {published.length === 1 ? 'раздел' : published.length < 5 ? 'раздела' : 'разделов'}.
            Остальные разделы находятся в работе.
          </p>
          <div className="docs-cards">
            {published.map((d) => (
              <a key={d.slug} className="docs-card docs-card--published" href={linkHref(docPath(d.slug))}>
                <span className="docs-card-tag">{d.section}</span>
                <h3>{d.title}</h3>
                <p>{d.summary}</p>
                <span className="arrow" aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <aside className="docs-note" aria-label="О статусе материала">
        <div className="container">
          <p><strong>Статус:</strong> материал находится в работе и будет дополняться.</p>
        </div>
      </aside>
    </div>
  );
}
