async function loadTasks() {
    const res = await fetch("/api/tasks");
    const tasks = await res.json();

    tasks.forEach(task => {
        createTaskElement(task);
    });
}

function createTaskElement(task) {
    const div = document.createElement("div");
    div.className = "task";
    div.draggable = true;
    div.innerText = task.title;
    div.dataset.id = task.id;

    div.addEventListener("dragstart", dragStart);

    document.getElementById(task.status).appendChild(div);
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