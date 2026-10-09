
const pantallaLogin = document.getElementById("pantallaLogin");
const dashboard = document.getElementById("dashboard");
const formLogin = document.getElementById("formLogin");
const mensajeLogin = document.getElementById("mensajeLogin");

// Conectamos AquaSolar con nuestro proyecto de Supabase.
const SUPABASE_URL = "PEGA_AQUI_TU_PROJECT_URL";
const SUPABASE_KEY = "PEGA_AQUI_TU_PUBLISHABLE_KEY";

const clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let humedadActual = 42;
let humedadObjetivo = 60;
let litrosUsados = 128.4;
let valvulaActiva = false;

// Mostramos el panel cuando existe una sesión válida.
function mostrarDashboard(usuario) {
    pantallaLogin.classList.add("oculto");
    dashboard.classList.remove("oculto");

    document.getElementById("nombreUsuario").textContent =
        usuario.email || "Usuario";
}

// Mostramos el login cuando no hay una sesión.
function mostrarLogin() {
    dashboard.classList.add("oculto");
    pantallaLogin.classList.remove("oculto");
}

// Iniciar sesión con correo y contraseña.
formLogin.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const email = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    mensajeLogin.textContent = "Verificando acceso...";

    const { data, error } = await clienteSupabase.auth.signInWithPassword({
        email: email,
        password: contrasena
    });

    if (error) {
        mensajeLogin.textContent =
            "No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.";
        console.error("Error de inicio de sesión:", error.message);
        return;
    }

    formLogin.reset();
    mensajeLogin.textContent = "";
    mostrarDashboard(data.user);
});

// Crear una cuenta nueva.
document.getElementById("btnRegistro").addEventListener("click", async function() {
    const email = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    if (!email || !contrasena) {
        mensajeLogin.textContent =
            "Escribe tu correo y una contraseña para registrarte.";
        return;
    }

    mensajeLogin.textContent = "Creando cuenta...";

    const { data, error } = await clienteSupabase.auth.signUp({
        email: email,
        password: contrasena
    });

    if (error) {
        mensajeLogin.textContent =
            "No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.";
        console.error("Error de registro:", error.message);
        return;
    }

    if (data.session && data.user) {
        formLogin.reset();
        mensajeLogin.textContent = "";
        mostrarDashboard(data.user);
    } else {
        mensajeLogin.textContent =
            "Cuenta creada. Revisa tu correo para confirmar el registro.";
    }
});

// Recuperamos la sesión y escuchamos cambios de autenticación.
clienteSupabase.auth.onAuthStateChange(function(evento, sesion) {
    if (sesion) {
        mostrarDashboard(sesion.user);
    } else {
        mostrarLogin();
    }
});

// Comprobamos si el usuario ya tenía una sesión al abrir la página.
async function comprobarSesion() {
    const { data, error } = await clienteSupabase.auth.getSession();

    if (error) {
        console.error("No se pudo comprobar la sesión:", error.message);
        mostrarLogin();
        return;
    }

    if (data.session) {
        mostrarDashboard(data.session.user);
    } else {
        mostrarLogin();
    }
}

comprobarSesion();

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


const nombresAccionamiento = {
    mosfet: "Carga DC compatible con MOSFET.",
    rele: "Carga conmutada mediante relevador compatible.",
    puenteH: "Motor compatible con puente H."
};

// Cambia de pestaña sin recargar la página.
document.querySelectorAll(".pestana").forEach(function(boton) {
    boton.addEventListener("click", function() {
        document.querySelectorAll(".pestana").forEach(function(pestana) {
            pestana.classList.remove("activa");
        });

        document.querySelectorAll(".vista").forEach(function(vista) {
            vista.classList.add("oculto");
        });

        boton.classList.add("activa");

        document.getElementById(boton.dataset.vista)
            .classList.remove("oculto");

        if (boton.dataset.vista === "vistaEstado") {
            dibujarGrafica();
        }
    });
});

// Muestra una descripción según el accionamiento elegido.
[1, 2, 3].forEach(function(numero) {
    const selector = document.getElementById("tipoValvula" + numero);
    const nota = document.getElementById("notaValvula" + numero);

    selector.addEventListener("change", function() {
        nota.textContent = nombresAccionamiento[selector.value];
    });
});

// Guarda los ajustes localmente en este navegador.
document.getElementById("btnGuardarPCB").addEventListener("click", function() {
    const configuracion = [];
    const canales = new Set();

    for (let numero = 1; numero <= 3; numero++) {
        const tipo = document.getElementById("tipoValvula" + numero).value;
        const canal = document.getElementById("pinValvula" + numero).value;
        const voltaje = Number(document.getElementById("voltaje" + numero).value);

        if (!Number.isFinite(voltaje) || voltaje <= 0) {
            document.getElementById("mensajePCB").textContent =
                "Revisa la tensión de la válvula " + numero + ".";
            return;
        }

        if (canales.has(canal)) {
            document.getElementById("mensajePCB").textContent =
                "Cada válvula debe tener un canal lógico distinto.";
            return;
        }

        canales.add(canal);
        configuracion.push({ tipo, canal, voltaje });
    }

    localStorage.setItem("configuracionAquaSolar", JSON.stringify(configuracion));

    document.getElementById("mensajePCB").textContent =
        "Configuración guardada en este navegador.";
});

// Recupera la configuración anterior, si existe.
const configuracionGuardada =
    JSON.parse(localStorage.getItem("configuracionAquaSolar") || "null");

if (configuracionGuardada) {
    configuracionGuardada.forEach(function(config, indice) {
        const numero = indice + 1;

        document.getElementById("tipoValvula" + numero).value = config.tipo;
        document.getElementById("pinValvula" + numero).value = config.canal;
        document.getElementById("voltaje" + numero).value = config.voltaje;
        document.getElementById("notaValvula" + numero).textContent =
            nombresAccionamiento[config.tipo];
    });
}

// Historial de prueba para la gráfica.
let historialHumedad = [42, 44, 43, 46, 49, 47, 52, 50, 54, 57, 55, 60];

function dibujarGrafica() {
    const canvas = document.getElementById("graficaHumedad");
    const contexto = canvas.getContext("2d");

    const ancho = canvas.clientWidth;
    const alto = 260;
    const escala = window.devicePixelRatio || 1;

    canvas.width = ancho * escala;
    canvas.height = alto * escala;
    contexto.setTransform(escala, 0, 0, escala, 0, 0);
    contexto.clearRect(0, 0, ancho, alto);

    const margenIzquierdo = 38;
    const margenDerecho = 12;
    const margenArriba = 15;
    const margenAbajo = 28;

    const graficaAncho = ancho - margenIzquierdo - margenDerecho;
    const graficaAlto = alto - margenArriba - margenAbajo;

    // Dibujamos las líneas de referencia del porcentaje.
    contexto.font = "12px Arial";
    contexto.textAlign = "right";
    contexto.textBaseline = "middle";

    [0, 25, 50, 75, 100].forEach(function(valor) {
        const y = margenArriba + graficaAlto * (1 - valor / 100);

        contexto.beginPath();
        contexto.strokeStyle = "#e0e9e1";
        contexto.moveTo(margenIzquierdo, y);
        contexto.lineTo(ancho - margenDerecho, y);
        contexto.stroke();

        contexto.fillStyle = "#718078";
        contexto.fillText(valor + "%", margenIzquierdo - 8, y);
    });

    // Convertimos las lecturas en puntos y los unimos.
    contexto.beginPath();
    contexto.strokeStyle = "#24764b";
    contexto.lineWidth = 3;

    historialHumedad.forEach(function(valor, indice) {
        const x = margenIzquierdo +
            (indice / Math.max(historialHumedad.length - 1, 1)) * graficaAncho;

        const y = margenArriba + graficaAlto * (1 - valor / 100);

        if (indice === 0) {
            contexto.moveTo(x, y);
        } else {
            contexto.lineTo(x, y);
        }
    });

    contexto.stroke();

    // Marcamos cada lectura.
    historialHumedad.forEach(function(valor, indice) {
        const x = margenIzquierdo +
            (indice / Math.max(historialHumedad.length - 1, 1)) * graficaAncho;

        const y = margenArriba + graficaAlto * (1 - valor / 100);

        contexto.beginPath();
        contexto.fillStyle = "#24764b";
        contexto.arc(x, y, 4, 0, Math.PI * 2);
        contexto.fill();
    });

    contexto.textAlign = "center";
    contexto.textBaseline = "alphabetic";
    contexto.fillStyle = "#718078";
    contexto.fillText("Lecturas consecutivas", ancho / 2, alto - 5);
}

// Agrega una nueva lectura ficticia a la gráfica.
document.getElementById("btnNuevaLectura").addEventListener("click", function() {
    const nuevaLectura = Math.floor(Math.random() * 71) + 20;

    historialHumedad.push(nuevaLectura);

    if (historialHumedad.length > 20) {
        historialHumedad.shift();
    }

    dibujarGrafica();
});

// Ajusta la gráfica si cambia el ancho de la ventana.
window.addEventListener("resize", function() {
    if (!document.getElementById("vistaEstado").classList.contains("oculto")) {
        dibujarGrafica();
    }
});