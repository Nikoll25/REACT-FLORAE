// Direcciones de la API
export const API_URL = import.meta.env.VITE_API_URL;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Peticiones autenticadas
const peticionAutenticada = async (ruta, opciones = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Debes iniciar sesión para continuar.");
    }

    const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers: {
            Accept: "application/json",
            ...(opciones.body && !(opciones.body instanceof FormData)
                ? { "Content-Type": "application/json" }
                : {}),
            ...opciones.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        if (respuesta.status === 401) {
            throw new Error(
                "Tu sesión ha expirado. Inicia sesión nuevamente."
            );
        }

        const mensaje =
            Object.values(datos.errors || {}).flat()[0] ||
            datos.mensaje ||
            datos.message ||
            "Ocurrió un error en la solicitud.";

        const error = new Error(mensaje);

        error.status = respuesta.status;
        error.creditos = datos.creditos ?? null;

        throw error;
    }

    return datos;
};

// Iniciar sesión
export const iniciarSesion = async (email, password) => {
    const respuesta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        const error = new Error(
            Object.values(datos.errors || {}).flat()[0] ||
            datos.mensaje ||
            datos.message ||
            "Correo o contraseña incorrectos."
        );

        error.codigo = datos.codigo || null;
        error.puede_reactivar = datos.puede_reactivar === true;
        error.status = respuesta.status;

        throw error;
    }

    return datos;
};

// Reactivar una cuenta suspendida voluntariamente
export const reactivarCuenta = async (email, password) => {
    const respuesta = await fetch(`${API_URL}/cuenta/reactivar`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        const error = new Error(
            Object.values(datos.errors || {}).flat()[0] ||
            datos.mensaje ||
            datos.message ||
            "No se pudo reactivar la cuenta."
        );

        error.codigo = datos.codigo || null;
        error.status = respuesta.status;

        throw error;
    }

    return datos;
};

// Obtener el usuario autenticado
export const obtenerUsuario = async () => {
    return await peticionAutenticada("/me");
};

// Cerrar sesión
export const cerrarSesion = async () => {
    return await peticionAutenticada("/logout", {
        method: "POST",
    });
};

// Actualizar nombre y correo
export const actualizarPerfil = async (datos) => {
    return await peticionAutenticada("/perfil", {
        method: "PUT",
        body: JSON.stringify(datos),
    });
};

// Cambiar contraseña
export const cambiarPassword = async (datos) => {
    return await peticionAutenticada("/profile/password", {
        method: "PUT",
        body: JSON.stringify(datos),
    });
};

// Actualizar fotografía de perfil
export const actualizarFotoPerfil = async (imagen) => {
    const formulario = new FormData();

    formulario.append("imagen", imagen);

    return await peticionAutenticada("/profile", {
        method: "POST",
        body: formulario,
    });
};

// Suspender voluntariamente la cuenta
export const suspenderCuenta = async (password) => {
    return await peticionAutenticada("/cuenta/suspender", {
        method: "POST",
        body: JSON.stringify({
            password,
        }),
    });
};

// Eliminar la cuenta
export const eliminarCuenta = async (password) => {
    return await peticionAutenticada("/profile", {
        method: "DELETE",
        body: JSON.stringify({
            password,
        }),
    });
};

// Consultar notificaciones
export const obtenerNotificaciones = async (pagina = 1) => {
    return await peticionAutenticada(
        `/notificaciones?page=${pagina}`
    );
};

// Consultar notificaciones sin leer
export const obtenerNotificacionesSinLeer = async () => {
    return await peticionAutenticada(
        "/notificaciones/sin-leer"
    );
};

// Marcar una notificación como leída
export const marcarNotificacionLeida = async (id) => {
    return await peticionAutenticada(
        `/notificaciones/${id}/leer`,
        {
            method: "PATCH",
        }
    );
};

// Marcar todas las notificaciones como leídas
export const marcarTodasNotificacionesLeidas = async () => {
    return await peticionAutenticada(
        "/notificaciones/leer-todas",
        {
            method: "PATCH",
        }
    );
};

// Consultar preferencias de notificaciones
export const obtenerPreferenciasNotificaciones = async () => {
    return await peticionAutenticada(
        "/notificaciones/preferencias"
    );
};

// Actualizar preferencias de notificaciones
export const actualizarPreferenciasNotificaciones = async (
    preferencias
) => {
    return await peticionAutenticada(
        "/notificaciones/preferencias",
        {
            method: "PUT",
            body: JSON.stringify(preferencias),
        }
    );
};

// Consultar todas las plantas
export const obtenerPlantas = async () => {
    const respuesta = await fetch(`${API_URL}/plant`, {
        headers: {
            Accept: "application/json",
        },
    });

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las plantas.");
    }

    const datos = await respuesta.json();

    return Array.isArray(datos) ? datos : datos.data || [];
};

// Consultar una planta por su ID
export const obtenerPlanta = async (id) => {
    const respuesta = await fetch(`${API_URL}/plant/${id}`, {
        headers: {
            Accept: "application/json",
        },
    });

    if (!respuesta.ok) {
        throw new Error("No se pudo cargar la planta.");
    }

    return await respuesta.json();
};

// Obtener la URL pública de una imagen
export const obtenerImagen = (imagen) => {
    if (!imagen || typeof imagen !== "string") {
        return null;
    }

    if (/^https?:\/\//i.test(imagen)) {
        return imagen;
    }

    const ruta = imagen.replace(/^\/+/, "");
    const base = (API_BASE_URL || "").replace(/\/+$/, "");

    if (ruta.startsWith("storage/")) {
        return `${base}/${ruta}`;
    }

    return `${base}/storage/${ruta}`;
};

// Consultar todas las plagas
export const obtenerPlagas = async () => {
    const respuesta = await fetch(`${API_URL}/plagas`, {
        headers: {
            Accept: "application/json",
        },
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(
            datos.message ||
            datos.mensaje ||
            "No se pudieron cargar las plagas."
        );
    }

    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos.data)) return datos.data;
    if (Array.isArray(datos.plagas)) return datos.plagas;

    return [];
};

// Consultar una plaga por su ID
export const obtenerPlaga = async (id) => {
    const respuesta = await fetch(`${API_URL}/plagas/${id}`, {
        headers: {
            Accept: "application/json",
        },
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(
            datos.message ||
            datos.mensaje ||
            "No se pudo cargar la plaga."
        );
    }

    return datos.plaga || datos.data || datos;
};

// Consultar todos los tratamientos
export const obtenerTratamientos = async () => {
    const respuesta = await fetch(`${API_URL}/tratamientos`, {
        headers: {
            Accept: "application/json",
        },
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(
            datos.message ||
            datos.mensaje ||
            "No se pudieron cargar los tratamientos."
        );
    }

    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos.data)) return datos.data;
    if (Array.isArray(datos.tratamientos)) {
        return datos.tratamientos;
    }

    return [];
};

// Consultar un tratamiento por su ID
export const obtenerTratamiento = async (id) => {
    const respuesta = await fetch(
        `${API_URL}/tratamientos/${id}`,
        {
            headers: {
                Accept: "application/json",
            },
        }
    );

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(
            datos.message ||
            datos.mensaje ||
            "No se pudo cargar el tratamiento."
        );
    }

    return datos.data || datos.tratamiento || datos;
};

// Consultar las plantas del jardín
export const obtenerPlantasJardin = async () => {
    return await peticionAutenticada("/jardin/plantas");
};

// Agregar una planta al jardín
export const agregarPlantaJardin = async (plantaId) => {
    return await peticionAutenticada("/jardin/plantas", {
        method: "POST",
        body: JSON.stringify({
            planta_id: plantaId,
        }),
    });
};

// Eliminar una planta del jardín
export const eliminarPlantaJardin = async (plantaJardinId) => {
    return await peticionAutenticada(
        `/jardin/plantas/${plantaJardinId}`,
        {
            method: "DELETE",
        }
    );
};

// Consultar las actividades de una planta
export const obtenerActividadesPlanta = async (plantaJardinId) => {
    return await peticionAutenticada(
        `/jardin/plantas/${plantaJardinId}/actividades`
    );
};

// Consultar las actividades de una fecha
export const obtenerActividadesPorFecha = async (fecha) => {
    const parametros = new URLSearchParams({ fecha });

    return await peticionAutenticada(
        `/actividades/fecha?${parametros.toString()}`
    );
};

// Marcar una actividad como completada
export const completarActividad = async (actividadId) => {
    return await peticionAutenticada(
        `/actividades/${actividadId}/completar`,
        {
            method: "PATCH",
        }
    );
};

// Consultar las plagas registradas
export const obtenerPlagasJardin = async () => {
    return await peticionAutenticada("/jardin/plagas");
};

// Registrar una plaga en una planta
export const registrarPlagaJardin = async (
    plagaId,
    plantaJardinId
) => {
    return await peticionAutenticada("/jardin/plagas", {
        method: "POST",
        body: JSON.stringify({
            plaga_id: plagaId,
            planta_jardin_id: plantaJardinId,
        }),
    });
};

// Consultar una plaga registrada
export const obtenerPlagaJardin = async (plagaJardinId) => {
    return await peticionAutenticada(
        `/jardin/plagas/${plagaJardinId}`
    );
};

// Marcar una plaga como erradicada
export const erradicarPlagaJardin = async (plagaJardinId) => {
    return await peticionAutenticada(
        `/jardin/plagas/${plagaJardinId}/erradicar`,
        {
            method: "PATCH",
        }
    );
};

// Reactivar una plaga erradicada
export const reactivarPlagaJardin = async (plagaJardinId) => {
    return await peticionAutenticada(
        `/jardin/plagas/${plagaJardinId}/reactivar`,
        {
            method: "PATCH",
        }
    );
};

// Consultar tratamientos aplicados
export const obtenerTratamientosJardin = async () => {
    return await peticionAutenticada(
        "/jardin/tratamientos"
    );
};

// Consultar un tratamiento aplicado
export const obtenerTratamientoJardin = async (aplicacionId) => {
    return await peticionAutenticada(
        `/jardin/tratamientos/${aplicacionId}`
    );
};

// Registrar un tratamiento en el jardín
export const registrarTratamientoJardin = async (
    plagaJardinId,
    tratamientoId
) => {
    return await peticionAutenticada(
        "/jardin/tratamientos",
        {
            method: "POST",
            body: JSON.stringify({
                plaga_jardin_id: plagaJardinId,
                tratamiento_id: tratamientoId,
            }),
        }
    );
};

// Calcular el estado de un tratamiento aplicado
export const obtenerEstadoTratamiento = (fechaFin) => {
    if (!fechaFin) {
        return "Sin fecha";
    }

    const fechaFinalizacion = new Date(fechaFin);

    if (isNaN(fechaFinalizacion.getTime())) {
        return "Sin fecha";
    }

    const hoy = new Date();

    return hoy >= fechaFinalizacion
        ? "Finalizado"
        : "Activo";
};

// Consultar los medicamentos de un tratamiento
export const obtenerMedicamentosTratamiento = async (
    tratamientoId
) => {
    const respuesta = await fetch(
        `${API_URL}/medicamentos`
    );

    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron consultar los medicamentos."
        );
    }

    const datos = await respuesta.json();

    return (datos.medicamentos || []).filter((medicamento) =>
        medicamento.tratamientos?.some(
            (tratamiento) =>
                String(tratamiento.id) === String(tratamientoId)
        )
    );
};

// Consultar medicamentos registrados en una aplicación
export const obtenerMedicamentosAplicados = async (aplicacionId) => {
    return await peticionAutenticada(
        `/jardin/tratamientos/${aplicacionId}/medicamentos`
    );
};

// Registrar medicamentos en una aplicación
export const registrarMedicamentosAplicados = async (
    aplicacionId,
    medicamentos
) => {
    return await peticionAutenticada(
        "/jardin/medicamentos",
        {
            method: "POST",
            body: JSON.stringify({
                aplicacion_tratamiento_id: aplicacionId,
                medicamentos,
            }),
        }
    );
};

// Retirar un medicamento registrado
export const retirarMedicamentoAplicado = async (registroId) => {
    return await peticionAutenticada(
        `/jardin/medicamentos/${registroId}`,
        {
            method: "DELETE",
        }
    );
};

// Consultar el resumen del jardín
export const obtenerEstadisticasPerfil = async () => {
    const fechaActual = new Date();

    const hoy = [
        fechaActual.getFullYear(),
        String(fechaActual.getMonth() + 1).padStart(2, "0"),
        String(fechaActual.getDate()).padStart(2, "0"),
    ].join("-");

    const [respuestaActividades, respuestaPlagas] =
        await Promise.all([
            obtenerActividadesPorFecha(hoy),
            obtenerPlagasJardin(),
        ]);

    const actividades = respuestaActividades.actividades;
    const plagas = respuestaPlagas.plagas;

    if (
        !Array.isArray(actividades) ||
        !Array.isArray(plagas)
    ) {
        throw new Error(
            "La API devolvió un formato inesperado para las estadísticas."
        );
    }

    const pendientes = actividades.filter(
        (actividad) => actividad.estado === "pendiente"
    );

    const cuidadosHoy = pendientes.filter(
        (actividad) =>
            String(
                actividad.fecha_programada || ""
            ).slice(0, 10) === hoy
    ).length;

    const cuidadosPendientes = pendientes.length;

    const plagasActivas = plagas.filter(
        (plaga) => plaga.estado === "activa"
    ).length;

    return {
        cuidadosHoy,
        cuidadosPendientes,
        plagasActivas,
    };
};

// Consultar Gemini y obtener los créditos actualizados
export const consultarAsistenteIAConCreditos = async (mensaje) => {
    const texto = String(mensaje || "").trim();

    if (!texto) {
        throw new Error(
            "Escribe un mensaje para consultar al asistente."
        );
    }

    const datos = await peticionAutenticada("/asistente/consultar", {
        method: "POST",
        body: JSON.stringify({
            mensaje: texto,
        }),
    });

    if (
        typeof datos.respuesta !== "string" ||
        !datos.respuesta.trim()
    ) {
        throw new Error(
            "El asistente no devolvió una respuesta válida."
        );
    }

    return {
        ...datos,
        respuesta: datos.respuesta.trim(),
    };
};

// Consultar el asistente y devolver únicamente el texto
export const consultarAsistenteIA = async (mensaje) => {
    const datos = await consultarAsistenteIAConCreditos(mensaje);

    return datos.respuesta;
};

// Consultar los créditos disponibles
export const obtenerCreditos = async () => {
    return await peticionAutenticada("/creditos", {
        cache: "no-store",
    });
};

// Consultar los planes disponibles
export const obtenerPlanes = async () => {
    return await peticionAutenticada("/planes");
};

// Consultar la suscripción actual
export const obtenerSuscripcionActual = async () => {
    return await peticionAutenticada("/suscripciones/actual", {
        cache: "no-store",
    });
};

// Consultar el historial de suscripciones
export const obtenerSuscripciones = async () => {
    return await peticionAutenticada("/suscripciones", {
        cache: "no-store",
    });
};

// Consultar el historial de pagos
export const obtenerPagos = async () => {
    return await peticionAutenticada("/pagos", {
        cache: "no-store",
    });
};

// Contratar una suscripción
export const contratarSuscripcion = async (planId, metodoPago) => {
    return await peticionAutenticada("/suscripciones/contratar", {
        method: "POST",
        body: JSON.stringify({
            plan_id: planId,
            metodo_pago: metodoPago,
        }),
    });
};

// Renovar una suscripción
export const renovarSuscripcion = async (planId, metodoPago) => {
    return await peticionAutenticada("/suscripciones/renovar", {
        method: "POST",
        body: JSON.stringify({
            plan_id: planId,
            metodo_pago: metodoPago,
        }),
    });
};

// Consultar el detalle de un pago
export const obtenerPago = async (id) => {
    return await peticionAutenticada(`/pagos/${id}`);
};