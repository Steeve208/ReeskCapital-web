/* =================================
   MINING.JS — CONTROL MINADO WEB
================================== */

let miningInterval = null;
let miningActive = false;
const MINING_API_URL = "/api/mine"; // Cambia por tu endpoint real

document.addEventListener("DOMContentLoaded", () => {
  // Onboarding/tutorial
  const onboardingKey = "rsc_mining_onboarding";
  const onboarding = document.getElementById("miningOnboarding");
  const closeOnboarding = document.getElementById("closeOnboarding");
  if (onboarding && !localStorage.getItem(onboardingKey)) {
    onboarding.style.display = "block";
    closeOnboarding.addEventListener("click", () => {
      onboarding.style.display = "none";
      localStorage.setItem(onboardingKey, "1");
    });
  }

  const startBtn = document.getElementById("mining-btn");
  const progressBar = document.getElementById("mining-progress");
  const statusEl = document.getElementById("mining-status");
  const amountEl = document.getElementById("mining-amount");
  const notifyEl = document.getElementById("mining-notify");

  if (!startBtn) return;

  // Feedback visual
  const feedbackEl = document.getElementById("miningFeedback");
  function showFeedback(msg, isError) {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg;
    feedbackEl.style.color = isError ? "#e35060" : "#b7ffb0";
    feedbackEl.style.display = "block";
    setTimeout(() => { feedbackEl.style.display = "none"; }, 4000);
  }

  // Gráfico de rendimiento (simulado)
  const chartEl = document.getElementById("miningChart");
  let chartCtx, chartData = [0], chartLabels = ["Inicio"];
  if (chartEl && chartEl.getContext) {
    chartCtx = chartEl.getContext("2d");
    drawChart();
  }
  function drawChart() {
    if (!chartCtx) return;
    chartCtx.clearRect(0, 0, chartEl.width, chartEl.height);
    chartCtx.beginPath();
    chartCtx.moveTo(0, chartEl.height - chartData[0]);
    for (let i = 1; i < chartData.length; i++) {
      chartCtx.lineTo(i * (chartEl.width / (chartData.length - 1)), chartEl.height - chartData[i]);
    }
    chartCtx.strokeStyle = "#7cf7ff";
    chartCtx.lineWidth = 2.5;
    chartCtx.shadowColor = "#3fd8c2";
    chartCtx.shadowBlur = 8;
    chartCtx.stroke();
    chartCtx.shadowBlur = 0;
  }

  // --- NUEVO FLUJO DE SESIÓN DE MINERÍA 24H ---
  const SESSION_KEY = 'rsc_mining_session';
  let session = JSON.parse(localStorage.getItem(SESSION_KEY));

  function getTimeLeft() {
    if (!session || !session.start) return 0;
    const now = Date.now();
    const end = session.start + 24 * 60 * 60 * 1000;
    return Math.max(0, end - now);
  }

  // --- HISTORIAL DE SESIONES ---
  const HISTORY_KEY = 'rsc_mining_history';
  function addSessionToHistory(session, reward) {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    history.push({ start: session.start, end: session.start + 24*60*60*1000, reward });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
  function renderSessionHistory() {
    const el = document.getElementById('miningSessionHistory');
    if (!el) return;
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    el.innerHTML = history.length === 0 ? '<p>No hay sesiones previas.</p>' :
      '<ul>' + history.map(s => `<li>🕒 ${new Date(s.start).toLocaleString()} — <b>${s.reward || 0} RSC</b></li>`).join('') + '</ul>';
  }

  // --- ANIMACIÓN DE PROGRESO DE SESIÓN ---
  function updateSessionProgress() {
    const timeLeft = getTimeLeft();
    const total = 24 * 60 * 60 * 1000;
    const percent = 100 - (timeLeft / total) * 100;
    const bar = document.querySelector('.progress-fill');
    if (bar) bar.style.width = percent + '%';
  }
  setInterval(updateSessionProgress, 1000);
  updateSessionProgress();

  async function getBackendReward(address) {
    try {
      const res = await fetch(`/api/mining/reward?address=${address}`);
      if (!res.ok) throw new Error('No se pudo obtener la recompensa');
      const data = await res.json();
      return data.reward;
    } catch (err) {
      return 0;
    }
  }

  // Modificar updateMiningUI para usar recompensa real
  let notifiedEnd = false;
  async function updateMiningUI() {
    const timeLeft = getTimeLeft();
    if (timeLeft > 0) {
      startBtn.disabled = true;
      startBtn.innerText = 'Minando...';
      const hours = Math.floor(timeLeft / 3600000);
      const mins = Math.floor((timeLeft % 3600000) / 60000);
      const secs = Math.floor((timeLeft % 60000) / 1000);
      document.getElementById('timerValue').innerText = `${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
      document.querySelector('.timer-label').innerText = 'Tiempo restante';
      notifiedEnd = false;
    } else {
      startBtn.disabled = false;
      startBtn.innerText = 'Start Mining';
      document.getElementById('timerValue').innerText = '24:00:00';
      document.querySelector('.timer-label').innerText = 'Next activation in';
      // Notificación/resumen al finalizar sesión
      if (!notifiedEnd && session && session.start) {
        // Obtener recompensa real del backend
        const wallet = localStorage.getItem('rsc_wallet');
        let reward = 0;
        if (wallet) {
          const { privateKey } = JSON.parse(wallet);
          const address = '0x' + privateKey.slice(-40);
          reward = await getBackendReward(address);
        }
        showFeedback(`¡Sesión finalizada! Ganaste ${reward} RSC.`, false);
        addSessionToHistory(session, reward);
        renderSessionHistory();
        notifiedEnd = true;
      }
    }
  }

  // Reemplazar setInterval por versión async
  setInterval(() => { updateMiningUI(); updateSessionProgress(); }, 1000);
  updateMiningUI();
  updateSessionProgress();

  startBtn.addEventListener("click", async () => {
    // Validar wallet antes de minar
    const wallet = localStorage.getItem('rsc_wallet');
    if (!wallet) {
      showFeedback("Debes crear una wallet antes de minar.", true);
      setTimeout(() => { window.location.href = 'wallet.html'; }, 1800);
      return;
    }
    if (getTimeLeft() > 0) {
      showFeedback("Ya tienes una sesión de minería activa. Espera a que termine para volver a minar.", true);
      return;
    }
    const { privateKey } = JSON.parse(wallet);
    const address = '0x' + privateKey.slice(-40);

    // Registrar sesión en backend para evitar trampas
    try {
      const res = await fetch("/api/mining/start", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, start: Date.now() })
      });
      if (!res.ok) throw new Error("Error al iniciar sesión de minería");
      const data = await res.json();
      // Guardar sesión local
      session = { start: Date.now() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      updateMiningUI();
      showFeedback("Minería iniciada. No cierres la página.");
    } catch (err) {
      showFeedback("Error: " + err.message, true);
      return;
    }
    // Aquí puedes iniciar el intervalo de minado real si lo deseas
  });

  function stopMining() {
    miningActive = false;
    clearInterval(miningInterval);
    miningInterval = null;
    startBtn.classList.remove("active");
    startBtn.innerText = "Start Mining";
    statusEl.textContent = "Minería detenida.";
    progressBar.style.width = "0%";
  }

  function notify(msg, isError) {
    if (!notifyEl) return;
    notifyEl.textContent = msg;
    notifyEl.style.background = isError ? "#e35060" : "#3fd8c2";
    notifyEl.style.color = "#fff";
    notifyEl.style.display = "block";
    setTimeout(() => { notifyEl.style.display = "none"; }, 4500);
  }
});
