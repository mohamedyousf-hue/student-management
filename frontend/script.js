const API_URL = "http://127.0.0.1:8000";

let students = [];

const studentsBody = document.getElementById("studentsBody");
const heroTotal = document.getElementById("heroTotal");
const heroDepts = document.getElementById("heroDepts");
const emptyState = document.getElementById("emptyState");
const modal = document.getElementById("studentModal");
const studentForm = document.getElementById("studentForm");
const searchInput = document.getElementById("searchInput");
const barChart = document.getElementById("barChart");
const deptList = document.getElementById("deptList");
const deptOptions = document.getElementById("deptOptions");
const newDeptInput = document.getElementById("newDeptInput");
const addDeptBtn = document.getElementById("addDeptBtn");
const selectAll = document.getElementById("selectAll");
const todayDate = document.getElementById("todayDate");

const deptPalette = ["#46c2b5", "#ffc93c", "#f4a6c1", "#7c8cf8", "#f4915c", "#5fbd7a"];
const deptColorMap = {};
let extraDepartments = []; // departments added manually with no students yet

function colorForDept(dept) {
  if (!deptColorMap[dept]) {
    const index = Object.keys(deptColorMap).length % deptPalette.length;
    deptColorMap[dept] = deptPalette[index];
  }
  return deptColorMap[dept];
}

function getAllDepartments() {
  const fromStudents = students.map(s => s.department);
  return [...new Set([...fromStudents, ...extraDepartments])];
}

function renderTopbarDate() {
  const now = new Date();
  todayDate.textContent = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

// ---------- API calls ----------

async function fetchStudents(search = "") {
  const url = search ? `${API_URL}/students?search=${encodeURIComponent(search)}` : `${API_URL}/students`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load students");
  return res.json();
}

async function createStudent(student) {
  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to add student");
  }
  return res.json();
}

async function removeStudent(id) {
  const res = await fetch(`${API_URL}/students/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Failed to delete student");
}

// ---------- Rendering ----------

function renderChart() {
  const counts = {};
  students.forEach(s => { counts[s.department] = (counts[s.department] || 0) + 1; });
  const max = Math.max(1, ...Object.values(counts));

  barChart.innerHTML = "";
  Object.entries(counts).forEach(([dept, count]) => {
    const col = document.createElement("div");
    col.className = "bar-col";
    const heightPct = Math.max(12, (count / max) * 100);
    col.innerHTML = `
      <span class="bar-count">${count}</span>
      <div class="bar" style="height:${heightPct}%; background:${colorForDept(dept)}"></div>
      <span class="bar-label">${dept}</span>
    `;
    barChart.appendChild(col);
  });
}

function renderDeptList() {
  const counts = {};
  students.forEach(s => { counts[s.department] = (counts[s.department] || 0) + 1; });

  deptList.innerHTML = "";
  deptOptions.innerHTML = "";

  getAllDepartments().forEach(dept => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="dept-dot" style="background:${colorForDept(dept)}"></span>
      <span class="dept-list-name">${dept}</span>
      <span class="dept-list-count">${counts[dept] || 0}</span>
    `;
    deptList.appendChild(li);

    const opt = document.createElement("option");
    opt.value = dept;
    deptOptions.appendChild(opt);
  });
}

function renderStudents() {
  studentsBody.innerHTML = "";

  students.forEach(s => {
    const color = colorForDept(s.department);
    const initial = s.name.charAt(0).toUpperCase();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" class="row-check"></td>
      <td>
        <div class="name-cell">
          <div class="avatar" style="background:${color}">${initial}</div>
          <span>${s.name}</span>
        </div>
      </td>
      <td>${s.age}</td>
      <td><span class="dept-tag" style="background:${color}22;color:${color}">${s.department}</span></td>
      <td>${s.email}</td>
      <td><span class="status-badge">${s.active ? "Active" : "Inactive"}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-action" onclick="deleteStudent(${s.id})" aria-label="Delete ${s.name}">🗑</button>
        </div>
      </td>
    `;
    studentsBody.appendChild(row);
  });

  emptyState.classList.toggle("hidden", students.length !== 0);
  selectAll.checked = false;
}

function renderAll() {
  heroTotal.textContent = students.length;
  heroDepts.textContent = getAllDepartments().length;
  renderChart();
  renderDeptList();
  renderStudents();
}

// ---------- Actions ----------

async function loadStudents(search = "") {
  try {
    students = await fetchStudents(search);
    renderAll();
  } catch (err) {
    console.error(err);
    alert("Couldn't reach the server. Make sure the backend is running (uvicorn main:app --reload).");
  }
}

async function deleteStudent(id) {
  try {
    await removeStudent(id);
    await loadStudents(searchInput.value.trim());
  } catch (err) {
    console.error(err);
    alert("Couldn't delete this student. Please try again.");
  }
}

function openModal() {
  modal.classList.remove("hidden");
  document.getElementById("name").focus();
}

function closeModal() {
  modal.classList.add("hidden");
  studentForm.reset();
}

document.getElementById("addStudentBtn").addEventListener("click", openModal);
document.getElementById("sidebarAddBtn").addEventListener("click", openModal);
document.getElementById("cancelBtn").addEventListener("click", closeModal);

studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newStudent = {
    name: document.getElementById("name").value,
    age: parseInt(document.getElementById("age").value, 10),
    department: document.getElementById("department").value,
    email: document.getElementById("email").value,
    active: true,
  };

  try {
    await createStudent(newStudent);
    closeModal();
    await loadStudents(searchInput.value.trim());
  } catch (err) {
    alert(err.message);
  }
});

addDeptBtn.addEventListener("click", () => {
  const name = newDeptInput.value.trim();
  if (!name) return;
  if (!extraDepartments.includes(name) && !students.some(s => s.department === name)) {
    extraDepartments.push(name);
  }
  newDeptInput.value = "";
  renderDeptList();
});

selectAll.addEventListener("change", () => {
  document.querySelectorAll(".row-check").forEach(cb => cb.checked = selectAll.checked);
});

let searchTimeout;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadStudents(searchInput.value.trim()), 300);
});

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.id === "sidebarAddBtn") return;
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

renderTopbarDate();
loadStudents();
