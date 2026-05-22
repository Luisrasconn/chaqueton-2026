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
      { id: 'r1', area: 'Ensamble', type: 'Cuello de botella', desc: 'Retraso en estación 3 por falta de piezas', operator: 'Carlos M.', status: 'En revisión', date: new Date(Date.now() - 86400000).toISOString() },
      { id: 'r2', area: 'Soldadura', type: 'Fallo técnico', desc: 'Robot soldador presenta desviación en eje Z', operator: 'Ana L.', status: 'Resuelto', date: new Date(Date.now() - 172800000).toISOString() },
      { id: 'r3', area: 'Pintura', type: 'Mejora sugerida', desc: 'Instalar extractor adicional en cabina 2', operator: 'Pedro R.', status: 'En revisión', date: new Date(Date.now() - 259200000).toISOString() },
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
          r.desc.toLowerCase().includes(filter) ||
          r.operator.toLowerCase().includes(filter)
        )
      : reports;

    reportsBody.innerHTML = '';
    filtered.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.area}</td>
        <td><span class="badge badge--${badgeMap[r.type] || 'info'}">${r.type}</span></td>
        <td>${r.desc}</td>
        <td>${r.operator}</td>
        <td><span class="badge badge--${r.status === 'Resuelto' ? 'success' : 'info'}">${r.status}</span></td>
        <td><button class="delete-btn" data-id="${r.id}">&times;</button></td>
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
    const desc = document.getElementById('reportDesc').value;
    const operator = document.getElementById('reportOperator').value || 'Anónimo';

    const report = {
      id: 'r' + Date.now(),
      area,
      type,
      desc,
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
    const element = document.getElementById('reportesTable');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'reportes-mhub-' + new Date().toISOString().slice(0, 10) + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
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
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
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
  let qrStream = null;
  let qrScanning = false;

  function startQRScanner() {
    qrResult.innerHTML = '<p style="color:var(--text-light)">Iniciando cámara...</p>';
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        qrStream = stream;
        qrVideo.srcObject = stream;
        qrVideo.play();
        qrScanning = true;
        scanQRCode();
      })
      .catch(() => {
        qrResult.innerHTML = '<p style="color:var(--danger)">No se pudo acceder a la cámara</p>';
      });
  }

  function scanQRCode() {
    if (!qrScanning) return;
    if (qrVideo.readyState === qrVideo.HAVE_ENOUGH_DATA) {
      const canvas = qrCanvas;
      canvas.width = qrVideo.videoWidth;
      canvas.height = qrVideo.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(qrVideo, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      try {
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          processQRCode(code.data);
          return;
        }
      } catch (e) {}
    }
    requestAnimationFrame(scanQRCode);
  }

  function processQRCode(data) {
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

  function stopQRScanner() {
    qrScanning = false;
    if (qrStream) {
      qrStream.getTracks().forEach(t => t.stop());
      qrStream = null;
    }
    qrModal.classList.remove('open');
  }

  qrScanBtn.addEventListener('click', () => {
    qrModal.classList.add('open');
    startQRScanner();
  });

  qrModalClose.addEventListener('click', stopQRScanner);
  qrCancelBtn.addEventListener('click', stopQRScanner);

  // ====================================
  // 13. LOGIN MODAL
  // ====================================
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const loginModalClose = document.getElementById('loginModalClose');

  loginBtn.addEventListener('click', () => {
    if (currentUser) {
      if (auth) {
        auth.signOut().catch(() => {});
      }
      currentUser = null;
      document.getElementById('userBadge').style.display = 'none';
      loginBtn.textContent = 'Iniciar sesión';
    } else {
      loginModal.classList.add('open');
    }
  });

  loginModalClose.addEventListener('click', () => loginModal.classList.remove('open'));
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.remove('open');
  });

  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      document.getElementById('userBadge').style.display = 'inline-flex';
      document.getElementById('userName').textContent = role === 'supervisor' ? 'Supervisor' : 'Operador';
      loginBtn.textContent = 'Cerrar sesión';
      currentUser = { uid: 'demo-' + role, role: role };
      loginModal.classList.remove('open');
    });
  });

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('open');
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
  // 15. CONVEYOR BELT ANIMATION (AFRAME)
  // ====================================
  if (typeof AFRAME !== 'undefined') {
    AFRAME.registerComponent('conveyor-animation', {
      tick: function (time, delta) {
        const items = document.querySelectorAll('.conveyor-item');
        items.forEach((item, i) => {
          const pos = item.getAttribute('position');
          let x = pos.x + (delta * 0.001);
          if (x > 5) x = -5;
          item.setAttribute('position', { x, y: pos.y, z: pos.z });
        });
      }
    });

    document.addEventListener('a-scene-ready', () => {
      const scene = document.querySelector('a-scene');
      if (scene) {
        scene.setAttribute('conveyor-animation', '');
      }
    });
  }
});
