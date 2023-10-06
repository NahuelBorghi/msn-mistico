const app = document.getElementById("app");
const app2 = document.getElementById("app2");
document.addEventListener("DOMContentLoaded", async function () {
  // Cargar la plantilla de inicio de sesión al cargar la página
  //creo promesas para asegurarme que este cargado el template antes de los eventlisteners
  await new Promise((resolve) => {
    loadTemplate("login", app, resolve);
  });
  // Agregar un evento de envío al formulario
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Evitar el envío tradicional del formulario

    // Obtener los valores de los campos del formulario
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const state = document.getElementById("state").value;

    // Comprobar los valores contra los datos hardcodeados (simulando autenticación)
    if (username != "admin" && password != "") {
      // Almacenar el nombre de usuario en sessionStorage
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("state", state);
      // Iniciar sesión con éxito
      loadChatAndFriendsList(); // Función para cargar el chat y la lista de amigos
    } else {
      alert("Credenciales incorrectas. Inténtalo de nuevo.");
    }
  });
});

function loadTemplate(templateName, targetElement, callback) {
  fetch(`./templates/${templateName}.html`)
    .then((response) => response.text())
    .then((html) => {
      targetElement.innerHTML = html;
      if (typeof callback === "function") {
        callback();
      }
    });
}
async function loadChatAndFriendsList() {
  await loadTemplates();
  addCategoryClickListeners();
  setupWebSocket();
}

async function loadTemplates() {
  await new Promise((resolve) => {
    loadTemplate("chat", app2, resolve);
  });
  await new Promise((resolve) => {
    loadTemplate("friendsList", app, resolve);
  });
}
