
const pantallaLogin = document.getElementById("pantallaLogin");
const dashboard = document.getElementById("dashboard");
const formLogin = document.getElementById("formLogin");

let humedadActual = 42;
let humedadObjetivo = 60;
let litrosUsados = 128.4;
let valvulaActiva = false;

// Este acceso es solo para probar la interfaz, no es autenticación real.
formLogin.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const mensaje = document.getElementById("mensajeLogin");

    if (usuario === "" || contrasena === "") {
        mensaje.textContent = "Completa los dos campos.";
        return;
    }

    document.getElementById("nombreUsuario").textContent = usuario;

    pantallaLogin.classList.add("oculto");
    dashboard.classList.remove("oculto");
});

// Actualiza los números y el estado visual del cultivo.
function actualizarDashboard() {
    document.getElementById("humedadActual").textContent = humedadActual;
    document.getElementById("humedadObjetivoTexto").textContent = humedadObjetivo;
    document.getElementById("litrosUsados").textContent = litrosUsados.toFixed(1);
    document.getElementById("barraHumedad").style.width = humedadActual + "%";

    const estado = document.getElementById("estadoCultivo");

    if (humedadActual < humedadObjetivo) {
        estado.textContent = "Por debajo de la meta";
    } else {
        estado.textContent = "Meta alcanzada";
    }

    document.getElementById("estadoValvula").textContent =
        valvulaActiva ? "Encendida" : "Apagada";

    document.getElementById("textoValvula").textContent =
        valvulaActiva ? "Riego activo (simulado)" : "Riego detenido";

    document.getElementById("btnValvula").textContent =
        valvulaActiva ? "Desactivar riego" : "Activar riego";
}

// Guarda el objetivo que el usuario eligió.
document.getElementById("btnGuardar").addEventListener("click", function() {
    const valor = Number(document.getElementById("objetivo").value);
    const mensaje = document.getElementById("mensajeAjuste");

    if (!Number.isFinite(valor) || valor < 1 || valor > 100) {
        mensaje.textContent = "Elige un valor entre 1 y 100.";
        return;
    }

    humedadObjetivo = valor;
    mensaje.style.color = "#24764b";
    mensaje.textContent = "Objetivo actualizado.";
    actualizarDashboard();
});

// Simula el encendido y apagado de la válvula.
document.getElementById("btnValvula").addEventListener("click", function() {
    valvulaActiva = !valvulaActiva;

    if (valvulaActiva) {
        litrosUsados += 0.5;
    }

    actualizarDashboard();
});

// Genera una lectura ficticia para probar el panel.
document.getElementById("btnSimular").addEventListener("click", function() {
    humedadActual = Math.floor(Math.random() * 71) + 20;
    actualizarDashboard();
});

// Regresa a la pantalla inicial.
document.getElementById("btnSalir").addEventListener("click", function() {
    dashboard.classList.add("oculto");
    pantallaLogin.classList.remove("oculto");
    formLogin.reset();
});

// Muestra los valores iniciales.
actualizarDashboard();