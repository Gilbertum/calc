document.addEventListener('DOMContentLoaded', () => {
  const authKey = localStorage.getItem('cp_auth');
  if(!authKey || authKey !== CONFIG.settings.password) {
    const p = prompt('🔒 Введите пароль доступа к калькулятору:');
    if(p === CONFIG.settings.password) localStorage.setItem('cp_auth', CONFIG.settings.password);
    else { document.body.innerHTML = '<h2 style="padding:40px;text-align:center;font-family:system-ui">Доступ ограничен</h2>'; return; }
  }

  const slider = document.getElementById('rkoSlider');
  const rkoInput = document.getElementById('rkoInput');
  const form = document.getElementById('calcForm');
  const errorBox = document.getElementById('errorBox');
  const modal = document.getElementById('cpModal');
  const cpContent = document.getElementById('cpContent');
  const teamSelect = document.getElementById('managerTeam');
  const nameSelect = document.getElementById('managerName');

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
    setTimeout(() => errorBox.classList.remove('visible'), 5000);
  }

  function syncSliderToInput() { rkoInput.value = roundToStep(slider.value) > 0 ? roundToStep(slider.value) : ''; }
  function syncInputToSlider() { slider.value = roundToStep(rkoInput.value); rkoInput.value = roundToStep(rkoInput.value) > 0 ? roundToStep(rkoInput.value) : ''; }

  slider.addEventListener('input', syncSliderToInput);
  rkoInput.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); syncInputToSlider(); });
  rkoInput.addEventListener('blur', () => { syncInputToSlider(); if(Number(rkoInput.value) > 0 && Number(rkoInput.value) < 10) { rkoInput.value = '10'; slider.value = '10'; } });

  function populateManagers(team) {
    nameSelect.innerHTML = '<option value="">Выберите менеджера ▼</option>';
    nameSelect.disabled = !team;
    if(team && CONFIG.managers[team]) {
      CONFIG.managers[team].forEach(name => {
        const opt = document.createElement('option');
        opt.value = name; opt.textContent = name; nameSelect.appendChild(opt);
      });
      setTimeout(() => nameSelect.focus(), 50);
    }
  }

  teamSelect.addEventListener('change', (e) => { populateManagers(e.target.value); if(e.target.value) localStorage.setItem('cp_last_team', e.target.value); });
  const lastTeam = localStorage.getItem('cp_last_team');
  if(lastTeam && CONFIG.managers[lastTeam]) { teamSelect.value = lastTeam; populateManagers(lastTeam); }

  document.getElementById('resetBtn').onclick = () => {
    form.reset(); slider.value = 0; rkoInput.value = ''; nameSelect.innerHTML = '<option value="">Сначала выберите команду ▼</option>'; nameSelect.disabled = true; errorBox.classList.remove('visible');
    document.querySelector('.preview-panel').innerHTML = '<div class="preview-placeholder"><p>Заполните форму и нажмите «Рассчитать»</p></div>';
  };

  function openModal(content) { cpContent.innerHTML = content; modal.classList.remove('hidden'); setTimeout(() => modal.classList.add('active'), 10); document.body.style.overflow = 'hidden'; }
  function closeModal() { modal.classList.remove('active'); setTimeout(() => { modal.classList.add('hidden'); document.body.style.overflow = ''; }, 200); }
  document.getElementById('closeModal').onclick = closeModal;
  modal.onclick = (e) => { if(e.target === modal) closeModal(); };
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault(); errorBox.classList.remove('visible');
    const base = Number(rkoInput.value) || 0;
    if(!base || base < 10) { showError('Минимальное количество утилей — 10'); rkoInput.focus(); return; }
    const partnerName = document.getElementById('partnerName').value.trim();
    const team = teamSelect.value; const manager = nameSelect.value;
    if(!partnerName) { showError('Введите название компании-партнёра'); return; }
    if(!team) { showError('Выберите команду'); return; }
    if(!manager) { showError('Выберите ФИО менеджера'); return; }

    const total = Math.min(base, 200);
    const tier = total >= 50 ? 50 : Math.floor(total / 10) * 10;
    const packageName = tier <= 10 ? 'Минимальный' : tier <= 30 ? 'Стандартный' : 'VIP';
    const variants = CONFIG.tiers[tier] || [];
    if(!variants.length) { showError('Обратный лидген предложить не можем.'); return; }

    const generatedAt = new Date().toLocaleString('ru-RU');
    
    // Overview
    const variantsOverviewHtml = variants.map((v, i) => {
      const toolsPreview = v.tools.map(tid => { const t = CONFIG.tools.find(x => x.id === tid); return t ? t.name : ''; }).join(' + ');
      return CONFIG.templates.variant_overview_card.replace(/{variant_id}/g, v.id).replace(/{variant_number}/g, i+1).replace(/{variant_title}/g, v.title).replace('{tools_preview}', toolsPreview);
    }).join('');

    // Detail
    const variantsDetailHtml = variants.map((v, i) => {
      let tv = 0, tl = 0;
      const toolsHtml = v.tools.map(tid => {
        const tool = CONFIG.tools.find(x => x.id === tid);
        const m = CONFIG.tools_metrics[tid] || { description: '', views: '0', leads: '0' };
        tv += Number(m.views.replace(/\s/g, '')) || 0; tl += Number(m.leads.replace(/\s/g, '')) || 0;
        return CONFIG.templates.tool_detail_card.replace('{tool_name}', tool.name).replace('{tool_type}', tool.type.toUpperCase()).replace('{tool_description}', m.description).replace('{views}', m.views).replace('{leads}', m.leads).replace('{tool_link}', tool.link);
      }).join('');
      return CONFIG.templates.variant_detail_slide.replace(/{variant_id}/g, v.id).replace(/{variant_number}/g, i+1).replace(/{variant_title}/g, v.title).replace('{tools_detailed_html}', toolsHtml).replace('{total_views}', tv.toLocaleString('ru-RU')).replace('{total_leads}', tl.toLocaleString('ru-RU'));
    }).join('');

    let html = CONFIG.templates.cp_presentation
      .replace('{client_name}', escapeHtml(partnerName))
      .replace('{package_name}', packageName)
      .replace('{rko_units_total}', total)
      .replace('{variants_count}', variants.length)
      .replace('{generated_at}', generatedAt)
      .replace('{version}', CONFIG.meta.version)
      .replace('{manager_team}', escapeHtml(team))
      .replace('{manager_name}', escapeHtml(manager))
      .replace('{variants_overview_html}', variantsOverviewHtml)
      .replace('{variants_detail_html}', variantsDetailHtml);

    openModal(html);
    setTimeout(() => {
      document.getElementById('copyFullKP').onclick = () => { navigator.clipboard.writeText(cpContent.innerText).then(() => { const b=document.getElementById('copyFullKP'); const o=b.textContent; b.textContent='✅ Скопировано!'; setTimeout(()=>b.textContent=o, 2000); }); };
      document.getElementById('mailKP').onclick = () => { const s=`Коммерческое предложение: Обратный лидген для ${partnerName}`; const b=`Коллеги, направляем КП.\nПартнёр: ${partnerName}\nПакет: ${packageName} (${total} утилей)\n\n${window.location.href}`; window.location.href=`mailto:?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`; };
      document.querySelectorAll('.variant-card').forEach(card => { card.style.cursor='pointer'; card.onclick=()=>{ const id=card.getAttribute('data-variant-id'); const sl=document.getElementById(`variant-${id}`); if(sl){sl.scrollIntoView({behavior:'smooth'}); sl.classList.add('highlight-variant'); setTimeout(()=>sl.classList.remove('highlight-variant'), 2000);} }; });
    }, 100);

    saveHistory({ partner_name: partnerName, package_name: packageName, total_units: total, variants_count: variants.length, config_version: CONFIG.meta.version });
  });

  function saveHistory(data) { try { const h=JSON.parse(localStorage.getItem('cp_history')||'[]'); h.unshift({id:Date.now(), timestamp:new Date().toISOString(), ...data}); localStorage.setItem('cp_history', JSON.stringify(h.slice(0, CONFIG.settings.history_limit))); } catch(e) {} }
});
