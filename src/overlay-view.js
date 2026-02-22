(function () {
  const segmentList = document.getElementById('segmentList');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const toggleBar = document.getElementById('toggleBar');
  const timerEl = document.getElementById('timer');
  const taskEl = document.getElementById('currentTask');

  let segments = [];
  let showBar = true;
  const OVERLAY_UPDATE_MS = 60 * 1000;

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function timeToMin(str) {
    const p = str.split(':').map(Number);
    return (p[0] || 0) * 60 + (p[1] || 0);
  }

  function render() {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const totalDayMin = 24 * 60;
    let progressPct = (nowMin / totalDayMin) * 100;

    segmentList.innerHTML = '';
    segments.forEach((seg, i) => {
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

    let currentSeg = null;
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      const startMin = timeToMin(s.start);
      const endMin = timeToMin(s.end);
      if (nowMin >= startMin && nowMin < endMin) {
        currentSeg = s;
        break;
      }
    }

    if (currentSeg) {
      const endMin = timeToMin(currentSeg.end);
      const remainingMin = endMin - nowMin;
      const m = Math.floor(remainingMin);
      const sec = Math.round((remainingMin - m) * 60);
      timerEl.textContent = (m > 0 ? m + 'm ' : '') + (sec > 0 ? sec + 's' : '0s');
      if (currentSeg.type === 'work' && currentSeg.topic) taskEl.textContent = currentSeg.topic;
      else if (currentSeg.type === 'shortBreak') taskEl.textContent = 'Short break';
      else if (currentSeg.type === 'longBreak') taskEl.textContent = 'Long break';
      else if (currentSeg.type === 'lunchBreak') taskEl.textContent = 'Lunch break';
      else taskEl.textContent = currentSeg.topic || 'Work';
    } else {
      timerEl.textContent = '--';
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

  fetchAndRender();
  setInterval(fetchAndRender, OVERLAY_UPDATE_MS);
})();
