const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs").promises; // Importar fs.promises para usar promesas

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

app.use(express.static("../"));

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// WebSocket para mensajes
wss.on("connection", (ws) => {
  console.log("Conexión para mensajes: OK");
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      if (data.state) {
        // Hacer algo específico para el estado recibido
        console.log(`${data.username} recibido en estado: ${data.state}`);
        ws.send(message.toString());
      } else {
        console.log(`${data}`);
        // Guardar los mensajes en el archivo de texto
        await saveMessage(message);
        console.log(`Mensaje recibido del frontend: ${message}`);
        // Broadcast del mensaje a todos los clientes (WebSocket)
        ws.send(message.toString());
      }
    } catch (error) {
      console.error("Error al analizar el mensaje JSON:", error);
    }
  });
});

async function getMessages() {
  try {
    const data = await fs.readFile("chat_messages.txt", "utf8");
    console.log("Mensajes cargados desde el archivo de texto.");
    return data.split("\n").filter((message) => message.trim() !== "");
  } catch (err) {
    console.error("Error al leer el archivo de texto de mensajes:", err);
    return [];
  }
}

async function saveMessage(message) {
  try {
    const chatMessages = await getMessages();
    chatMessages.push(message); // Agrega el nuevo mensaje al arreglo de mensajes
    const textData = chatMessages.join("\n");

    await fs.writeFile("chat_messages.txt", textData);
    console.log("Mensaje guardado en el archivo de texto.");
  } catch (err) {
    console.error("Error al guardar los mensajes en el archivo de texto:", err);
  }
}
