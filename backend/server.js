const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let chatMessages = [];
getMessages();

const PORT = 3000;

// Configurar las rutas y middleware de Express aquí (si es necesario)

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// WebSocket para mensajes
wss.on("connection", (ws) => {
  console.log("Conexión para mensajes: OK");
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (data.state) {
        // Hacer algo específico para el estado recibido
        console.log(`${data.username} recibido en estado: ${data.state}`);
        ws.send(`${message.toString()}`);
      } else {
        console.log(`${data}`);
        chatMessages.push(data);
        // Guardar los mensajes en el archivo JSON
        fs.writeFile(
          "chat_messages.json",
          JSON.stringify(chatMessages),
          (err) => {
            if (err) {
              console.error(
                "Error al guardar los mensajes en el archivo JSON:",
                err
              );
            } else {
              console.log("Mensaje guardado en el archivo JSON.");
            }
          }
        );
        console.log(`Mensaje recibido del frontend: ${message}`);
        // Broadcast del mensaje a todos los clientes (WebSocket)
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(messageData));
          }
        });
      }
    } catch (error) {
      console.error("Error al analizar el mensaje JSON:", error);
    }
  });
});
function getMessages() {
  fs.readFile("chat_messages.json", "utf8", (err, data) => {
    if (!err) {
      try {
        chatMessages = JSON.parse(data);
        console.log("Mensajes cargados desde el archivo JSON.");
      } catch (err) {
        console.error("Error al analizar el archivo JSON de mensajes:", err);
      }
    }
  });
}
// WebSocket para usuarios y estados
const userWebSocket = new WebSocket.Server({ noServer: true });

userWebSocket.on("connection", (ws) => {
  console.log("conexión de usuarios y estados: OK");

  // Aquí puedes manejar la información de usuarios y estados
});

server.on("upgrade", (request, socket, head) => {
  if (request.url === "/user-socket") {
    userWebSocket.handleUpgrade(request, socket, head, (ws) => {
      userWebSocket.emit("connection", ws, request);
    });
  }
});
