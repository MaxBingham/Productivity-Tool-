/**
 * Parse "HH:MM" to minutes since midnight.
 */
function timeToMinutes(str) {
  const [h, m] = str.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Check if a break (at breakStartMin) overlaps the lunch window.
 */
function isInLunchWindow(breakStartMin, lunchStartMin, lunchEndMin) {
  return breakStartMin >= lunchStartMin && breakStartMin < lunchEndMin;
}

/**
 * Expand a single block into work/break segments.
 * blocks: [{ start, end, topic }]
 * config: workMinutes, shortBreakMinutes, longBreakMinutes, longBreakAfterSessions, lunchStart, lunchEnd, lunchBreakMinutes
 */
function expandBlocksToSegments(blocks, config) {
  if (!blocks || blocks.length === 0) return [];

  const {
    workMinutes = 25,
    shortBreakMinutes = 5,
    longBreakMinutes = 15,
    longBreakAfterSessions = 4,
    lunchStart = '12:00',
    lunchEnd = '13:30',
    lunchBreakMinutes = 25
  } = config;

  const lunchStartMin = timeToMinutes(lunchStart);
  const lunchEndMin = timeToMinutes(lunchEnd);

  const segments = [];

  for (const block of blocks) {
    let currentMin = timeToMinutes(block.start);
    const endMin = timeToMinutes(block.end);
    const topic = block.topic || '';

    let workCount = 0;

    while (currentMin < endMin) {
      const workEndMin = Math.min(currentMin + workMinutes, endMin);
      const workDuration = workEndMin - currentMin;
      if (workDuration > 0) {
        segments.push({
          start: minutesToTime(currentMin),
          end: minutesToTime(workEndMin),
          type: 'work',
          topic
        });
        workCount++;
        currentMin = workEndMin;
      }

      if (currentMin >= endMin) break;

      let breakMinutes = shortBreakMinutes;
      if (workCount >= longBreakAfterSessions) {
        breakMinutes = longBreakMinutes;
        workCount = 0;
      }

      const breakStartMin = currentMin;
      const breakEndMin = Math.min(currentMin + breakMinutes, endMin);

      if (isInLunchWindow(breakStartMin, lunchStartMin, lunchEndMin)) {
        const lunchLen = Math.min(lunchBreakMinutes, endMin - currentMin);
        segments.push({
          start: minutesToTime(currentMin),
          end: minutesToTime(currentMin + lunchLen),
          type: 'lunchBreak',
          topic: ''
        });
        currentMin += lunchLen;
      } else {
        segments.push({
          start: minutesToTime(currentMin),
          end: minutesToTime(breakEndMin),
          type: breakMinutes === longBreakMinutes ? 'longBreak' : 'shortBreak',
          topic: ''
        });
        currentMin = breakEndMin;
      }
    }
  }

  return segments;
}

module.exports = { expandBlocksToSegments, timeToMinutes, minutesToTime };
