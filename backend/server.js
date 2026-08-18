// server.js — REST API for the College Admission Management System
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 4000;

// Small helper to wrap route handlers and catch errors
const h = (fn) => (req, res) => {
  try {
    fn(req, res);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/* ------------------------- COURSES ------------------------- */

app.get('/api/courses', h((req, res) => {
  const courses = db.prepare('SELECT * FROM courses ORDER BY id').all();
  res.json(courses);
}));

app.post('/api/courses', h((req, res) => {
  const { name, department, total_seats } = req.body;
  if (!name || !department) throw new Error('name and department are required');
  const info = db
    .prepare('INSERT INTO courses (name, department, total_seats) VALUES (?, ?, ?)')
    .run(name, department, total_seats || 60);
  res.status(201).json(db.prepare('SELECT * FROM courses WHERE id = ?').get(info.lastInsertRowid));
}));

app.put('/api/courses/:id', h((req, res) => {
  const { name, department, total_seats } = req.body;
  db.prepare('UPDATE courses SET name = ?, department = ?, total_seats = ? WHERE id = ?')
    .run(name, department, total_seats, req.params.id);
  res.json(db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id));
}));

app.delete('/api/courses/:id', h((req, res) => {
  db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  res.status(204).end();
}));

/* ------------------------- STUDENTS ------------------------- */

app.get('/api/students', h((req, res) => {
  const students = db.prepare('SELECT * FROM students ORDER BY id').all();
  res.json(students);
}));

app.get('/api/students/:id', h((req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
}));

app.post('/api/students', h((req, res) => {
  const { name, email, phone, gender, category, grade_12_percent, entrance_score } = req.body;
  if (!name || !email) throw new Error('name and email are required');
  const info = db
    .prepare(`INSERT INTO students (name, email, phone, gender, category, grade_12_percent, entrance_score)
              VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(name, email, phone || null, gender || null, category || 'General',
         grade_12_percent || null, entrance_score || null);
  res.status(201).json(db.prepare('SELECT * FROM students WHERE id = ?').get(info.lastInsertRowid));
}));

app.put('/api/students/:id', h((req, res) => {
  const { name, email, phone, gender, category, grade_12_percent, entrance_score } = req.body;
  db.prepare(`UPDATE students SET name=?, email=?, phone=?, gender=?, category=?,
              grade_12_percent=?, entrance_score=? WHERE id=?`)
    .run(name, email, phone, gender, category, grade_12_percent, entrance_score, req.params.id);
  res.json(db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id));
}));

app.delete('/api/students/:id', h((req, res) => {
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  res.status(204).end();
}));

/* ----------------------- APPLICATIONS ----------------------- */

const applicationView = `
  SELECT a.id, a.status, a.applied_on, a.remarks,
         s.id AS student_id, s.name AS student_name, s.email AS student_email,
         s.entrance_score, s.grade_12_percent, s.category,
         c.id AS course_id, c.name AS course_name, c.department, c.total_seats
  FROM applications a
  JOIN students s ON s.id = a.student_id
  JOIN courses c ON c.id = a.course_id
`;

app.get('/api/applications', h((req, res) => {
  const { status, course_id } = req.query;
  let query = applicationView;
  const conditions = [];
  const params = [];
  if (status) { conditions.push('a.status = ?'); params.push(status); }
  if (course_id) { conditions.push('a.course_id = ?'); params.push(course_id); }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY a.id DESC';
  res.json(db.prepare(query).all(...params));
}));

app.post('/api/applications', h((req, res) => {
  const { student_id, course_id, remarks } = req.body;
  if (!student_id || !course_id) throw new Error('student_id and course_id are required');
  const info = db
    .prepare('INSERT INTO applications (student_id, course_id, remarks) VALUES (?, ?, ?)')
    .run(student_id, course_id, remarks || null);
  res.status(201).json(db.prepare(applicationView + ' WHERE a.id = ?').get(info.lastInsertRowid));
}));

app.put('/api/applications/:id/status', h((req, res) => {
  const { status, remarks } = req.body;
  const allowed = ['Pending', 'Admitted', 'Rejected', 'Waitlisted'];
  if (!allowed.includes(status)) throw new Error(`status must be one of ${allowed.join(', ')}`);
  db.prepare('UPDATE applications SET status = ?, remarks = COALESCE(?, remarks) WHERE id = ?')
    .run(status, remarks, req.params.id);
  res.json(db.prepare(applicationView + ' WHERE a.id = ?').get(req.params.id));
}));

app.delete('/api/applications/:id', h((req, res) => {
  db.prepare('DELETE FROM applications WHERE id = ?').run(req.params.id);
  res.status(204).end();
}));

/* -------------------------- STATS ---------------------------- */

app.get('/api/stats', h((req, res) => {
  const totals = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM students) AS total_students,
      (SELECT COUNT(*) FROM courses) AS total_courses,
      (SELECT COUNT(*) FROM applications) AS total_applications,
      (SELECT COUNT(*) FROM applications WHERE status='Admitted') AS admitted,
      (SELECT COUNT(*) FROM applications WHERE status='Pending') AS pending,
      (SELECT COUNT(*) FROM applications WHERE status='Rejected') AS rejected,
      (SELECT COUNT(*) FROM applications WHERE status='Waitlisted') AS waitlisted
  `).get();

  const byCourse = db.prepare(`
    SELECT c.name AS course, c.total_seats,
           COUNT(a.id) AS applications,
           SUM(CASE WHEN a.status='Admitted' THEN 1 ELSE 0 END) AS admitted
    FROM courses c
    LEFT JOIN applications a ON a.course_id = c.id
    GROUP BY c.id
    ORDER BY c.id
  `).all();

  const byCategory = db.prepare(`
    SELECT s.category, COUNT(a.id) AS applications,
           SUM(CASE WHEN a.status='Admitted' THEN 1 ELSE 0 END) AS admitted
    FROM students s
    LEFT JOIN applications a ON a.student_id = s.id
    GROUP BY s.category
  `).all();

  res.json({ totals, byCourse, byCategory });
}));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`College Admission Management System API running on http://localhost:${PORT}`);
});
