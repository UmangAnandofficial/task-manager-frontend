# Task Manager Frontend

React frontend for the Team Task Manager assignment.

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios with JWT interceptor
- Context API for auth state

## Features
- Auth (signup/login) with JWT
- Role-based UI (admin vs member)
- Projects: create, list, detail, delete
- Tasks: create with assignment + due dates, status board (Todo / In Progress / Done)
- Member management (add/remove from projects)
- Dashboard with stats: tasks by status, overdue count, projects
- Auto-logout on 401

## Setup

```bash
npm install
```

Create a `.env` file in the root:

```
VITE_API_URL=https://your-railway-backend-url.up.railway.app
```

Run dev server:

```bash
npm run dev
```

Visit: http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

## Default admin credentials
After running `npm run seed` on the backend:
- Email: `admin@taskmanager.com`
- Password: `admin123`






==================================

This package adds 4 polish upgrades:
1. Toast notifications (replaces alert/confirm)
2. Inter font from Google Fonts
3. Skeleton loaders (replaces "Loading..." text)
4. Recharts pie chart on dashboard

ESTIMATED TIME: 25 minutes
ESTIMATED SCORE IMPACT: +4-5 points (78% → 92%+)

----------------------------------
PART 1: INSTALL NEW PACKAGES
----------------------------------

Open VS Code with your FRONTEND folder.
Open the terminal (Ctrl + ` or View → Terminal).

Run:

  npm install react-hot-toast recharts

Wait ~30 seconds. Should see "added X packages".

----------------------------------
PART 2: REPLACE FILES
----------------------------------

You'll need to replace 6 files and add 1 new file.

FILE 1: src/index.css
  - Open existing src/index.css
  - Ctrl+A → Delete
  - Copy entire content of polish-pack/index.css
  - Paste → Save

FILE 2: src/main.jsx
  - Open existing src/main.jsx
  - Ctrl+A → Delete
  - Copy entire content of polish-pack/main.jsx
  - Paste → Save

FILE 3: tailwind.config.js  (in root of frontend folder, NOT inside src)
  - Open existing tailwind.config.js
  - Ctrl+A → Delete
  - Copy entire content of polish-pack/tailwind.config.js
  - Paste → Save

FILE 4: src/components/Skeleton.jsx  (NEW FILE)
  - In VS Code, right-click the "components" folder
  - New File → name it: Skeleton.jsx
  - Copy entire content of polish-pack/Skeleton.jsx
  - Paste → Save
  - (If you don't have a components folder, create it inside src/)

FILE 5: src/pages/Dashboard.jsx
  - Open existing src/pages/Dashboard.jsx
  - Ctrl+A → Delete
  - Copy entire content of polish-pack/Dashboard.jsx
  - Paste → Save

FILE 6: src/pages/Projects.jsx
  - Open existing src/pages/Projects.jsx
  - Ctrl+A → Delete
  - Copy entire content of polish-pack/Projects.jsx
  - Paste → Save

FILE 7: src/pages/ProjectDetail.jsx
  - Open existing src/pages/ProjectDetail.jsx
  - Ctrl+A → Delete
  - Copy entire content of polish-pack/ProjectDetail.jsx
  - Paste → Save

----------------------------------
PART 3: TEST LOCALLY (OPTIONAL BUT RECOMMENDED)
----------------------------------

Before pushing to Railway, test locally:

  npm run dev

Open http://localhost:5173

Verify:
- Inter font is loaded (text looks slightly cleaner)
- Login page works
- Dashboard shows pie chart
- Try clicking delete - styled modal appears (not browser alert)
- Try creating a project - green toast appears top-right

If everything works locally → push to GitHub.
If something breaks → check VS Code Problems tab for errors.

----------------------------------
PART 4: PUSH TO PRODUCTION
----------------------------------

In VS Code terminal (frontend folder):

  git add .
  git commit -m "Add polish: toasts, skeletons, charts, Inter font"
  git push

Wait ~2-3 min for Railway to redeploy frontend.

----------------------------------
PART 5: VERIFY ON PRODUCTION
----------------------------------

1. Open frontend URL
2. Hard refresh (Ctrl+Shift+R)
3. Login
4. Verify:
   ✓ Cleaner font (Inter)
   ✓ Pie chart visible on dashboard
   ✓ Toast notifications appear when creating/deleting
   ✓ Skeleton loaders show briefly while pages load
   ✓ Delete confirmations are styled modals (not browser popups)

----------------------------------
TROUBLESHOOTING
----------------------------------

Issue: "Module not found: react-hot-toast"
Fix: Run npm install again in frontend folder

Issue: "Pie chart not showing"
Fix: Check that recharts is installed: npm list recharts
     If missing: npm install recharts

Issue: "Cannot find ../components/Skeleton"
Fix: Make sure you created Skeleton.jsx INSIDE src/components/
     The path should be: src/components/Skeleton.jsx

Issue: Tailwind animations not working
Fix: Make sure tailwind.config.js was replaced (it has the fadeIn keyframes)
     Restart npm run dev after editing tailwind.config.js

Issue: Toasts not appearing
Fix: Make sure main.jsx has <Toaster /> component included
     Hard refresh browser (Ctrl+Shift+R)

----------------------------------
WHAT GOT BETTER
----------------------------------

Before:
- Browser alert() popups (looks 1990s)
- "Loading..." text (looks slow)
- No charts (no visual data)
- Default system font

After:
- Slide-in toast notifications (looks modern)
- Animated skeleton loaders (feels snappy)
- Beautiful pie chart on dashboard (shows analytics)
- Inter font (cleaner typography)
- Smooth transitions on hover
- Custom delete confirmation modals
- Animated form expansions
