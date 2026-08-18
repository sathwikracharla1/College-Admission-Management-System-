# College Admission Management System

A full-stack app: Node/Express + SQLite backend, vanilla HTML/CSS/JS frontend.

## Run it

```bash
cd backend
npm install
node server.js
```

Then open **http://localhost:4000** in your browser. The frontend is served
by the same Express server, so there's nothing else to start.

The SQLite database (`admissions.db`) is created automatically on first run
and seeded with sample students, courses, and applications.

## What's inside

- **backend/db.js** — SQLite schema (students, courses, applications) + seed data
- **backend/server.js** — REST API (CRUD for students/courses/applications, plus a `/api/stats` endpoint for the dashboard) and static file serving
- **frontend/index.html, style.css, app.js** — single-page dashboard: Overview (stats + charts), Students, Courses, Applications (with inline status updates)

## API endpoints

| Method | Route                                 | Purpose                                                 |
|--------|-----------------------------------------|----------------------------------------------------------|
| GET    | /api/students                          | list students                                            |
| POST   | /api/students                          | add student                                               |
| PUT    | /api/students/:id                      | update student                                             |
| DELETE | /api/students/:id                      | remove student                                             |
| GET    | /api/courses                           | list courses                                               |
| POST   | /api/courses                           | add course                                                  |
| GET    | /api/applications?status=&course_id=   | list applications (filterable)                              |
| POST   | /api/applications                      | submit application                                          |
| PUT    | /api/applications/:id/status           | update decision (Admitted/Rejected/Waitlisted/Pending)      |
| GET    | /api/stats                             | dashboard totals + breakdowns                              |
