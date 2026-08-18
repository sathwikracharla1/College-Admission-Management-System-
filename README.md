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

## 🔗 API Endpoints

The backend provides REST APIs for managing students, courses, and applications.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/students` | View all students |
| POST | `/api/students` | Add a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |
| GET | `/api/courses` | View all courses |
| POST | `/api/courses` | Add a course |
| GET | `/api/applications` | View applications |
| POST | `/api/applications` | Submit an application |
| PUT | `/api/applications/:id/status` | Update application status |
| GET | `/api/stats` | View dashboard statistics |


## 🎯 Purpose of the Project

This project demonstrates how a **full-stack web application** works by connecting the frontend, backend server, REST APIs, and database.

It can be used as a **college project, learning project, or starting point for a larger admission management system**.

## 👨‍💻 Author

**Sathwik Racharla**              | dashboard totals + breakdowns                              |
