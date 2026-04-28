document.addEventListener('DOMContentLoaded', () => {
  // 🔐 Auth
  const authKey = localStorage.getItem('cp_auth');
  if(!authKey || authKey !== CONFIG.settings.password) {
    const p = prompt('🔒 Введите пароль доступа к калькулятору:');
    if(p === CONFIG.settings.password) localStorage.setItem('cp_auth', CONFIG.settings.password);
    else { document.body.innerHTML='<h2 style="padding:40px">Доступ ограничен</h2>'; return; }
  }

  // Elements
  const slider = document.getElementById('rkoSlider');
  const input = document.getElementById('rkoInput');
  const form = document.getElementById('calcForm');
  const errorBox = document.getElementById('errorBox');
  const modal = document.getElementById('cpModal');
  const cpContent = document.getElementById('cpContent');

  // Sync Slider <-> Input
  slider.addEventListener('input', () => {
    const v = Math.floor(Number(slider.value)/10)*10;
    slider.value = v;
    input.value = v || '';
  });
  input.addEventListener('input', () => {
    const v = Math.floor(Number(input.value.replace(/\D/g,''))/10)*10;
    slider.value = v;
    input.value = v;
  });

  // Reset
  document.getElementById('resetBtn').onclick = () => {
    form.reset(); slider.value = 0; input.value = ''; errorBox.classList.remove('visible');
  };

  // Close Modal
  document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
  window.onclick = (e) => { if(e.target === modal) modal.classList.remove('active'); };

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorBox.classList.remove('visible');

    const base = Number(input.value) || 0;
    if(base < 10) { showError('Минимальное количество утилей — 10'); return; }

    const partnerName = document.getElementById('partnerName').value.trim();
    const team = document.getElementById('managerTeam').value.trim();
    const manager = document.getElementById('managerName').value.trim();
    if(!partnerName || !team || !manager) { showError('Заполните все обязательные поля'); return; }

    // 30% rule for RKO-linked addons
    const addons = document.querySelectorAll('input[name="addon"]:checked');
    const addonCount = addons.length;
    const bonus = Math.floor(addonCount * 0.3);
    const total = Math.min(base + bonus, 200);

    // Map tools
    const available = CONFIG.tools_catalog.filter(t => t.threshold <= total);
    if(!available.length) { showError('Обратный лидген предложить не можем. Минимальный порог: 10 утилей.'); return; }

    // Determine tier
    let tier = 'Стартовый';
    if(total >= 50) tier = 'VIP';
    else if(total >= 30) tier = 'Продвинутый';

    // Render CP
    const generatedAt = new Date().toLocaleString('ru-RU');
    let html = CONFIG.templates.cp_base
      .replace('{client_name}', partnerName)
      .replace('{package_tier}', tier)
      .replace('{rko_units_base}', base)
      .replace('{rko_units_total}', total)
      .replace('{tools_count}', available.length)
      .replace('{generated_at}', generatedAt)
      .replace('{version}', CONFIG.meta.version)
      .replace('{manager_team}', team)
      .replace('{manager_name}', manager);

    // Tools cards
    const toolsHtml = available.map((t, i) => {
      return CONFIG.templates.tool_card
        .replace('{tooltip}', t.tooltip || '')
        .replace('{name}', t.name)
        .replace('{type}', t.type.toUpperCase())
        .replace('{threshold}', t.threshold)
        .replace('{link}', t.link || '#')
        .replace(/style="animation-delay: 0\.(\d+)s;"/g, ''); // cleanup
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

  function showError(msg) { errorBox.textContent = msg; errorBox.classList.add('visible'); }

  // History
  function saveHistory(data) {
    const hist = JSON.parse(localStorage.getItem('cp_history') || '[]');
    hist.unshift({ timestamp: new Date().toISOString(), ...data });
    localStorage.setItem('cp_history', JSON.stringify(hist.slice(0, CONFIG.settings.history_limit)));
  }

  // Export Buttons
  document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(cpContent.innerText).then(() => alert('✅ Текст КП скопирован в буфер'));
  };

  document.getElementById('pdfBtn').onclick = () => {
    const btn = document.getElementById('pdfBtn'); btn.disabled = true; btn.textContent = '⏳ Генерация...';
    html2pdf().set(CONFIG.settings.pdf_options).from(cpContent).save(`КП_${new Date().toISOString().slice(0,10)}.pdf`)
      .then(() => { btn.disabled = false; btn.textContent = '📥 Скачать PDF'; });
  };

  document.getElementById('mailBtn').onclick = () => {
    const subject = encodeURIComponent(`КП Обратный Лидген: ${document.getElementById('partnerName').value}`);
    const body = encodeURIComponent(`Коллеги, направляю сформированное КП.\n\nДоступно инструментов: ${cpContent.querySelectorAll('.tool-card').length}\nПакет: ${cpContent.querySelector('strong')?.nextSibling?.textContent || 'N/A'}\n\nФайл во вложении.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
});