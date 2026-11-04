
// obtenemos las direcciones desde el archivo .env
export const API_URL = import.meta.env.VITE_API_URL;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// consultamos todas las plantas registradas
export const obtenerPlantas = async () => {
    const respuesta = await fetch(`${API_URL}/plant`);

    if (!respuesta.ok) {
        throw new Error("no se pudieron cargar las plantas");
    }

    const datos = await respuesta.json();

    // laravel puede devolver los registros directamente o dentro de data
    return Array.isArray(datos) ? datos : datos.data || [];
};

// consultamos una planta por su identificador
export const obtenerPlanta = async (id) => {
    const respuesta = await fetch(`${API_URL}/plant/${id}`);

    if (!respuesta.ok) {
        throw new Error("no se pudo cargar la planta");
    }

    const datos = await respuesta.json();

    return datos;
};

// construimos la dirección de las imágenes
export const obtenerImagen = (imagen) => {
    if (!imagen) {
        return null;
    }

    // si la imagen ya tiene una dirección completa, la conservamos
    if (imagen.startsWith("http")) {
        return imagen;
    }

    // quitamos posibles barras iniciales
    const ruta = imagen.replace(/^\/+/, "");

    // las imágenes de florae están almacenadas en storage
    return `${API_BASE_URL}/storage/${ruta}`;
};
