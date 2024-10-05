const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

// Middlewares
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
    const jsonContent = JSON.stringify(tasks, null, 2); // Formato del archivo JSON
    fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
        if (err) {
            console.error(`Error al escribir en tasks.json: ${err.message}`);
            return callback(err);
        }
        callback(null);
    });
};

// Endpoints para obtener, agregar, modificar y eliminar tareas
app.get('/api/tasks', (req, res) => {
    readTasksFile((err, tasks) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer las tareas.' });
        }
        res.json(tasks);
    });
});

app.post('/api/tasks', (req, res) => {
    readTasksFile((err, tasks) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer las tareas.' });
        }

        const newTask = {
            id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
            name: req.body.name,
            description: req.body.description,
            responsible: req.body.responsible,
            status: req.body.status
        };
        tasks.push(newTask);
        writeTasksFile(tasks, (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error al guardar la tarea.' });
            }
            res.status(201).json(newTask);
        });
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    readTasksFile((err, tasks) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer las tareas.' });
        }

        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }

        tasks[taskIndex].name = req.body.name || tasks[taskIndex].name;
        tasks[taskIndex].description = req.body.description || tasks[taskIndex].description;
        tasks[taskIndex].responsible = req.body.responsible || tasks[taskIndex].responsible;
        tasks[taskIndex].status = req.body.status || tasks[taskIndex].status;

        writeTasksFile(tasks, (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error al actualizar la tarea.' });
            }
            res.json(tasks[taskIndex]);
        });
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    readTasksFile((err, tasks) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer las tareas.' });
        }

        const newTasks = tasks.filter(task => task.id !== taskId);
        writeTasksFile(newTasks, (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error al eliminar la tarea.' });
            }
            res.json({ message: 'Tarea eliminada correctamente.' });
        });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Tasks Service corriendo en http://localhost:${PORT}`);
});
