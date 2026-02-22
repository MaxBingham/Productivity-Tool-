# Time Blocker

Lightweight desktop time blocker with Pomodoro-style work/break segments and a small overlay. Plan your day in blocks; the app splits each block into work sessions and breaks (with optional lunch window). Dark mode, minimal UI.

## Requirements

- Node.js 18+
- Windows or macOS

## Setup

If `npm install` fails with permission errors on the npm cache, fix it once:

```bash
sudo chown -R $(whoami) ~/.npm
```

Then:

```bash
cd Documents/CodingProjects/ProductivityTool
npm install
npm start
```

## Usage

1. **Plan (main window)**  
   Set the date (default: tomorrow), add time blocks (start, end, topic). Click **+ Add block**. Changes save automatically.

2. **Settings**  
   Click **Settings** to set Pomodoro: work length, short/long break, long break after N sessions, lunch window and lunch break length.

3. **Overlay (top-right)**  
   Shows today's segments: time + check when done, optional vertical progress bar (toggle with "Hide bar" / "Show bar"), and current timer + task. Updates every 60 seconds.

4. **Tray**  
   Right-click the tray icon: **Show plan**, **Show overlay**, **Quit**.

5. **Notifications**  
   System notifications when a new segment starts (work, short break, long break, lunch).

## Data

- Plans: `userData/time-blocker/plans.json` (per date).
- Settings: `userData/time-blocker/settings.json`.  
  On Windows, `userData` is under `%APPDATA%`.

## Build (optional)

```bash
npm run dist
```

Output in `dist/`.
