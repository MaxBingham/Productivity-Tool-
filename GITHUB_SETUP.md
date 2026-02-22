# Add this project to GitHub (title: Productivity Tool)

Run these commands in your terminal from the project folder.

1. **Go to the project**
   ```bash
   cd ~/Documents/CodingProjects/ProductivityTool
   ```

2. **Initialize git and make the first commit**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Time Blocker productivity tool"
   ```

3. **Create the repo on GitHub**
   - Go to [github.com/new](https://github.com/new)
   - **Repository name:** `productivity-tool` (or `ProductivityTool`)
   - **Description:** Productivity tool – time blocker with Pomodoro overlay
   - Choose Public, then **Create repository** (do not add README, .gitignore, or license).

4. **Connect and push**
   Replace `YOUR_USERNAME` with your GitHub username:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/productivity-tool.git
   git push -u origin main
   ```

   If you use SSH:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/productivity-tool.git
   git push -u origin main
   ```

Done. The repo will show as **productivity-tool**; you can set the description/title to "Productivity Tool" in the repo settings.
