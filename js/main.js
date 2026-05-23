document.addEventListener('DOMContentLoaded', () => {

  // ====================================
  // 1. FIREBASE INIT (with fallback)
  // ====================================
  let db = null;
  let auth = null;
  let currentUser = null;

  try {
    const firebaseConfig = {
      apiKey: 'AIzaSyDemo_' + Math.random().toString(36).slice(2, 8),
      authDomain: 'demo-mhub.firebaseapp.com',
      projectId: 'demo-mhub',
    };
    if (typeof firebase !== 'undefined') {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      auth = firebase.auth();
      auth.signInAnonymously().catch(() => {});
      auth.onAuthStateChanged(user => {
        currentUser = user;
        const badge = document.getElementById('userBadge');
        const loginBtn = document.getElementById('loginBtn');
        if (user) {
          badge.style.display = 'inline-flex';
          document.getElementById('userName').textContent = 'Conectado';
          loginBtn.textContent = 'Cerrar sesión';
        } else {
          badge.style.display = 'none';
          loginBtn.textContent = 'Iniciar sesión';
        }
      });
    }
  } catch (e) {
    console.log('Firebase no disponible, usando localStorage');
  }

  // ====================================
  // 2. TAB NAVIGATION
  // ====================================
  const tabs = document.querySelectorAll('.nav__tab');
  const contents = document.querySelectorAll('.tab-content');

function activateTab(tabId) {
  // Role-based gate
  if (currentUser) {
    const allowedSupervisor = ['inicio', 'capacitacion', 'retroalimentacion', 'almacen', 'realidadvirtual'];
    const allowedOperador = ['capacitacion', 'entrenamiento', 'almacen', 'realidadvirtual'];
    const allowed = currentUser.role === 'supervisor' ? allowedSupervisor : allowedOperador;
    if (!allowed.includes(tabId)) return;
  }

  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
  contents.forEach(c => c.classList.toggle('active', c.id === 'tab-' + tabId));
  history.replaceState(null, '', '#' + tabId);
  if (tabId === 'inicio') initCharts();
  if (tabId === 'realidadvirtual') initVRScene();
}

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  });

  document.querySelectorAll('[data-tab]').forEach(el => {
    if (!el.classList.contains('nav__tab')) {
      el.addEventListener('click', () => activateTab(el.dataset.tab));
    }
  });

  const hash = location.hash.replace('#', '');
  if (hash && document.querySelector('[data-tab="' + hash + '"]')) {
    activateTab(hash);
  }

  // ====================================
  // 3. MOBILE MENU
  // ====================================
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  menuToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  tabs.forEach(tab => tab.addEventListener('click', () => mainNav.classList.remove('open')));

  // ====================================
  // 4. COUNTER ANIMATION
  // ====================================
  const counters = document.querySelectorAll('.card__value[data-target]');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;
    counters.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1200;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }
      requestAnimationFrame(update);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) animateCounters();
    });
  }, { threshold: 0.3 });
  observer.observe(document.getElementById('tab-inicio'));

  // ====================================
  // 5. CHARTS (Chart.js)
  // ====================================
  let chartsInited = false;
  let chartInstances = [];

  function destroyCharts() {
    chartInstances.forEach(c => c.destroy());
    chartInstances = [];
  }

  function initCharts() {
    if (chartsInited) return;
    chartsInited = true;
    destroyCharts();

    const isDark = document.body.classList.contains('dark');
    const fontColor = isDark ? '#94a3b8' : '#5a6a7a';
    const gridColor = isDark ? '#334155' : '#e2e8f0';

    Chart.defaults.color = fontColor;
    Chart.defaults.borderColor = gridColor;

    // Productivity line chart
    const ctx1 = document.getElementById('chartProductividad');
    if (ctx1) {
      const ch = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          datasets: [{
            label: 'Productividad %',
            data: [82, 85, 79, 88, 91, 87, 84],
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13,148,136,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0d9488',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, max: 100, grid: { color: gridColor } },
            x: { grid: { display: false } }
          }
        }
      });
      chartInstances.push(ch);
    }

    // Incidents doughnut chart
    const ctx2 = document.getElementById('chartIncidencias');
    if (ctx2) {
      const ch = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Fallo técnico', 'Cuello de botella', 'Seguridad', 'Mejora', 'Material'],
          datasets: [{
            data: [12, 8, 3, 6, 4],
            backgroundColor: ['#e74c3c', '#f39c12', '#e67e22', '#3498db', '#9b59b6'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, padding: 12, font: { size: 11 } }
            }
          }
        }
      });
      chartInstances.push(ch);
    }

    // Training bar chart
    const ctx3 = document.getElementById('chartCapacitacion');
    if (ctx3) {
      const ch = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: ['Ensamble', 'Soldadura', 'Pintura', 'Empaque', 'Mantenimiento'],
          datasets: [{
            label: 'Horas',
            data: [120, 95, 78, 54, 110],
            backgroundColor: ['#0d9488', '#14b8a6', '#27ae60', '#d97706', '#0284c7'],
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor } },
            x: { grid: { display: false } }
          }
        }
      });
      chartInstances.push(ch);
    }
  }

  // Re-init charts on theme change
  document.addEventListener('themeChanged', () => {
    chartsInited = false;
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id === 'tab-inicio') {
      initCharts();
    }
  });

  // Watch for tab-inicio becoming visible and init charts
  const inicioObserver = new MutationObserver(() => {
    const inicio = document.getElementById('tab-inicio');
    if (inicio && inicio.classList.contains('active') && !chartsInited) {
      initCharts();
    }
  });
  document.querySelectorAll('.tab-content').forEach(tc => {
    inicioObserver.observe(tc, { attributes: true, attributeFilter: ['class'] });
  });

  // ====================================
  // 6. THEME TOGGLE (Dark Mode)
  // ====================================
  const themeToggle = document.getElementById('themeToggle');

  function setTheme(dark) {
    document.body.classList.toggle('dark', dark);
    themeToggle.textContent = dark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    localStorage.setItem('mhub-dark', dark);
    chartsInited = false;
    document.dispatchEvent(new CustomEvent('themeChanged'));
  }

  if (localStorage.getItem('mhub-dark') === 'true') {
    setTheme(true);
  }

  themeToggle.addEventListener('click', () => {
    setTheme(!document.body.classList.contains('dark'));
  });

  // ====================================
  // 7. CHECKLIST
  // ====================================
  document.querySelectorAll('.checklist__input').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = document.querySelectorAll('.checklist__input:checked').length;
      const total = document.querySelectorAll('.checklist__input').length;
      if (checked === total) {
        const existing = document.querySelector('.checklist-msg');
        if (existing) existing.remove();
        const msg = document.createElement('p');
        msg.className = 'checklist-msg';
        msg.textContent = '\u2713 \u00a1Has completado todo el checklist de inducci\u00f3n!';
        msg.style.cssText = 'margin-top:1rem;padding:0.75rem;background:#d1fae5;color:#065f46;border-radius:8px;font-weight:600;';
        document.querySelector('.checklist').appendChild(msg);
      }
    });
  });

  // ====================================
  // 8. REPORT FORM (Firestore + localStorage)
  // ====================================
  const reportForm = document.getElementById('reportForm');
  const formSuccess = document.getElementById('formSuccess');
  const reportsBody = document.getElementById('reportsBody');
  const searchReport = document.getElementById('searchReport');
  const reportCount = document.getElementById('reportCount');

  const badgeMap = {
    'Fallo técnico': 'danger',
    'Cuello de botella': 'warning',
    'Riesgo de seguridad': 'danger',
    'Mejora sugerida': 'primary',
    'Material faltante': 'warning'
  };

  let reports = JSON.parse(localStorage.getItem('mhub-reports') || '[]');

  // Seed data
  if (reports.length === 0) {
    reports = [
      { id: 'r1', area: 'Ensamble', type: 'Cuello de botella', problem: 'Retraso en estación 3 por falta de piezas', solution: 'Reabastecer estación cada hora con lotes más pequeños', operator: 'Carlos M.', status: 'En revisión', date: new Date(Date.now() - 86400000).toISOString() },
      { id: 'r2', area: 'Soldadura', type: 'Fallo técnico', problem: 'Robot soldador presenta desviación en eje Z', solution: 'Calibrar robot y reemplazar sensor de posición', operator: 'Ana L.', status: 'Resuelto', date: new Date(Date.now() - 172800000).toISOString() },
      { id: 'r3', area: 'Pintura', type: 'Mejora sugerida', problem: 'Acumulación de humo en cabina 2', solution: 'Instalar extractor adicional de alta capacidad', operator: 'Pedro R.', status: 'En revisión', date: new Date(Date.now() - 259200000).toISOString() },
    ];
    saveReports();
  }

  function saveReports() {
    localStorage.setItem('mhub-reports', JSON.stringify(reports));
    if (db && currentUser) {
      reports.forEach(r => {
        db.collection('reportes').doc(r.id).set(r).catch(() => {});
      });
    }
  }

  function renderReports(filter = '') {
    const filtered = filter
      ? reports.filter(r =>
          r.area.toLowerCase().includes(filter) ||
          r.type.toLowerCase().includes(filter) ||
          (r.problem || '').toLowerCase().includes(filter) ||
          (r.solution || '').toLowerCase().includes(filter) ||
          r.operator.toLowerCase().includes(filter)
        )
      : reports;

    reportsBody.innerHTML = '';
    filtered.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.area}</td>
        <td><span class="badge badge--${badgeMap[r.type] || 'info'}">${r.type}</span></td>
        <td>${r.problem || r.desc || ''}</td>
        <td>${r.solution || '—'}</td>
        <td>${r.operator}</td>
        <td><span class="badge badge--${r.status === 'Resuelto' ? 'success' : 'info'}">${r.status}</span></td>
        <td><button class="delete-btn" data-id="${r.id}" aria-label="Eliminar reporte de ${r.area}">&times;</button></td>
      `;
      reportsBody.appendChild(tr);
    });

    reportCount.textContent = filtered.length + ' reporte(s)';

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        reports = reports.filter(r => r.id !== btn.dataset.id);
        saveReports();
        renderReports(searchReport.value.toLowerCase());
      });
    });
  }

  reportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const area = document.getElementById('reportArea').value;
    const type = document.getElementById('reportType').value;
    const problem = document.getElementById('reportProblem').value;
    const solution = document.getElementById('reportSolution').value;
    const operator = document.getElementById('reportOperator').value || 'Anónimo';

    const report = {
      id: 'r' + Date.now(),
      area,
      type,
      problem,
      solution,
      operator,
      status: 'Pendiente',
      date: new Date().toISOString()
    };

    reports.unshift(report);
    saveReports();
    renderReports(searchReport.value.toLowerCase());

    formSuccess.style.display = 'block';
    setTimeout(() => { formSuccess.style.display = 'none'; }, 3000);
    reportForm.reset();
  });

  searchReport.addEventListener('input', () => {
    renderReports(searchReport.value.toLowerCase());
  });

  renderReports();

  // ====================================
  // 9. EXPORT PDF
  // ====================================
  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const visibleReports = document.querySelectorAll('#reportsBody tr');
    const container = document.getElementById('reportesTable');
    const origContent = container.innerHTML;

    let html = `
      <div style="font-family:sans-serif;padding:20px">
        <h1 style="font-size:22px;color:#0d9488;margin-bottom:4px">MHub — Reporte de Retroalimentaci&oacute;n</h1>
        <p style="color:#666;font-size:13px;margin-bottom:20px">Generado el ${new Date().toLocaleDateString('es-MX')}</p>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:#0d9488;color:#fff">
              <th style="padding:8px;text-align:left">Supervisor</th>
              <th style="padding:8px;text-align:left">Incidencia</th>
              <th style="padding:8px;text-align:left">Soluci&oacute;n</th>
              <th style="padding:8px;text-align:left">&Aacute;rea</th>
              <th style="padding:8px;text-align:left">Tipo</th>
            </tr>
          </thead>
          <tbody>
    `;

    visibleReports.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 5) {
        html += '<tr style="border-bottom:1px solid #ddd">';
        html += '<td style="padding:6px 8px">' + cells[4].textContent + '</td>';
        html += '<td style="padding:6px 8px">' + cells[2].textContent + '</td>';
        html += '<td style="padding:6px 8px">' + cells[3].textContent + '</td>';
        html += '<td style="padding:6px 8px">' + cells[0].textContent + '</td>';
        html += '<td style="padding:6px 8px">' + cells[1].textContent + '</td>';
        html += '</tr>';
      }
    });

    html += '</tbody></table></div>';

    container.innerHTML = html;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'reporte-retroalimentacion-' + new Date().toISOString().slice(0, 10) + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(container).save().then(function () {
      container.innerHTML = origContent;
    }, function () {
      container.innerHTML = origContent;
    });
  });

  // ====================================
  // 10. VIRTUAL WAREHOUSE FILTERS
  // ====================================
  const filterBtns = document.querySelectorAll('.almacen-filters .btn[data-filter]');
  const toolCards = document.querySelectorAll('.tool-card');

  function updateToolCounts() {
    const visible = document.querySelectorAll('.tool-card:not(.tool-card--hidden)');
    const disp = document.querySelectorAll('.tool-card:not(.tool-card--hidden)[data-status="disponible"]');
    const uso = document.querySelectorAll('.tool-card:not(.tool-card--hidden)[data-status="uso"]');
    const mant = document.querySelectorAll('.tool-card:not(.tool-card--hidden)[data-status="mantenimiento"]');
    document.getElementById('countDisponible').textContent = disp.length;
    document.getElementById('countUso').textContent = uso.length;
    document.getElementById('countMantenimiento').textContent = mant.length;
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      if (filter === 'authorized') return;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      toolCards.forEach(card => {
        card.classList.toggle('tool-card--hidden', filter !== 'all' && card.dataset.status !== filter);
      });
      updateToolCounts();
    });
  });

  updateToolCounts();

  // ====================================
  // 11. TOOL STATUS TOGGLE (click to cycle)
  // ====================================
  toolCards.forEach(card => {
    card.addEventListener('dblclick', () => {
      if (currentUser && currentUser.role === 'supervisor') return;
      const statuses = ['disponible', 'uso', 'mantenimiento'];
      const current = card.dataset.status;
      const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];
      card.dataset.status = next;

      const statusEl = card.querySelector('.tool-card__status');
      const statusMap = {
        disponible: { text: '\u25cf Disponible', cls: 'status--disponible' },
        uso: { text: '\u25cf En uso', cls: 'status--uso' },
        mantenimiento: { text: '\u25cf En mantenimiento', cls: 'status--mantenimiento' }
      };
      statusEl.textContent = statusMap[next].text;
      statusEl.className = 'tool-card__status ' + statusMap[next].cls;

      // Update dashboard counter
      const totalDisp = document.querySelectorAll('.tool-card[data-status="disponible"]').length;
      document.querySelector('.card--metric:nth-child(3) .card__value').textContent = totalDisp;

      updateToolCounts();
    });
  });

  // ====================================
  // 12. QR SCANNER
  // ====================================
  const qrScanBtn = document.getElementById('qrScanBtn');
  const qrModal = document.getElementById('qrModal');
  const qrModalClose = document.getElementById('qrModalClose');
  const qrCancelBtn = document.getElementById('qrCancelBtn');
  const qrVideo = document.getElementById('qrVideo');
  const qrCanvas = document.getElementById('qrCanvas');
  const qrResult = document.getElementById('qrResult');
  const qrManualInput = document.getElementById('qrManualInput');
  const qrManualBtn = document.getElementById('qrManualBtn');
  let qrStream = null;
  let qrScanning = false;
  let qrScanInterval = null;
  let qrJsAvailable = false;

  function processQRCode(data) {
    if (currentUser && currentUser.role === 'supervisor') return;
    qrScanning = false;
    const toolId = data.trim();

    const tool = document.querySelector('.tool-card[data-id="' + toolId + '"]');
    if (tool) {
      const currentStatus = tool.dataset.status;
      const newStatus = currentStatus === 'disponible' ? 'uso' : 'disponible';
      tool.dataset.status = newStatus;

      const statusEl = tool.querySelector('.tool-card__status');
      const statusMap = {
        disponible: { text: '\u25cf Disponible', cls: 'status--disponible' },
        uso: { text: '\u25cf En uso', cls: 'status--uso' },
        mantenimiento: { text: '\u25cf En mantenimiento', cls: 'status--mantenimiento' }
      };
      statusEl.textContent = statusMap[newStatus].text;
      statusEl.className = 'tool-card__status ' + statusMap[newStatus].cls;

      const icon = newStatus === 'disponible' ? '\u2705' : '\u26A0\uFE0F';
      qrResult.innerHTML = '<p style="color:var(--success);font-weight:700">' + icon + ' Herramienta ' + toolId + ' marcada como <strong>' + (newStatus === 'disponible' ? 'Disponible' : 'En uso') + '</strong></p>';

      const totalDisp = document.querySelectorAll('.tool-card[data-status="disponible"]').length;
      document.querySelector('.card--metric:nth-child(3) .card__value').textContent = totalDisp;
      updateToolCounts();
    } else {
      qrResult.innerHTML = '<p style="color:var(--danger)">Herramienta no encontrada: ' + toolId + '</p>';
    }

    setTimeout(() => stopQRScanner(), 2000);
  }

  function scanQRCode() {
    if (!qrScanning || !qrJsAvailable) return;
    try {
      if (qrVideo.readyState >= qrVideo.HAVE_CURRENT_DATA) {
        const canvas = qrCanvas;
        canvas.width = qrVideo.videoWidth || 640;
        canvas.height = qrVideo.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(qrVideo, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });
        if (code && code.data) {
          processQRCode(code.data);
        }
      }
    } catch (e) {}
  }

  function startQRScanner() {
    qrResult.innerHTML = '<p style="color:var(--text-light)">Iniciando c\u00e1mara...</p>';
    qrJsAvailable = typeof jsQR !== 'undefined';
    if (!qrJsAvailable) {
      qrResult.innerHTML = '<p style="color:var(--warning)">Biblioteca QR no disponible. Ingresa el ID manualmente abajo.</p>';
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then(stream => {
        qrStream = stream;
        qrVideo.srcObject = stream;
        qrVideo.setAttribute('playsinline', '');
        qrVideo.muted = true;
        qrVideo.play();
        qrScanning = true;
        if (qrJsAvailable) {
          qrVideo.addEventListener('playing', () => {
            qrResult.innerHTML = '<p style="color:var(--text-light)">Escaneando QR...</p>';
            qrScanInterval = setInterval(scanQRCode, 300);
          });
        }
      })
      .catch(() => {
        qrResult.innerHTML = '<p style="color:var(--danger)">No se pudo acceder a la c\u00e1mara. Ingresa el ID manualmente.</p>';
      });
  }

  function stopQRScanner() {
    qrScanning = false;
    if (qrScanInterval) { clearInterval(qrScanInterval); qrScanInterval = null; }
    if (qrStream) {
      qrStream.getTracks().forEach(t => t.stop());
      qrStream = null;
    }
    qrVideo.srcObject = null;
    qrModal.classList.remove('open');
  }

  function handleManualQR() {
    const id = qrManualInput.value.trim().toUpperCase();
    if (!id) {
      qrResult.innerHTML = '<p style="color:var(--warning)">Ingresa un ID de herramienta (ej: T-102)</p>';
      return;
    }
    processQRCode(id);
  }

  qrScanBtn.addEventListener('click', () => {
    qrManualInput.value = '';
    qrModal.classList.add('open');
    startQRScanner();
  });

  qrManualBtn.addEventListener('click', handleManualQR);
  qrManualInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleManualQR(); });
  qrModalClose.addEventListener('click', stopQRScanner);
  qrCancelBtn.addEventListener('click', stopQRScanner);

  // ====================================
  // 13. LOGIN MODAL
  // ====================================
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const loginModalClose = document.getElementById('loginModalClose');
  const loginForm = document.getElementById('loginForm');
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPass');
  const loginError = document.getElementById('loginError');

  const CREDENTIALS = {
    supervisor: { password: 'sup123', label: 'Supervisor' },
    operador: { password: 'ope123', label: 'Operador' }
  };

  function applyRoleRestrictions(role) {
    const tabIds = document.querySelectorAll('.nav__tab');
    const allowedSupervisor = ['inicio', 'capacitacion', 'retroalimentacion', 'almacen', 'realidadvirtual'];
    const allowedOperador = ['capacitacion', 'entrenamiento', 'almacen', 'realidadvirtual'];
    const allowed = role === 'supervisor' ? allowedSupervisor : allowedOperador;

    tabIds.forEach(tab => {
      const tabId = tab.dataset.tab;
      const isAllowed = allowed.includes(tabId);
      tab.style.display = isAllowed ? '' : 'none';
      if (tab.classList.contains('active') && !isAllowed) {
        tab.classList.remove('active');
      }
    });

    // Activate first allowed tab
    const firstAllowed = [...tabIds].find(t => allowed.includes(t.dataset.tab));
    if (firstAllowed) activateTab(firstAllowed.dataset.tab);

    // Warehouse restrictions
    const qrScanBtn = document.getElementById('qrScanBtn');
    const faceAuthStartBtn = document.getElementById('faceAuthStartBtn');
    const toolCards = document.querySelectorAll('.tool-card');
    const addPersonBtn = document.getElementById('addPersonBtn');
    const personnelSection = document.querySelector('.personnel-section');

    if (role === 'supervisor') {
      // Can only register persons, NOT check out tools
      if (qrScanBtn) qrScanBtn.style.display = 'none';
      if (faceAuthStartBtn) faceAuthStartBtn.style.display = 'none';
      toolCards.forEach(c => c.style.pointerEvents = 'none');
      if (addPersonBtn) addPersonBtn.style.display = '';
      if (personnelSection) personnelSection.style.display = '';
    } else {
      // Can only check out tools, NOT register persons
      if (qrScanBtn) qrScanBtn.style.display = '';
      if (faceAuthStartBtn) faceAuthStartBtn.style.display = '';
      toolCards.forEach(c => c.style.pointerEvents = '');
      if (addPersonBtn) addPersonBtn.style.display = 'none';
      if (personnelSection) personnelSection.style.display = 'none';
    }
  }

  function clearRoleRestrictions() {
    document.querySelectorAll('.nav__tab').forEach(t => {
      t.style.display = '';
      if (!t.classList.contains('active') && t.dataset.tab === 'inicio') {
        t.classList.add('active');
      }
    });
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const inicio = document.getElementById('tab-inicio');
    if (inicio) inicio.classList.add('active');

    const qrScanBtn = document.getElementById('qrScanBtn');
    const faceAuthStartBtn = document.getElementById('faceAuthStartBtn');
    if (qrScanBtn) qrScanBtn.style.display = '';
    if (faceAuthStartBtn) faceAuthStartBtn.style.display = '';
    document.querySelectorAll('.tool-card').forEach(c => c.style.pointerEvents = '');
    const addPersonBtn = document.getElementById('addPersonBtn');
    const personnelSection = document.querySelector('.personnel-section');
    if (addPersonBtn) addPersonBtn.style.display = '';
    if (personnelSection) personnelSection.style.display = '';
  }

  loginBtn.addEventListener('click', () => {
    if (currentUser) {
      currentUser = null;
      document.getElementById('userBadge').style.display = 'none';
      loginBtn.textContent = 'Iniciar sesión';
      clearRoleRestrictions();
      loginForm.reset();
      loginError.style.display = 'none';
    } else {
      loginModal.classList.add('open');
    }
  });

  loginModalClose.addEventListener('click', () => loginModal.classList.remove('open'));
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.remove('open');
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = loginUser.value.trim().toLowerCase();
    const pass = loginPass.value;
    const cred = CREDENTIALS[user];

    if (cred && cred.password === pass) {
      currentUser = { uid: 'demo-' + user, role: user };
      document.getElementById('userBadge').style.display = 'inline-flex';
      document.getElementById('userName').textContent = cred.label;
      loginBtn.textContent = 'Cerrar sesión';
      loginError.style.display = 'none';
      loginModal.classList.remove('open');
      applyRoleRestrictions(user);
    } else {
      loginError.style.display = '';
    }
  });

  loginModalClose.addEventListener('click', () => loginModal.classList.remove('open'));
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.remove('open');
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = loginUser.value.trim().toLowerCase();
    const pass = loginPass.value;
    const cred = CREDENTIALS[user];

    if (cred && cred.password === pass) {
      currentUser = { uid: 'demo-' + user, role: user };
      document.getElementById('userBadge').style.display = 'inline-flex';
      document.getElementById('userName').textContent = cred.label;
      loginBtn.textContent = 'Cerrar sesión';
      loginError.style.display = 'none';
      loginModal.classList.remove('open');
      applyRoleRestrictions(user);
    } else {
      loginError.style.display = '';
    }
  });

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        if (m.id === 'faceRecModal') stopFaceRecCamera();
        else if (m.id === 'registerPersonModal') stopRegisterCamera();
        else if (m.id === 'personDetailModal') personDetailModal.classList.remove('open');
        else m.classList.remove('open');
      }
    });
  });

  // ====================================
  // 14. VR SCENE INIT (trigger A-Frame)
  // ====================================
  function initVRScene() {
    const container = document.getElementById('vrContainer');
    if (container && !container.querySelector('a-scene')) {
      // A-Frame auto-initializes when <a-scene> is in the DOM
      // We just ensure the container exists and is visible
    }
  }

  // ====================================
  // 15. FACE RECOGNITION SYSTEM
  // ====================================

  const FACE_MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
  let faceApiReady = false;
  let faceModelsLoading = false;
  let recognizedPerson = null;

  // --- Person management ---
  function getPersons() {
    return JSON.parse(localStorage.getItem('mhub-persons') || '[]');
  }

  function savePersons(persons) {
    localStorage.setItem('mhub-persons', JSON.stringify(persons));
  }

  // --- Load face-api models ---
  async function initFaceApi() {
    if (faceApiReady || faceModelsLoading) return;
    if (typeof faceapi === 'undefined') {
      console.warn('face-api.js no disponible');
      return;
    }
    faceModelsLoading = true;
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL);
      faceApiReady = true;
      console.log('Face API listo');
    } catch (e) {
      console.warn('Error cargando modelos faciales:', e);
    } finally {
      faceModelsLoading = false;
    }
  }

  // --- Get face descriptor from video ---
  async function getFaceDescriptor(videoEl) {
    if (!faceApiReady) return null;
    const det = await faceapi.detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
      .withFaceLandmarks().withFaceDescriptor();
    return det ? det.descriptor : null;
  }

  // --- Match face against registered persons ---
  function matchFace(descriptor) {
    const persons = getPersons();
    if (!persons.length) return null;
    const threshold = 0.45;
    let bestMatch = null;
    let bestDistance = Infinity;
    for (const p of persons) {
      if (!p.descriptor) continue;
      const d = new Float32Array(Object.values(p.descriptor));
      const dist = faceapi.euclideanDistance(descriptor, d);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestMatch = p;
      }
    }
    return bestDistance < threshold ? bestMatch : null;
  }

  // --- Draw face detection overlay ---
  function drawFaceOverlay(videoEl, canvasEl) {
    if (!faceApiReady) return;
    const displaySize = { width: videoEl.clientWidth || videoEl.width, height: videoEl.clientHeight || videoEl.height };
    canvasEl.width = displaySize.width;
    canvasEl.height = displaySize.height;
    const ctx = canvasEl.getContext('2d');
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    faceapi.detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
      .withFaceLandmarks().then(det => {
        if (det) {
          const resized = faceapi.resizeResults(det, displaySize);
          const box = resized.detection.box;
          ctx.strokeStyle = '#0d9488';
          ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
          ctx.fillStyle = 'rgba(13,148,136,0.2)';
          ctx.fillRect(box.x, box.y, box.width, box.height);
        }
      }).catch(() => {});
  }

  // --- Face Recognition Modal ---
  const faceRecModal = document.getElementById('faceRecModal');
  const faceRecVideo = document.getElementById('faceRecVideo');
  const faceRecOverlay = document.getElementById('faceRecOverlay');
  const faceRecStatus = document.getElementById('faceRecStatus');
  const faceRecCaptureBtn = document.getElementById('faceRecCaptureBtn');
  const faceRecCancelBtn = document.getElementById('faceRecCancelBtn');
  const faceRecModalClose = document.getElementById('faceRecModalClose');
  let faceRecStream = null;
  let faceRecDrawInterval = null;

  function startFaceRecCamera() {
    faceRecStatus.innerHTML = '<span class="face-status-msg__icon">&#128161;</span><span>Iniciando c&#225;mara...</span>';
    faceRecCaptureBtn.disabled = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then(stream => {
        faceRecStream = stream;
        faceRecVideo.srcObject = stream;
        faceRecVideo.play();
        if (faceApiReady) {
          faceRecStatus.innerHTML = '<span class="face-status-msg__icon">&#9989;</span><span>C&#225;mara lista. Presiona "Reconocer".</span>';
          faceRecCaptureBtn.disabled = false;
          faceRecDrawInterval = setInterval(() => drawFaceOverlay(faceRecVideo, faceRecOverlay), 200);
        } else {
          faceRecStatus.innerHTML = '<span class="face-status-msg__icon">&#9203;</span><span>Cargando modelos faciales...</span>';
          initFaceApi().then(() => {
            faceRecStatus.innerHTML = '<span class="face-status-msg__icon">&#9989;</span><span>C&#225;mara lista. Presiona "Reconocer".</span>';
            faceRecCaptureBtn.disabled = false;
            faceRecDrawInterval = setInterval(() => drawFaceOverlay(faceRecVideo, faceRecOverlay), 200);
          });
        }
      })
      .catch(() => {
        faceRecStatus.innerHTML = '<span class="face-status-msg__icon">&#10060;</span><span>No se pudo acceder a la c&#225;mara</span>';
        faceRecCaptureBtn.disabled = true;
      });
  }

  function stopFaceRecCamera() {
    if (faceRecDrawInterval) { clearInterval(faceRecDrawInterval); faceRecDrawInterval = null; }
    if (faceRecStream) {
      faceRecStream.getTracks().forEach(t => t.stop());
      faceRecStream = null;
    }
    faceRecVideo.srcObject = null;
    faceRecModal.classList.remove('open');
  }

  function showFaceRecModal() {
    faceRecModal.classList.add('open');
    setTimeout(startFaceRecCamera, 300);
  }

  async function handleFaceRecognition() {
    if (!faceApiReady) {
      faceRecStatus.innerHTML = '<span class="face-status-msg__icon">&#9203;</span><span>Cargando modelos...</span>';
      await initFaceApi();
      if (!faceApiReady) {
        faceRecStatus.innerHTML = '<span class="face-status-msg__icon">&#10060;</span><span>Error: modelos faciales no disponibles</span>';
        return;
      }
    }
    const descriptor = await getFaceDescriptor(faceRecVideo);
    if (!descriptor) {
      faceRecStatus.innerHTML = '<span class="face-status-msg__icon">&#9888;</span><span>No se detect&#243; un rostro. Aseg&#250;rate de estar frente a la c&#225;mara.</span>';
      return;
    }
    const match = matchFace(descriptor);
    if (match) {
      recognizedPerson = match;
      localStorage.setItem('mhub-recognized', JSON.stringify({ id: match.id, name: match.name }));
      faceRecStatus.innerHTML = '<span class="face-status-msg__icon" style="font-size:2rem">&#9989;</span><span style="font-size:1.1rem;font-weight:700;color:var(--success)">&#161;Bienvenido, ' + match.name + '!</span>';
      updateWarehouseAuthUI(match);
      setTimeout(stopFaceRecCamera, 2000);
    } else {
      faceRecStatus.innerHTML = '<span class="face-status-msg__icon">&#10060;</span><span>Rostro no reconocido. No est&#225;s autorizado para acceder al almac&#233;n.</span>';
    }
  }

  faceRecCaptureBtn.addEventListener('click', handleFaceRecognition);
  faceRecCancelBtn.addEventListener('click', stopFaceRecCamera);
  faceRecModalClose.addEventListener('click', stopFaceRecCamera);

  // --- Register Person Modal ---
  const registerPersonModal = document.getElementById('registerPersonModal');
  const registerFaceVideo = document.getElementById('registerFaceVideo');
  const registerFaceOverlay = document.getElementById('registerFaceOverlay');
  const registerFaceStatus = document.getElementById('registerFaceStatus');
  const registerFaceCaptureBtn = document.getElementById('registerFaceCaptureBtn');
  const registerFaceCancelBtn = document.getElementById('registerFaceCancelBtn');
  const registerPersonClose = document.getElementById('registerPersonClose');
  const personNameInput = document.getElementById('personNameInput');
  const registerStep1 = document.getElementById('registerStep1');
  const registerStep2 = document.getElementById('registerStep2');
  const registerPersonNameDisplay = document.getElementById('registerPersonNameDisplay');
  const registerToolsGrid = document.getElementById('registerToolsGrid');
  const registerSaveBtn = document.getElementById('registerSaveBtn');
  const registerSkipBtn = document.getElementById('registerSkipBtn');
  let registerStream = null;
  let registerDrawInterval = null;
  let pendingPersonData = null;

  function startRegisterCamera() {
    registerStep1.style.display = '';
    registerStep2.style.display = 'none';
    pendingPersonData = null;
    registerFaceStatus.innerHTML = '<span class="face-status-msg__icon">&#128161;</span><span>Iniciando c&#225;mara...</span>';
    registerFaceCaptureBtn.disabled = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then(stream => {
        registerStream = stream;
        registerFaceVideo.srcObject = stream;
        registerFaceVideo.play();
        if (faceApiReady) {
          registerFaceStatus.innerHTML = '<span class="face-status-msg__icon">&#9989;</span><span>C&#225;mara lista. Presiona "Capturar Rostro".</span>';
          registerFaceCaptureBtn.disabled = false;
          registerDrawInterval = setInterval(() => drawFaceOverlay(registerFaceVideo, registerFaceOverlay), 200);
        } else {
          registerFaceStatus.innerHTML = '<span class="face-status-msg__icon">&#9203;</span><span>Cargando modelos faciales...</span>';
          initFaceApi().then(() => {
            registerFaceStatus.innerHTML = '<span class="face-status-msg__icon">&#9989;</span><span>C&#225;mara lista. Presiona "Capturar Rostro".</span>';
            registerFaceCaptureBtn.disabled = false;
            registerDrawInterval = setInterval(() => drawFaceOverlay(registerFaceVideo, registerFaceOverlay), 200);
          });
        }
      })
      .catch(() => {
        registerFaceStatus.innerHTML = '<span class="face-status-msg__icon">&#10060;</span><span>No se pudo acceder a la c&#225;mara</span>';
        registerFaceCaptureBtn.disabled = true;
      });
  }

  function stopRegisterCamera(closeModal = true) {
    if (registerDrawInterval) { clearInterval(registerDrawInterval); registerDrawInterval = null; }
    if (registerStream) {
      registerStream.getTracks().forEach(t => t.stop());
      registerStream = null;
    }
    registerFaceVideo.srcObject = null;
    if (closeModal) registerPersonModal.classList.remove('open');
  }

  function renderToolSelection() {
    const allTools = document.querySelectorAll('.tool-card');
    let html = '';
    allTools.forEach(tool => {
      const toolId = tool.dataset.id;
      const toolName = tool.querySelector('.tool-card__name').textContent;
      html += `
        <label class="auth-tool-item">
          <input type="checkbox" class="auth-tool-checkbox" data-tool-id="${toolId}">
          <span>${toolName}</span>
        </label>
      `;
    });
    registerToolsGrid.innerHTML = html;
  }

  function getSelectedTools() {
    const checks = registerToolsGrid.querySelectorAll('.auth-tool-checkbox:checked');
    return Array.from(checks).map(cb => cb.dataset.toolId);
  }

  async function handleRegisterFace() {
    const name = personNameInput.value.trim();
    if (!name) {
      registerFaceStatus.innerHTML = '<span class="face-status-msg__icon">&#9888;</span><span>Ingresa un nombre primero.</span>';
      return;
    }
    if (!faceApiReady) {
      registerFaceStatus.innerHTML = '<span class="face-status-msg__icon">&#9203;</span><span>Cargando modelos...</span>';
      await initFaceApi();
    }
    const descriptor = await getFaceDescriptor(registerFaceVideo);
    if (!descriptor) {
      registerFaceStatus.innerHTML = '<span class="face-status-msg__icon">&#9888;</span><span>No se detect&#243; un rostro. Aseg&#250;rate de estar frente a la c&#225;mara.</span>';
      return;
    }

    pendingPersonData = {
      id: 'p_' + Date.now(),
      name: name,
      descriptor: Array.from(descriptor),
      authorizedTools: [],
      createdAt: new Date().toISOString()
    };

    stopRegisterCamera(false);
    registerPersonNameDisplay.textContent = name;
    renderToolSelection();
    registerStep1.style.display = 'none';
    registerStep2.style.display = '';
  }

  function handleRegisterSave() {
    if (!pendingPersonData) return;
    const selected = getSelectedTools();
    pendingPersonData.authorizedTools = selected;
    const persons = getPersons();
    persons.push(pendingPersonData);
    savePersons(persons);
    const name = pendingPersonData.name;
    renderPersonGrid();
    pendingPersonData = null;
    registerPersonModal.classList.remove('open');
    if (recognizedPerson) {
      updateWarehouseAuthUI(recognizedPerson);
    }
    alert(name + ' registrado exitosamente con ' + selected.length + ' herramienta(s) autorizada(s).');
  }

  function handleRegisterSkip() {
    if (!pendingPersonData) return;
    pendingPersonData.authorizedTools = [];
    const persons = getPersons();
    persons.push(pendingPersonData);
    savePersons(persons);
    const name = pendingPersonData.name;
    renderPersonGrid();
    pendingPersonData = null;
    registerPersonModal.classList.remove('open');
    alert(name + ' registrado sin herramientas. Puedes asignarlas despu\u00e9s con el bot\u00f3n Editar.');
  }

  registerFaceCaptureBtn.addEventListener('click', handleRegisterFace);
  registerSaveBtn.addEventListener('click', handleRegisterSave);
  registerSkipBtn.addEventListener('click', handleRegisterSkip);
  registerFaceCancelBtn.addEventListener('click', stopRegisterCamera);
  registerPersonClose.addEventListener('click', stopRegisterCamera);

  // --- Person Grid ---
  function renderPersonGrid() {
    const grid = document.getElementById('personGrid');
    const empty = document.getElementById('personnelEmpty');
    const persons = getPersons();
    if (!persons.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    grid.innerHTML = persons.map(p => `
      <div class="person-card" data-person-id="${p.id}">
        <div class="person-card__avatar">&#128100;</div>
        <div class="person-card__name">${p.name}</div>
        <div class="person-card__tools">${p.authorizedTools.length} herramienta(s)</div>
        <button class="btn btn--sm btn--outline person-card__edit" data-person-id="${p.id}">Editar</button>
      </div>
    `).join('');

    grid.querySelectorAll('.person-card__edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPersonDetail(btn.dataset.personId);
      });
    });
  }

  // --- Person Detail Modal ---
  const personDetailModal = document.getElementById('personDetailModal');
  const personDetailClose = document.getElementById('personDetailClose');
  const personDetailName = document.getElementById('personDetailName');
  const personDetailFace = document.getElementById('personDetailFace');
  const authToolsList = document.getElementById('authToolsList');
  const deletePersonBtn = document.getElementById('deletePersonBtn');
  let currentDetailPersonId = null;

  function showPersonDetail(personId) {
    const persons = getPersons();
    const p = persons.find(x => x.id === personId);
    if (!p) return;
    currentDetailPersonId = personId;
    personDetailName.textContent = p.name;
    personDetailFace.innerHTML = '<span style="font-size:3rem">&#128100;</span>';

    const allTools = document.querySelectorAll('.tool-card');
    let html = '';
    allTools.forEach(tool => {
      const toolId = tool.dataset.id;
      const toolName = tool.querySelector('.tool-card__name').textContent;
      const checked = p.authorizedTools.includes(toolId) ? 'checked' : '';
      html += `
        <label class="auth-tool-item">
          <input type="checkbox" class="auth-tool-checkbox" data-tool-id="${toolId}" ${checked}>
          <span>${toolName}</span>
        </label>
      `;
    });
    authToolsList.innerHTML = html;

    authToolsList.querySelectorAll('.auth-tool-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const persons = getPersons();
        const person = persons.find(x => x.id === currentDetailPersonId);
        if (!person) return;
        const toolId = cb.dataset.toolId;
        if (cb.checked) {
          if (!person.authorizedTools.includes(toolId)) person.authorizedTools.push(toolId);
        } else {
          person.authorizedTools = person.authorizedTools.filter(id => id !== toolId);
        }
        savePersons(persons);
        renderPersonGrid();
        if (recognizedPerson && recognizedPerson.id === currentDetailPersonId) {
          recognizedPerson = person;
          localStorage.setItem('mhub-recognized', JSON.stringify({ id: person.id, name: person.name }));
          updateWarehouseAuthUI(person);
        }
      });
    });

    personDetailModal.classList.add('open');
  }

  deletePersonBtn.addEventListener('click', () => {
    if (!currentDetailPersonId) return;
    if (!confirm('Eliminar esta persona?')) return;
    let persons = getPersons();
    persons = persons.filter(p => p.id !== currentDetailPersonId);
    savePersons(persons);
    if (recognizedPerson && recognizedPerson.id === currentDetailPersonId) {
      recognizedPerson = null;
      localStorage.removeItem('mhub-recognized');
      updateWarehouseAuthUI(null);
    }
    personDetailModal.classList.remove('open');
    renderPersonGrid();
  });

  personDetailClose.addEventListener('click', () => personDetailModal.classList.remove('open'));

  // --- Warehouse Auth UI ---
  function updateWarehouseAuthUI(person) {
    const icon = document.getElementById('faceAuthIcon');
    const title = document.getElementById('faceAuthTitle');
    const sub = document.getElementById('faceAuthSub');
    const startBtn = document.getElementById('faceAuthStartBtn');
    const logoutBtn = document.getElementById('faceAuthLogoutBtn');
    const authMsg = document.getElementById('authToolsMsg');
    const authText = document.getElementById('authToolsText');
    const filterAuthBtn = document.getElementById('filterAuthorizedBtn');

    if (person) {
      icon.textContent = '\u2705';
      title.textContent = 'Bienvenido, ' + person.name;
      sub.textContent = 'Acceso verificado. Puedes sacar las herramientas autorizadas.';
      startBtn.style.display = 'none';
      logoutBtn.style.display = '';

      const toolCount = person.authorizedTools.length;
      authMsg.style.display = toolCount ? '' : 'none';
      authText.textContent = toolCount ? 'Tienes ' + toolCount + ' herramienta(s) autorizada(s). Usa el filtro "Mis autorizadas" para verlas.' : '';
      filterAuthBtn.style.display = toolCount ? '' : 'none';
      filterAuthBtn.disabled = false;

      updateAuthBadges(person);
    } else {
      icon.textContent = '\uD83D\uDD12';
      title.textContent = 'Acceso no verificado';
      sub.textContent = 'Presiona "Iniciar reconocimiento facial" para acceder al almac\u00e9n';
      startBtn.style.display = '';
      logoutBtn.style.display = 'none';
      authMsg.style.display = 'none';
      filterAuthBtn.style.display = 'none';
      filterAuthBtn.disabled = true;

      updateAuthBadges(null);
    }
    updateToolCounts();
  }

  function updateAuthBadges(person) {
    document.querySelectorAll('.tool-card__auth-badge').forEach(badge => {
      badge.style.display = 'none';
    });
    if (!person) return;
    person.authorizedTools.forEach(toolId => {
      const card = document.querySelector('.tool-card[data-id="' + toolId + '"]');
      if (card) {
        const badge = card.querySelector('.tool-card__auth-badge');
        if (badge) badge.style.display = '';
      }
    });
  }

  // --- Face Auth Start ---
  document.getElementById('faceAuthStartBtn').addEventListener('click', () => {
    if (!getPersons().length) {
      alert('No hay personal registrado. Agrega una persona primero.');
      document.getElementById('addPersonBtn').click();
      return;
    }
    initFaceApi().then(showFaceRecModal);
  });

  document.getElementById('faceAuthLogoutBtn').addEventListener('click', () => {
    recognizedPerson = null;
    localStorage.removeItem('mhub-recognized');
    updateWarehouseAuthUI(null);
    document.querySelectorAll('.tool-card').forEach(c => c.classList.remove('tool-card--hidden'));
  });

  document.getElementById('addPersonBtn').addEventListener('click', () => {
    pendingPersonData = null;
    registerStep2.style.display = 'none';
    registerStep1.style.display = '';
    personNameInput.value = '';
    registerFaceStatus.innerHTML = '<span class="face-status-msg__icon">&#128161;</span><span>Preparando c\u00e1mara...</span>';
    registerPersonModal.classList.add('open');
    setTimeout(startRegisterCamera, 300);
  });

  // --- Auto restore session ---
  const savedPerson = localStorage.getItem('mhub-recognized');
  if (savedPerson) {
    try {
      const data = JSON.parse(savedPerson);
      const persons = getPersons();
      const match = persons.find(p => p.id === data.id);
      if (match) {
        recognizedPerson = match;
        initFaceApi();
        setTimeout(() => updateWarehouseAuthUI(match), 500);
      } else {
        localStorage.removeItem('mhub-recognized');
      }
    } catch (e) {
      localStorage.removeItem('mhub-recognized');
    }
  } else {
    initFaceApi();
  }

  // Auto-trigger face rec on tab switch to almacen (if not recognized)
  const almacenTabObserver = new MutationObserver(() => {
    const almacen = document.getElementById('tab-almacen');
    if (almacen && almacen.classList.contains('active') && !recognizedPerson) {
      const startBtn = document.getElementById('faceAuthStartBtn');
      if (startBtn.style.display !== 'none' && getPersons().length) {
        startBtn.style.animation = 'pulse 1.5s ease infinite';
      }
    }
  });
  document.querySelectorAll('.tab-content').forEach(tc => {
    almacenTabObserver.observe(tc, { attributes: true, attributeFilter: ['class'] });
  });

  // Authorized tools filter
  document.getElementById('filterAuthorizedBtn').addEventListener('click', function () {
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const authorized = recognizedPerson ? recognizedPerson.authorizedTools : [];
    toolCards.forEach(card => {
      const isAuthorized = authorized.includes(card.dataset.id);
      card.classList.toggle('tool-card--hidden', !isAuthorized);
    });
    updateToolCounts();
  });

  // Deactivate authorized filter when switching to other filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.filter !== 'authorized') {
        document.getElementById('filterAuthorizedBtn').classList.remove('active');
      }
    });
  });

  renderPersonGrid();

  // ====================================
  // 14. VR COMPONENTS (A-Frame)
  // ====================================
  if (typeof AFRAME !== 'undefined') {

    // Click feedback: pulse + flash
    AFRAME.registerComponent('click-feedback', {
      init: function () {
        this.el.addEventListener('click', () => {
          const el = this.el;
          // Get current scale at click time
          const scale = el.getComputedAttribute('scale') || { x: 1, y: 1, z: 1 };
          el.setAttribute('scale', {
            x: scale.x * 0.75,
            y: scale.y * 0.75,
            z: scale.z * 0.75
          });
          // Flash emissive
          const meshes = [];
          if (el.hasAttribute('material')) meshes.push(el);
          meshes.push(...el.querySelectorAll('[material]'));
          meshes.forEach(m => {
            const origEmissive = m.getAttribute('material').emissive || '#000000';
            m.setAttribute('material', 'emissive', '#f1c40f');
            m.setAttribute('material', 'emissiveIntensity', '0.6');
            setTimeout(() => {
              m.setAttribute('material', 'emissive', origEmissive);
              m.setAttribute('material', 'emissiveIntensity', '0');
            }, 200);
          });
          setTimeout(() => {
            el.setAttribute('scale', scale);
          }, 300);
        });
      }
    });

    // Hover emissive: adds glow on mouseenter/mouseleave for an entity and its children
    AFRAME.registerComponent('hover-glow', {
      schema: {
        color: { type: 'color', default: '#0d9488' },
        intensity: { type: 'number', default: 0.4 }
      },
      init: function () {
        const el = this.el;
        const color = this.data.color;
        const intensity = this.data.intensity;

        el.addEventListener('mouseenter', () => {
          const meshes = [];
          if (el.hasAttribute('material')) meshes.push(el);
          meshes.push(...el.querySelectorAll('[material]'));
          meshes.forEach(m => {
            m.setAttribute('material', 'emissive', color);
            m.setAttribute('material', 'emissiveIntensity', intensity);
          });
        });
        el.addEventListener('mouseleave', () => {
          const meshes = [];
          if (el.hasAttribute('material')) meshes.push(el);
          meshes.push(...el.querySelectorAll('[material]'));
          meshes.forEach(m => {
            m.setAttribute('material', 'emissive', '#000000');
            m.setAttribute('material', 'emissiveIntensity', 0);
          });
        });
      }
    });

    // Toggle panel: spawn a floating panel near the player
    AFRAME.registerComponent('toggle-panel', {
      schema: {
        title: { type: 'string', default: 'Panel' }
      },
      init: function () {
        this.panelEl = null;
        this.el.addEventListener('click', () => {
          this.toggle();
        });
      },
      toggle: function () {
        if (this.panelEl) {
          this.close();
        } else {
          this.open();
        }
      },
      open: function () {
        const rig = document.getElementById('playerRig');
        if (!rig) return;

        const rigPos = rig.getAttribute('position');
        const rigRot = rig.getAttribute('rotation');

        // Create panel 2m in front of player
        const panel = document.createElement('a-entity');
        panel.setAttribute('class', 'clickable');
        panel.setAttribute('position', { x: rigPos.x, y: rigPos.y + 0.2, z: rigPos.z - 2.5 });
        panel.setAttribute('look-at', '#playerCamera');
        panel.setAttribute('scale', '0 0 0');

        const bg = document.createElement('a-plane');
        bg.setAttribute('width', '2.5');
        bg.setAttribute('height', '2');
        bg.setAttribute('color', '#1a1a2e');
        bg.setAttribute('opacity', '0.95');
        bg.setAttribute('shadow', '');
        bg.setAttribute('radius', '0.08');

        const panelColor = this.el.getAttribute('data-color') || '#0d9488';

        const header = document.createElement('a-plane');
        header.setAttribute('position', '0 0.85 0.01');
        header.setAttribute('width', '2.3');
        header.setAttribute('height', '0.3');
        header.setAttribute('color', panelColor);
        header.setAttribute('radius', '0.05');

        const titleText = document.createElement('a-text');
        const titleAttr = this.data.title || 'INFORMACION';
        titleText.setAttribute('value', titleAttr);
        titleText.setAttribute('position', '0 0.85 0.02');
        titleText.setAttribute('color', 'white');
        titleText.setAttribute('align', 'center');
        titleText.setAttribute('width', '2.2');

        panel.appendChild(bg);
        panel.appendChild(header);
        panel.appendChild(titleText);

        // Parse data-lines attribute manually (| separated, since A-Frame array schema splits on commas)
        const raw = this.el.getAttribute('data-lines') || '';
        const lines = raw.split('|').map(l => l.trim()).filter(l => l);

        lines.forEach((line, i) => {
          const yPos = 0.55 - (i * 0.25);
          const lineText = document.createElement('a-text');
          lineText.setAttribute('value', line);
          lineText.setAttribute('position', `-0.8 ${yPos} 0.02`);
          lineText.setAttribute('color', '#bdc3c7');
          lineText.setAttribute('align', 'left');
          lineText.setAttribute('width', '2.2');
          lineText.setAttribute('scale', '0.85 0.85 1');
          panel.appendChild(lineText);
        });

        // Close button: clickable with ✕ icon
        const closeText = document.createElement('a-text');
        closeText.setAttribute('value', '✕  Cerrar');
        closeText.setAttribute('position', '0 -0.85 0.02');
        closeText.setAttribute('color', '#7f8c8d');
        closeText.setAttribute('align', 'center');
        closeText.setAttribute('width', '2.2');
        closeText.setAttribute('scale', '0.55 0.55 1');

        // Close plane (clickable)
        const closeBg = document.createElement('a-plane');
        closeBg.setAttribute('position', '0 -0.85 0.01');
        closeBg.setAttribute('width', '2.3');
        closeBg.setAttribute('height', '0.2');
        closeBg.setAttribute('color', '#34495e');
        closeBg.setAttribute('radius', '0.05');
        closeBg.setAttribute('class', 'clickable');
        closeBg.setAttribute('click-feedback', '');
        var self = this;
        closeBg.addEventListener('click', function () { self.close(); });
        closeText.setAttribute('class', 'clickable');
        closeText.addEventListener('click', function () { self.close(); });

        panel.appendChild(closeBg);
        panel.appendChild(closeText);

        // Entrance animation
        panel.setAttribute('animation', {
          property: 'scale',
          from: '0 0 0',
          to: '1 1 1',
          dur: 300,
          easing: 'easeOutBack'
        });

        document.querySelector('a-scene').appendChild(panel);

        this.panelEl = panel;

        // Keep reference for cleanup
        this.el.emit('panel-opened', { panel: panel });
      },
      close: function () {
        if (!this.panelEl) return;

        const panel = this.panelEl;

        // Exit animation then remove
        panel.setAttribute('animation', {
          property: 'scale',
          from: '1 1 1',
          to: '0 0 0',
          dur: 200,
          easing: 'easeInQuad'
        });

        setTimeout(() => {
          if (panel.parentNode) panel.parentNode.removeChild(panel);
        }, 250);

        this.panelEl = null;
        this.el.emit('panel-closed', {});
      }
    });

    // ======================================================================
    // OPERATION MANAGER: detailed 22-substep assembly simulation
    // ======================================================================
    AFRAME.registerComponent('operation-manager', {
      schema: { active: { type: 'boolean', default: false } },

      init: function () {
        this.currentStepIdx = 0;
        this.currentSubIdx = 0;
        this.workpiece = null;
        this.startTime = 0;
        this.isActive = false;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.pieceType = 'A';
        this.conveyorRunning = false;
        this.conveyorAnimId = null;
        this.armPhase = 0;
        this.armOrigPos = {};

        this.hudEl = document.getElementById('assemblyHud');
        this.hudStep = document.getElementById('hudStep');
        this.hudText = document.getElementById('hudText');
        this.hudFill = document.getElementById('hudFill');
        this.hudScore = document.getElementById('hudScore');
        this.completeEl = document.getElementById('assemblyComplete');
        this.choicePanel = document.getElementById('choicePanel');
        this.feedbackPanel = document.getElementById('feedbackPanel');

        var self = this;
        document.getElementById('resetBtn').addEventListener('click', function () { self.reset(); });
        document.getElementById('completeReset').addEventListener('click', function () { self.reset(); });
        document.getElementById('skipBtn').addEventListener('click', function () { if (self.isActive) self.advance(); });

        var startBtn = document.querySelector('#startAssembly');
        if (startBtn) {
          startBtn.addEventListener('click', function (e) {
            if (!self.isActive) { e.stopPropagation(); self.start(); }
          });
        }

        // ===== STEP DEFINITIONS =====
        this.steps = [
          // STEP 0: START
          {
            title: 'Inicio',
            subSteps: [
              {
                type: 'click',
                instruction: 'Haz clic en INICIAR SIMULACION para comenzar el proceso de ensamble',
                target: '#startAssembly',
                action: function () { self.goToStep(0, 0); }
              }
            ]
          },

          // STEP 1: PARTS BIN (2 sub-steps)
          {
            title: 'Seleccionar pieza',
            subSteps: [
              {
                type: 'choice',
                instruction: 'Selecciona el tipo de pieza a ensamblar',
                options: [
                  { label: 'Tipo A — Plastico', correct: true, feedback: 'Correcto! Pieza de plastico seleccionada' },
                  { label: 'Tipo B — Metal', correct: true, feedback: 'Correcto! Pieza de metal seleccionada' }
                ],
                onChoose: function (value) { self.pieceType = value; }
              },
              {
                type: 'click',
                instruction: 'Haz clic en el CONTENEDOR DE PIEZAS (bote amarillo) para obtener material',
                target: '#partsBin',
                action: function () {
                  var color = self.pieceType === 'A' ? '#f1c40f' : '#e74c3c';
                  var worldPos = self.getWorldPos('#partsBin');
                  worldPos.y += 0.4;

                  var scene = document.querySelector('a-scene');
                  var part = document.createElement('a-box');
                  part.setAttribute('id', 'workpiece');
                  part.setAttribute('width', '0.25');
                  part.setAttribute('height', '0.25');
                  part.setAttribute('depth', '0.25');
                  part.setAttribute('color', color);
                  part.setAttribute('shadow', '');
                  part.setAttribute('position', worldPos.x + ' ' + worldPos.y + ' ' + worldPos.z);
                  scene.appendChild(part);
                  self.workpiece = part;
                  self.flashElement('#partsBin', '#f1c40f');
                  setTimeout(function () { self.advance(); }, 500);
                }
              }
            ]
          },

          // STEP 2: CONVEYOR (3 sub-steps)
          {
            title: 'Banda transportadora',
            subSteps: [
              {
                type: 'click',
                instruction: 'Paso 2a: Presiona ENCENDER BANDA para iniciar el transporte de la pieza',
                target: '#conveyorBelt',
                action: function () {
                  self.conveyorRunning = true;
                  var cs = document.querySelector('#conveyorStatus');
                  if (cs) { cs.setAttribute('value', '▶ ENCENDIDA'); cs.setAttribute('color', '#27ae60'); }
                  self.flashElement('#conveyorBelt', '#2980b9');
                  self.advance();
                }
              },
              {
                type: 'click',
                instruction: 'Paso 2b: Presiona DETENER BANDA cuando la pieza llegue al final',
                target: '#conveyorBelt',
                action: function () {
                  if (!self.conveyorRunning) return;
                  self.conveyorRunning = false;
                  var cs = document.querySelector('#conveyorStatus');
                  if (cs) { cs.setAttribute('value', '⏸ DETENIDA'); cs.setAttribute('color', '#e74c3c'); }
                  // Move workpiece to conveyor end
                  var st1 = self.getWorldPos('#station1');
                  var endX = st1.x + 1.3, endZ = st1.z + 0.5;
                  if (self.workpiece) {
                    self.workpiece.setAttribute('animation', {
                      property: 'position',
                      to: endX + ' 0.55 ' + endZ,
                      dur: 1500,
                      easing: 'linear'
                    });
                  }
                  setTimeout(function () { self.advance(); }, 1800);
                }
              },
              {
                type: 'click',
                instruction: 'Paso 2c: Confirma la posicion de la pieza en la banda',
                target: '#conveyorBelt',
                action: function () {
                  self.flashElement('#conveyorBelt', '#27ae60');
                  setTimeout(function () { self.advance(); }, 300);
                }
              }
            ]
          },

          // STEP 3: ROBOTIC ARM (5 sub-steps)
          {
            title: 'Brazo robotico',
            subSteps: [
              {
                type: 'click',
                instruction: 'Paso 3a: Bajar brazo — Haz clic en el BRAZO ROBOTICO',
                target: '#roboticArm',
                action: function () {
                  self.animateArmSegment('bajar');
                  setTimeout(function () { self.advance(); }, 600);
                }
              },
              {
                type: 'click',
                instruction: 'Paso 3b: Cerrar pinzas — Haz clic en el BRAZO ROBOTICO',
                target: '#roboticArm',
                action: function () {
                  self.animateGripper('cerrar');
                  setTimeout(function () { self.advance(); }, 400);
                }
              },
              {
                type: 'click',
                instruction: 'Paso 3c: Subir brazo con pieza — Haz clic en el BRAZO ROBOTICO',
                target: '#roboticArm',
                action: function () {
                  self.animateArmSegment('subir');
                  setTimeout(function () { self.advance(); }, 600);
                }
              },
              {
                type: 'click',
                instruction: 'Paso 3d: Rotar brazo 180° — Haz clic en el BRAZO ROBOTICO',
                target: '#roboticArm',
                action: function () {
                  var arm = document.querySelector('#roboticArm');
                  if (arm) {
                    arm.setAttribute('animation__armrot', {
                      property: 'rotation', to: '0 180 0', dur: 800, easing: 'easeInOutQuad'
                    });
                  }
                  setTimeout(function () { self.advance(); }, 1000);
                }
              },
              {
                type: 'click',
                instruction: 'Paso 3e: Soltar pieza en mesa de soldadura — Haz clic en el BRAZO ROBOTICO',
                target: '#roboticArm',
                action: function () {
                  self.animateGripper('abrir');
                  // Move workpiece to welding table
                  var weldWorld = self.getWorldPos('#weldingTable');
                  weldWorld.y += 0.4;
                  if (self.workpiece) {
                    self.workpiece.setAttribute('animation', {
                      property: 'position',
                      to: weldWorld.x + ' ' + weldWorld.y + ' ' + weldWorld.z,
                      dur: 800, easing: 'easeInOutQuad'
                    });
                  }
                  // Return arm
                  var arm = document.querySelector('#roboticArm');
                  if (arm) {
                    arm.setAttribute('animation__armrot', {
                      property: 'rotation', to: '0 0 0', dur: 600, easing: 'easeInOutQuad'
                    });
                  }
                  self.flashElement('#roboticArm', '#2980b9');
                  setTimeout(function () { self.advance(); }, 1200);
                }
              }
            ]
          },

          // STEP 4: WELDING (4 sub-steps)
          {
            title: 'Soldadura',
            subSteps: [
              {
                type: 'choice',
                instruction: 'Paso 4a: Selecciona la TEMPERATURA correcta de soldadura',
                options: [
                  { label: '650°C', correct: false, feedback: 'Incorrecto. 650°C es muy baja — el material no se fundira correctamente. La temperatura optima es 850°C.' },
                  { label: '850°C', correct: true, feedback: 'Correcto! 850°C es la temperatura optima para soldar este material.' },
                  { label: '1050°C', correct: false, feedback: 'Incorrecto. 1050°C es muy alta — deformara la pieza y puede causar defectos. La temperatura correcta es 850°C.' }
                ]
              },
              {
                type: 'click',
                instruction: 'Paso 4b: Posicionar la antorcha de soldadura — Haz clic en el ROBOT SOLDADOR',
                target: '#weldingRobot',
                action: function () {
                  self.flashElement('#weldingRobot', '#f39c12');
                  // Animate welding arm
                  var armBox = document.querySelector('#station2 a-box[position="0.6 1 -0.3"]');
                  if (armBox) {
                    armBox.setAttribute('animation__weldarm', {
                      property: 'rotation', to: '0 0 -60', dur: 600, easing: 'easeInOutQuad'
                    });
                  }
                  setTimeout(function () { self.advance(); }, 800);
                }
              },
              {
                type: 'click',
                instruction: 'Paso 4c: Activar SOLDADURA — Haz clic en el ROBOT SOLDADOR',
                target: '#weldingRobot',
                action: function () {
                  var spark = document.querySelector('#weldingSpark');
                  if (spark) {
                    spark.setAttribute('animation__weld', {
                      property: 'scale', to: '4 4 4', dur: 80,
                      dir: 'alternate', loop: 6, easing: 'easeInOutQuad'
                    });
                  }
                  self.flashElement('#weldingRobot', '#e74c3c');
                  setTimeout(function () { self.advance(); }, 1000);
                }
              },
              {
                type: 'click',
                instruction: 'Paso 4d: Enfriar la pieza — Haz clic en el ROBOT SOLDADOR',
                target: '#weldingRobot',
                action: function () {
                  if (self.workpiece) {
                    self.workpiece.setAttribute('color', '#d97706');
                  }
                  self.flashElement('#weldingRobot', '#27ae60');
                  setTimeout(function () { self.advance(); }, 500);
                }
              }
            ]
          },

          // STEP 5: SCANNER (3 sub-steps)
          {
            title: 'Control de calidad',
            subSteps: [
              {
                type: 'click',
                instruction: 'Paso 5a: Iniciar ESCANEO de calidad — Haz clic en el ESCANER',
                target: '#scanner',
                action: function () {
                  // Move workpiece to scanner
                  var scanWorld = self.getWorldPos('#scanner');
                  scanWorld.y += 0.5;
                  scanWorld.z += 0.4;
                  if (self.workpiece) {
                    self.workpiece.setAttribute('animation', {
                      property: 'position',
                      to: scanWorld.x + ' ' + scanWorld.y + ' ' + scanWorld.z,
                      dur: 1200, easing: 'easeInOutQuad'
                    });
                  }
                  self.flashElement('#scanner', '#27ae60');
                  setTimeout(function () { self.advance(); }, 1500);
                }
              },
              {
                type: 'auto',
                instruction: 'Escaneando... Resultado: PIEZA APROBADA (98.7% de calidad)',
                delay: 2000,
                action: function () {
                  var sp = self.getWorldPos('#scanner');
                  var scene = document.querySelector('a-scene');
                  var rt = document.createElement('a-text');
                  rt.setAttribute('id', 'scanResult');
                  rt.setAttribute('position', sp.x + ' ' + (sp.y + 1.2) + ' ' + sp.z);
                  rt.setAttribute('value', 'PIEZA APROBADA');
                  rt.setAttribute('color', '#27ae60');
                  rt.setAttribute('align', 'center');
                  rt.setAttribute('width', '3');
                  rt.setAttribute('scale', '0 0 0');
                  scene.appendChild(rt);
                  rt.setAttribute('animation__appear', {
                    property: 'scale', from: '0 0 0', to: '1.5 1.5 1',
                    dur: 400, easing: 'easeOutBack'
                  });
                  setTimeout(function () {
                    if (rt.parentNode) rt.parentNode.removeChild(rt);
                  }, 3000);
                }
              },
              {
                type: 'choice',
                instruction: 'Paso 5c: La pieza paso la inspeccion. Que accion tomas?',
                options: [
                  { label: 'Aprobar pieza', correct: true, feedback: 'Correcto! La pieza cumple con todos los estandares de calidad.' },
                  { label: 'Rechazar pieza', correct: false, feedback: 'Incorrecto. La pieza tiene 98.7% de calidad — esta dentro del rango aceptable. Debe aprobarse.' }
                ]
              }
            ]
          },

          // STEP 6: PACKAGING (3 sub-steps)
          {
            title: 'Empaque final',
            subSteps: [
              {
                type: 'choice',
                instruction: 'Paso 6a: Selecciona el MATERIAL DE EMPAQUE',
                options: [
                  { label: 'Plastico termoencogible', correct: true, feedback: 'Excelente! El plastico termoencogible protege la pieza de humedad y golpes.' },
                  { label: 'Caja de carton', correct: true, feedback: 'Perfecto! El carton es ideal para transporte seguro.' },
                  { label: 'Burbuja sin caja', correct: false, feedback: 'Incorrecto. La burbuja sola no protege lo suficiente para envio industrial.' }
                ]
              },
              {
                type: 'click',
                instruction: 'Paso 6b: Envolver la pieza — Haz clic en la MAQUINA DE EMPAQUE',
                target: '#shrinkWrap',
                action: function () {
                  if (self.workpiece) {
                    self.workpiece.setAttribute('color', '#d4a574');
                    var wp = self.workpiece.getAttribute('position');
                    var scene = document.querySelector('a-scene');
                    var wrap = document.createElement('a-box');
                    wrap.setAttribute('width', '0.35');
                    wrap.setAttribute('height', '0.35');
                    wrap.setAttribute('depth', '0.35');
                    wrap.setAttribute('color', '#d4a574');
                    wrap.setAttribute('material', 'transparent: true; opacity: 0.3');
                    wrap.setAttribute('position', wp.x + ' ' + wp.y + ' ' + wp.z);
                    scene.appendChild(wrap);
                    setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 2000);
                  }
                  self.flashElement('#shrinkWrap', '#8e44ad');
                  setTimeout(function () { self.advance(); }, 800);
                }
              },
              {
                type: 'click',
                instruction: 'Paso 6c: Apilar pieza en el pallet — Haz clic en la MAQUINA DE EMPAQUE',
                target: '#shrinkWrap',
                action: function () {
                  var palletWorld = self.getWorldPos('#station4');
                  palletWorld.x -= 0.8;
                  palletWorld.y = 0.6;
                  palletWorld.z -= 0.5;
                  if (self.workpiece) {
                    self.workpiece.setAttribute('animation', {
                      property: 'position',
                      to: palletWorld.x + ' ' + palletWorld.y + ' ' + palletWorld.z,
                      dur: 1500, easing: 'easeInOutQuad'
                    });
                  }
                  self.flashElement('#shrinkWrap', '#f1c40f');
                  setTimeout(function () { self.advance(); }, 1800);
                }
              }
            ]
          }
        ];
      },

      getWorldPos: function (selector) {
        var el = document.querySelector(selector);
        if (!el || !el.object3D) return { x: 0, y: 0, z: 0 };
        var pos = new AFRAME.THREE.Vector3();
        el.object3D.getWorldPosition(pos);
        return { x: pos.x, y: pos.y, z: pos.z };
      },

      start: function () {
        if (this.isActive) return;
        this.isActive = true;
        this.currentStepIdx = 0;
        this.currentSubIdx = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.startTime = Date.now();
        this.conveyorRunning = false;
        this.armPhase = 0;
        this._choiceHadError = false;
        this.hudEl.style.display = 'block';
        this.completeEl.style.display = 'none';
        this.choicePanel.style.display = 'none';
        this.feedbackPanel.style.display = 'none';
        this.enterSubStep(0, 0);
      },

      enterSubStep: function (stepIdx, subIdx) {
        var step = this.steps[stepIdx];
        if (!step) { this.complete(); return; }

        var sub = step.subSteps[subIdx];
        if (!sub) {
          // Next step
          this.enterSubStep(stepIdx + 1, 0);
          return;
        }

        this.currentStepIdx = stepIdx;
        this.currentSubIdx = subIdx;

        // Update HUD
        this.hudStep.textContent = 'Paso ' + (stepIdx + 1) + '/' + this.steps.length;
        this.hudText.textContent = sub.instruction;
        this.hudFill.style.width = (this.calcProgress() * 100) + '%';
        this.hudScore.textContent = '✓ ' + this.correctCount + '  ✗ ' + this.wrongCount;

        // Hide panels
        this.choicePanel.style.display = 'none';
        this.choicePanel.innerHTML = '';
        this.feedbackPanel.style.display = 'none';

        // Clear highlight
        this.clearHighlight();

        var skipBtn = document.getElementById('skipBtn');
        if (sub.type === 'click') {
          if (skipBtn) skipBtn.style.display = 'inline-block';
          this.highlightTarget(sub.target);
          this.wireClick(sub);
        } else if (sub.type === 'choice') {
          if (skipBtn) skipBtn.style.display = 'none';
          this.showChoices(sub);
        } else if (sub.type === 'auto') {
          if (skipBtn) skipBtn.style.display = 'none';
          this.hudText.textContent = sub.instruction;
          var self = this;
          setTimeout(function () {
            if (sub.action) sub.action();
            self.advance();
          }, sub.delay || 1500);
        }
      },

      calcProgress: function () {
        var totalSteps = 0;
        var doneSteps = 0;
        for (var i = 0; i < this.steps.length; i++) {
          var subs = this.steps[i].subSteps.length;
          totalSteps += subs;
          if (i < this.currentStepIdx) doneSteps += subs;
          else if (i === this.currentStepIdx) doneSteps += this.currentSubIdx;
        }
        return totalSteps > 0 ? doneSteps / totalSteps : 0;
      },

      advance: function () {
        this.enterSubStep(this.currentStepIdx, this.currentSubIdx + 1);
      },

      wireClick: function (sub) {
        var self = this;
        if (this._clickTarget && this._clickHandler) {
          this._clickTarget.removeEventListener('click', this._clickHandler);
        }
        var target = document.querySelector(sub.target);
        if (!target) return;
        this._clickTarget = target;
        this._clickHandler = function () {
          if (!self.isActive) return;
          if (self._clickTarget) {
            self._clickTarget.removeEventListener('click', self._clickHandler);
          }
          self._clickTarget = null;
          self._clickHandler = null;
          sub.action();
        };
        target.addEventListener('click', this._clickHandler);
      },

      showChoices: function (sub) {
        var self = this;
        this.choicePanel.style.display = 'flex';
        this.choicePanel.innerHTML = '';

        sub.options.forEach(function (opt, idx) {
          var btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.textContent = opt.label;
          btn.style.cssText = 'padding:8px 16px;border:2px solid rgba(255,255,255,0.2);border-radius:8px;background:rgba(255,255,255,0.06);color:white;cursor:pointer;font-size:0.85rem;font-family:inherit;transition:0.2s';
          btn.addEventListener('mouseenter', function () { this.style.borderColor = '#0d9488'; this.style.background = 'rgba(13,148,136,0.15)'; });
          btn.addEventListener('mouseleave', function () { this.style.borderColor = 'rgba(255,255,255,0.2)'; this.style.background = 'rgba(255,255,255,0.06)'; });
          btn.addEventListener('click', function () {
            self.choicePanel.style.display = 'none';
            if (opt.correct) {
              if (!self._choiceHadError) self.correctCount++;
              self._choiceHadError = false;
              self.feedbackPanel.style.cssText = 'display:block;margin-top:8px;padding:8px 12px;border-radius:8px;text-align:center;font-size:0.9rem;background:rgba(39,174,96,0.2);border:1px solid #27ae60;color:#27ae60';
              self.feedbackPanel.textContent = opt.feedback;
              setTimeout(function () {
                self.feedbackPanel.style.display = 'none';
                self.advance();
              }, 1800);
            } else {
              self._choiceHadError = true;
              self.wrongCount++;
              self.feedbackPanel.style.cssText = 'display:block;margin-top:8px;padding:8px 12px;border-radius:8px;text-align:center;font-size:0.9rem;background:rgba(231,76,60,0.2);border:1px solid #e74c3c;color:#e74c3c';
              self.feedbackPanel.textContent = opt.feedback;
              var retry = document.createElement('button');
              retry.className = 'hud-btn';
              retry.textContent = 'Reintentar';
              retry.style.marginTop = '8px';
              retry.style.marginLeft = '12px';
              retry.addEventListener('click', function () {
                self.feedbackPanel.style.display = 'none';
                self.choicePanel.style.display = 'flex';
              });
              self.feedbackPanel.appendChild(retry);
            }
          });
          self.choicePanel.appendChild(btn);
        });
      },

      highlightTarget: function (selector) {
        this.clearHighlight();
        var target = document.querySelector(selector);
        if (!target) return;
        target.classList.add('assembly-highlight');
        target.setAttribute('animation__stepglow', {
          property: 'scale', to: '1.12 1.12 1.12',
          dur: 600, dir: 'alternate', loop: true, easing: 'easeInOutQuad'
        });
      },

      clearHighlight: function () {
        document.querySelectorAll('.assembly-highlight').forEach(function (el) {
          el.classList.remove('assembly-highlight');
          el.removeAttribute('animation__stepglow');
        });
      },

      flashElement: function (selector, color) {
        var el = document.querySelector(selector);
        if (!el) return;
        el.setAttribute('animation__flash', {
          property: 'scale', to: '1.2 1.2 1.2',
          dur: 200, dir: 'alternate', loop: 2, easing: 'easeInOutQuad'
        });
      },

      // Robotic arm animations
      animateArmSegment: function (dir) {
        var armBox = document.querySelector('#armSegment1');
        if (!armBox) return;
        var toRot = dir === 'bajar' ? '30 0 0' : '-30 0 0';
        armBox.setAttribute('animation__armseg', {
          property: 'rotation', to: toRot, dur: 500, easing: 'easeInOutQuad'
        });
      },

      animateGripper: function (action) {
        var g1 = document.querySelector('#gripperLeft');
        var g2 = document.querySelector('#gripperRight');
        if (action === 'cerrar') {
          if (g1) g1.setAttribute('position', '0.12 1.9 0.55');
          if (g2) g2.setAttribute('position', '0.18 1.9 0.55');
        } else {
          if (g1) g1.setAttribute('position', '0.05 1.9 0.55');
          if (g2) g2.setAttribute('position', '0.25 1.9 0.55');
        }
      },

      complete: function () {
        var elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        var mins = Math.floor(elapsed / 60);
        var secs = elapsed % 60;

        this.clearHighlight();
        if (this._clickTarget && this._clickHandler) {
          this._clickTarget.removeEventListener('click', this._clickHandler);
        }
        this.choicePanel.style.display = 'none';
        this.feedbackPanel.style.display = 'none';
        this.hudEl.style.display = 'none';
        this.completeEl.style.display = 'flex';
        document.getElementById('completeStats').innerHTML =
          'Tiempo total: ' + mins + 'm ' + secs + 's<br>' +
          'Aciertos: ' + this.correctCount + ' | Errores: ' + this.wrongCount +
          ' | Calificacion: ' + (this.wrongCount === 0 ? 'Excelente' : this.wrongCount <= 2 ? 'Buena' : 'Necesita mejorar');
        this.isActive = false;
      },

      reset: function () {
        if (this._clickTarget && this._clickHandler) {
          this._clickTarget.removeEventListener('click', this._clickHandler);
        }
        this._clickTarget = null;
        this._clickHandler = null;

        if (this.workpiece && this.workpiece.parentNode) {
          this.workpiece.parentNode.removeChild(this.workpiece);
        }
        this.workpiece = null;

        var sr = document.querySelector('#scanResult');
        if (sr && sr.parentNode) sr.parentNode.removeChild(sr);

        this.clearHighlight();
        this.choicePanel.style.display = 'none';
        this.feedbackPanel.style.display = 'none';
        this.hudEl.style.display = 'none';
        this.completeEl.style.display = 'none';
        this.isActive = false;
        this.conveyorRunning = false;
        this.currentStepIdx = 0;
        this.currentSubIdx = 0;
      }
    });
    // ===== END OPERATION MANAGER =====

    // Conveyor animation (station 1)
    AFRAME.registerComponent('conveyor-animation', {
      tick: function (time, delta) {
        const items = document.querySelectorAll('.conveyor-item');
        items.forEach((item) => {
          const pos = item.getAttribute('position');
          let x = pos.x + (delta * 0.0008);
          if (x > 1.3) x = -1.3;
          item.setAttribute('position', { x, y: pos.y, z: pos.z });
        });
      }
    });

    // Package animation (station 4)
    AFRAME.registerComponent('package-animation', {
      tick: function (time, delta) {
        const items = document.querySelectorAll('.package-item');
        items.forEach((item) => {
          const pos = item.getAttribute('position');
          let x = pos.x + (delta * 0.0006);
          if (x > 1) x = -1;
          item.setAttribute('position', { x, y: pos.y, z: pos.z });
        });
      }
    });

    document.addEventListener('a-scene-ready', () => {
      const scene = document.querySelector('a-scene');
      if (scene) {
        scene.setAttribute('conveyor-animation', '');
        scene.setAttribute('package-animation', '');
      }
    });
  }

  function initVRScene() {
    requestAnimationFrame(() => {
      const scene = document.querySelector('#vrScene');
      if (!scene || !scene.canvas) return;
      const container = document.getElementById('vrContainer');
      if (container) {
        scene.canvas.width = container.clientWidth;
        scene.canvas.height = container.clientHeight;
        scene.emit('resize');
      }
    });
  }

  // ====================================
  // 11. TRAINING MODULES & EXAMS
  // ====================================
  const EXAM_STORAGE_KEY = 'mhub-exams';

  const QUIZZES = {
    seguridad: {
      questions: [
        { q: '¿Qué reduce el uso correcto de EPP hasta en un 60% según la OSHA?', options: ['Tiempo de producción', 'Accidentes graves', 'Costos de mantenimiento', 'Consumo de energía'], correct: 1 },
        { q: '¿Cuál es el primer paso del procedimiento LOTO?', options: ['Aplicar candado', 'Liberar energía residual', 'Notificar a afectados', 'Verificar cero energía'], correct: 2 },
        { q: '¿Qué significa el acrónimo PASS en el uso de extintores?', options: ['Push, Aim, Squeeze, Sweep', 'Pull, Aim, Squeeze, Sweep', 'Pull, Activate, Spray, Sweep', 'Push, Activate, Squeeze, Spray'], correct: 1 },
        { q: '¿Cuál es la primera causa de incapacidad laboral según el módulo?', options: ['Caídas desde altura', 'Golpes por objetos', 'Trastornos musculoesqueléticos', 'Quemaduras químicas'], correct: 2 },
        { q: '¿Cuántas secciones tiene la Hoja de Datos de Seguridad (HDS)?', options: ['12', '14', '16', '18'], correct: 2 },
        { q: '¿Qué tipo de extintor se usa para fuegos eléctricos?', options: ['Tipo A', 'Tipo B', 'Tipo C', 'Tipo D'], correct: 2 },
        { q: '¿Cada cuánto deben realizarse los simulacros de evacuación?', options: ['Mensuales', 'Bimestrales', 'Trimestrales', 'Semestrales'], correct: 2 },
        { q: '¿Qué significa la sigla LOTO?', options: ['Lock-Out / Tag-Out', 'Load-Over / Turn-Off', 'Lift-Off / Take-Out', 'Lever-Over / Tool-Out'], correct: 0 },
        { q: '¿Cuál es la técnica correcta al levantar una carga > 15 kg?', options: ['Doblar la cintura', 'Doblar rodillas y mantener espalda recta', 'Levantar con un solo brazo', 'Girar el tronco mientras levanta'], correct: 1 },
        { q: '¿Qué debe tener un trabajador antes de operar maquinaria?', options: ['Autorización verbal', 'Entrenamiento documentado vigente', 'Experiencia previa no certificada', 'Solo supervisión remota'], correct: 1 }
      ]
    },
    optimizacion: {
      questions: [
        { q: '¿Cuál es el primer paso (Seiri) de la metodología 5S?', options: ['Ordenar', 'Clasificar', 'Limpiar', 'Estandarizar'], correct: 1 },
        { q: '¿Qué significa la palabra japonesa "Kaizen"?', options: ['Producción rápida', 'Cambio para mejorar', 'Cero defectos', 'Trabajo en equipo'], correct: 1 },
        { q: '¿Cuál es el objetivo principal de SMED?', options: ['Aumentar velocidad de producción', 'Reducir cambios de herramienta a <10 min', 'Eliminar inventario completo', 'Mejorar calidad del producto'], correct: 1 },
        { q: '¿Qué representa un Kanban en el sistema Toyota?', options: ['Una máquina', 'Un operario', 'Una tarjeta o señal', 'Un producto defectuoso'], correct: 2 },
        { q: '¿Cuántos desperdicios (Muda) se identifican en Lean?', options: ['5', '6', '7', '8'], correct: 2 },
        { q: '¿Qué significa "Takt" en alemán?', options: ['Tiempo', 'Ritmo', 'Velocidad', 'Ciclo'], correct: 1 },
        { q: '¿Qué ciclo sigue la metodología Kaizen?', options: ['DMAIC', 'PDCA', 'FMEA', '8D'], correct: 1 },
        { q: '¿Qué significa Jidoka?', options: ['Producción en masa', 'Automatización con toque humano', 'Control estadístico', 'Mantenimiento preventivo'], correct: 1 },
        { q: '¿Qué herramienta mapea todos los pasos desde materia prima hasta el cliente?', options: ['Diagrama de Pareto', 'Value Stream Mapping (VSM)', 'Diagrama de Ishikawa', 'Histograma'], correct: 1 },
        { q: '¿Qué reduce el SMV (Standard Minute Value)?', options: ['El tiempo de entrega', 'El tiempo estándar por tarea', 'El costo de materiales', 'El número de operadores'], correct: 1 }
      ]
    }
  };

  function getExamResult(courseId) {
    const data = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY) || '{}');
    return data[courseId] || null;
  }

  function saveExamResult(courseId, correct, total, passed) {
    const data = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY) || '{}');
    data[courseId] = { correct, total, passed, date: new Date().toISOString() };
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(data));
  }

  function updateCourseBadge(courseId) {
    const exam = getExamResult(courseId);
    const badge = document.getElementById('progress-' + courseId);
    if (!badge) return;
    if (exam && exam.passed) {
      badge.textContent = 'Aprobado';
      badge.style.background = '#16a34a';
    } else if (exam && !exam.passed) {
      badge.textContent = 'Reprobado';
      badge.style.background = '#dc2626';
    } else {
      badge.textContent = 'Pendiente';
      badge.style.background = '';
    }
  }

  function switchTrainingView(courseId, showQuiz) {
    const content = document.getElementById(courseId + '-content');
    const quiz = document.getElementById(courseId + '-quiz');
    if (content) content.style.display = showQuiz ? 'none' : '';
    if (quiz) quiz.style.display = showQuiz ? '' : 'none';
  }

  function renderQuiz(courseId) {
    const container = document.getElementById(courseId + '-questions');
    const quizData = QUIZZES[courseId];
    if (!container || !quizData) return;

    container.innerHTML = quizData.questions.map((item, idx) => `
      <div class="quiz-question" data-idx="${idx}">
        <div class="quiz-question__text">${idx + 1}. ${item.q}</div>
        <div class="quiz-question__options">
          ${item.options.map((opt, oi) => `
            <label class="quiz-option">
              <input type="radio" name="q${idx}" value="${oi}">
              <span class="quiz-option__label">${opt}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function gradeQuiz(courseId) {
    const quizData = QUIZZES[courseId];
    const container = document.getElementById(courseId + '-questions');
    const resultEl = document.getElementById(courseId + '-quiz-result');
    if (!quizData || !container || !resultEl) return;

    const questions = container.querySelectorAll('.quiz-question');
    let correct = 0;

    questions.forEach((qEl, idx) => {
      const selected = qEl.querySelector('input[type="radio"]:checked');
      const options = qEl.querySelectorAll('.quiz-option');
      const correctIdx = quizData.questions[idx].correct;

      options.forEach((opt, oi) => {
        opt.classList.remove('correct', 'wrong');
        if (oi === correctIdx) opt.classList.add('correct');
        if (selected && parseInt(selected.value) === oi && oi !== correctIdx) opt.classList.add('wrong');
      });

      if (selected && parseInt(selected.value) === correctIdx) correct++;
    });

    const total = questions.length;
    const passed = correct >= 7;

    saveExamResult(courseId, correct, total, passed);

    resultEl.innerHTML = `
      <div class="quiz-result__score">${correct}/${total}</div>
      <div style="font-size:1rem;margin-bottom:0.5rem">${correct} de ${total} respuestas correctas</div>
      <div style="font-weight:700;font-size:1.3rem">${passed ? '&#9989; ¡APROBADO!' : '&#10060; REPROBADO'}</div>
      ${passed ? '<p style="margin-top:0.5rem;color:#16a34a">Has completado la capacitaci\u00f3n exitosamente.</p>' : '<p style="margin-top:0.5rem;color:#dc2626">Debes estudiar el contenido nuevamente y recursar el examen.</p>'}
    `;
    resultEl.className = 'quiz-result ' + (passed ? 'passed' : 'failed');
    resultEl.style.display = '';

    document.getElementById(courseId + '-submit-quiz').style.display = 'none';
    document.getElementById(courseId + '-back-content').innerHTML = passed ? '&#8592; Cerrar' : '&#8592; Volver a estudiar';
    updateCourseBadge(courseId);
  }

  function resetQuiz(courseId) {
    const resultEl = document.getElementById(courseId + '-quiz-result');
    const submitBtn = document.getElementById(courseId + '-submit-quiz');
    const backBtn = document.getElementById(courseId + '-back-content');
    if (resultEl) { resultEl.style.display = 'none'; resultEl.className = 'quiz-result'; resultEl.innerHTML = ''; }
    if (submitBtn) submitBtn.style.display = '';
    if (backBtn) backBtn.innerHTML = '\u2190 Volver al contenido';
  }

  function openTrainingModal(courseId) {
    const map = { seguridad: 'safety-training-modal', optimizacion: 'optimization-training-modal' };
    const modal = document.getElementById(map[courseId]);
    if (!modal) return;
    modal.classList.add('open');
    switchTrainingView(courseId, false);
    resetQuiz(courseId);
    renderQuiz(courseId);
  }

  function closeAllTrainingModals() {
    document.querySelectorAll('.modal-overlay[id$="training-modal"]').forEach(m => m.classList.remove('open'));
  }

  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      const courseMap = { 'safety-training-modal': 'seguridad', 'optimization-training-modal': 'optimizacion' };
      const courseId = courseMap[modalId];
      if (courseId) openTrainingModal(courseId);
    });
  });

  document.querySelectorAll('.safety-training-close, .optimization-training-close').forEach(btn => {
    btn.addEventListener('click', closeAllTrainingModals);
  });

  ['safety-training-modal', 'optimization-training-modal'].forEach(id => {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAllTrainingModals();
      });
    }
  });

  // Exam buttons
  function bindExamButton(courseId) {
    const startBtn = document.getElementById(courseId + '-start-exam');
    const submitBtn = document.getElementById(courseId + '-submit-quiz');
    const backBtn = document.getElementById(courseId + '-back-content');

    if (startBtn) startBtn.addEventListener('click', () => switchTrainingView(courseId, true));
    if (submitBtn) submitBtn.addEventListener('click', () => gradeQuiz(courseId));
    if (backBtn) backBtn.addEventListener('click', () => {
      const exam = getExamResult(courseId);
      if (exam && exam.passed) { closeAllTrainingModals(); return; }
      switchTrainingView(courseId, false);
      resetQuiz(courseId);
    });
  }

  bindExamButton('seguridad');
  bindExamButton('optimizacion');

  updateCourseBadge('seguridad');
  updateCourseBadge('optimizacion');
});
