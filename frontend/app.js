// app.js — talks to the College Admission Management System API
const API = '/api';

let COURSES = [];
let STUDENTS = [];

/* ------------------------- helpers ------------------------- */

async function apiGet(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return res.json();
}
async function apiSend(path, method, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json()).error || `${method} ${path} failed`);
  return res.status === 204 ? null : res.json();
}

function fmtDate(iso) {
  if (!iso) return '—';
  return iso.split(' ')[0];
}

/* ------------------------- navigation ------------------------- */

document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`view-${btn.dataset.view}`).classList.add('active');
  });
});

/* ------------------------- overview ------------------------- */

async function loadOverview() {
  const { totals, byCourse, byCategory } = await apiGet('/stats');

  const cards = [
    { label: 'Total students', value: totals.total_students, cls: '' },
    { label: 'Total applications', value: totals.total_applications, cls: '' },
    { label: 'Admitted', value: totals.admitted, cls: 'admit' },
    { label: 'Pending', value: totals.pending, cls: 'pending' },
    { label: 'Rejected', value: totals.rejected, cls: 'reject' },
  ];
  document.getElementById('stat-grid').innerHTML = cards
    .map((c) => `
      <div class="stat-card ${c.cls}">
        <div class="label">${c.label}</div>
        <div class="value">${c.value}</div>
      </div>`)
    .join('');

  document.getElementById('course-bars').innerHTML = byCourse
    .map((c) => {
      const pct = c.total_seats ? Math.min(100, Math.round((c.admitted / c.total_seats) * 100)) : 0;
      return `
        <div class="bar-row">
          <div class="bar-label"><span>${c.course}</span><span>${c.admitted}/${c.total_seats}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        </div>`;
    })
    .join('');

  const maxApps = Math.max(1, ...byCategory.map((c) => c.applications));
  document.getElementById('category-bars').innerHTML = byCategory
    .map((c) => {
      const pct = Math.round((c.applications / maxApps) * 100);
      return `
        <div class="bar-row">
          <div class="bar-label"><span>${c.category || 'Unspecified'}</span><span>${c.applications} applied · ${c.admitted} admitted</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:var(--accent-wait)"></div></div>
        </div>`;
    })
    .join('');
}

/* ------------------------- students ------------------------- */

async function loadStudents() {
  STUDENTS = await apiGet('/students');
  document.querySelector('#table-students tbody').innerHTML = STUDENTS
    .map((s) => `
      <tr>
        <td>${s.name}</td>
        <td class="mono">${s.email}</td>
        <td>${s.category || '—'}</td>
        <td class="mono">${s.grade_12_percent ?? '—'}</td>
        <td class="mono">${s.entrance_score ?? '—'}</td>
        <td><button class="link-btn" data-del-student="${s.id}">Remove</button></td>
      </tr>`)
    .join('');

  document.querySelectorAll('[data-del-student]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this student and their applications?')) return;
      await apiSend(`/students/${btn.dataset.delStudent}`, 'DELETE');
      loadStudents();
      loadOverview();
    });
  });
}

/* ------------------------- courses ------------------------- */

async function loadCourses() {
  const stats = await apiGet('/stats');
  COURSES = await apiGet('/courses');
  const byCourseStats = Object.fromEntries(stats.byCourse.map((c) => [c.course, c]));

  document.querySelector('#table-courses tbody').innerHTML = COURSES
    .map((c) => {
      const s = byCourseStats[c.name] || { applications: 0, admitted: 0 };
      return `
      <tr>
        <td>${c.name}</td>
        <td>${c.department}</td>
        <td class="mono">${c.total_seats}</td>
        <td class="mono">${s.applications}</td>
        <td class="mono">${s.admitted}</td>
        <td><button class="link-btn" data-del-course="${c.id}">Remove</button></td>
      </tr>`;
    })
    .join('');

  document.querySelectorAll('[data-del-course]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this course and its applications?')) return;
      await apiSend(`/courses/${btn.dataset.delCourse}`, 'DELETE');
      loadCourses();
      loadOverview();
    });
  });
}

/* ------------------------- applications ------------------------- */

async function loadApplications() {
  const status = document.getElementById('filter-status').value;
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const apps = await apiGet(`/applications${qs}`);

  document.querySelector('#table-applications tbody').innerHTML = apps
    .map((a) => `
      <tr>
        <td>${a.student_name}</td>
        <td>${a.course_name}</td>
        <td class="mono">${a.entrance_score ?? '—'}</td>
        <td class="mono">${fmtDate(a.applied_on)}</td>
        <td>
          <select class="status-select ${a.status}" data-app-id="${a.id}">
            ${['Pending', 'Admitted', 'Rejected', 'Waitlisted']
              .map((s) => `<option value="${s}" ${s === a.status ? 'selected' : ''}>${s}</option>`)
              .join('')}
          </select>
        </td>
        <td>${a.remarks || '—'}</td>
      </tr>`)
    .join('');

  document.querySelectorAll('[data-app-id]').forEach((sel) => {
    sel.addEventListener('change', async () => {
      await apiSend(`/applications/${sel.dataset.appId}/status`, 'PUT', { status: sel.value });
      sel.className = `status-select ${sel.value}`;
      loadOverview();
    });
  });
}

document.getElementById('filter-status').addEventListener('change', loadApplications);

/* ------------------------- modal ------------------------- */

const backdrop = document.getElementById('modal-backdrop');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

function openModal(title, bodyHtml, onSubmit) {
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;
  backdrop.classList.add('open');
  const form = modalBody.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await onSubmit(new FormData(form));
    closeModal();
  });
}
function closeModal() { backdrop.classList.remove('open'); }
document.getElementById('modal-close').addEventListener('click', closeModal);
backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });

document.getElementById('btn-add-student').addEventListener('click', () => {
  openModal('Add student', `
    <form>
      <div class="field"><label>Full name</label><input name="name" required /></div>
      <div class="field"><label>Email</label><input name="email" type="email" required /></div>
      <div class="field"><label>Phone</label><input name="phone" /></div>
      <div class="field"><label>Category</label>
        <select name="category"><option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option></select>
      </div>
      <div class="field"><label>12th grade %</label><input name="grade_12_percent" type="number" step="0.1" /></div>
      <div class="field"><label>Entrance score</label><input name="entrance_score" type="number" step="0.1" /></div>
      <button class="modal-submit" type="submit">Add student</button>
    </form>
  `, async (fd) => {
    await apiSend('/students', 'POST', Object.fromEntries(fd));
    loadStudents(); loadOverview();
  });
});

document.getElementById('btn-add-course').addEventListener('click', () => {
  openModal('Add course', `
    <form>
      <div class="field"><label>Course name</label><input name="name" required /></div>
      <div class="field"><label>Department</label><input name="department" required /></div>
      <div class="field"><label>Total seats</label><input name="total_seats" type="number" value="60" /></div>
      <button class="modal-submit" type="submit">Add course</button>
    </form>
  `, async (fd) => {
    await apiSend('/courses', 'POST', Object.fromEntries(fd));
    loadCourses(); loadOverview();
  });
});

document.getElementById('btn-add-application').addEventListener('click', async () => {
  if (!STUDENTS.length) STUDENTS = await apiGet('/students');
  if (!COURSES.length) COURSES = await apiGet('/courses');
  openModal('New application', `
    <form>
      <div class="field"><label>Student</label>
        <select name="student_id" required>${STUDENTS.map((s) => `<option value="${s.id}">${s.name}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Course</label>
        <select name="course_id" required>${COURSES.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Remarks (optional)</label><input name="remarks" /></div>
      <button class="modal-submit" type="submit">Submit application</button>
    </form>
  `, async (fd) => {
    await apiSend('/applications', 'POST', Object.fromEntries(fd));
    loadApplications(); loadOverview();
  });
});

/* ------------------------- boot ------------------------- */

async function boot() {
  const status = document.getElementById('conn-status');
  try {
    await apiGet('/health');
    status.textContent = '● connected';
    status.className = 'conn-status ok';
  } catch {
    status.textContent = '● API unreachable — start the backend';
    status.className = 'conn-status err';
    return;
  }
  loadOverview();
  loadStudents();
  loadCourses();
  loadApplications();
}
boot();
