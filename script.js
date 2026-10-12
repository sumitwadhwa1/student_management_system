const API = "http://localhost:5000/api";
let students = [];

// Element helper (avoids clashes with built-ins like window.name)
const $ = id => document.getElementById(id);

// ---------- Login / Logout ----------
$("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  if ($("username").value === "admin" && $("password").value === "admin123") {
    $("loginPage").style.display = "none";
    $("app").style.display = "flex";
    loadStudents();
  } else {
    alert("Invalid username or password");
  }
});

function logout() {
  $("app").style.display = "none";
  $("loginPage").style.display = "flex";
}

// ---------- Navigation ----------
function showPage(id, el) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  $(id).classList.add("active");
  document.querySelectorAll(".nav").forEach(n => n.classList.remove("active"));
  if (el) el.classList.add("active");
  if (id === "students") loadStudents();
}

// ---------- Load & Render ----------
async function loadStudents() {
  try {
    const r = await fetch(API + "/students");
    if (!r.ok) throw new Error();
    students = await r.json();
    render(students);
    $("totalStudents").textContent = students.length;
    $("totalCourses").textContent = new Set(students.map(s => s.course)).size;
  } catch (e) {
    alert("Backend server not connected. Start Node.js server on port 5000.");
  }
}

function render(data) {
  $("studentTable").innerHTML = data.map(s => `<tr>
    <td>${s.id}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.roll_no)}</td>
    <td>${escapeHtml(s.email || "-")}</td><td>${escapeHtml(s.course)}</td><td>${s.semester}</td>
    <td><button class="edit" onclick="editStudent(${s.id})">Edit</button>
    <button class="delete" onclick="deleteStudent(${s.id})">Delete</button></td>
  </tr>`).join("");
}

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

// ---------- Search ----------
function searchStudents() {
  const q = $("search").value.toLowerCase();
  render(students.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.roll_no.toLowerCase().includes(q) ||
    s.course.toLowerCase().includes(q)
  ));
}

// ---------- Modal ----------
function openModal() {
  $("studentForm").reset();
  $("studentId").value = "";
  $("modalTitle").textContent = "Add Student";
  $("modal").classList.add("show");
}

function closeModal() {
  $("modal").classList.remove("show");
}

// ---------- Add / Update ----------
$("studentForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = $("studentId").value;
  const data = {
    name: $("name").value,
    roll_no: $("roll").value,
    email: $("email").value,
    phone: $("phone").value,
    course: $("course").value,
    semester: $("semester").value
  };
  try {
    const r = await fetch(id ? API + "/students/" + id : API + "/students", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const out = await r.json();
    if (!r.ok) throw new Error(out.error || out.message);
    alert(out.message);
    closeModal();
    loadStudents();
  } catch (e) {
    alert(e.message || "Request failed");
  }
});

// ---------- Edit ----------
async function editStudent(id) {
  try {
    const r = await fetch(API + "/students/" + id);
    const s = await r.json();
    $("studentId").value = s.id;
    $("name").value = s.name;
    $("roll").value = s.roll_no;
    $("email").value = s.email || "";
    $("phone").value = s.phone || "";
    $("course").value = s.course;
    $("semester").value = s.semester;
    $("modalTitle").textContent = "Edit Student";
    $("modal").classList.add("show");
  } catch (e) {
    alert("Unable to load student");
  }
}

// ---------- Delete ----------
async function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;
  try {
    const r = await fetch(API + "/students/" + id, { method: "DELETE" });
    const out = await r.json();
    alert(out.message);
    loadStudents();
  } catch (e) {
    alert("Delete failed");
  }
}
