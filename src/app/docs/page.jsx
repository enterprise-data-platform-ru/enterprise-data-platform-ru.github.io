import React from 'react';
import {docs} from '../../content/site.mjs';
import {getPublishedDocs, getGettingStarted, getSectionStatus, docPath} from '../../content/docs/navigation.mjs';
import {linkHref} from '../../lib/paths.mjs';
import DocsLayout from '../../components/DocsLayout.jsx';

export const metadata = {
  title: 'Документация — Enterprise Data Platform',
  description: 'Архитектура, компоненты, безопасность и эксплуатация корпоративной платформы данных.',
  alternates: {
    canonical: 'https://enterprisedataplatform.ru/docs/',
  },
};

export default function DocsIndexPage() {
  const published = getPublishedDocs();
  const start = getGettingStarted();
  return (
    <DocsLayout variant="index" currentSlug="">
      <section className="docs-hero" aria-labelledby="docs-heading">
        <h1 id="docs-heading">Документация</h1>
        <p className="lead">
          Материалы по архитектуре, компонентам, безопасности и эксплуатации
          Enterprise Data Platform. Каждый раздел описывает назначение,
          границы и ключевые решения.
        </p>
      </section>

      <section className="docs-start" aria-labelledby="docs-start">
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
      </section>

      <section className="docs-list" aria-labelledby="docs-catalog">
        <h2 id="docs-catalog">Содержание документации</h2>
        <p className="docs-list-intro">
          Разделы платформы. Публикуемые материалы открываются по ссылке,
          планируемые обозначены как предстоящие.
        </p>
        <div className="docs-cards">
          {docs.map((card) => {
            const status = getSectionStatus(card.slug);
            const isPublished = status === 'published';
            const content = (
              <>
                <span className="docs-card-tag">{card.code}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <span className="docs-card-status">
                  {isPublished ? 'Доступно' : status === 'draft' ? 'В работе' : 'В планах'}
                </span>
              </>
            );
            return isPublished ? (
              <a key={card.code} className="docs-card docs-card--published" href={linkHref(docPath(card.slug))}>
                {content}
              </a>
            ) : (
              <article key={card.code} className="docs-card">{content}</article>
            );
          })}
        </div>
      </section>

      {published.length > 0 && (
        <section className="docs-published" aria-labelledby="docs-published">
          <h2 id="docs-published">Опубликованные материалы</h2>
          <div className="docs-cards">
            {published.map((entry) => (
              <a key={entry.slug} className="docs-card docs-card--published" href={linkHref(docPath(entry.slug))}>
                <span className="docs-card-tag">{entry.section}</span>
                <h3>{entry.title}</h3>
                {entry.summary && <p>{entry.summary}</p>}
                <span className="arrow" aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <aside className="docs-note" aria-label="О статусе документации">
        <p><strong>Статус:</strong> документация находится в разработке и будет дополняться.</p>
      </aside>
    </DocsLayout>
  );
}
