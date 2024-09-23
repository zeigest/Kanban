document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadUsers(); // Cargar usuarios para los selectores en los modales
});

// Función para abrir el modal de agregar tarea
function openAddTaskModal(status) {
    document.getElementById('add-task-modal').style.display = 'block';
    document.getElementById('add-task-status').value = status;
}

// Función para cerrar el modal de agregar tarea
function closeAddTaskModal() {
    document.getElementById('add-task-modal').style.display = 'none';
    document.getElementById('add-task-form').reset();
}

// Función para abrir el modal de editar tarea
function openEditTaskModal(task) {
    document.getElementById('edit-task-modal').style.display = 'block';
    document.getElementById('edit-task-id').value = task.id; // Guardar el ID de la tarea
    document.getElementById('edit-task-name').value = task.name;
    document.getElementById('edit-task-desc').value = task.description;
    document.getElementById('edit-task-responsible').value = task.responsible;
    document.getElementById('edit-task-status').value = task.status;
}

// Función para cerrar el modal de editar tarea
function closeEditTaskModal() {
    document.getElementById('edit-task-modal').style.display = 'none';
    document.getElementById('edit-task-form').reset();
}

// Función para cargar las tareas desde el servidor
function loadTasks() {
    document.getElementById('todo-tasks').innerHTML = '';
    document.getElementById('doing-tasks').innerHTML = '';
    document.getElementById('done-tasks').innerHTML = '';

    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
            });
        })
        .catch(err => console.error('Error al cargar tareas:', err));
}

// Función para crear un elemento de tarea en el tablero
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    taskElement.innerHTML = `
        <h3>${task.name}</h3>
        <p>${task.description}</p>
        <p><strong>Responsable:</strong> ${task.responsible}</p>
    `;
    taskElement.addEventListener('click', () => openEditTaskModal(task));
    return taskElement;
}

// Función para cargar los usuarios desde el servidor y llenar las listas desplegables
function loadUsers() {
    fetch('/api/users')
        .then(response => response.json())
        .then(users => {
            // Limpiar opciones anteriores en ambas listas
            const addUserSelect = document.getElementById('add-task-responsible');
            const editUserSelect = document.getElementById('edit-task-responsible');
            addUserSelect.innerHTML = ''; // Limpiar las opciones existentes
            editUserSelect.innerHTML = '';

            // Llenar las listas con los nombres de los usuarios
            users.forEach(user => {
                const optionAdd = document.createElement('option');
                optionAdd.value = user.name;
                optionAdd.textContent = user.name;
                addUserSelect.appendChild(optionAdd);

                const optionEdit = document.createElement('option');
                optionEdit.value = user.name;
                optionEdit.textContent = user.name;
                editUserSelect.appendChild(optionEdit);
            });
        })
        .catch(err => console.error('Error al cargar usuarios:', err));
}

// Función para agregar una tarea nueva
document.getElementById('add-task-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const taskData = {
        name: document.getElementById('add-task-name').value,
        description: document.getElementById('add-task-desc').value,
        responsible: document.getElementById('add-task-responsible').value,
        status: document.getElementById('add-task-status').value
    };
    addTask(taskData);
});

function addTask(taskData) {
    fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    })
        .then(() => {
            loadTasks();
            closeAddTaskModal();
        })
        .catch(err => console.error('Error al agregar tarea:', err));
}

// Función para editar una tarea existente
document.getElementById('edit-task-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const taskId = document.getElementById('edit-task-id').value;
    const updatedTask = {
        name: document.getElementById('edit-task-name').value,
        description: document.getElementById('edit-task-desc').value,
        responsible: document.getElementById('edit-task-responsible').value,
        status: document.getElementById('edit-task-status').value
    };
    updateTask(taskId, updatedTask);
});

function updateTask(id, updatedTask) {
    fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
    })
        .then(() => {
            loadTasks();
            closeEditTaskModal();
        })
        .catch(err => console.error('Error al actualizar tarea:', err));
}
