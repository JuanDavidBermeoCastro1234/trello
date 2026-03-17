const STORAGE_KEY = "trello_statuses_v1";
const DEFAULTS = ["BACKLOG", "PENDIENTE", "PROGRESO", "HECHO"];

function getStoredStatuses() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
    return [...DEFAULTS];
  }
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
      return [...DEFAULTS];
    }
    return arr;
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
    return [...DEFAULTS];
  }
}

function saveStatuses(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

async function loadTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();

  // clear current rendered tasks
  document.querySelectorAll(".task").forEach((el) => el.remove());

  tasks.forEach((task) => {
    try {
      createTaskElement(task);
    } catch (err) {
      console.warn("Failed to render task", task, err);
    }
  });
}

function createTaskElement(task) {
  const div = document.createElement("div");
  div.className = "task";
  div.draggable = true;

  const title = document.createElement("div");
  title.className = "task-title";
  title.innerText = task.title;

  const desc = document.createElement("div");
  desc.className = "task-desc";
  desc.innerText = task.description || "";

  const del = document.createElement("button");
  del.className = "task-delete";
  del.innerText = "Eliminar";
  del.addEventListener("click", async () => {
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    div.remove();
  });

  div.dataset.id = task.id;
  div.appendChild(title);
  if (task.description) div.appendChild(desc);
  div.appendChild(del);

  div.addEventListener("dragstart", dragStart);

  const container = document.getElementById(task.status);
  if (!container) {
    console.warn("Unknown status for task, assigning to BACKLOG:", task);
    const fallback = document.getElementById("BACKLOG");
    if (fallback) fallback.appendChild(div);
    else document.body.appendChild(div);
    return;
  }
  container.appendChild(div);
}

function dragStart(e) {
  e.dataTransfer.setData("id", e.target.dataset.id);
}

async function renderBoard() {
  const statuses = getStoredStatuses();
  const board = document.getElementById("board-root");
  board.innerHTML = "";

  const select = document.getElementById("new-task-status");
  select.innerHTML = "";

  statuses.forEach((name) => {
    const col = document.createElement("div");
    col.className = "column";
    col.dataset.status = name;

    const h = document.createElement("h2");
    h.innerText = name;

    const delCol = document.createElement("button");
    delCol.className = "col-delete";
    delCol.innerText = "Eliminar columna";
    delCol.addEventListener("click", async () => {
      // remove from stored statuses
      const updated = getStoredStatuses().filter((s) => s !== name);
      saveStatuses(updated);

      // reassign tasks with this status to BACKLOG (or first status available)
      const tasksRes = await fetch("/api/tasks");
      const tasks = await tasksRes.json();
      const fallback = updated.includes("BACKLOG")
        ? "BACKLOG"
        : updated[0] || "";
      for (const t of tasks) {
        if (t.status === name) {
          const newStatus = fallback;
          if (newStatus) {
            await fetch(`/api/tasks/${t.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus }),
            });
          }
        }
      }

      await renderBoard();
      await loadTasks();
    });

    const container = document.createElement("div");
    container.className = "task-container";
    container.id = name;
    container.addEventListener("dragover", (e) => e.preventDefault());
    container.addEventListener("drop", async (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("id");
      const newStatus = container.id;
      const taskElement = document.querySelector(`[data-id='${id}']`);
      if (taskElement) container.appendChild(taskElement);
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    });

    col.appendChild(h);
    col.appendChild(delCol);
    col.appendChild(container);
    board.appendChild(col);

    const opt = document.createElement("option");
    opt.value = name;
    opt.innerText = name;
    select.appendChild(opt);
  });

  // after building columns, load tasks into them
  await loadTasks();
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("add-status-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("new-status-name").value.trim();
      if (!name) return;
      const statuses = getStoredStatuses();
      if (!statuses.includes(name)) {
        statuses.push(name);
        saveStatuses(statuses);
      }
      document.getElementById("new-status-name").value = "";
      await renderBoard();
    });

  document
    .getElementById("add-task-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("new-task-title").value.trim();
      const desc = document.getElementById("new-task-desc").value.trim();
      const status = document.getElementById("new-task-status").value;
      if (!title) return;
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: desc, status }),
      });
      document.getElementById("new-task-title").value = "";
      document.getElementById("new-task-desc").value = "";
      await renderBoard();
    });

  renderBoard();
});
