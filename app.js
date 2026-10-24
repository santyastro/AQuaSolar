
const pantallaLogin = document.getElementById("pantallaLogin");
const dashboard = document.getElementById("dashboard");
const formLogin = document.getElementById("formLogin");
const mensajeLogin = document.getElementById("mensajeLogin");

// Conectamos AquaSolar con nuestro proyecto de Supabase.
//conecta con el proyecto
const SUPABASE_URL = "https://rnwsceoyiptmdgbepoau.supabase.co";
//api del proyecto(no incluir el api key privado)
const SUPABASE_KEY = "sb_publishable_27jZrdS3SNHk27cFadlftg_s7WYzHvR";

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

document.getElementById("btnSalir").addEventListener("click", async function() {
    const { error } = await clienteSupabase.auth.signOut();

    if (error) {
        console.error("Error al cerrar sesión:", error.message);
        return;
    }

    formLogin.reset();
    mostrarLogin();
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


/* CONFIGURACIÓN DEL TERRENO */

// Buscamos una ciudad o código postal usando OpenStreetMap.
document.getElementById("btnBuscarUbicacion").addEventListener("click", async function() {
    const busqueda = document.getElementById("busquedaUbicacion").value.trim();
    const selector = document.getElementById("resultadoUbicacion");
    const mensaje = document.getElementById("mensajeUbicacion");

    if (!busqueda) {
        mensaje.textContent = "Escribe una ciudad o código postal.";
        return;
    }

    mensaje.textContent = "Buscando ubicaciones...";
    selector.disabled = true;
    selector.innerHTML = '<option value="">Buscando...</option>';

    try {
        const parametros = new URLSearchParams({
            q: busqueda,
            format: "jsonv2",
            addressdetails: "1",
            limit: "5"
        });

        const respuesta = await fetch(
            "https://nominatim.openstreetmap.org/search?" + parametros.toString()
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo consultar el servicio.");
        }

        const lugares = await respuesta.json();

        selector.innerHTML = "";

        if (lugares.length === 0) {
            selector.innerHTML = '<option value="">Sin resultados</option>';
            mensaje.textContent = "No encontramos esa ubicación. Prueba con más detalles.";
            return;
        }

        lugares.forEach(function(lugar, indice) {
            const opcion = document.createElement("option");

            opcion.value = String(indice);
            opcion.textContent = lugar.display_name;
            selector.appendChild(opcion);
        });

        // Conservamos las coordenadas que devuelve el servicio.
        selector.dataset.resultados = JSON.stringify(
            lugares.map(function(lugar) {
                return {
                    nombre: lugar.display_name,
                    latitud: lugar.lat,
                    longitud: lugar.lon
                };
            })
        );

        selector.disabled = false;
        selector.selectedIndex = 0;
        selector.dispatchEvent(new Event("change"));

        mensaje.textContent = "Selecciona el resultado que corresponda a tu terreno.";

    } catch (error) {
        console.error("Error al buscar ubicación:", error);
        selector.innerHTML = '<option value="">Error de búsqueda</option>';
        mensaje.textContent =
            "No se pudo consultar la ubicación. Revisa tu conexión e inténtalo de nuevo.";
    }
});

// Mostramos las coordenadas de la ubicación seleccionada.
document.getElementById("resultadoUbicacion").addEventListener("change", function() {
    const selector = this;
    const resultados = JSON.parse(selector.dataset.resultados || "[]");
    const lugar = resultados[Number(selector.value)];

    if (!lugar) {
        document.getElementById("latitud").value = "";
        document.getElementById("longitud").value = "";
        return;
    }

    document.getElementById("latitud").value = lugar.latitud;
    document.getElementById("longitud").value = lugar.longitud;
});

// Recuperamos los datos agrícolas guardados anteriormente.
function cargarTerreno() {
    const guardado = JSON.parse(
        localStorage.getItem("configuracionTerrenoAquaSolar") || "null"
    );

    if (!guardado) return;

    document.getElementById("tipoCultivo").value = guardado.cultivo || "";
    document.getElementById("etapaCultivo").value = guardado.etapa || "";
    document.getElementById("fuenteAgua").value = guardado.fuenteAgua || "";
    document.getElementById("superficie").value = guardado.superficie || "";
    document.getElementById("nombreRed").value = guardado.nombreRed || "";
    document.getElementById("busquedaUbicacion").value = guardado.busqueda || "";
    document.getElementById("latitud").value = guardado.latitud || "";
    document.getElementById("longitud").value = guardado.longitud || "";
}

// Guardamos la configuración agrícola sin almacenar la contraseña Wi-Fi.
document.getElementById("formTerreno").addEventListener("submit", function(evento) {
    evento.preventDefault();

    const superficie = Number(document.getElementById("superficie").value);
    const nombreRed = document.getElementById("nombreRed").value.trim();
    const contrasenaRed = document.getElementById("contrasenaRed").value;
    const mensaje = document.getElementById("mensajeTerreno");

    if (!Number.isFinite(superficie) || superficie <= 0) {
        mensaje.textContent = "Introduce una superficie válida en hectáreas.";
        return;
    }

    if (!nombreRed || !contrasenaRed) {
        mensaje.textContent = "Completa el nombre y la contraseña de la red Wi-Fi.";
        return;
    }

    const configuracion = {
        cultivo: document.getElementById("tipoCultivo").value,
        etapa: document.getElementById("etapaCultivo").value,
        fuenteAgua: document.getElementById("fuenteAgua").value,
        superficie: superficie,
        nombreRed: nombreRed,
        busqueda: document.getElementById("busquedaUbicacion").value.trim(),
        latitud: document.getElementById("latitud").value,
        longitud: document.getElementById("longitud").value
    };

    if (!configuracion.latitud || !configuracion.longitud) {
        mensaje.textContent = "Busca y selecciona la ubicación antes de guardar.";
        return;
    }

    localStorage.setItem(
        "configuracionTerrenoAquaSolar",
        JSON.stringify(configuracion)
    );

    mensaje.textContent =
        "Configuración del terreno guardada en este navegador.";

    // No persistimos la contraseña ni la mostramos en mensajes.
    document.getElementById("contrasenaRed").value = "";
});

// Cargamos los datos anteriores al iniciar la página.
cargarTerreno();
/* ==========================================================
   CLIMA DEL TERRENO
   Consulta las condiciones meteorológicas según las
   coordenadas guardadas en la configuración del terreno.
   ========================================================== */

// Convierte los códigos meteorológicos en descripciones.
function describirClima(codigo) {
    if (codigo === 0) return "Despejado";
    if (codigo === 1) return "Mayormente despejado";
    if (codigo === 2) return "Parcialmente nublado";
    if (codigo === 3) return "Nublado";
    if ([45, 48].includes(codigo)) return "Niebla";
    if ([51, 53, 55, 56, 57].includes(codigo)) return "Llovizna";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) {
        return "Lluvia";
    }
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) {
        return "Nieve";
    }
    if ([95, 96, 99].includes(codigo)) return "Tormenta";
    return "Condición meteorológica variable";
}

// Consulta el clima de la ubicación guardada.
async function actualizarClima() {
    const mensaje = document.getElementById("climaMensaje");
    const boton = document.getElementById("btnActualizarClima");

    const ubicacion = document.getElementById("climaUbicacion");
    const temperatura = document.getElementById("climaTemperatura");
    const humedad = document.getElementById("climaHumedad");
    const lluvia = document.getElementById("climaLluvia");
    const viento = document.getElementById("climaViento");
    const condicion = document.getElementById("climaCondicion");
    const actualizado = document.getElementById("climaActualizado");

    const guardado = JSON.parse(
        localStorage.getItem("configuracionTerrenoAquaSolar") || "null"
    );

    if (
        !guardado ||
        guardado.latitud === "" ||
        guardado.longitud === "" ||
        !Number.isFinite(Number(guardado.latitud)) ||
        !Number.isFinite(Number(guardado.longitud))
    ) {
        ubicacion.textContent = "Configura primero la ubicación";
        mensaje.textContent =
            "Ve a Configuración del terreno y guarda una ubicación válida.";
        return;
    }

    const lat = Number(guardado.latitud);
    const lon = Number(guardado.longitud);

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        mensaje.textContent = "Las coordenadas guardadas no son válidas.";
        return;
    }

    mensaje.textContent = "Consultando condiciones meteorológicas...";
    boton.disabled = true;

    try {
        const parametros = new URLSearchParams({
            latitude: String(lat),
            longitude: String(lon),
            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "precipitation",
                "wind_speed_10m",
                "weather_code"
            ].join(","),
            timezone: "auto"
        });

        const respuesta = await fetch(
            "https://api.open-meteo.com/v1/forecast?" +
            parametros.toString()
        );

        if (!respuesta.ok) {
            throw new Error("El servicio meteorológico no respondió correctamente.");
        }

        const datos = await respuesta.json();
        const actual = datos.current;

        if (!actual) {
            throw new Error("El servicio no devolvió condiciones actuales.");
        }

        temperatura.textContent =
            `${actual.temperature_2m} °C`;

        humedad.textContent =
            `${actual.relative_humidity_2m} %`;

        lluvia.textContent =
            `${actual.precipitation} mm`;

        viento.textContent =
            `${actual.wind_speed_10m} km/h`;

        condicion.textContent =
            describirClima(actual.weather_code);

        // Mostramos el texto de búsqueda que el usuario guardó.
        ubicacion.textContent =
            guardado.busqueda || `${lat}, ${lon}`;

        mensaje.textContent = "Clima actualizado correctamente.";

        actualizado.textContent =
            "Hora de referencia: " +
            actual.time.replace("T", " ") +
            " (" + datos.timezone + ").";

    } catch (error) {
        console.error("Error al consultar el clima:", error);
        mensaje.textContent =
            "No se pudo consultar el clima. Revisa tu conexión e inténtalo de nuevo.";
    } finally {
        boton.disabled = false;
    }
}

// Consultamos el clima al pulsar el botón.
document.getElementById("btnActualizarClima")
    .addEventListener("click", actualizarClima);

// También lo consultamos al entrar al dashboard.
const mostrarDashboardOriginal = mostrarDashboard;

mostrarDashboard = function(usuario) {
    mostrarDashboardOriginal(usuario);
    actualizarClima();
};