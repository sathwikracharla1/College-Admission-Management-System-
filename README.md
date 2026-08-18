# College Admission Management System

A simple and user-friendly **College Admission Management System** built as a full-stack web application.

The system helps manage **students, courses, and college applications** through a simple dashboard.

## 🚀 Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **API:** REST API

## ✨ Features

### 📊 Dashboard
- View admission statistics
- View total students
- View total courses
- View application statistics
- Monitor application status

### 👨‍🎓 Student Management
- View all students
- Add new students
- Update student details
- Delete students

### 📚 Course Management
- View available courses
- Add new courses

### 📝 Application Management
- Submit student applications
- View applications
- Filter applications
- Update application status

Application statuses include:

- Pending
- Admitted
- Rejected
- Waitlisted

## 📁 Project Structure

```text
college-admission-system/
│
├── backend/
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── style.css
│
└── README.md

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
