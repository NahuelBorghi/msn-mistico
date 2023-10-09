document.addEventListener("DOMContentLoaded", function () {
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
      window.location.href = "/chat.html";
      // Redireccion al chat
    } else {
      alert("Credenciales incorrectas. Inténtalo de nuevo.");
    }
  });
});
