(function () {
  const segmentList = document.getElementById('segmentList');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const toggleBar = document.getElementById('toggleBar');
  const currentTimeEl = document.getElementById('currentTime');
  const countdownEl = document.getElementById('countdown');
  const taskEl = document.getElementById('currentTask');

  let segments = [];
  let showBar = true;
  const SEGMENT_FETCH_MS = 60 * 1000;
  const CLOCK_TICK_MS = 1000;

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function timeToMin(str) {
    const p = str.split(':').map(Number);
    return (p[0] || 0) * 60 + (p[1] || 0);
  }

  function pad2(n) {
    return String(Math.floor(n)).padStart(2, '0');
  }

  function updateClock() {
    const now = new Date();
    currentTimeEl.textContent = pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
  }

  function getCurrentSegment(nowMin) {
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      const startMin = timeToMin(s.start);
      const endMin = timeToMin(s.end);
      if (nowMin >= startMin && nowMin < endMin) return { seg: s, endMin };
    }
    return null;
  }

  function render() {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const totalDayMin = 24 * 60;
    const progressPct = (nowMin / totalDayMin) * 100;

    segmentList.innerHTML = '';
    segments.forEach((seg) => {
      const endMin = timeToMin(seg.end);
      const done = nowMin >= endMin;
      const current = nowMin >= timeToMin(seg.start) && nowMin < endMin;
      const row = document.createElement('div');
      row.className = 'overlay-segment' + (done ? ' done' : '') + (current ? ' current' : '');
      row.innerHTML = '<span class="time">' + seg.start + '</span>' +
        (done ? '<span class="check">✓</span>' : '<span class="check"></span>');
      segmentList.appendChild(row);
    });

    if (showBar && segments.length > 0) {
      progressBar.style.display = 'block';
      progressFill.style.height = Math.min(100, Math.max(0, progressPct)) + '%';
    } else {
      progressBar.style.display = 'none';
    }

    const current = getCurrentSegment(nowMin);
    if (current) {
      const remainingSec = Math.max(0, Math.round((current.endMin - nowMin) * 60));
      countdownEl.textContent = remainingSec + ' s';
      countdownEl.classList.remove('idle');
      if (current.seg.type === 'work' && current.seg.topic) taskEl.textContent = current.seg.topic;
      else if (current.seg.type === 'shortBreak') taskEl.textContent = 'Short break';
      else if (current.seg.type === 'longBreak') taskEl.textContent = 'Long break';
      else if (current.seg.type === 'lunchBreak') taskEl.textContent = 'Lunch break';
      else taskEl.textContent = current.seg.topic || 'Work';
    } else {
      countdownEl.textContent = '--:--';
      countdownEl.classList.add('idle');
      taskEl.textContent = segments.length ? 'Between segments' : 'No plan for today';
    }
  }

  function fetchAndRender() {
    window.timeBlocker.getTodaySegments(todayStr()).then(s => {
      segments = s || [];
      render();
    });
  }

  toggleBar.onclick = () => {
    showBar = !showBar;
    toggleBar.textContent = showBar ? 'Hide bar' : 'Show bar';
    render();
  };

  updateClock();
  setInterval(updateClock, CLOCK_TICK_MS);
  render();
  setInterval(render, CLOCK_TICK_MS);
  fetchAndRender();
  setInterval(fetchAndRender, SEGMENT_FETCH_MS);
})();
