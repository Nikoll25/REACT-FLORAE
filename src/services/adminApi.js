import { peticionAutenticada } from "./api";

// Métodos reutilizables para las peticiones
const get = (ruta) => peticionAutenticada(ruta, { cache: "no-store" });
const post = (ruta, datos) => peticionAutenticada(ruta, { method: "POST", body: datos instanceof FormData ? datos : JSON.stringify(datos) });
const put = (ruta, datos) => peticionAutenticada(ruta, { method: "PUT", body: JSON.stringify(datos) });
const patch = (ruta, datos) => peticionAutenticada(ruta, { method: "PATCH", body: datos === undefined ? undefined : JSON.stringify(datos) });
const eliminar = (ruta) => peticionAutenticada(ruta, { method: "DELETE" });

// Administración de plantas
export const obtenerPlantasAdmin = () => get("/admin/plant");
export const obtenerPlantaAdmin = (id) => get(`/admin/plant/${id}`);
export const crearPlanta = (datos) => post("/plant", datos);
export const actualizarPlanta = (id, datos) => put(`/plant/${id}`, datos);
export const suspenderPlanta = (id) => patch(`/plant/${id}/suspend`);
export const activarPlanta = (id) => patch(`/plant/${id}/activate`);
export const eliminarPlanta = (id, confirmar = false) => eliminar(`/plant/${id}?confirmar=${confirmar ? 1 : 0}`);

// Imágenes de plantas
export const obtenerImagenesPlanta = (plantaId) => get(`/plant/${plantaId}/imagenes`);
export const agregarImagenPlanta = (plantaId, formulario) => post(`/plant/${plantaId}/imagenes`, formulario);
export const establecerImagenPrincipalPlanta = (plantaId, imagenId) => patch(`/plant/${plantaId}/imagenes/${imagenId}/principal`);
export const eliminarImagenPlanta = (plantaId, imagenId) => eliminar(`/plant/${plantaId}/imagenes/${imagenId}`);

// Administración de cuidados
export const obtenerCuidadosPlanta = (plantaId) => get(`/plant/${plantaId}/cuidados`);
export const obtenerCuidado = (id) => get(`/plantcare/${id}`);
export const crearCuidado = (datos) => post("/plantcare", datos);
export const actualizarCuidado = (id, datos) => put(`/plantcare/${id}`, datos);
export const eliminarCuidado = (id) => eliminar(`/plantcare/${id}`);

// Administración de plagas
export const obtenerPlagasAdmin = () => get("/admin/plagas");
export const obtenerPlagaAdmin = (id) => get(`/admin/plagas/${id}`);
export const crearPlaga = (datos) => post("/plagas", datos);
export const actualizarPlaga = (id, datos) => put(`/plagas/${id}`, datos);
export const suspenderPlaga = (id) => patch(`/plagas/${id}/suspender`);
export const reactivarPlaga = (id) => patch(`/plagas/${id}/reactivar`);
export const eliminarPlaga = (id, confirmar = false) => eliminar(`/plagas/${id}?confirmar=${confirmar ? 1 : 0}`);

// Imágenes de plagas
export const obtenerImagenesPlaga = (plagaId) => get(`/plagas/${plagaId}/imagenes`);
export const agregarImagenPlaga = (plagaId, formulario) => post(`/plagas/${plagaId}/imagenes`, formulario);
export const establecerImagenPrincipalPlaga = (plagaId, imagenId) => patch(`/plagas/${plagaId}/imagenes/${imagenId}/principal`);
export const eliminarImagenPlaga = (plagaId, imagenId) => eliminar(`/plagas/${plagaId}/imagenes/${imagenId}`);

// Administración de tratamientos
export const obtenerTratamientosAdmin = () => get("/admin/tratamientos");
export const obtenerTratamientoAdmin = (id) => get(`/admin/tratamientos/${id}`);
export const crearTratamiento = (datos) => post("/tratamientos", datos);
export const actualizarTratamiento = (id, datos) => put(`/tratamientos/${id}`, datos);
export const suspenderTratamiento = (id) => patch(`/tratamientos/${id}/suspender`);
export const reactivarTratamiento = (id) => patch(`/tratamientos/${id}/reactivar`);
export const eliminarTratamiento = (id, confirmar = false) => eliminar(`/tratamientos/${id}?confirmar=${confirmar ? 1 : 0}`);

// Administración de medicamentos
export const obtenerMedicamentosAdmin = () => get("/admin/medicamentos");
export const obtenerMedicamentoAdmin = (id) => get(`/medicamentos/${id}`);
export const crearMedicamento = (datos) => post("/medicamentos", datos);
export const actualizarMedicamento = (id, datos) => put(`/medicamentos/${id}`, datos);
export const suspenderMedicamento = (id) => patch(`/medicamentos/${id}/suspender`);
export const activarMedicamento = (id) => patch(`/medicamentos/${id}/activar`);
export const eliminarMedicamento = (id, confirmar = false) => eliminar(`/medicamentos/${id}?confirmar=${confirmar ? 1 : 0}`);

// Administración de usuarios
export const obtenerUsuariosAdmin = () => get("/admin/users");
export const obtenerUsuarioAdmin = (id) => get(`/admin/users/${id}`);
export const crearAdministrador = (datos) => post("/admin/users", datos);
export const suspenderUsuario = (id) => patch(`/admin/users/${id}/suspend`);
export const activarUsuario = (id) => patch(`/admin/users/${id}/activate`);

// Administración de sugerencias de IA
export const obtenerSugerenciasIA = (filtros = {}) => {
    const parametros = new URLSearchParams(Object.entries(filtros).filter(([, valor]) => valor !== "" && valor != null));
    return get(`/admin/sugerencias-ia?${parametros}`);
};
export const obtenerSugerenciaIA = (id) => get(`/admin/sugerencias-ia/${id}`);
export const aceptarSugerenciaIA = (id) => get(`/admin/sugerencias-ia/${id}/aceptar`);
export const rechazarSugerenciaIA = (id) => patch(`/admin/sugerencias-ia/${id}/rechazar`);

// Administración de planes
export const obtenerPlanesAdmin = () => get("/admin/planes");
export const actualizarPlan = (id, datos) => put(`/admin/planes/${id}`, datos);

// Administración de suscripciones
export const obtenerSuscripcionesAdmin = (filtros = {}) => {
    const parametros = new URLSearchParams(Object.entries(filtros).filter(([, valor]) => valor !== "" && valor != null));
    return get(`/admin/suscripciones?${parametros}`);
};
export const obtenerSuscripcionAdmin = (id) => get(`/admin/suscripciones/${id}`);

// Administración de pagos
export const obtenerPagosAdmin = (filtros = {}) => {
    const parametros = new URLSearchParams(Object.entries(filtros).filter(([, valor]) => valor !== "" && valor != null));
    return get(`/admin/pagos?${parametros}`);
};
export const obtenerPagoAdmin = (id) => get(`/admin/pagos/${id}`);

// Consultar las estadísticas y el crecimiento de Florae
export const obtenerEstadisticasAdmin = (meses = 6) => get(`/admin/dashboard?meses=${meses}`);