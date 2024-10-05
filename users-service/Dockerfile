# Usa la imagen de Node.js como base
FROM node:14

# Define el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias y los instalamos
COPY package*.json ./
RUN npm install

# Copia todo el código de la aplicación al contenedor
COPY . .

# Expone el puerto que usará el servicio
EXPOSE 3002

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
