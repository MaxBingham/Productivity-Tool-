(function () {
  const planDate = document.getElementById('planDate');
  const blocksList = document.getElementById('blocksList');
  const addBlockBtn = document.getElementById('addBlock');
  const toggleSettings = document.getElementById('toggleSettings');
  const settingsPanel = document.getElementById('settingsPanel');
  const saveSettingsBtn = document.getElementById('saveSettings');

  function tomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  planDate.value = tomorrow();

  function renderBlock(block, index) {
    const div = document.createElement('div');
    div.className = 'block';
    div.innerHTML = `
      <input type="time" class="start" value="${block.start || '09:00'}" />
      <input type="time" class="end" value="${block.end || '10:00'}" />
      <button type="button" class="remove">Remove</button>
      <input type="text" class="topic" placeholder="Topic" value="${block.topic || ''}" />
    `;
    div.querySelector('.remove').onclick = () => removeBlock(index);
    blocksList.appendChild(div);
  }

  function removeBlock(index) {
    loadBlocks().then(blocks => {
      blocks.splice(index, 1);
      saveBlocks(blocks);
      refreshList();
    });
  }

  function getBlocksFromDOM() {
    const rows = blocksList.querySelectorAll('.block');
    return Array.from(rows).map(row => ({
      start: row.querySelector('.start').value,
      end: row.querySelector('.end').value,
      topic: row.querySelector('.topic').value.trim()
    }));
  }

  function saveBlocks(blocks) {
    const dateStr = planDate.value;
    return window.timeBlocker.setPlan(dateStr, blocks);
  }

  function loadBlocks() {
    return window.timeBlocker.getPlan(planDate.value);
  }

  function refreshList() {
    blocksList.innerHTML = '';
    loadBlocks().then(blocks => {
      (blocks || []).forEach((b, i) => renderBlock(b, i));
    });
  }

  addBlockBtn.onclick = () => {
    const blocks = getBlocksFromDOM();
    blocks.push({ start: '09:00', end: '10:00', topic: '' });
    saveBlocks(blocks).then(() => refreshList());
  };

  planDate.addEventListener('change', refreshList);

  blocksList.addEventListener('change', () => {
    const blocks = getBlocksFromDOM();
    saveBlocks(blocks);
  });

  toggleSettings.onclick = (e) => {
    e.preventDefault();
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  };

  function loadSettings() {
    window.timeBlocker.getSettings().then(s => {
      document.getElementById('workMin').value = s.workMinutes;
      document.getElementById('shortBreak').value = s.shortBreakMinutes;
      document.getElementById('longBreak').value = s.longBreakMinutes;
      document.getElementById('longBreakAfter').value = s.longBreakAfterSessions;
      document.getElementById('lunchStart').value = s.lunchStart || '12:00';
      document.getElementById('lunchEnd').value = s.lunchEnd || '13:30';
      document.getElementById('lunchBreak').value = s.lunchBreakMinutes;
    });
  }

  saveSettingsBtn.onclick = () => {
    window.timeBlocker.setSettings({
      workMinutes: parseInt(document.getElementById('workMin').value, 10) || 25,
      shortBreakMinutes: parseInt(document.getElementById('shortBreak').value, 10) || 5,
      longBreakMinutes: parseInt(document.getElementById('longBreak').value, 10) || 15,
      longBreakAfterSessions: parseInt(document.getElementById('longBreakAfter').value, 10) || 4,
      lunchStart: document.getElementById('lunchStart').value || '12:00',
      lunchEnd: document.getElementById('lunchEnd').value || '13:30',
      lunchBreakMinutes: parseInt(document.getElementById('lunchBreak').value, 10) || 25
    }).then(() => { settingsPanel.style.display = 'none'; });
  };

  loadSettings();
  refreshList();
})();
