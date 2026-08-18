// db.js — SQLite database setup and schema for the College Admission Management System
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'admissions.db'));
db.pragma('foreign_keys = ON');

// ---------- Schema ----------
db.exec(`
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 60
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  gender TEXT,
  category TEXT DEFAULT 'General',
  grade_12_percent REAL,
  entrance_score REAL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending | Admitted | Rejected | Waitlisted
  applied_on TEXT DEFAULT (datetime('now')),
  remarks TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
`);

// ---------- Seed (only if empty) ----------
const courseCount = db.prepare('SELECT COUNT(*) AS c FROM courses').get().c;
if (courseCount === 0) {
  const insertCourse = db.prepare(
    'INSERT INTO courses (name, department, total_seats) VALUES (?, ?, ?)'
  );
  const courses = [
    ['B.Tech Computer Science', 'Engineering', 60],
    ['B.Tech Electronics', 'Engineering', 40],
    ['BBA', 'Management', 50],
    ['B.Sc Data Science', 'Science', 45],
    ['B.Com', 'Commerce', 55],
  ];
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertCourse.run(...row);
  });
  insertMany(courses);

  const insertStudent = db.prepare(`
    INSERT INTO students (name, email, phone, gender, category, grade_12_percent, entrance_score)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const students = [
    ['Aditi Sharma', 'aditi.sharma@example.com', '9876543210', 'Female', 'General', 92.5, 88],
    ['Rohan Verma', 'rohan.verma@example.com', '9876543211', 'Male', 'OBC', 85.2, 76],
    ['Sneha Reddy', 'sneha.reddy@example.com', '9876543212', 'Female', 'General', 95.1, 91],
    ['Karan Mehta', 'karan.mehta@example.com', '9876543213', 'Male', 'SC', 78.4, 65],
    ['Priya Nair', 'priya.nair@example.com', '9876543214', 'Female', 'General', 88.9, 82],
  ];
  const insertStudents = db.transaction((rows) => {
    for (const row of rows) insertStudent.run(...row);
  });
  insertStudents(students);

  const insertApp = db.prepare(`
    INSERT INTO applications (student_id, course_id, status, remarks)
    VALUES (?, ?, ?, ?)
  `);
  const apps = [
    [1, 1, 'Admitted', 'Strong entrance score'],
    [2, 3, 'Pending', null],
    [3, 4, 'Admitted', 'Top of merit list'],
    [4, 2, 'Rejected', 'Below cutoff'],
    [5, 5, 'Waitlisted', 'Seat pending confirmation'],
  ];
  const insertApps = db.transaction((rows) => {
    for (const row of rows) insertApp.run(...row);
  });
  insertApps(apps);
}

module.exports = db;
