const socket = new WebSocket("ws://localhost:3000");
const user = sessionStorage.getItem("username");
const state = sessionStorage.getItem("state");
socket.addEventListener("open", () => {
  console.log("Conexión WebSocket establecida con el servidor");
  socket.send(JSON.stringify({ username: user, state: state }));
});
document.getElementById("send-button").addEventListener("click", (event) => {
  event.preventDefault();
  sendMessage();
});
document.getElementById("message").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const message = document.getElementById("message").value;
  if (message.trim() !== "") {
    document.getElementById("message").value = "";
    const data = {
      message: message,
      user: user,
      date: new Date().toISOString(),
    };
    socket.send(JSON.stringify(data));
    console.log("aca no la cague");
  }
}
function addCategoryClickListeners() {
  const categoryHeaders = document.querySelectorAll("#contact-list h3");
  categoryHeaders.forEach((header) => {
    header.addEventListener("click", toggleCategoryList);
  });
}

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

socket.addEventListener("message", (event) => {
  console.log(event.data);
  const datos = JSON.parse(event.data);

  // Obtener el nombre de usuario del sessionStorage
  const currentUser = sessionStorage.getItem("username");
  if (datos.message) {
    const nuevaPlantilla = createMessageTemplate(datos);
    const contenedor = document.getElementById("chat-container");
    // Marcar mensajes propios como "own-message"
    if (datos.user === currentUser) {
      nuevaPlantilla.classList.add("own-message");
    }
    contenedor.appendChild(nuevaPlantilla);
  } else {
    handleFriendMessage(datos);
  }
});

function handleFriendMessage(datos) {
  const friendElement = createFriendElement(datos);
  const userList = getUserListByState(datos.state);
  if (userList) {
    userList.appendChild(friendElement);
  }
}

function createFriendElement(datos) {
  const friendElement = document.createElement("li");
  friendElement.innerHTML = `
        <li>
            <img src="./assets/imgs/${datos.state}.png" alt="${datos.state}"></img>
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

function createMessageTemplate(data) {
  const nuevaPlantilla = document.createElement("div");
  nuevaPlantilla.innerHTML = `
    <p>${data.user} dice:</p>
    <p>${data.message}</p>
    `;
  return nuevaPlantilla;
}
