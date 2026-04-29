window.CONFIG = {
  meta: { version: '2.1.0', updated_at: '2026-04-29' },
  settings: { password: 'Partner2026!', history_limit: 50 },
  
  managers: {
    "Крупные партнерства": ["Гуляев Владимир", "Крицкая Ирина", "Мифтахова Алина", "Подорожная Александра"],
    "Отраслевые партнерства": ["Балашов Михаил", "Бундин Алексей", "Ишханова Ася", "Колотий Татьяна", "Крупин Андрей", "Тусикова Анжела"]
  },

  tools: [
    { id: 'showcase', name: 'Витрина', cost: 10, type: 'placement', tooltip: 'Каталог офферов с приоритетным показом', link: 'https://www.tbank.ru/business/' },
    { id: 't_community', name: 'Рассылка в Т-Комьюнити', cost: 10, type: 'mailing', tooltip: 'База 120К+ предпринимателей', link: 'https://www.tbank.ru/business/' },
    { id: 'business_secrets', name: 'Бизнес секреты', cost: 20, type: 'editorial', tooltip: 'Редакционный формат: кейс/интервью', link: 'https://www.tbank.ru/business/' },
    { id: 'bank_mailing', name: 'Рассылка в контурах банка', cost: 20, type: 'mailing', tooltip: 'Охват 45К+ активных клиентов', link: 'https://www.tbank.ru/business/' },
    { id: 'rnd', name: 'RnD', cost: 30, type: 'integration', tooltip: 'Пилотная интеграция в экосистему', link: 'https://www.tbank.ru/business/' },
    { id: 'webinar', name: 'Вебинар', cost: 30, type: 'event', tooltip: 'Совместный эфир с записью', link: 'https://www.tbank.ru/business/' },
    { id: 'promo_offer', name: 'Промо оффера на витрине', cost: 30, type: 'promotion', tooltip: 'Бейдж «Акция» + топ-3 категория', link: 'https://www.tbank.ru/business/' },
    { id: 'yellow_app', name: 'Жёлтое приложение', cost: 40, type: 'mobile', tooltip: 'Пуш + баннер с диплинком', link: 'https://www.tbank.ru/business/' },
    { id: 't_journal', name: 'Т-Ж', cost: 50, type: 'media', tooltip: 'Публикация с таргетом по отрасли', link: 'https://www.tbank.ru/business/' }
  ],

  // Точные комбинации по порогам (как в ТЗ)
  tiers: {
    10: [
      { id: 'v10_1', title: 'Витрина', tools: ['showcase'] },
      { id: 'v10_2', title: 'Рассылки в Т-Комьюнити', tools: ['t_community'] }
    ],
    20: [
      { id: 'v20_1', title: 'Бизнес Секреты', tools: ['business_secrets'] },
      { id: 'v20_2', title: 'Рассылка в контурах банка', tools: ['bank_mailing'] },
      { id: 'v20_3', title: 'Витрина + Рассылки в Т-Комьюнити', tools: ['showcase', 't_community'] }
    ],
    30: [
      { id: 'v30_1', title: 'Промо оффера на витрине', tools: ['promo_offer'] },
      { id: 'v30_2', title: 'Вебинар', tools: ['webinar'] },
      { id: 'v30_3', title: 'RnD', tools: ['rnd'] },
      { id: 'v30_4', title: 'Бизнес Секреты + Витрина', tools: ['business_secrets', 'showcase'] },
      { id: 'v30_5', title: 'Бизнес Секреты + Т-Комьюнити', tools: ['business_secrets', 't_community'] },
      { id: 'v30_6', title: 'Рассылка в контурах банка + Витрина', tools: ['bank_mailing', 'showcase'] },
      { id: 'v30_7', title: 'Рассылка в контурах банка + Т-Комьюнити', tools: ['bank_mailing', 't_community'] }
    ],
    40: [
      { id: 'v40_1', title: 'Жёлтое приложение', tools: ['yellow_app'] },
      { id: 'v40_2', title: 'RnD + Витрина', tools: ['rnd', 'showcase'] },
      { id: 'v40_3', title: 'RnD + Т-Комьюнити', tools: ['rnd', 't_community'] },
      { id: 'v40_4', title: 'Вебинар + Витрина', tools: ['webinar', 'showcase'] },
      { id: 'v40_5', title: 'Вебинар + Т-Комьюнити', tools: ['webinar', 't_community'] },
      { id: 'v40_6', title: 'Промо оффера + Витрина', tools: ['promo_offer', 'showcase'] },
      { id: 'v40_7', title: 'Промо оффера + Т-Комьюнити', tools: ['promo_offer', 't_community'] },
      { id: 'v40_8', title: 'Бизнес Секреты + Рассылка в контурах банка', tools: ['business_secrets', 'bank_mailing'] },
      { id: 'v40_9', title: 'БС + Витрина + Т-Комьюнити', tools: ['business_secrets', 'showcase', 't_community'] },
      { id: 'v40_10', title: 'Банк-рассылка + Витрина + Т-Комьюнити', tools: ['bank_mailing', 'showcase', 't_community'] }
    ],
    50: [
      { id: 'v50_1', title: 'Т-Ж', tools: ['t_journal'] },
      { id: 'v50_2', title: 'Жёлтое приложение + Витрина', tools: ['yellow_app', 'showcase'] },
      { id: 'v50_3', title: 'Жёлтое приложение + Т-Комьюнити', tools: ['yellow_app', 't_community'] },
      { id: 'v50_4', title: 'RnD + Бизнес Секреты', tools: ['rnd', 'business_secrets'] },
      { id: 'v50_5', title: 'RnD + Рассылка в контурах банка', tools: ['rnd', 'bank_mailing'] },
      { id: 'v50_6', title: 'RnD + Витрина + Т-Комьюнити', tools: ['rnd', 'showcase', 't_community'] },
      { id: 'v50_7', title: 'Вебинар + Бизнес Секреты', tools: ['webinar', 'business_secrets'] },
      { id: 'v50_8', title: 'Вебинар + Рассылка в контурах банка', tools: ['webinar', 'bank_mailing'] },
      { id: 'v50_9', title: 'Вебинар + Витрина + Т-Комьюнити', tools: ['webinar', 'showcase', 't_community'] },
      { id: 'v50_10', title: 'БС + Банк-рассылка + Витрина', tools: ['business_secrets', 'bank_mailing', 'showcase'] },
      { id: 'v50_11', title: 'БС + Банк-рассылка + Т-Комьюнити', tools: ['business_secrets', 'bank_mailing', 't_community'] }
    ]
  },

  tools_metrics: {
    showcase: { description: "Размещение вашего оффера в каталоге банковских партнёров с приоритетным показом в категории", views: "15 000", leads: "150" },
    t_community: { description: "Таргетированная рассылка по базе предпринимателей (120К+ подписчиков)", views: "45 000", leads: "90" },
    business_secrets: { description: "Интеграция в редакционный материал: кейс, интервью или экспертный комментарий", views: "80 000", leads: "200" },
    bank_mailing: { description: "Включение вашего оффера в регулярную рассылку для клиентов банка", views: "45 000", leads: "135" },
    rnd: { description: "Тестовая интеграция вашего продукта в экосистему банка для пилотной аудитории", views: "5 000", leads: "50" },
    webinar: { description: "Совместный вебинар с банком: презентация решения для целевой аудитории", views: "3 000", leads: "75" },
    promo_offer: { description: "Выделенное размещение с бейджем «Акция» и приоритетным показом в топ-3", views: "20 000", leads: "180" },
    yellow_app: { description: "Пуш-уведомление + баннер в мобильном приложении банка с глубокой ссылкой", views: "100 000", leads: "250" },
    t_journal: { description: "Публикация в Т-Ж с органическим охватом и таргетом по отрасли/региону", views: "150 000", leads: "300" }
  },

  templates: {
    cp_presentation: `
      <div class="kp-presentation">
        <div class="kp-slide kp-slide-hero">
          <div class="kp-badge">Партнёру доступен пакет</div>
          <h1 class="kp-package">{package_name}</h1>
          <div class="kp-partner-info">
            <span class="label">Партнёр:</span> <strong>{client_name}</strong>
            <span class="divider">•</span>
            <span class="label">Объём:</span> <strong>{rko_units_total} утилей/квартал</strong>
            <span class="divider">•</span>
            <span class="label">Вариантов:</span> <strong>{variants_count}</strong>
          </div>
          <div class="kp-date">Сформировано: {generated_at} | Версия: {version}</div>
        </div>

        <div class="kp-slide">
          <h2 class="kp-title">📦 Что можно предложить?</h2>
          <div class="variants-overview">{variants_overview_html}</div>
        </div>

        {variants_detail_html}

        <div class="kp-slide kp-slide-footer">
          <h2 class="kp-title">📬 Следующие шаги</h2>
          <div class="kp-contacts">
            <div class="contact-block"><div class="contact-label">Команда</div><div class="contact-value">{manager_team}</div></div>
            <div class="contact-block"><div class="contact-label">Менеджер</div><div class="contact-value">{manager_name}</div></div>
          </div>
          <div class="kp-actions-presentation">
            <button class="btn-action" id="copyFullKP">📋 Скопировать всё КП</button>
            <button class="btn-action secondary" id="mailKP">✉️ Отправить партнёру</button>
          </div>
        </div>
      </div>
    `,
    variant_overview_card: `
      <div class="variant-card" data-variant-id="{variant_id}">
        <div class="variant-number">Вариант {variant_number}</div>
        <h3 class="variant-title">{variant_title}</h3>
        <div class="variant-tools-preview">{tools_preview}</div>
        <div class="variant-cta">Подробнее →</div>
      </div>
    `,
    variant_detail_slide: `
      <div class="kp-slide kp-slide-variant" id="variant-{variant_id}">
        <div class="variant-header">
          <span class="variant-badge">Вариант {variant_number}</span>
          <h2 class="variant-name">{variant_title}</h2>
        </div>
        <div class="tools-detailed">{tools_detailed_html}</div>
        <div class="variant-total-metrics">
          <h4>📊 Суммарный эффект варианта</h4>
          <div class="metrics-grid">
            <div class="metric-card"><div class="metric-value">{total_views}</div><div class="metric-label">просмотров/мес</div></div>
            <div class="metric-card"><div class="metric-value">{total_leads}</div><div class="metric-label">заявок/мес</div></div>
          </div>
        </div>
      </div>
    `,
    tool_detail_card: `
      <div class="tool-detail-card">
        <div class="tool-header"><h3 class="tool-name">{tool_name}</h3><span class="tool-type">{tool_type}</span></div>
        <div class="tool-description"><strong>Что это:</strong> {tool_description}</div>
        <div class="tool-metrics">
          <div class="metric-item"><span class="metric-icon">👁</span><span class="metric-text"><strong>{views}</strong> просмотров/мес</span></div>
          <div class="metric-item"><span class="metric-icon">📩</span><span class="metric-text"><strong>{leads}</strong> заявок/мес</span></div>
        </div>
        <div class="tool-example">
          <div class="example-label">📍 Пример размещения:</div>
          <div class="example-placeholder">
            <div class="placeholder-screenshot"><span class="placeholder-text">Скриншот размещения</span><a href="{tool_link}" target="_blank" class="placeholder-link">Открыть пример →</a></div>
          </div>
        </div>
        <div class="tool-link-block"><a href="{tool_link}" target="_blank" class="tool-link-btn">Подробнее об инструменте →</a></div>
      </div>
    `
  }
};
