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
