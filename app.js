document.addEventListener('DOMContentLoaded', () => {
  // 🔐 Авторизация
  const authKey = localStorage.getItem('cp_auth');
  if(!authKey || authKey !== CONFIG.settings.password) {
    const p = prompt('🔒 Введите пароль доступа к калькулятору:');
    if(p === CONFIG.settings.password) {
      localStorage.setItem('cp_auth', CONFIG.settings.password);
    } else {
      document.body.innerHTML = '<h2 style="padding:40px;text-align:center;font-family:system-ui">Доступ ограничен</h2>';
      return;
    }
  }

  // ===== Элементы =====
  const slider = document.getElementById('rkoSlider');
  const rkoInput = document.getElementById('rkoInput');
  const form = document.getElementById('calcForm');
  const errorBox = document.getElementById('errorBox');
  const modal = document.getElementById('cpModal');
  const cpContent = document.getElementById('cpContent');
  const teamSelect = document.getElementById('managerTeam');
  const nameSelect = document.getElementById('managerName');
  const pdfBtn = document.getElementById('pdfBtn');
  
  if(pdfBtn) pdfBtn.style.display = 'none';

  // ===== Утилиты =====
  function roundToStep(value, step = 10) {
    const num = Number(String(value).replace(/\D/g, '')) || 0;
    return Math.floor(num / step) * step;
  }
  
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('visible');
    // Авто-скрытие через 5 сек
    setTimeout(() => errorBox.classList.remove('visible'), 5000);
  }

  // ===== Слайдер + инпут: двусторонняя синхронизация =====
  function syncSliderToInput() {
    const val = roundToStep(slider.value);
    rkoInput.value = val > 0 ? val : '';
  }
  
  function syncInputToSlider() {
    const val = roundToStep(rkoInput.value);
    slider.value = val;
    rkoInput.value = val > 0 ? val : '';
  }

  slider.addEventListener('input', syncSliderToInput);
  
  rkoInput.addEventListener('input', (e) => {
    // Только цифры
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    syncInputToSlider();
  });
  
  rkoInput.addEventListener('blur', () => {
    syncInputToSlider();
    // Валидация минимума
    const val = Number(rkoInput.value) || 0;
    if(val > 0 && val < 10) {
      rkoInput.value = '10';
      slider.value = '10';
    }
  });

  // ===== Каскадные списки: команда → менеджеры =====
  function populateManagers(team) {
    // Очищаем и добавляем дефолт
    nameSelect.innerHTML = '<option value="">Выберите менеджера ▼</option>';
    nameSelect.disabled = !team;
    
    if(team && CONFIG.managers && CONFIG.managers[team]) {
      CONFIG.managers[team].forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        nameSelect.appendChild(opt);
      });
      // Авто-фокус на поле ФИО после загрузки опций
      setTimeout(() => nameSelect.focus(), 50);
    }
  }

  teamSelect.addEventListener('change', (e) => {
    populateManagers(e.target.value);
    if(e.target.value) localStorage.setItem('cp_last_team', e.target.value);
  });

  // Восстановление последнего выбора
  const lastTeam = localStorage.getItem('cp_last_team');
  if(lastTeam && CONFIG.managers && CONFIG.managers[lastTeam]) {
    teamSelect.value = lastTeam;
    populateManagers(lastTeam);
  }

  // ===== Сброс формы =====
  document.getElementById('resetBtn').onclick = () => {
    form.reset();
    slider.value = 0;
    rkoInput.value = '';
    nameSelect.innerHTML = '<option value="">Сначала выберите команду ▼</option>';
    nameSelect.disabled = true;
    errorBox.classList.remove('visible');
    // Скрыть превью, если было открыто
    const preview = document.querySelector('.preview-panel');
    if(preview && !modal.classList.contains('active')) {
      preview.innerHTML = '<div class="preview-placeholder"><p>Заполните форму и нажмите «Рассчитать»</p></div>';
    }
  };

  // ===== Модальное окно =====
  function openModal(content) {
    cpContent.innerHTML = content;
    modal.classList.remove('hidden');
    // Небольшая задержка для плавного появления
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden'; // блокируем скролл фона
  }
  
  function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 200);
  }
  
  document.getElementById('closeModal').onclick = closeModal;
  modal.onclick = (e) => { if(e.target === modal) closeModal(); };
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

  // ===== Обработчик расчёта =====
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorBox.classList.remove('visible');

    // 1. Валидация утилей
    const base = Number(rkoInput.value) || 0;
    if(!base || base < 10) { 
      showError('Минимальное количество утилей — 10'); 
      rkoInput.focus();
      return; 
    }

    // 2. Валидация полей
    const partnerName = document.getElementById('partnerName').value.trim();
    const team = teamSelect.value;
    const manager = nameSelect.value;
    
    if(!partnerName) { showError('Введите название компании-партнёра'); return; }
    if(!team) { showError('Выберите команду'); return; }
    if(!manager) { showError('Выберите ФИО менеджера'); return; }

    // 3. Расчёт (доп. продукты пока скрыты, бонус = 0)
    const bonus = 0;
    const total = Math.min(base + bonus, 200);

    // 4. Маппинг инструментов
    const available = CONFIG.tools_catalog.filter(t => t.threshold <= total);
    if(!available || available.length === 0) { 
      showError('Обратный лидген предложить не можем. Минимальный порог: 10 утилей.'); 
      return; 
    }

    // 5. Определение пакета
    let tier = 'Стартовый';
    if(total >= 50) tier = 'VIP';
    else if(total >= 30) tier = 'Продвинутый';

    // 6. Рендер КП
    const generatedAt = new Date().toLocaleString('ru-RU');
    let html = CONFIG.templates.cp_base
      .replace('{client_name}', escapeHtml(partnerName))
      .replace('{package_tier}', tier)
      .replace('{rko_units_base}', base)
      .replace('{rko_units_total}', total)
      .replace('{tools_count}', available.length)
      .replace('{generated_at}', generatedAt)
      .replace('{version}', CONFIG.meta.version)
      .replace('{manager_team}', escapeHtml(team))
      .replace('{manager_name}', escapeHtml(manager));

    // Карточки инструментов с анимацией
    const toolsHtml = available.map((t, i) => {
      const delay = 0.05 + (i * 0.05);
      return CONFIG.templates.tool_card
        .replace('{tooltip}', t.tooltip || '')
        .replace('{name}', escapeHtml(t.name))
        .replace('{type}', t.type.toUpperCase())
        .replace('{threshold}', t.threshold)
        .replace('{link}', t.link || 'https://www.tbank.ru/business/')
        .replace('style="animation-delay: 0.0s;"', `style="animation-delay: ${delay}s;"`);
    }).join('');
    
    html = html.replace('<!-- TOOLS_PLACEHOLDER -->', `<div class="tools-list">${toolsHtml}</div>`);

    // Кейс
    const firstToolId = available[0]?.id;
    if(CONFIG.cases && CONFIG.cases[firstToolId]) {
      const c = CONFIG.cases[firstToolId];
      html = html.replace('<!-- CASE_PLACEHOLDER -->', `
        <section class="case-study">
          <h5>💡 ${escapeHtml(c.title)}</h5>
          <p>${escapeHtml(c.desc)}</p>
          <p class="result">📊 Результат: ${escapeHtml(c.result)}</p>
        </section>
      `);
    } else {
      html = html.replace('<!-- CASE_PLACEHOLDER -->', '');
    }

    // 7. Показ модального окна
    openModal(html);
    
    // 8. Сохранение в историю
    saveHistory({ 
      partner_name: partnerName, 
      package_tier: tier, 
      total_units: total, 
      tools_count: available.length, 
      config_version: CONFIG.meta.version 
    });
  });

  // ===== История =====
  function saveHistory(data) {
    try {
      const hist = JSON.parse(localStorage.getItem('cp_history') || '[]');
      hist.unshift({ id: Date.now(), timestamp: new Date().toISOString(), ...data });
      localStorage.setItem('cp_history', JSON.stringify(hist.slice(0, CONFIG.settings.history_limit)));
    } catch(e) {
      console.warn('History save failed:', e);
    }
  }

  // ===== Кнопки экспорта =====
  document.getElementById('copyBtn').onclick = () => {
    const text = cpContent.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copyBtn');
      const original = btn.textContent;
      btn.textContent = '✅ Скопировано!';
      setTimeout(() => btn.textContent = original, 2000);
    }).catch(() => alert('Не удалось скопировать. Выделите текст вручную.'));
  };

  document.getElementById('mailBtn').onclick = () => {
    const partner = document.getElementById('partnerName').value;
    const subject = encodeURIComponent(`КП Обратный Лидген: ${partner}`);
    const body = encodeURIComponent(`Коллеги, направляю сформированное КП.\nПартнёр: ${partner}\n\nДоступно инструментов: ${cpContent.querySelectorAll('.tool-card').length}\n\nСсылка: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
});
