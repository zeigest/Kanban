const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middlewares
app.use(express.static('public'));
app.use(express.json());

// Función para leer el archivo JSON de tareas
const readTasksFile = (callback) => {
    const filePath = path.join(__dirname, 'data', 'tasks.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error al leer el archivo tasks.json: ${err.message}`);
            return callback(err, null);
        }
        try {
            const tasks = JSON.parse(data);
            return callback(null, tasks);
        } catch (parseError) {
            console.error(`Error al parsear tasks.json: ${parseError.message}`);
            return callback(parseError, null);
        }
    });
};

// Función para escribir en tasks.json
const writeTasksFile = (tasks, callback) => {
    const filePath = path.join(__dirname, 'data', 'tasks.json');
    const jsonContent = JSON.stringify(tasks, null, 2); // Formateo correcto del archivo JSON
    fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
        if (err) {
            console.error(`Error al escribir en tasks.json: ${err.message}`);
            return callback(err);
        }
        callback(null);
    });
};

// Endpoint para obtener todas las tareas
app.get('/api/tasks', (req, res) => {
    readTasksFile((err, tasks) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer las tareas.' });
        }
        res.json(tasks);
    });
});

// Endpoint para obtener los usuarios desde users.json
app.get('/api/users', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'users.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los usuarios.' });
        }
        try {
            const users = JSON.parse(data);
            res.json(users); // Enviamos la lista completa de usuarios
        } catch (parseError) {
            return res.status(500).json({ message: 'Error al procesar los usuarios.' });
        }
    });
});


// Endpoint para agregar una nueva tarea (POST)
app.post('/api/tasks', (req, res) => {
    readTasksFile((err, tasks) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer las tareas.' });
        }

        // Crear nueva tarea solo si no tiene un ID (esto viene del modal de agregar)
        const newTask = {
            id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1, // Asignar un nuevo ID
            name: req.body.name,
            description: req.body.description,
            responsible: req.body.responsible,
            status: req.body.status
        };
        tasks.push(newTask); // Agregar la nueva tarea al array
        writeTasksFile(tasks, (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error al guardar la tarea.' });
            }
            res.status(201).json(newTask); // Respuesta con la nueva tarea
        });
    });
});

// Endpoint para modificar una tarea existente (PUT)
app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id); // Convertir ID a entero
    readTasksFile((err, tasks) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer las tareas.' });
        }

        // Buscar la tarea a actualizar
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }

        // Actualizar solo los campos que fueron enviados
        tasks[taskIndex].name = req.body.name || tasks[taskIndex].name;
        tasks[taskIndex].description = req.body.description || tasks[taskIndex].description;
        tasks[taskIndex].responsible = req.body.responsible || tasks[taskIndex].responsible;
        tasks[taskIndex].status = req.body.status || tasks[taskIndex].status;

        // Guardar el archivo actualizado
        writeTasksFile(tasks, (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error al actualizar la tarea.' });
            }
            res.json(tasks[taskIndex]); // Responder con la tarea actualizada
        });
    });
});

// Inicializar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
