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
          const meshes = el.querySelectorAll('[material]');
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
          const meshes = el.querySelectorAll('[material]');
          meshes.forEach(m => {
            m.setAttribute('material', 'emissive', color);
            m.setAttribute('material', 'emissiveIntensity', intensity);
          });
        });
        el.addEventListener('mouseleave', () => {
          const meshes = el.querySelectorAll('[material]');
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

        // Close button text
        const closeText = document.createElement('a-text');
        closeText.setAttribute('value', 'Click para cerrar');
        closeText.setAttribute('position', '0 -0.85 0.02');
        closeText.setAttribute('color', '#7f8c8d');
        closeText.setAttribute('align', 'center');
        closeText.setAttribute('width', '2.2');
        closeText.setAttribute('scale', '0.55 0.55 1');

        // Close plane
        const closeBg = document.createElement('a-plane');
        closeBg.setAttribute('position', '0 -0.85 0.01');
        closeBg.setAttribute('width', '2.3');
        closeBg.setAttribute('height', '0.2');
        closeBg.setAttribute('color', '#34495e');
        closeBg.setAttribute('radius', '0.05');

        panel.appendChild(closeBg);
        panel.appendChild(closeText);

        // Make the panel clickable to close (using raycaster)
        panel.setAttribute('class', 'clickable');
        panel.addEventListener('click', (e) => {
          e.stopPropagation();
          this.close();
        });

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
    // ASSEMBLY MANAGER: controls 7-step guided simulation
    // ======================================================================
    AFRAME.registerComponent('assembly-manager', {
      schema: { active: { type: 'boolean', default: false } },

      init: function () {
        this.currentStep = 0;
        this.workpiece = null;
        this.startTime = 0;
        this.isActive = false;

        this.hudEl = document.getElementById('assemblyHud');
        this.hudStep = document.getElementById('hudStep');
        this.hudText = document.getElementById('hudText');
        this.hudFill = document.getElementById('hudFill');
        this.completeEl = document.getElementById('assemblyComplete');

        const resetBtn = document.getElementById('resetBtn');
        const completeReset = document.getElementById('completeReset');
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (completeReset) completeReset.addEventListener('click', () => this.reset());

        const startBtn = document.querySelector('#startAssembly');
        if (startBtn) {
          startBtn.addEventListener('click', (e) => {
            if (!this.isActive) { e.stopPropagation(); this.start(); }
          });
        }

        this.steps = [
          {
            instruction: 'Haz clic en INICIAR SIMULACION para comenzar el proceso de ensamble',
            target: '#startAssembly',
            action: () => this.nextStep()
          },
          {
            instruction: 'Paso 1: Haz clic en el CONTENEDOR DE PIEZAS (bote amarillo) para obtener material',
            target: '#partsBin',
            action: () => this.stepGetPart()
          },
          {
            instruction: 'Paso 2: Haz clic en la BANDA TRANSPORTADORA para mover la pieza',
            target: '#conveyorBelt',
            action: () => this.stepConveyor()
          },
          {
            instruction: 'Paso 3: Haz clic en el BRAZO ROBOTICO para ensamblar la pieza',
            target: '#roboticArm',
            action: () => this.stepAssemble()
          },
          {
            instruction: 'Paso 4: Haz clic en el ROBOT DE SOLDADURA para soldar',
            target: '#weldingRobot',
            action: () => this.stepWeld()
          },
          {
            instruction: 'Paso 5: Haz clic en el ESCANER para inspeccionar calidad',
            target: '#scanner',
            action: () => this.stepScan()
          },
          {
            instruction: 'Paso 6: Haz clic en la MAQUINA DE EMPAQUE para finalizar',
            target: '#shrinkWrap',
            action: () => this.stepPackage()
          }
        ];
      },

      getWorldPos: function (selector) {
        const el = document.querySelector(selector);
        if (!el || !el.object3D) return { x: 0, y: 0, z: 0 };
        const pos = new AFRAME.THREE.Vector3();
        el.object3D.getWorldPosition(pos);
        return { x: pos.x, y: pos.y, z: pos.z };
      },

      start: function () {
        if (this.isActive) return;
        this.isActive = true;
        this.currentStep = 0;
        this.startTime = Date.now();
        this.hudEl.style.display = 'block';
        this.completeEl.style.display = 'none';
        this.goToStep(0);
      },

      goToStep: function (index) {
        var step = this.steps[index];
        if (!step) { this.complete(); return; }
        this.currentStep = index;

        this.hudStep.textContent = 'Paso ' + (index + 1) + '/' + this.steps.length;
        this.hudText.textContent = step.instruction;
        this.hudFill.style.width = ((index) / this.steps.length * 100) + '%';

        this.highlightTarget(step.target);

        // Remove previous step listener
        if (this._stepTarget && this._stepHandler) {
          this._stepTarget.removeEventListener('click', this._stepHandler);
        }

        // Wire step action to target
        var target = document.querySelector(step.target);
        if (target) {
          target.classList.add('step-active');
          this._stepTarget = target;
          this._stepHandler = function (e) {
            if (!this.isActive) return;
            step.action.call(this);
          }.bind(this);
          target.addEventListener('click', this._stepHandler, { once: true });
        }
      },

      highlightTarget: function (selector) {
        document.querySelectorAll('.assembly-highlight').forEach(function (el) {
          el.classList.remove('assembly-highlight');
          el.removeAttribute('animation__stepglow');
        });
        const target = document.querySelector(selector);
        if (!target) return;
        target.classList.add('assembly-highlight');
        target.setAttribute('animation__stepglow', {
          property: 'scale',
          to: '1.12 1.12 1.12',
          dur: 600,
          dir: 'alternate',
          loop: true,
          easing: 'easeInOutQuad'
        });
      },

      flashElement: function (selector, color) {
        const el = document.querySelector(selector);
        if (!el) return;
        el.setAttribute('animation__flash', {
          property: 'scale',
          to: '1.2 1.2 1.2',
          dur: 200,
          dir: 'alternate',
          loop: 2,
          easing: 'easeInOutQuad'
        });
      },

      // ===== STEP ACTIONS =====

      stepGetPart: function () {
        const worldPos = this.getWorldPos('#partsBin');
        worldPos.y += 0.4;

        const scene = document.querySelector('a-scene');
        const part = document.createElement('a-box');
        part.setAttribute('id', 'workpiece');
        part.setAttribute('width', '0.25');
        part.setAttribute('height', '0.25');
        part.setAttribute('depth', '0.25');
        part.setAttribute('color', '#f1c40f');
        part.setAttribute('shadow', '');
        part.setAttribute('position', worldPos.x + ' ' + worldPos.y + ' ' + worldPos.z);
        scene.appendChild(part);

        this.workpiece = part;
        this.flashElement('#partsBin', '#2980b9');

        var self = this;
        setTimeout(function () { self.nextStep(); }, 600);
      },

      stepConveyor: function () {
        if (!this.workpiece) return;
        var conveyorEnd = this.getWorldPos('#station1');
        conveyorEnd.x += 1.3;
        conveyorEnd.y = 0.55;
        conveyorEnd.z += 0.5;

        var pos = this.workpiece.getAttribute('position');

        this.workpiece.setAttribute('animation', {
          property: 'position',
          from: pos.x + ' ' + pos.y + ' ' + pos.z,
          to: conveyorEnd.x + ' ' + conveyorEnd.y + ' ' + conveyorEnd.z,
          dur: 2000,
          easing: 'linear'
        });

        var self = this;
        setTimeout(function () { self.nextStep(); }, 2200);
      },

      stepAssemble: function () {
        if (!this.workpiece) return;
        var armWorld = this.getWorldPos('#roboticArm');
        var pos = this.workpiece.getAttribute('position');

        // Move to arm (pick up)
        this.workpiece.setAttribute('animation', {
          property: 'position',
          from: pos.x + ' ' + pos.y + ' ' + pos.z,
          to: (armWorld.x) + ' ' + (armWorld.y + 1.2) + ' ' + armWorld.z,
          dur: 1200,
          easing: 'easeInOutQuad'
        });

        var self = this;
        // Then move to welding table
        setTimeout(function () {
          var weldWorld = self.getWorldPos('#weldingTable');
          weldWorld.y += 0.4;

          self.workpiece.setAttribute('animation', {
            property: 'position',
            from: (armWorld.x) + ' ' + (armWorld.y + 1.2) + ' ' + armWorld.z,
            to: weldWorld.x + ' ' + weldWorld.y + ' ' + weldWorld.z,
            dur: 1500,
            easing: 'easeInOutQuad'
          });

          // Rotate arm
          var arm = document.querySelector('#roboticArm');
          if (arm) {
            arm.setAttribute('animation__armrot', {
              property: 'rotation',
              to: '0 180 0',
              dur: 800,
              easing: 'easeInOutQuad'
            });
            setTimeout(function () {
              arm.setAttribute('animation__armrot', {
                property: 'rotation',
                to: '0 0 0',
                dur: 800,
                easing: 'easeInOutQuad'
              });
            }, 1000);
          }
        }, 1300);

        setTimeout(function () { self.nextStep(); }, 3200);
      },

      stepWeld: function () {
        if (!this.workpiece) return;
        this.workpiece.setAttribute('color', '#d97706');

        var spark = document.querySelector('#weldingSpark');
        if (spark) {
          spark.setAttribute('animation__weld', {
            property: 'scale',
            to: '3 3 3',
            dur: 100,
            dir: 'alternate',
            loop: 4,
            easing: 'easeInOutQuad'
          });
        }
        this.flashElement('#weldingRobot', '#f39c12');

        var self = this;
        setTimeout(function () { self.nextStep(); }, 1200);
      },

      stepScan: function () {
        if (!this.workpiece) return;
        var scanWorld = this.getWorldPos('#scanner');
        scanWorld.y += 0.5;
        scanWorld.z += 0.4;

        var pos = this.workpiece.getAttribute('position');

        this.workpiece.setAttribute('animation', {
          property: 'position',
          from: pos.x + ' ' + pos.y + ' ' + pos.z,
          to: scanWorld.x + ' ' + scanWorld.y + ' ' + scanWorld.z,
          dur: 1500,
          easing: 'easeInOutQuad'
        });

        var self = this;
        setTimeout(function () {
          self.flashElement('#scanner', '#27ae60');

          var scene = document.querySelector('a-scene');
          var resultText = document.createElement('a-text');
          resultText.setAttribute('id', 'scanResult');
          var sp = self.getWorldPos('#scanner');
          resultText.setAttribute('position', sp.x + ' ' + (sp.y + 1.2) + ' ' + sp.z);
          resultText.setAttribute('value', 'PIEZA APROBADA');
          resultText.setAttribute('color', '#27ae60');
          resultText.setAttribute('align', 'center');
          resultText.setAttribute('width', '3');
          resultText.setAttribute('scale', '0 0 0');
          scene.appendChild(resultText);

          resultText.setAttribute('animation__appear', {
            property: 'scale',
            from: '0 0 0',
            to: '1.5 1.5 1',
            dur: 400,
            easing: 'easeOutBack'
          });

          setTimeout(function () {
            if (resultText.parentNode) resultText.parentNode.removeChild(resultText);
          }, 2000);
        }, 1600);

        setTimeout(function () { self.nextStep(); }, 3200);
      },

      stepPackage: function () {
        if (!this.workpiece) return;
        var palletWorld = this.getWorldPos('#station4');
        palletWorld.x -= 0.8;
        palletWorld.y = 0.6;
        palletWorld.z -= 0.5;

        var pos = this.workpiece.getAttribute('position');

        this.workpiece.setAttribute('animation', {
          property: 'position',
          from: pos.x + ' ' + pos.y + ' ' + pos.z,
          to: palletWorld.x + ' ' + palletWorld.y + ' ' + palletWorld.z,
          dur: 1500,
          easing: 'easeInOutQuad'
        });

        var self = this;
        setTimeout(function () {
          self.workpiece.setAttribute('color', '#d4a574');

          var scene = document.querySelector('a-scene');
          var wrap = document.createElement('a-box');
          wrap.setAttribute('width', '0.35');
          wrap.setAttribute('height', '0.35');
          wrap.setAttribute('depth', '0.35');
          wrap.setAttribute('material', 'transparent: true; opacity: 0.3; color: #d4a574');
          var wp = self.workpiece.getAttribute('position');
          wrap.setAttribute('position', wp.x + ' ' + wp.y + ' ' + wp.z);
          scene.appendChild(wrap);

          self.flashElement('#shrinkWrap', '#8e44ad');

          setTimeout(function () {
            if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
          }, 1500);
        }, 1600);

        setTimeout(function () { self.nextStep(); }, 2500);
      },

      complete: function () {
        var elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        var mins = Math.floor(elapsed / 60);
        var secs = elapsed % 60;

        this.hudEl.style.display = 'none';
        this.completeEl.style.display = 'flex';
        document.getElementById('completeStats').textContent =
          'Tiempo total: ' + mins + 'm ' + secs + 's | 4 estaciones completadas';
        this.isActive = false;

        document.querySelectorAll('.assembly-highlight').forEach(function (el) {
          el.classList.remove('assembly-highlight');
          el.removeAttribute('animation__stepglow');
        });
      },

      reset: function () {
        if (this.workpiece && this.workpiece.parentNode) {
          this.workpiece.parentNode.removeChild(this.workpiece);
        }
        this.workpiece = null;

        // Remove active step listener
        if (this._stepTarget && this._stepHandler) {
          this._stepTarget.removeEventListener('click', this._stepHandler);
        }
        this._stepTarget = null;
        this._stepHandler = null;

        var result = document.querySelector('#scanResult');
        if (result && result.parentNode) result.parentNode.removeChild(result);

        this.hudEl.style.display = 'none';
        this.completeEl.style.display = 'none';
        this.isActive = false;
        this.currentStep = 0;

        document.querySelectorAll('.assembly-highlight').forEach(function (el) {
          el.classList.remove('assembly-highlight');
          el.removeAttribute('animation__stepglow');
        });

        // Reset workpiece color
        var wp = document.querySelector('#workpiece');
        if (wp) wp.setAttribute('color', '#f1c40f');
      }
    });

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
    // Scene auto-initializes with A-Frame
  }
});
