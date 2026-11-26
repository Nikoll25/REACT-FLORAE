// Direcciones de la API
export const API_URL = import.meta.env.VITE_API_URL;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Realizar peticiones y manejar errores
const realizarPeticion = async (ruta, opciones = {}, mensajeError = "Ocurrió un error en la solicitud.") => {
    let respuesta;

    try {
        respuesta = await fetch(`${API_URL}${ruta}`, {
            ...opciones,
            headers: {
                Accept: "application/json",
                ...(opciones.body && !(opciones.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
                ...opciones.headers,
            },
        });
    } catch (error) {
        console.error("Error de conexión:", error);
        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
    }

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        const mensaje = Object.values(datos?.errors || {}).flat()[0] || datos?.mensaje || datos?.message || mensajeError;
        const error = new Error(mensaje);

        error.status = respuesta.status;
        error.codigo = datos?.codigo || null;
        error.puede_reactivar = datos?.puede_reactivar === true;
        error.creditos = datos?.creditos ?? null;

        throw error;
    }

    if (respuesta.status === 204) return {};

    if (datos === null) {
        throw new Error("El servidor no devolvió una respuesta válida.");
    }

    return datos;
};

// Peticiones autenticadas
export const peticionAutenticada = async (ruta, opciones = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Debes iniciar sesión para continuar.");
    }

    try {
        return await realizarPeticion(ruta, {
            ...opciones,
            headers: { ...opciones.headers, Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        if (error.status === 401) {
            error.message = "Tu sesión ha expirado. Inicia sesión nuevamente.";
        }

        throw error;
    }
};

// Métodos reutilizables
const get = (ruta, opciones = {}) => peticionAutenticada(ruta, opciones);
const post = (ruta, datos) => peticionAutenticada(ruta, { method: "POST", body: datos instanceof FormData ? datos : JSON.stringify(datos) });
const put = (ruta, datos) => peticionAutenticada(ruta, { method: "PUT", body: JSON.stringify(datos) });
const patch = (ruta) => peticionAutenticada(ruta, { method: "PATCH" });
const eliminar = (ruta, datos) => peticionAutenticada(ruta, { method: "DELETE", body: datos === undefined ? undefined : JSON.stringify(datos) });

// Iniciar sesión
export const iniciarSesion = (email, password) => realizarPeticion("/login", { method: "POST", body: JSON.stringify({ email, password }) }, "Correo o contraseña incorrectos.");

// Reactivar una cuenta suspendida voluntariamente
export const reactivarCuenta = (email, password) => realizarPeticion("/cuenta/reactivar", { method: "POST", body: JSON.stringify({ email, password }) }, "No se pudo reactivar la cuenta.");

// Obtener el usuario autenticado
export const obtenerUsuario = () => get("/me");

// Cerrar sesión
export const cerrarSesion = () => post("/logout");

// Actualizar nombre y correo
export const actualizarPerfil = (datos) => put("/perfil", datos);

// Cambiar contraseña
export const cambiarPassword = (datos) => put("/profile/password", datos);

// Actualizar fotografía de perfil
export const actualizarFotoPerfil = (imagen) => {
    const formulario = new FormData();
    formulario.append("imagen", imagen);
    return post("/profile", formulario);
};

// Suspender voluntariamente la cuenta
export const suspenderCuenta = (password) => post("/cuenta/suspender", { password });

// Eliminar la cuenta
export const eliminarCuenta = (password) => eliminar("/profile", { password });

// Consultar notificaciones
export const obtenerNotificaciones = (pagina = 1) => get(`/notificaciones?page=${pagina}`);

// Consultar notificaciones sin leer
export const obtenerNotificacionesSinLeer = () => get("/notificaciones/sin-leer");

// Marcar una notificación como leída
export const marcarNotificacionLeida = (id) => patch(`/notificaciones/${id}/leer`);

// Marcar todas las notificaciones como leídas
export const marcarTodasNotificacionesLeidas = () => patch("/notificaciones/leer-todas");

// Consultar preferencias de notificaciones
export const obtenerPreferenciasNotificaciones = () => get("/notificaciones/preferencias");

// Actualizar preferencias de notificaciones
export const actualizarPreferenciasNotificaciones = (preferencias) => put("/notificaciones/preferencias", preferencias);

// Consultar todas las plantas
export const obtenerPlantas = async () => {
    const datos = await realizarPeticion("/plant", {}, "No se pudieron cargar las plantas.");
    return Array.isArray(datos) ? datos : datos.data || [];
};

// Consultar una planta por su ID
export const obtenerPlanta = (id) => realizarPeticion(`/plant/${id}`, {}, "No se pudo cargar la planta.");

// Obtener la URL pública de una imagen
export const obtenerImagen = (imagen) => {
    if (!imagen || typeof imagen !== "string") return null;
    if (/^https?:\/\//i.test(imagen)) return imagen;

    const ruta = imagen.replace(/^\/+/, "");
    const base = (API_BASE_URL || "").replace(/\/+$/, "");

    return ruta.startsWith("storage/") ? `${base}/${ruta}` : `${base}/storage/${ruta}`;
};

// Consultar todas las plagas
export const obtenerPlagas = async () => {
    const datos = await realizarPeticion("/plagas", {}, "No se pudieron cargar las plagas.");

    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos.data)) return datos.data;
    if (Array.isArray(datos.plagas)) return datos.plagas;

    return [];
};

// Consultar una plaga por su ID
export const obtenerPlaga = async (id) => {
    const datos = await realizarPeticion(`/plagas/${id}`, {}, "No se pudo cargar la plaga.");
    return datos.plaga || datos.data || datos;
};

// Consultar todos los tratamientos
export const obtenerTratamientos = async () => {
    const datos = await realizarPeticion("/tratamientos", {}, "No se pudieron cargar los tratamientos.");

    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos.data)) return datos.data;
    if (Array.isArray(datos.tratamientos)) return datos.tratamientos;

    return [];
};

// Consultar un tratamiento por su ID
export const obtenerTratamiento = async (id) => {
    const datos = await realizarPeticion(`/tratamientos/${id}`, {}, "No se pudo cargar el tratamiento.");
    return datos.data || datos.tratamiento || datos;
};

// Consultar las plantas del jardín
export const obtenerPlantasJardin = () => get("/jardin/plantas");

// Agregar una planta al jardín
export const agregarPlantaJardin = (plantaId) => post("/jardin/plantas", { planta_id: plantaId });

// Eliminar una planta del jardín
export const eliminarPlantaJardin = (plantaJardinId) => eliminar(`/jardin/plantas/${plantaJardinId}`);

// Consultar las actividades de una planta
export const obtenerActividadesPlanta = (plantaJardinId) => get(`/jardin/plantas/${plantaJardinId}/actividades`);

// Consultar las actividades de una fecha
export const obtenerActividadesPorFecha = (fecha) => get(`/actividades/fecha?${new URLSearchParams({ fecha }).toString()}`);

// Marcar una actividad como completada
export const completarActividad = (actividadId) => patch(`/actividades/${actividadId}/completar`);

// Consultar las plagas registradas en el jardín
export const obtenerPlagasJardin = () => get("/jardin/plagas");

// Registrar una plaga en una planta
export const registrarPlagaJardin = (plagaId, plantaJardinId) => post("/jardin/plagas", { plaga_id: plagaId, planta_jardin_id: plantaJardinId });

// Consultar una plaga registrada
export const obtenerPlagaJardin = (plagaJardinId) => get(`/jardin/plagas/${plagaJardinId}`);

// Marcar una plaga como erradicada
export const erradicarPlagaJardin = (plagaJardinId) => patch(`/jardin/plagas/${plagaJardinId}/erradicar`);

// Reactivar una plaga erradicada
export const reactivarPlagaJardin = (plagaJardinId) => patch(`/jardin/plagas/${plagaJardinId}/reactivar`);

// Consultar tratamientos aplicados
export const obtenerTratamientosJardin = () => get("/jardin/tratamientos");

// Consultar un tratamiento aplicado
export const obtenerTratamientoJardin = (aplicacionId) => get(`/jardin/tratamientos/${aplicacionId}`);

// Registrar un tratamiento en el jardín
export const registrarTratamientoJardin = (plagaJardinId, tratamientoId) => post("/jardin/tratamientos", { plaga_jardin_id: plagaJardinId, tratamiento_id: tratamientoId });

// Calcular el estado de un tratamiento aplicado
export const obtenerEstadoTratamiento = (fechaFin) => {
    if (!fechaFin) return "Sin fecha";

    const fechaFinalizacion = new Date(fechaFin);

    if (isNaN(fechaFinalizacion.getTime())) return "Sin fecha";

    return new Date() >= fechaFinalizacion ? "Finalizado" : "Activo";
};

// Consultar los medicamentos de un tratamiento
export const obtenerMedicamentosTratamiento = async (tratamientoId) => {
    const datos = await realizarPeticion("/medicamentos", {}, "No se pudieron consultar los medicamentos.");

    return (datos.medicamentos || []).filter((medicamento) =>
        medicamento.tratamientos?.some((tratamiento) => String(tratamiento.id) === String(tratamientoId))
    );
};

// Consultar medicamentos registrados en una aplicación
export const obtenerMedicamentosAplicados = (aplicacionId) => get(`/jardin/tratamientos/${aplicacionId}/medicamentos`);

// Registrar medicamentos en una aplicación
export const registrarMedicamentosAplicados = (aplicacionId, medicamentos) => post("/jardin/medicamentos", { aplicacion_tratamiento_id: aplicacionId, medicamentos });

// Retirar un medicamento registrado
export const retirarMedicamentoAplicado = (registroId) => eliminar(`/jardin/medicamentos/${registroId}`);

// Consultar el resumen del jardín
export const obtenerEstadisticasPerfil = async () => {
    const fechaActual = new Date();
    const hoy = [fechaActual.getFullYear(), String(fechaActual.getMonth() + 1).padStart(2, "0"), String(fechaActual.getDate()).padStart(2, "0")].join("-");

    const [respuestaActividades, respuestaPlagas] = await Promise.all([
        obtenerActividadesPorFecha(hoy),
        obtenerPlagasJardin(),
    ]);

    const actividades = respuestaActividades.actividades;
    const plagas = respuestaPlagas.plagas;

    if (!Array.isArray(actividades) || !Array.isArray(plagas)) {
        throw new Error("La API devolvió un formato inesperado para las estadísticas.");
    }

    const pendientes = actividades.filter((actividad) => actividad.estado === "pendiente");
    const cuidadosHoy = pendientes.filter((actividad) => String(actividad.fecha_programada || "").slice(0, 10) === hoy).length;
    const cuidadosPendientes = pendientes.length;
    const plagasActivas = plagas.filter((plaga) => plaga.estado === "activa").length;

    return { cuidadosHoy, cuidadosPendientes, plagasActivas };
};

// Consultar Gemini y obtener los créditos actualizados
export const consultarAsistenteIAConCreditos = async (mensaje) => {
    const texto = String(mensaje || "").trim();

    if (!texto) {
        throw new Error("Escribe un mensaje para consultar al asistente.");
    }

    const datos = await post("/asistente/consultar", { mensaje: texto });

    if (typeof datos?.respuesta !== "string" || !datos.respuesta.trim()) {
        const error = new Error("El asistente no devolvió una respuesta válida.");
        error.creditos = datos?.creditos ?? null;
        throw error;
    }

    return { ...datos, respuesta: datos.respuesta.trim() };
};

// Consultar el asistente y devolver únicamente el texto
export const consultarAsistenteIA = async (mensaje) => {
    const datos = await consultarAsistenteIAConCreditos(mensaje);
    return datos.respuesta;
};

// Consultar los créditos disponibles
export const obtenerCreditos = () => get("/creditos", { cache: "no-store" });

// Consultar los planes disponibles
export const obtenerPlanes = () => get("/planes");

// Consultar la suscripción actual
export const obtenerSuscripcionActual = () => get("/suscripciones/actual", { cache: "no-store" });

// Consultar el historial de suscripciones
export const obtenerSuscripciones = () => get("/suscripciones", { cache: "no-store" });

// Consultar el historial de pagos
export const obtenerPagos = () => get("/pagos", { cache: "no-store" });

// Contratar una suscripción
export const contratarSuscripcion = (planId, metodoPago) => post("/suscripciones/contratar", { plan_id: planId, metodo_pago: metodoPago });

// Renovar una suscripción
export const renovarSuscripcion = (planId, metodoPago) => post("/suscripciones/renovar", { plan_id: planId, metodo_pago: metodoPago });

// Consultar el detalle de un pago
export const obtenerPago = (id) => get(`/pagos/${id}`);