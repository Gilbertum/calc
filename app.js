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

  // Elements
  const rkoInput = document.getElementById('rkoInput');
  const form = document.getElementById('calcForm');
  const errorBox = document.getElementById('errorBox');
  const modal = document.getElementById('cpModal');
  const cpContent = document.getElementById('cpContent');
  const teamSelect = document.getElementById('managerTeam');
  const nameSelect = document.getElementById('managerName');

  // 🎯 Каскадные списки: команда → менеджеры
  function populateManagers(team) {
    nameSelect.innerHTML = '<option value="">Выберите менеджера</option>';
    nameSelect.disabled = !team;
    
    if(team && CONFIG.managers[team]) {
      CONFIG.managers[team].forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        nameSelect.appendChild(opt);
      });
    }
  }

  teamSelect.addEventListener('change', (e) => {
    populateManagers(e.target.value);
    // Сохраняем выбор в localStorage для удобства
    if(e.target.value) localStorage.setItem('cp_last_team', e.target.value);
  });

  // Восстанавливаем последний выбор команды при загрузке
  const lastTeam = localStorage.getItem('cp_last_team');
  if(lastTeam && CONFIG.managers[lastTeam]) {
    teamSelect.value = lastTeam;
    populateManagers(lastTeam);
  }

  // 🔢 Валидация ввода утилей: только цифры + автоформатирование
  rkoInput.addEventListener('input', (e) => {
    // Удаляем всё, кроме цифр
    let val = e.target.value.replace(/\D/g, '');
    
    // Ограничение по длине (до 4 цифр = до 9999)
    if(val.length > 4) val = val.slice(0, 4);
    
    // Автоокругление вниз до кратного 10 при потере фокуса
    e.target.value = val;
  });

  rkoInput.addEventListener('blur', (e) => {
    let val = Number(e.target.value) || 0;
    val = Math.floor(val / 10) * 10; // округление вниз
    val = Math.max(0, Math.min(val, 9990)); // лимиты
    e.target.value = val || '';
  });

  // Allow only numeric keys + arrows/backspace
  rkoInput.addEventListener('keydown', (e) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if(!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
      e.preventDefault();
    }
  });

  // Reset form
  document.getElementById('resetBtn').onclick = () => {
    form.reset();
    nameSelect.innerHTML = '<option value="">Сначала выберите команду</option>';
    nameSelect.disabled = true;
    errorBox.classList.remove('visible');
  };

  // Modal close
  document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
  window.onclick = (e) => { if(e.target === modal) modal.classList.remove('active'); };

  // Submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorBox.classList.remove('visible');

    const base = Number(rkoInput.value) || 0;
    if(base < 10) { showError('Минимальное количество утилей — 10'); return; }

    const partnerName = document.getElementById('partnerName').value.trim();
    const team = teamSelect.value;
    const manager = nameSelect.value;
    
    if(!partnerName || !team || !manager) { 
      showError('Заполните все обязательные поля'); 
      return; 
    }

    // Доп. продукты скрыты, но логика 30% сохранена для будущего
    // const addons = document.querySelectorAll('input[name="addon"]:checked');
    // const bonus = Math.floor(addons.length * 0.3);
    const bonus = 0; // пока не используем
    const total = Math.min(base + bonus, 200);

    // Map tools
    const available = CONFIG.tools_catalog.filter(t => t.threshold <= total);
    if(!available.length) { 
      showError('Обратный лидген предложить не можем. Минимальный порог: 10 утилей.'); 
      return; 
    }

    // Tier
    let tier = 'Стартовый';
    if(total >= 50) tier = 'VIP';
    else if(total >= 30) tier = 'Продвинутый';

    // Render CP
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

    // Tools cards
    const toolsHtml = available.map((t, i) => {
      const delay = 0.05 + (i * 0.05);
      return CONFIG.templates.tool_card
        .replace('{tooltip}', t.tooltip || '')
        .replace('{name}', t.name)
        .replace('{type}', t.type.toUpperCase())
        .replace('{threshold}', t.threshold)
        .replace('{link}', t.link || 'https://www.tbank.ru/business/')
        .replace('style="animation-delay: 0.0s;"', `style="animation-delay: ${delay}s;"`);
    }).join('');
    
    html = html.replace('<!-- TOOLS_PLACEHOLDER -->', `<div class="tools-list">${toolsHtml}</div>`);

    // Case
    const firstToolId = available[0]?.id;
    if(CONFIG.cases[firstToolId]) {
      const c = CONFIG.cases[firstToolId];
      html = html.replace('<!-- CASE_PLACEHOLDER -->', `
        <section class="case-study">
          <h5>💡 ${c.title}</h5>
          <p>${c.desc}</p>
          <p class="result">📊 Результат: ${c.result}</p>
        </section>
      `);
    } else {
      html = html.replace('<!-- CASE_PLACEHOLDER -->', '');
    }

    cpContent.innerHTML = html;
    modal.classList.add('active');
    saveHistory({ partner_name: partnerName, package_tier: tier, total_units: total, tools_count: available.length, config_version: CONFIG.meta.version });
  });

  // Helpers
  function showError(msg) { 
    errorBox.textContent = msg; 
    errorBox.classList.add('visible'); 
  }
  
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // History
  function saveHistory(data) {
    const hist = JSON.parse(localStorage.getItem('cp_history') || '[]');
    hist.unshift({ id: Date.now(), timestamp: new Date().toISOString(), ...data });
    localStorage.setItem('cp_history', JSON.stringify(hist.slice(0, CONFIG.settings.history_limit)));
  }

  // Copy button
  document.getElementById('copyBtn').onclick = () => {
    const text = cpContent.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copyBtn');
      const original = btn.textContent;
      btn.textContent = '✅ Скопировано!';
      setTimeout(() => btn.textContent = original, 2000);
    }).catch(() => alert('Не удалось скопировать. Выделите текст вручную.'));
  };

  // Mailto
  document.getElementById('mailBtn').onclick = () => {
    const partner = document.getElementById('partnerName').value;
    const subject = encodeURIComponent(`КП Обратный Лидген: ${partner}`);
    const body = encodeURIComponent(`Коллеги, направляю сформированное КП.\nПартнёр: ${partner}\n\nДоступно инструментов: ${cpContent.querySelectorAll('.tool-card').length}\n\nСсылка: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
});
  };
});
