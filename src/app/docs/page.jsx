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

  // Catalog slugs that already appear as section cards
  const catalogSlugs = new Set(
    docs
      .filter(card => getSectionStatus(card.slug) === 'published')
      .map(card => card.slug),
  );

  // Additional published materials that are not the getting-started card
  // and are not already shown as catalog section cards.
  const otherMaterials = published.filter(
    entry =>
      entry.slug !== start?.slug &&
      !catalogSlugs.has(entry.slug),
  );

  const statusLabel = {
    published: 'Доступно',
    draft: 'В разработке',
    planned: 'Скоро',
  };

  return (
    <DocsLayout variant="index" currentSlug="">
      <h1>Документация платформы</h1>
      <p className="docs-lead">
        Материалы по архитектуре, компонентам, безопасности и эксплуатации
        Enterprise Data Platform. Каждый раздел описывает назначение,
        границы и ключевые решения.
      </p>

      {/* Getting-started card */}
      {start && (
        <a
          className="docs-start-card"
          href={linkHref(docPath(start.slug))}
        >
          <span className="docs-start-label">
            Начало работы
          </span>

          <h2>
            {start.title}
            <span aria-hidden="true"> →</span>
          </h2>

          <p>
            Назначение, границы и ключевые
            решения платформы.
          </p>
        </a>
      )}

      {/* Other published materials (compact list) */}
      {otherMaterials.length > 0 && (
        <section className="docs-published">
          <h2>Другие материалы</h2>
          <ul className="docs-list">
            {otherMaterials.map((entry) => (
              <li key={entry.slug}>
                <a href={linkHref(docPath(entry.slug))}>
                  {entry.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Catalog of section cards */}
      <section className="docs-catalog-section">
        <h2>Разделы документации</h2>
        <div className="docs-cards">
          {docs.map((card) => {
            const status = getSectionStatus(card.slug);
            const isPublished = status === 'published';
            const label = statusLabel[status] || status;

            const inner = (
              <>
                <span className="docs-card-status">{label}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                {card.topics && card.topics.length > 0 && (
                  <div className="docs-topics">
                    {card.topics.map((topic) => (
                      <span key={topic} className="docs-topic">{topic}</span>
                    ))}
                  </div>
                )}
              </>
            );

            return isPublished ? (
              <a
                key={card.code}
                className="docs-card docs-card--published"
                href={linkHref(docPath(card.slug))}
              >
                {inner}
              </a>
            ) : (
              <article key={card.code} className="docs-card">
                {inner}
              </article>
            );
          })}
        </div>
      </section>

      {/* Note */}
      <p className="docs-note">
        Документация находится в разработке и будет дополняться.
        По вопросам сотрудничества —{' '}
        <a href={linkHref('#contact')}>связаться с нами</a>.
      </p>
    </DocsLayout>
  );
}
