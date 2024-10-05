const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3002;

// Middleware para procesar JSON
app.use(express.json());

// Función para leer el archivo JSON de usuarios
const readUsersFile = (callback) => {
    const filePath = path.join(__dirname, 'data', 'users.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error al leer el archivo users.json: ${err.message}`);
            return callback(err, null);
        }
        try {
            const users = JSON.parse(data);
            return callback(null, users);
        } catch (parseError) {
            console.error(`Error al parsear users.json: ${parseError.message}`);
            return callback(parseError, null);
        }
    });
};

// Función para escribir en users.json
const writeUsersFile = (users, callback) => {
    const filePath = path.join(__dirname, 'data', 'users.json');
    const jsonContent = JSON.stringify(users, null, 2);
    fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
        if (err) {
            console.error(`Error al escribir en users.json: ${err.message}`);
            return callback(err);
        }
        callback(null);
    });
};

// Endpoint para obtener todos los usuarios (READ)
app.get('/api/users', (req, res) => {
    readUsersFile((err, users) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los usuarios.' });
        }
        res.json(users);
    });
});

// Endpoint para obtener un usuario por ID (READ)
app.get('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    readUsersFile((err, users) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los usuarios.' });
        }
        const user = users.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(user);
    });
});

// Endpoint para agregar un nuevo usuario (CREATE)
app.post('/api/users', (req, res) => {
    readUsersFile((err, users) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los usuarios.' });
        }

        const newUser = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            name: req.body.name
        };
        users.push(newUser);

        writeUsersFile(users, (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error al guardar el usuario.' });
            }
            res.status(201).json(newUser);
        });
    });
});

// Endpoint para actualizar un usuario por ID (UPDATE)
app.put('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    readUsersFile((err, users) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los usuarios.' });
        }

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        users[userIndex].name = req.body.name || users[userIndex].name;

        writeUsersFile(users, (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error al actualizar el usuario.' });
            }
            res.json(users[userIndex]);
        });
    });
});

// Endpoint para eliminar un usuario por ID (DELETE)
app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    readUsersFile((err, users) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer los usuarios.' });
        }

        const newUsers = users.filter(u => u.id !== userId);

        writeUsersFile(newUsers, (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error al eliminar el usuario.' });
            }
            res.json({ message: 'Usuario eliminado correctamente.' });
        });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Users Service corriendo en http://localhost:${PORT}`);
});
