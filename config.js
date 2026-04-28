window.CONFIG = {
  meta: { version: '1.4.0', updated_at: '2026-04-29' },
  settings: {
    password: 'Partner2026!',
    history_limit: 50
  },
  tools_catalog: [
    { id: 'showcase', name: 'Витрина', threshold: 10, type: 'placement', tooltip: 'Каталог офферов с приоритетным показом', link: 'https://www.tbank.ru/business/' },
    { id: 't_community', name: 'Рассылка в Т-Комьюнити', threshold: 10, type: 'mailing', tooltip: 'База 120К+ предпринимателей', link: 'https://www.tbank.ru/business/' },
    { id: 'business_secrets', name: 'Бизнес секреты', threshold: 20, type: 'editorial', tooltip: 'Редакционный формат: кейс/интервью', link: 'https://www.tbank.ru/business/' },
    { id: 'bank_mailing', name: 'Рассылка в контурах банка', threshold: 20, type: 'mailing', tooltip: 'Охват 45К+ активных клиентов', link: 'https://www.tbank.ru/business/' },
    { id: 'rnd', name: 'RnD', threshold: 30, type: 'integration', tooltip: 'Пилотная интеграция в экосистему', link: 'https://www.tbank.ru/business/' },
    { id: 'webinar', name: 'Вебинар', threshold: 30, type: 'event', tooltip: 'Совместный эфир с записью', link: 'https://www.tbank.ru/business/' },
    { id: 'promo_offer', name: 'Промо оффера на витрине', threshold: 30, type: 'promotion', tooltip: 'Бейдж «Акция» + топ-3 категория', link: 'https://www.tbank.ru/business/' },
    { id: 'yellow_app', name: 'Жёлтое приложение', threshold: 40, type: 'mobile', tooltip: 'Пуш + баннер с диплинком', link: 'https://www.tbank.ru/business/' },
    { id: 't_journal', name: 'Т-Ж', threshold: 50, type: 'media', tooltip: 'Публикация с таргетом по отрасли', link: 'https://www.tbank.ru/business/' }
  ],
  templates: {
    cp_base: `
      <div class="cp-header">
        <h1>Коммерческое предложение</h1>
        <p><strong>Партнёр:</strong> {client_name} | <strong>Пакет:</strong> {package_tier}</p>
        <p><strong>Утилей (базовых):</strong> {rko_units_base} → <strong>Скорректировано:</strong> {rko_units_total}</p>
        <p><small>Сформировано: {generated_at} | Версия правил: {version}</small></p>
      </div>
      <section class="cp-section">
        <h2>📈 Расчётная выгода</h2>
        <p>При объёме <strong>{rko_units_total} утилей/квартал</strong> вам доступно <strong>{tools_count} инструментов</strong> обратного лидгена. Прогноз воронки: рост квалифицированных лидов на 25–40% при сохранении текущей конверсии.</p>
      </section>
      <section class="cp-section">
        <h2>🛠 Доступные инструменты</h2>
        <div class="tools-list">
          <!-- TOOLS_PLACEHOLDER -->
        </div>
      </section>
      <!-- CASE_PLACEHOLDER -->
      <section class="cp-section">
        <h2>📬 Контакты и поддержка</h2>
        <p>Команда: <strong>{manager_team}</strong> | Менеджер: <strong>{manager_name}</strong></p>
      </section>
    `,
    tool_card: `<div class="tool-card"><div class="tool-name tooltip" data-tooltip="{tooltip}">{name}</div><div class="tool-meta">{type} | Порог: {threshold}+</div><a href="{link}" class="tool-link" target="_blank" rel="noopener">Подробнее →</a></div>`
  },
  cases: {
    showcase: { title: 'Витрина: +150 лидов за 2 недели', desc: 'Размещение оффера РКО в категории «Стартапы».', result: 'Конверсия 4.2%, стоимость лида — 320 ₽' },
    yellow_app: { title: 'Жёлтое приложение: рост установок на 210%', desc: 'Пуш-рассылка по сегменту «Онлайн-торговля».', result: '850 переходов, 120 регистраций за 3 дня' },
    business_secrets: { title: 'Бизнес секреты: экспертный охват 45К+', desc: 'Интервью с основателем в формате «Как мы масштабировали партнёрку».', result: '210 переходов, 42 заявки, 8 сделок' }
  }
};