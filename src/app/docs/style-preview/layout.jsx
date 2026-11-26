import DocsLayout from '../../../components/DocsLayout.jsx';

export const metadata = {
  title: 'Проверка стилей — Enterprise Data Platform',
  description: 'Тестовая страница для визуальной проверки всех стилей документации. Не публикуется.',
  robots: {index: false, follow: false},
};

export default function StylePreviewLayout({children}) {
  return (
    <DocsLayout variant="article" currentSlug="">
      {children}
    </DocsLayout>
  );
}
