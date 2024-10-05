const express = require('express');
const axios = require('axios');  // Para hacer solicitudes HTTP a los microservicios
const http = require('http');    // Necesario para trabajar con WebSockets y HTTP
const { Server } = require('socket.io');  // Requerimos Socket.IO

const app = express();
const PORT = 3000;

// Crear el servidor HTTP y vincularlo a Socket.IO
const server = http.createServer(app);
const io = new Server(server);

// Middlewares
app.use(express.static('public'));
app.use(express.json());

// Redirigir las solicitudes a los microservicios

// Endpoint para obtener todas las tareas desde el microservicio de tareas
app.get('/api/tasks', (req, res) => {
    axios.get('http://tasks-service:3001/api/tasks')  // Usar el nombre del servicio en Docker Compose
        .then(response => {
            res.json(response.data);
        })
        .catch(err => {
            console.error(`Error al obtener las tareas: ${err.message}`);
            res.status(500).json({ message: 'Error al obtener las tareas.' });
        });
});

// Endpoint para obtener todos los usuarios desde el microservicio de usuarios
app.get('/api/users', (req, res) => {
    axios.get('http://users-service:3002/api/users')  // Usar el nombre del servicio en Docker Compose
        .then(response => {
            res.json(response.data);
        })
        .catch(err => {
            console.error(`Error al obtener los usuarios: ${err.message}`);
            res.status(500).json({ message: 'Error al obtener los usuarios.' });
        });
});

// Endpoint para agregar una nueva tarea (redirigido al microservicio de tareas)
app.post('/api/tasks', (req, res) => {
    axios.post('http://tasks-service:3001/api/tasks', req.body)
        .then(response => {
            res.status(201).json(response.data);
            io.emit('taskUpdated', { message: 'Nueva tarea añadida', task: response.data });
            console.log('Nueva tarea añadida y emitida a WebSocket:', response.data);
        })
        .catch(err => {
            console.error(`Error al agregar la tarea: ${err.message}`);
            res.status(500).json({ message: 'Error al agregar la tarea.' });
        });
});

// Endpoint para modificar una tarea existente (redirigido al microservicio de tareas)
app.put('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    axios.put(`http://tasks-service:3001/api/tasks/${taskId}`, req.body)
        .then(response => {
            res.json(response.data);
            io.emit('taskUpdated', { message: 'Tarea actualizada', task: response.data });
            console.log('Tarea actualizada y emitida a WebSocket:', response.data);
        })
        .catch(err => {
            console.error(`Error al actualizar la tarea: ${err.message}`);
            res.status(500).json({ message: 'Error al actualizar la tarea.' });
        });
});

// Endpoint para eliminar una tarea (redirigido al microservicio de tareas)
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    axios.delete(`http://tasks-service:3001/api/tasks/${taskId}`)
        .then(response => {
            res.json({ message: 'Tarea eliminada correctamente.' });
            io.emit('taskUpdated', { message: 'Tarea eliminada', taskId });
            console.log(`Tarea ${taskId} eliminada y emitida a WebSocket.`);
        })
        .catch(err => {
            console.error(`Error al eliminar la tarea: ${err.message}`);
            res.status(500).json({ message: 'Error al eliminar la tarea.' });
        });
});

// Endpoint para agregar un nuevo usuario (redirigido al microservicio de usuarios)
app.post('/api/users', (req, res) => {
    axios.post('http://users-service:3002/api/users', req.body)
        .then(response => {
            res.status(201).json(response.data);
        })
        .catch(err => {
            console.error(`Error al agregar el usuario: ${err.message}`);
            res.status(500).json({ message: 'Error al agregar el usuario.' });
        });
});

// Endpoint para modificar un usuario existente (redirigido al microservicio de usuarios)
app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    axios.put(`http://users-service:3002/api/users/${userId}`, req.body)
        .then(response => {
            res.json(response.data);
        })
        .catch(err => {
            console.error(`Error al actualizar el usuario: ${err.message}`);
            res.status(500).json({ message: 'Error al actualizar el usuario.' });
        });
});

// Endpoint para eliminar un usuario (redirigido al microservicio de usuarios)
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    axios.delete(`http://users-service:3002/api/users/${userId}`)
        .then(response => {
            res.json({ message: 'Usuario eliminado correctamente.' });
        })
        .catch(err => {
            console.error(`Error al eliminar el usuario: ${err.message}`);
            res.status(500).json({ message: 'Error al eliminar el usuario.' });
        });
});

// Evento para manejar la conexión de WebSocket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);

    // Enviar una notificación de prueba al cliente cuando se conecte
    socket.emit('notification', { message: 'Bienvenido al sistema Kanban' });

    // Evento para manejar desconexión del cliente
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });

    // Recibir el evento desde el cliente cuando se añade una tarea
    socket.on('taskAdded', (data) => {
        console.log('Tarea añadida desde el cliente:', data);
        // Emitir la tarea añadida a todos los clientes conectados
        io.emit('taskUpdated', { message: 'Nueva tarea añadida', task: data });
    });
});

// Inicializar el servidor con Socket.IO
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
