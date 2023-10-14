const socket = new WebSocket("ws://192.168.100.13:3000");
const user = sessionStorage.getItem("username");
const state = sessionStorage.getItem("state");

if (!user) {
  window.location.href = "/index.html";
} else {
  document.getElementById("user").innerHTML = user;
}

socket.addEventListener("open", () => {
  console.log("Conexión WebSocket establecida con el servidor");
  socket.send(JSON.stringify({ username: user, state: state }));
  // Cargar los mensajes desde el Local Storage
  const savedMessages = loadMessages();

  // Obtener el contenedor de chat por su ID
  const chatContainer = document.getElementById("chat-container");

  // Crear elementos HTML para los mensajes y agregarlos al contenedor
  savedMessages.forEach((message) => {
    const nuevaPlantilla = createMessageTemplate(message);
    if (message.user === user) {
      nuevaPlantilla.classList.add("own-message");
    }
    chatContainer.appendChild(nuevaPlantilla);
  });
});

socket.addEventListener("message", (event) => {
  const datos = JSON.parse(event.data);
  if (datos.type == "zumbido") {
    // Mostrar un mensaje en el chat
    const contenedor = document.getElementById("chat-container");
    const zumbidoMessage = document.createElement("div");
    zumbidoMessage.textContent = `${datos.user} ha enviado un zumbido`;
    contenedor.appendChild(zumbidoMessage);
    showAttentionNotification(`¡${datos.user} ha enviado un zumbido!`);
    // Sacudir la pantalla
    shakeScreen();
    // Activar la vibración
    vibrate();
  } else if (datos.message) {
    const nuevaPlantilla = createMessageTemplate(datos);
    const contenedor = document.getElementById("chat-container");
    // Marcar mensajes propios como "own-message"
    if (datos.user === user) {
      nuevaPlantilla.classList.add("own-message");
    }
    contenedor.appendChild(nuevaPlantilla);

    // Actualizar y guardar los mensajes en el Local Storage
    const chatMessages = loadMessages();
    chatMessages.push(datos);
    saveMessages(chatMessages);
  } else {
    handleFriendState(datos);
  }
});
// zumbido
function showAttentionNotification(message) {
  if ("Notification" in window) {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        // Crear un elemento de audio para el sonido
        const audio = new Audio("./assets/audio/vibrateSound.mp3");
        new Notification(message, { silent: true }); // Opciones para hacer que sea una notificación silenciosa
        audio.play();
      }
    });
  }
}
function shakeScreen() {
  // Agregar la clase de sacudida a un elemento (puedes usar el body o cualquier otro elemento de tu elección)
  const body = document.body;
  body.classList.add("shake");

  // Eliminar la clase de sacudida después de un tiempo
  setTimeout(() => {
    body.classList.remove("shake");
  }, 500);
}
function vibrate() {
  if ("vibrate" in navigator) {
    navigator.vibrate([800, 100, 800]); // Patron de vibración
  }
}
///event listeners
const categoryHeaders = document.querySelectorAll("#contact-list h3");
categoryHeaders.forEach((header) => {
  header.addEventListener("click", toggleCategoryList);
});
document.getElementById("send-button").addEventListener("click", (event) => {
  event.preventDefault();
  sendMessage();
});
document.getElementById("zumbido").addEventListener("click", (event) => {
  event.preventDefault();
  const data = {
    type: "zumbido",
    user: user,
    date: new Date().toISOString(),
  };
  socket.send(JSON.stringify(data));
});
document.getElementById("message").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});
document.getElementById("logOut").addEventListener("click", logOut);
window.addEventListener("beforeunload", (event) => {
  // Realiza una solicitud WebSocket para notificar al servidor que el usuario se desconecta antes de cerrar la ventana
  socket.send(JSON.stringify({ type: "disconnect" }));
  // Puedes agregar un mensaje personalizado para confirmar la desconexión si es necesario
  event.returnValue = "¿Seguro que deseas cerrar la ventana?";
});

/// Chat funtions
function sendMessage() {
  const message = document.getElementById("message").value;
  if (message.trim() !== "") {
    document.getElementById("message").value = "";
    const fecha = new Date();

    const formatter = new Intl.DateTimeFormat("es", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const fechaFormateada = formatter.format(fecha);
    const data = {
      message: message,
      user: user,
      date: fechaFormateada,
    };
    socket.send(JSON.stringify(data));
  }
}
function saveMessages() {
  // Obtener el contenedor de chat por su ID
  const chatContainer = document.getElementById("chat-container");
  // Crear un array para almacenar los mensajes
  const messages = [];
  // Obtener todos los elementos hijos del contenedor
  const messageElements = chatContainer.children;
  // Recorrer los elementos y extraer la información
  for (let i = 0; i < messageElements.length; i++) {
    const messageElement = messageElements[i];
    // Extraer la información del mensaje
    const userElement = messageElement.querySelector(".user");
    // Eliminar " dice:" del nombre de usuario
    const userText = userElement.textContent.replace(" dice:", "").trim();
    const messageText =
      messageElement.querySelector(".message-text").textContent;
    const dateText = messageElement.querySelector(".date").textContent; // Convierte la fecha en milisegundos

    // Agregar la información al array
    messages.push({
      user: userText,
      message: messageText,
      date: dateText, // Convertir la fecha en un objeto de fecha
    });
  }
  // Convertir el array de objetos a una cadena JSON
  const messagesJson = JSON.stringify(messages);
  // Guardar la cadena JSON en el Local Storage
  localStorage.setItem("chatMessages", messagesJson);
}
function createMessageTemplate(data) {
  const nuevaPlantilla = document.createElement("div");

  nuevaPlantilla.innerHTML = `
    <p class="user">${data.user} dice:</p>
    <p class="message-text">${data.message}</p>
    <p class="date">${data.date}</p>
  `;
  return nuevaPlantilla;
}
function loadMessages() {
  const messagesJson = localStorage.getItem("chatMessages");
  if (messagesJson) {
    return JSON.parse(messagesJson);
  } else {
    return [];
  }
}

//friends list
function toggleCategoryList() {
  const list = this.nextElementSibling; // Obtiene la lista siguiente al elemento <h3>
  const toggleIcon = this.querySelector(".toggle-icon"); // Obtiene el icono dentro del <h3>

  if (list.style.display === "none" || list.style.display === "") {
    list.style.display = "block";
    toggleIcon.textContent = "▲"; // Cambia el icono a flecha hacia arriba
  } else {
    list.style.display = "none";
    toggleIcon.textContent = "▼"; // Cambia el icono a flecha hacia abajo
  }
}
function handleFriendState(datos) {
  // Limpia todas las listas de usuarios
  const onlineUserList = document.getElementById("connected-list");
  const offlineUserList = document.getElementById("disconnected-list");
  onlineUserList.innerHTML = "";
  offlineUserList.innerHTML = "";
  datos.forEach((user) => {
    const friendElement = createFriendStateElement(user);

    if (user.state === "online" || user.state === "busy") {
      onlineUserList.appendChild(friendElement);
    } else if (user.state === "offline") {
      offlineUserList.appendChild(friendElement);
    }
  });
}
function createFriendStateElement(datos) {
  const friendElement = document.createElement("li");
  friendElement.innerHTML = `
        <li class="friend-element">
            <img src="./assets/imgs/${datos.state}.svg" alt="${datos.state}" class="mini-avatar"></img>
            <p>${datos.username}</p>
        </li>`;
  return friendElement;
}
function getUserListByState(state) {
  if (state === "offline") {
    return document.getElementById("disconnected-list");
  } else {
    return document.getElementById("connected-list");
  }
}

//log out
function logOut() {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("state");
  window.location.href = "/index.html";
}
