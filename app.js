// ── State ──────────────────────────────────────────────────
let employees = JSON.parse(localStorage.getItem('employees') || 'null') || [
  { id: 'EMP-001', name: 'Arjun Sharma',   dept: 'Frontend', role: 'Senior Developer' },
  { id: 'EMP-002', name: 'Priya Menon',    dept: 'Backend',  role: 'Lead Engineer' },
  { id: 'EMP-003', name: 'Karthik Rajan',  dept: 'DevOps',   role: 'Cloud Architect' },
  { id: 'EMP-004', name: 'Divya Nair',     dept: 'QA',       role: 'QA Analyst' },
  { id: 'EMP-005', name: 'Rahul Iyer',     dept: 'Design',   role: 'UI/UX Designer' },
  { id: 'EMP-006', name: 'Sneha Reddy',    dept: 'Frontend', role: 'React Developer' },
  { id: 'EMP-007', name: 'Vijay Kumar',    dept: 'Backend',  role: 'Node.js Developer' },
  { id: 'EMP-008', name: 'Ananya Das',     dept: 'QA',       role: 'Automation Tester' },
];

let records = JSON.parse(localStorage.getItem('records') || '[]');

let selectedStatus = 'Present';
let barChartInstance = null;
let deptChartInstance = null;

const DEPT_COLORS = {
  Frontend: '#6c63ff', Backend: '#22c55e', DevOps: '#f59e0b',
  QA: '#ef4444', Design: '#a78bfa'
};

const AVATAR_COLORS = [
  ['#1e163a','#a78bfa'],['#0d2b1a','#22c55e'],['#1a1a0d','#f59e0b'],
  ['#1a0d0d','#ef4444'],['#0d1a2e','#60a5fa'],['#1a0d1a','#e879f9'],
];

// ── Helpers ────────────────────────────────────────────────
function save() {
  localStorage.setItem('employees', JSON.stringify(employees));
  localStorage.setItem('records', JSON.stringify(records));
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}

function avatarColor(id) {
  const idx = parseInt(id.replace(/\D/g,''), 10) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    day:'numeric', month:'short', year:'numeric'
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function getRecordsForDate(date, dept) {
  return records.filter(r => {
    const emp = employees.find(e => e.id === r.empId);
    if (!emp) return false;
    if (dept && dept !== 'All' && emp.dept !== dept) return false;
    return r.date === date;
  });
}

// ── Clock & Date ───────────────────────────────────────────
function initClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleTimeString('en-IN', { hour12: false });
  document.getElementById('page-date').textContent =
    now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  document.getElementById('today-label').textContent = fmtDate(todayStr());
  document.getElementById('bulk-date-label').textContent = fmtDate(todayStr());
  setInterval(() => {
    document.getElementById('clock').textContent =
      new Date().toLocaleTimeString('en-IN', { hour12: false });
  }, 1000);
}

// ── Stats ──────────────────────────────────────────────────
function updateStats() {
  const dept = document.getElementById('dept-filter').value;
  const today = todayStr();
  const todayRecs = getRecordsForDate(today, dept);
  const emps = dept === 'All' ? employees : employees.filter(e => e.dept === dept);
  const total = emps.length;
  const present = todayRecs.filter(r => r.status === 'Present').length;
  const absent  = todayRecs.filter(r => r.status === 'Absent').length;
  const late    = todayRecs.filter(r => r.status === 'Late').length;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-present').textContent = present;
  document.getElementById('stat-absent').textContent = absent;
  document.getElementById('stat-late').textContent = late;
  document.getElementById('pct-present').textContent = total ? Math.round(present/total*100)+'%' : '0%';
  document.getElementById('pct-absent').textContent  = total ? Math.round(absent/total*100)+'%'  : '0%';
  document.getElementById('pct-late').textContent    = total ? Math.round(late/total*100)+'%'    : '0%';
}

// ── Bar Chart ──────────────────────────────────────────────
function renderBarChart() {
  const ctx = document.getElementById('barChart').getContext('2d');
  const today = todayStr();
  const depts = ['Frontend','Backend','DevOps','QA','Design'];
  const present = [], absent = [], late = [];
  depts.forEach(d => {
    const recs = getRecordsForDate(today, d);
    const emps = employees.filter(e => e.dept === d);
    const marked = recs.length;
    present.push(recs.filter(r=>r.status==='Present').length);
    absent.push(recs.filter(r=>r.status==='Absent').length);
    late.push(recs.filter(r=>r.status==='Late').length);
  });
  if (barChartInstance) barChartInstance.destroy();
  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: depts,
      datasets: [
        { label:'Present', data: present, backgroundColor:'rgba(34,197,94,0.7)', borderRadius:4 },
        { label:'Late',    data: late,    backgroundColor:'rgba(245,158,11,0.7)', borderRadius:4 },
        { label:'Absent',  data: absent,  backgroundColor:'rgba(239,68,68,0.7)',  borderRadius:4 },
      ]
    },
    options: {
      responsive: true,
      plugins: { legend:{ labels:{ color:'#8888aa', font:{ family:'Sora', size:11 }, boxWidth:10 } } },
      scales: {
        x: { stacked:true, grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#8888aa', font:{family:'DM Mono', size:11} } },
        y: { stacked:true, grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#8888aa', stepSize:1, font:{family:'DM Mono', size:11} }, beginAtZero:true }
      }
    }
  });
}

function renderDeptChart() {
  const ctx = document.getElementById('deptChart').getContext('2d');
  const depts = ['Frontend','Backend','DevOps','QA','Design'];
  const counts = depts.map(d => employees.filter(e=>e.dept===d).length);
  const colors = depts.map(d => DEPT_COLORS[d]);
  if (deptChartInstance) deptChartInstance.destroy();
  deptChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: depts,
      datasets: [{ data: counts, backgroundColor: colors, borderWidth:0, hoverOffset:4 }]
    },
    options: {
      responsive: true,
      plugins: {
        legend:{ position:'right', labels:{ color:'#8888aa', font:{family:'Sora',size:11}, boxWidth:10, padding:10 } }
      }
    }
  });
}

// ── Activity Feed ──────────────────────────────────────────
function renderActivity() {
  const feed = document.getElementById('activity-feed');
  const today = todayStr();
  const todayRecs = records.filter(r => r.date === today)
    .slice().reverse().slice(0, 8);
  if (todayRecs.length === 0) {
    feed.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:1rem 0;text-align:center">No attendance marked today yet.</div>';
    return;
  }
  feed.innerHTML = todayRecs.map(r => {
    const emp = employees.find(e => e.id === r.empId);
    if (!emp) return '';
    const cls = r.status.toLowerCase();
    return `<div class="activity-item">
      <div class="act-dot ${cls}"></div>
      <span class="act-name">${emp.name}</span>
      <span style="font-size:11px;color:var(--text3)">${emp.dept}</span>
      <span class="act-badge ${cls}">${r.status}</span>
      <span class="act-time">${r.time || ''}</span>
    </div>`;
  }).join('');
}

// ── Mark Attendance ────────────────────────────────────────
function populateMarkEmp() {
  const sel = document.getElementById('mark-emp');
  sel.innerHTML = '<option value="">-- Choose Employee --</option>' +
    employees.map(e => `<option value="${e.id}">${e.name} (${e.dept})</option>`).join('');
  document.getElementById('mark-date').value = todayStr();
}

function markAttendance() {
  const empId = document.getElementById('mark-emp').value;
  const date  = document.getElementById('mark-date').value;
  const note  = document.getElementById('mark-note').value.trim();
  if (!empId) { showToast('⚠ Please select an employee'); return; }
  if (!date)  { showToast('⚠ Please select a date'); return; }
  const existing = records.findIndex(r => r.empId === empId && r.date === date);
  const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:false });
  const rec = { empId, date, status: selectedStatus, note, time };
  if (existing >= 0) records[existing] = rec;
  else records.push(rec);
  save();
  const emp = employees.find(e => e.id === empId);
  showToast(`✓ ${emp.name} marked as ${selectedStatus}`);
  refreshAll();
  document.getElementById('mark-note').value = '';
}

// Status toggle buttons
document.querySelectorAll('.stbtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.stbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedStatus = btn.dataset.status;
  });
});

// ── Bulk Attendance ────────────────────────────────────────
function renderBulkList() {
  const list = document.getElementById('bulk-list');
  const today = todayStr();
  list.innerHTML = employees.map(emp => {
    const rec = records.find(r => r.empId === emp.id && r.date === today);
    const status = rec ? rec.status : null;
    const [bg, fg] = avatarColor(emp.id);
    return `<div class="bulk-row">
      <div class="avatar" style="background:${bg};color:${fg}">${initials(emp.name)}</div>
      <div class="emp-info">
        <div class="emp-name">${emp.name}</div>
        <div class="emp-dept">${emp.dept}</div>
      </div>
      <div class="bulk-status">
        <button class="${status==='Present'?'p-active':''}" onclick="setBulkStatus('${emp.id}','Present',this)">P</button>
        <button class="${status==='Late'?'l-active':''}" onclick="setBulkStatus('${emp.id}','Late',this)">L</button>
        <button class="${status==='Absent'?'a-active':''}" onclick="setBulkStatus('${emp.id}','Absent',this)">A</button>
      </div>
    </div>`;
  }).join('');
}

function setBulkStatus(empId, status, btn) {
  const today = todayStr();
  const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:false });
  const existing = records.findIndex(r => r.empId === empId && r.date === today);
  if (existing >= 0) records[existing].status = status;
  else records.push({ empId, date: today, status, note:'', time });
  save();
  // Update button styles in this row
  const row = btn.closest('.bulk-row');
  row.querySelectorAll('button').forEach(b => b.className = '');
  if (status === 'Present') btn.className = 'p-active';
  if (status === 'Late')    btn.className = 'l-active';
  if (status === 'Absent')  btn.className = 'a-active';
  updateStats(); renderActivity(); renderBarChart();
}

function bulkMark(status) {
  const today = todayStr();
  const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:false });
  employees.forEach(emp => {
    const existing = records.findIndex(r => r.empId === emp.id && r.date === today);
    if (existing >= 0) records[existing].status = status;
    else records.push({ empId: emp.id, date: today, status, note:'', time });
  });
  save();
  showToast(`✓ All employees marked as ${status}`);
  refreshAll();
}

// ── Records ────────────────────────────────────────────────
function renderRecords() {
  const filterDate   = document.getElementById('filter-date').value;
  const filterStatus = document.getElementById('filter-status').value;
  let filtered = [...records];
  if (filterDate)   filtered = filtered.filter(r => r.date === filterDate);
  if (filterStatus !== 'All') filtered = filtered.filter(r => r.status === filterStatus);
  filtered.sort((a,b) => b.date.localeCompare(a.date));
  const tbody = document.getElementById('records-body');
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:2rem">No records found</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map((r, idx) => {
    const emp = employees.find(e => e.id === r.empId);
    if (!emp) return '';
    const cls = r.status.toLowerCase();
    const origIdx = records.indexOf(r);
    return `<tr>
      <td><span style="font-weight:500">${emp.name}</span><br><span style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace">${emp.id}</span></td>
      <td><span class="dept-badge" style="font-size:11px;padding:2px 8px;border-radius:20px;background:rgba(108,99,255,0.12);color:var(--accent2)">${emp.dept}</span></td>
      <td style="font-family:'DM Mono',monospace;font-size:12px">${fmtDate(r.date)}</td>
      <td><span class="badge ${cls}">${r.status}</span></td>
      <td style="color:var(--text2);font-size:12px">${r.note || '—'}</td>
      <td><button class="delete-btn" onclick="deleteRecord(${origIdx})">Delete</button></td>
    </tr>`;
  }).join('');
}

function deleteRecord(idx) {
  records.splice(idx, 1);
  save();
  showToast('Record deleted');
  refreshAll();
}

document.getElementById('filter-date').addEventListener('change', renderRecords);
document.getElementById('filter-status').addEventListener('change', renderRecords);

// ── Export CSV ─────────────────────────────────────────────
function exportCSV() {
  const headers = ['Employee ID', 'Name', 'Department', 'Date', 'Status', 'Note', 'Time'];
  const rows = records.map(r => {
    const emp = employees.find(e => e.id === r.empId);
    if (!emp) return null;
    return [emp.id, emp.name, emp.dept, r.date, r.status, r.note||'', r.time||''];
  }).filter(Boolean);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `attendance_${todayStr()}.csv`;
  a.click();
  showToast('CSV exported!');
}

// ── Employees ──────────────────────────────────────────────
function renderEmployees() {
  const q = document.getElementById('emp-search').value.toLowerCase();
  const grid = document.getElementById('emp-grid');
  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.dept.toLowerCase().includes(q) ||
    e.id.toLowerCase().includes(q)
  );
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="color:var(--text3);font-size:13px;grid-column:1/-1;padding:2rem;text-align:center">No employees found</div>';
    return;
  }
  grid.innerHTML = filtered.map(emp => {
    const [bg, fg] = avatarColor(emp.id);
    return `<div class="emp-card">
      <div class="avatar" style="background:${bg};color:${fg}">${initials(emp.name)}</div>
      <div class="emp-card-name">${emp.name}</div>
      <div class="emp-card-role">${emp.role}</div>
      <div class="emp-card-id">${emp.id}</div>
      <div class="dept-badge">${emp.dept}</div>
      <div class="emp-card-actions">
        <button onclick="removeEmployee('${emp.id}')">Remove</button>
      </div>
    </div>`;
  }).join('');
}

function removeEmployee(id) {
  if (!confirm('Remove this employee?')) return;
  employees = employees.filter(e => e.id !== id);
  records = records.filter(r => r.empId !== id);
  save(); showToast('Employee removed'); refreshAll();
}

// ── Add Employee Modal ─────────────────────────────────────
function openAddModal() {
  document.getElementById('modal').classList.add('open');
}
function closeModal(e) {
  if (!e || e.target === document.getElementById('modal'))
    document.getElementById('modal').classList.remove('open');
}
function addEmployee() {
  const name = document.getElementById('new-name').value.trim();
  const id   = document.getElementById('new-id').value.trim();
  const dept = document.getElementById('new-dept').value;
  const role = document.getElementById('new-role').value.trim();
  if (!name || !id || !role) { showToast('⚠ Fill all fields'); return; }
  if (employees.find(e => e.id === id)) { showToast('⚠ Employee ID already exists'); return; }
  employees.push({ id, name, dept, role });
  save();
  closeModal();
  document.getElementById('new-name').value = '';
  document.getElementById('new-id').value = '';
  document.getElementById('new-role').value = '';
  showToast(`✓ ${name} added`);
  refreshAll();
}

// ── Tabs ───────────────────────────────────────────────────
const TAB_TITLES = { dashboard:'Dashboard', mark:'Mark Attendance', records:'Records', employees:'Employees' };

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const tab = item.dataset.tab;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('page-title').textContent = TAB_TITLES[tab];
    if (tab === 'dashboard') { renderBarChart(); renderDeptChart(); renderActivity(); }
    if (tab === 'mark')      { populateMarkEmp(); renderBulkList(); }
    if (tab === 'records')   { renderRecords(); }
    if (tab === 'employees') { renderEmployees(); }
  });
});

document.getElementById('dept-filter').addEventListener('change', () => {
  updateStats(); renderBarChart();
});

// ── Refresh All ────────────────────────────────────────────
function refreshAll() {
  updateStats();
  renderBarChart();
  renderDeptChart();
  renderActivity();
  renderBulkList();
  renderRecords();
  renderEmployees();
  populateMarkEmp();
}

// ── Init ───────────────────────────────────────────────────
initClock();
document.getElementById('filter-date').value = todayStr();
refreshAll();
