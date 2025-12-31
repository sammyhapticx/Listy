// app.js
const STORAGE_KEY = "todo-tasks-v1";
const THEME_KEY = "todo-theme-v1";

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskListEl = document.getElementById("taskList");
const tabs = document.querySelectorAll(".tab");
const themeSelect = document.getElementById("themeSelect");

let tasks = [];
let currentTab = "active";

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  tasks = raw ? JSON.parse(raw) : [];

  const savedTheme = localStorage.getItem(THEME_KEY) || "water";
  setTheme(savedTheme);
  themeSelect.value = savedTheme;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function setTheme(name) {
  document.body.className = "";
  document.body.classList.add(`theme-${name}`);
  localStorage.setItem(THEME_KEY, name);
}

// Helpers
function nowISO() {
  return new Date().toISOString();
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

// CRUD
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  tasks.push({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    text: trimmed,
    createdAt: nowISO(),
    completedAt: null,
    done: false
  });
  saveState();
  render();
  taskInput.value = "";
}

function toggleTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  t.completedAt = t.done ? nowISO() : null;
  saveState();
  render();
}

function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveState();
  render();
}

// UI render
function render() {
  taskListEl.innerHTML = "";

  const filtered = tasks.filter(t =>
    currentTab === "active" ? !t.done : t.done
  );

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.textContent = currentTab === "active"
      ? "No active tasks."
      : "No completed tasks yet.";
    empty.style.opacity = ".7";
    taskListEl.appendChild(empty);
    return;
  }

  filtered.forEach(task => {
    const item = document.createElement("div");
    item.className = "task";

    const main = document.createElement("div");
    main.className = "task-main";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const textBox = document.createElement("div");
    const text = document.createElement("div");
    text.className = "task-text";
    text.textContent = task.text;
    if (task.done) text.style.textDecoration = "line-through";

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.innerHTML =
      `Created: ${formatTime(task.createdAt)}` +
      (task.completedAt
        ? `<br>Completed: ${formatTime(task.completedAt)}`
        : "");

    textBox.appendChild(text);
    textBox.appendChild(meta);

    main.appendChild(checkbox);
    main.appendChild(textBox);

    const actions = document.createElement("div");
    actions.className = "task-actions";
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeTask(task.id));
    actions.appendChild(removeBtn);

    item.appendChild(main);
    item.appendChild(actions);
    taskListEl.appendChild(item);
  });
}

// Event wiring
addBtn.addEventListener("click", () => addTask(taskInput.value));
taskInput.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask(taskInput.value);
});

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentTab = btn.dataset.tab;
    render();
  });
});

themeSelect.addEventListener("change", () => {
  setTheme(themeSelect.value);
});

// init
loadState();
render();
