document.addEventListener('DOMContentLoaded', () => {
  const authKey = localStorage.getItem('cp_auth');
  const requiredPass = CONFIG?.settings?.password || 'Partner2026!';
  if(!authKey || authKey !== requiredPass) {
    const p = prompt('🔒 Введите пароль доступа к калькулятору:');
    if(p === requiredPass) localStorage.setItem('cp_auth', requiredPass);
    else { document.body.innerHTML = '<h2 style="padding:40px;text-align:center;font-family:system-ui">Доступ ограничен</h2>'; return; }
  }

  function loadTeamsFromConfig() {
    const teamSelect = document.getElementById('managerTeam');
    teamSelect.innerHTML = '<option value="">Выберите команду ▼</option>';
    if (CONFIG.managers) {
      Object.keys(CONFIG.managers).forEach(teamName => {
        const option = document.createElement('option');
        option.value = teamName;
        option.textContent = teamName;
        teamSelect.appendChild(option);
      });
    }
  }
  loadTeamsFromConfig();

  const slider = document.getElementById('rkoSlider');
  const rkoInput = document.getElementById('rkoInput');
  const form = document.getElementById('calcForm');
  const errorBox = document.getElementById('errorBox');
  const modal = document.getElementById('cpModal');
  const cpContent = document.getElementById('cpContent');
  const teamSelect = document.getElementById('managerTeam');
  const nameSelect = document.getElementById('managerName');
  
  let currentSlide = 0;
  let totalSlides = 0;
  let keyHandler = null;

  function roundToStep(value, step = 10) { 
    const num = parseInt(String(value).replace(/\D/g, '')) || 0;
    return Math.floor(num / step) * step; 
  }
  function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
  function showError(msg) { errorBox.textContent = msg; errorBox.classList.add('visible'); setTimeout(() => errorBox.classList.remove('visible'), 5000); }
  
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
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); 
    syncInputToSlider(); 
  });
  rkoInput.addEventListener('blur', () => { 
    const v = roundToStep(rkoInput.value);
    if(v > 0 && v < 10) { rkoInput.value = '10'; slider.value = '10'; }
    else { syncInputToSlider(); }
  });

  function populateManagers(team) {
    nameSelect.innerHTML = '<option value="">Выберите менеджера ▼</option>';
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
    if(e.target.value) localStorage.setItem('cp_last_team', e.target.value); 
  });

  const lastTeam = localStorage.getItem('cp_last_team');
  if(lastTeam && CONFIG.managers[lastTeam]) { 
    teamSelect.value = lastTeam; 
    populateManagers(lastTeam); 
  }

  document.getElementById('resetBtn').onclick = () => {
    form.reset(); 
    slider.value = 0; 
    rkoInput.value = ''; 
    nameSelect.innerHTML = '<option value="">Сначала выберите команду ▼</option>'; 
    nameSelect.disabled = true; 
    errorBox.classList.remove('visible');
    document.querySelector('.preview-panel').innerHTML = '<div class="preview-placeholder"><p>Заполните форму и нажмите «Рассчитать»</p></div>';
  };

  function openModal(html) {
    cpContent.innerHTML = html;
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }, 10);
    currentSlide = 0;
    updateSlideUI();
    attachSlideEvents();
  }

  function closeModal() {
    modal.classList.remove('active');
    if(keyHandler) window.removeEventListener('keydown', keyHandler);
    setTimeout(() => { modal.classList.add('hidden'); document.body.style.overflow = ''; }, 200);
  }
  document.getElementById('closeModal').onclick = closeModal;
  modal.onclick = (e) => { if(e.target === modal) closeModal(); };

  function navigateTo(index) {
    currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
    updateSlideUI();
  }

  function updateSlideUI() {
    document.querySelectorAll('.slide').forEach((sl, i) => sl.classList.toggle('active', i === currentSlide));
    const counter = document.getElementById('slideCounter');
    if(counter) counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    if(prev) prev.disabled = currentSlide === 0;
    if(next) next.disabled = currentSlide === totalSlides - 1;
  }

  function attachSlideEvents() {
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    const print = document.getElementById('printBtn');
    const download = document.getElementById('downloadBtn');
    
    if(prev) prev.onclick = () => navigateTo(currentSlide - 1);
    if(next) next.onclick = () => navigateTo(currentSlide + 1);
    if(print) print.onclick = () => window.print();
    if(download) download.onclick = downloadCurrentSlide;
    
    document.querySelectorAll('.overview-tile').forEach(tile => { 
      tile.style.cursor='pointer'; 
      tile.onclick = () => navigateTo(parseInt(tile.dataset.slideIndex)); 
    });
    document.querySelectorAll('.back-to-overview').forEach(btn => btn.onclick = () => navigateTo(1));
    
    keyHandler = (e) => {
      if(!modal.classList.contains('active')) return;
      if(e.key === 'ArrowLeft') navigateTo(currentSlide - 1);
      if(e.key === 'ArrowRight') navigateTo(currentSlide + 1);
      if(e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', keyHandler);
  }

  async function downloadCurrentSlide() {
    if(typeof html2canvas === 'undefined') { alert('⚠️ Библиотека захвата не загрузилась. Проверьте интернет.'); return; }
    const btn = document.getElementById('downloadBtn');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Генерация...'; btn.disabled = true;
    try {
      const slide = document.querySelector('.slide.active');
      const canvas = await html2canvas(slide, { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0 });
      const link = document.createElement('a');
      link.download = `OL_KP_Slide_${currentSlide + 1}_${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(e) {
      console.error(e);
      alert('Не удалось создать скриншот. Попробуйте через "Сохранить как PDF"');
    } finally {
      btn.textContent = originalText; btn.disabled = false;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault(); errorBox.classList.remove('visible');
    const base = Number(rkoInput.value) || 0;
    if(base < 10) { showError('Минимальное количество утилей — 10'); rkoInput.focus(); return; }
    
    const partnerName = document.getElementById('partnerName').value.trim();
    const team = teamSelect.value; 
    const manager = nameSelect.value;
    if(!partnerName) { showError('Введите название компании-партнёра'); return; }
    if(!team) { showError('Выберите команду'); return; }
    if(!manager) { showError('Выберите ФИО менеджера'); return; }
    
    const total = Math.min(base, 200);
    const tier = total >= 50 ? 50 : Math.floor(total / 10) * 10;
    const packageName = tier <= 10 ? 'Минимальный' : tier <= 30 ? 'Стандартный' : 'VIP';
    const variants = CONFIG.tiers[String(tier)] || [];
    
    if(!variants.length) { showError('Обратный лидген предложить не можем.'); return; }
    
    const generatedAt = new Date().toLocaleString('ru-RU');
    totalSlides = 2 + variants.length;
    let slidesHTML = `
      <div class="slide slide-intro active" data-index="0">
        <div class="badge">Партнёру доступен пакет</div>
        <h1 class="package-title">${packageName}</h1>
        <div class="info-row">
          <span class="info-label">Партнёр:</span> <strong>${escapeHtml(partnerName)}</strong>
          <span class="dot"></span>
          <span class="info-label">Объём:</span> <strong>${total} утилей / кв</strong>
          <span class="dot"></span>
          <span class="info-label">Вариантов:</span> <strong>${variants.length}</strong>
        </div>
        <div class="footer-note">Сформировано: ${generatedAt} | Версия: ${CONFIG.meta.version}</div>
      </div>`;
      
    let overviewHTML = `<div class="slide slide-overview" data-index="1"><h2 class="slide-title">📦 Что можно предложить?</h2><div class="tiles-grid">`;
    variants.forEach((v, i) => {
      const detailIndex = 2 + i;
      overviewHTML += `
        <div class="overview-tile" data-slide-index="${detailIndex}">
          <div class="tile-number">Вариант ${i + 1}</div>
          <h3 class="tile-title">${v.title}</h3>
          <div class="tile-tools">${v.tools.map(tid => CONFIG.tools.find(t=>t.id===tid)?.name).filter(Boolean).join(' + ')}</div>
          <div class="tile-cta">Открыть →</div>
        </div>`;
    });
    overviewHTML += `</div></div>`;
    slidesHTML += overviewHTML;
    
    variants.forEach((v, i) => {
      const detailIndex = 2 + i;
      let tv = 0, tl = 0;
      let toolsHTML = `<div class="tools-list">`;
      v.tools.forEach(tid => {
        const tool = CONFIG.tools.find(t => t.id === tid);
        if(!tool) return;
        const m = CONFIG.tools_metrics[tid] || { description: '', views: '0', leads: '0' };
        tv += parseInt(String(m.views).replace(/\s/g, '')) || 0; 
        tl += parseInt(String(m.leads).replace(/\s/g, '')) || 0;
        toolsHTML += `
          <div class="tool-card">
            <div class="tool-header"><h3>${tool.name}</h3><span class="type-tag">${tool.type.toUpperCase()}</span></div>
            <p class="tool-desc">${m.description}</p>
            <div class="tool-metrics"><span>👁 <strong>${m.views}</strong> просмотров / мес</span><span>📩 <strong>${m.leads}</strong> заявок / мес</span></div>
            <a href="${tool.link}" target="_blank" class="tool-link">Смотреть пример →</a>
          </div>`;
      });
      toolsHTML += `</div>`;
      slidesHTML += `
        <div class="slide slide-detail" data-index="${detailIndex}">
          <button class="back-to-overview">← Назад к списку вариантов</button>
          <h2 class="slide-title">Вариант ${i + 1}: ${v.title}</h2>
          ${toolsHTML}
          <div class="variant-total">
            <h4>📊 Суммарный эффект</h4>
            <div class="metrics-row">
              <div class="metric"><span class="val">${tv.toLocaleString('ru-RU')}</span><span class="lbl">просмотров / мес</span></div>
              <div class="metric"><span class="val">${tl.toLocaleString('ru-RU')}</span><span class="lbl">заявок / мес</span></div>
            </div>
          </div>
        </div>`;
    });
    
    slidesHTML += `
      <div class="slide-controls">
        <button id="prevBtn" class="nav-btn">←</button>
        <span id="slideCounter">1 / ${totalSlides}</span>
        <button id="nextBtn" class="nav-btn">→</button>
        <button id="downloadBtn" class="nav-btn">📷 Скачать PNG</button>
        <button id="printBtn" class="nav-btn">🖨️ Печать</button>
      </div>`;
      
    openModal(slidesHTML);
    saveHistory({ partner_name: partnerName, package_name: packageName, total_units: total, variants_count: variants.length, config_version: CONFIG.meta.version });
  });

  function saveHistory(data) { 
    try { 
      const h = JSON.parse(localStorage.getItem('cp_history')||'[]'); 
      h.unshift({
        id: Date.now(), 
        timestamp: new Date().toISOString(), 
        ...data,
        manager_team: teamSelect.value,
        manager_name: nameSelect.value
      }); 
      localStorage.setItem('cp_history', JSON.stringify(h.slice(0, CONFIG.settings.history_limit))); 
    } catch(e) { console.warn('History save failed', e); } 
  }
});
