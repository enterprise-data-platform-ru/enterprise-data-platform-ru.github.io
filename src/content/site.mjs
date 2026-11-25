export const site = {
  name: 'Enterprise Data Platform', shortName: 'EDP', url: 'https://enterprisedataplatform.ru',
  description: 'Референсная архитектура корпоративной платформы данных: Lakehouse, потоковая обработка, аналитика, Data Governance и эксплуатация на Kubernetes.',
  // Укажите подтверждённый рабочий адрес. До этого контактная форма не активируется.
  email: 'contact@enterprisedataplatform.ru',
  nav: [ ['Платформа', '#platform'], ['Архитектура', '#architecture'], ['Решения', '#solutions'], ['Технологии', '#technology'], ['Документация', '/docs/'] ],
};
export const modules = [
  { id:'ingestion', code:'01', icon:'stream', title:'Интеграция данных', description:'Потоковая и пакетная загрузка, репликация изменений и подключение корпоративных источников.', tools:['Kafka','Debezium','Kafka Connect'] },
  { id:'lakehouse', code:'02', icon:'layers', title:'Data Lakehouse', description:'Единый слой хранения с открытым табличным форматом, транзакциями и независимым масштабированием.', tools:['S3 / MinIO','Apache Iceberg','Polaris'] },
  { id:'compute', code:'03', icon:'compute', title:'Обработка и оркестрация', description:'Распределённые вычисления, SQL-трансформации и управляемые пайплайны данных.', tools:['Apache Spark','Airflow','dbt'] },
  { id:'analytics', code:'04', icon:'chart', title:'Аналитика и BI', description:'Интерактивные SQL-запросы, аналитические витрины и самостоятельная работа с данными.', tools:['Trino','ClickHouse','Superset'] },
  { id:'governance', code:'05', icon:'shield', title:'Data Governance', description:'Каталогизация, контроль качества, политики доступа и защита чувствительной информации.', tools:['OpenMetadata','Keycloak','OPA'] },
  { id:'operations', code:'06', icon:'nodes', title:'Platform Engineering', description:'Воспроизводимое развёртывание, GitOps, управление ресурсами и наблюдаемость.', tools:['Kubernetes','Argo CD','Prometheus'] },
];
export const stages = [
  {label:'01 / SOURCE', title:'Источники', items:['ERP / CRM','PostgreSQL / API','События / файлы']},
  {label:'02 / INGEST', title:'Интеграция', items:['Kafka','Debezium','Kafka Connect']},
  {label:'03 / STORE', title:'Lakehouse', items:['S3 / MinIO','Iceberg','Polaris']},
  {label:'04 / PROCESS', title:'Вычисления', items:['Spark / Airflow','Trino','ClickHouse']},
  {label:'05 / SERVE', title:'Потребители', items:['BI / отчётность','ML / AI','API / приложения']},
];
export const scenarios = [
  {id:'lake', title:'Корпоративный Lakehouse', label:'LAKEHOUSE', description:'Объединение разрозненных источников в открытой архитектуре хранения и вычислений. Подготовка данных для BI, аналитики и ML без обязательного дублирования всего массива.', flow:['Источники','S3 + Iceberg','Spark + Trino','BI / ML'], outcomes:['Единый слой корпоративных данных','Разделение хранения и вычислений','Открытые форматы и SQL-доступ']},
  {id:'cdc', title:'CDC и real-time', label:'STREAMING', description:'Доставка изменений из операционных систем в аналитический контур с контролем схем, повторной обработкой и наблюдаемостью задержек.', flow:['PostgreSQL','Debezium','Kafka','ClickHouse'], outcomes:['Событийная интеграция','Контроль задержки и повторов','Актуализация аналитических витрин']},
  {id:'bi', title:'BI и витрины', label:'ANALYTICS', description:'Организация управляемых аналитических витрин, федеративных запросов и отчётности с контролем доступа.', flow:['Iceberg','Trino / dbt','Витрины','Superset'], outcomes:['SQL для аналитиков','Разграничение доступа','Управляемые трансформации']},
  {id:'ai', title:'AI / ML', label:'AI READY', description:'Подготовка воспроизводимых наборов данных для экспериментов и прикладных AI-сценариев с контролем происхождения и качества.', flow:['Lakehouse','Spark','JupyterHub','ML / AI'], outcomes:['Версионирование данных','Изолированные среды','Контроль качества входных данных']},
];
export const principles = [
  {icon:'layers',title:'Открытая архитектура',description:'Открытые форматы, стандартные интерфейсы и возможность заменять компоненты по мере развития.'},
  {icon:'shield',title:'Безопасность по умолчанию',description:'Проектирование SSO, RBAC/ABAC, сегментации и политик доступа на каждом уровне.'},
  {icon:'nodes',title:'Гибкое размещение',description:'On-premises, облако или гибридная инфраструктура. Выбор по требованиям нагрузки и безопасности.'},
  {icon:'chart',title:'Управляемая эксплуатация',description:'GitOps, мониторинг, резервное копирование и проверяемые процедуры восстановления.'},
];
export const docs = [
  {
    code: 'A',
    title: 'Архитектура',
    description: 'Логическая топология, уровни платформы, потоки данных и принципы проектирования. Описывает как компоненты взаимодействуют и как принимать решения о выборе технологий.',
    topics: ['Reference Architecture', 'Data Pipeline', 'Масштабирование', 'On-premises / Cloud / Hybrid'],
  },
  {
    code: 'B',
    title: 'Компоненты',
    description: 'Описание модулей платформы: интеграция данных, lakehouse, обработка, аналитика, governance и эксплуатация. Для каждого — назначение, ключевые технологии и грани ответственности.',
    topics: ['Интеграция', 'Iceberg', 'Spark / Trino', 'OpenMetadata'],
  },
  {
    code: 'C',
    title: 'Безопасность',
    description: 'Модель доступа, сегментация данных, шифрование, аудит и соответствие требованиям. SSO, RBAC/ABAC, политики доступа на каждом уровне.',
    topics: ['IAM / SSO', 'RBAC / ABAC', 'Шифрование', 'Аудит'],
  },
  {
    code: 'D',
    title: 'Эксплуатация',
    description: 'Развёртывание, GitOps, мониторинг, резервное копирование и восстановление. Воспроизводимые процедуры и стандарты операций.',
    topics: ['Kubernetes', 'Argo CD', 'Prometheus / Grafana', 'Backup / DR'],
  },
];
export const faq = [
  ['Что такое Enterprise Data Platform?', 'Это проект референсной архитектуры корпоративной платформы данных на основе открытых технологий. Конкретные компоненты и их версии выбираются под требования проекта.'],
  ['Чем Lakehouse отличается от классического КХД?', 'Lakehouse объединяет объектное хранение и табличные форматы с транзакционными гарантиями. Классическое КХД обычно опирается на отдельную аналитическую СУБД. Подходы могут сосуществовать.'],
  ['Можно ли развернуть платформу on-premises?', 'Архитектура предусматривает on-premises, облачное и гибридное размещение. Совместимость и ресурсные требования нужно подтвердить в рамках конкретного внедрения.'],
  ['Обязательно ли внедрять все компоненты сразу?', 'Нет. Начать можно с отдельного сценария — например, CDC или Lakehouse — и постепенно расширять платформу.'],
  ['Это готовый коммерческий продукт?', 'На текущем этапе сайт представляет архитектурную концепцию. Готовность отдельных интеграций, условия поддержки и внедрения требуют отдельного согласования.'],
];
