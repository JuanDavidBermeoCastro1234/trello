async function loadTasks() {
    const res = await fetch("/api/tasks");
    const tasks = await res.json();

    tasks.forEach(task => {
        try {
            createTaskElement(task);
        } catch (err) {
            console.warn('Failed to render task', task, err);
        }
    });
}

function createTaskElement(task) {
    const div = document.createElement("div");
    div.className = "task";
    div.draggable = true;
    div.innerText = task.title;
    div.dataset.id = task.id;

    div.addEventListener("dragstart", dragStart);

    const container = document.getElementById(task.status);
    if (!container) {
        console.warn('Unknown or empty status for task, assigning to BACKLOG:', task);
        const fallback = document.getElementById('BACKLOG');
        if (fallback) {
            fallback.appendChild(div);
        } else {
            // As a last resort, append to body so it's visible for debugging
            document.body.appendChild(div);
        }
        return;
    }

    container.appendChild(div);
}

function dragStart(e) {
    e.dataTransfer.setData("id", e.target.dataset.id);
}

document.querySelectorAll(".task-container").forEach(container => {
    container.addEventListener("dragover", e => e.preventDefault());

    container.addEventListener("drop", async e => {
        e.preventDefault();
        const id = e.dataTransfer.getData("id");
        const newStatus = container.id;

        const taskElement = document.querySelector(`[data-id='${id}']`);
        container.appendChild(taskElement);

        await fetch(`/api/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
    });
});

loadTasks();