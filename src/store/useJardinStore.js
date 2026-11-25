
import { create } from "zustand";

import {
    obtenerPlantasJardin,
    agregarPlantaJardin,
    eliminarPlantaJardin,
} from "../services/api";

export const useJardinStore = create((set, get) => ({

    // Plantas del jardín
    plantas: [],

    // Estado de carga
    cargando: false,

    // Mensajes de error
    error: null,

    // ======================================
    // OBTENER PLANTAS
    // ======================================
    cargarPlantas: async () => {

        set({
            cargando: true,
            error: null,
        });

        try {
            const datos = await obtenerPlantasJardin();

            // Admitimos una lista directa o una respuesta
            // que contenga la lista en "plantas" o "data".
const plantas = Array.isArray(datos)
    ? datos
    : Array.isArray(datos.jardin?.plantas_jardin)
        ? datos.jardin.plantas_jardin
        : Array.isArray(datos.plantas)
            ? datos.plantas
            : Array.isArray(datos.data)
                ? datos.data
                : [];

            set({
                plantas,
                cargando: false,
            });

            return plantas;

        } catch (error) {

            set({
                plantas: [],
                error: error.message,
                cargando: false,
            });

            throw error;
        }
    },

    // ======================================
    // AGREGAR PLANTA
    // ======================================
    agregarPlanta: async (plantaId) => {

        const datos = await agregarPlantaJardin(plantaId);

        // Volvemos a consultar para obtener
        // las relaciones y actividades actualizadas
        await get().cargarPlantas();

        return datos;
    },

    // ======================================
    // ELIMINAR PLANTA
    // ======================================
    eliminarPlanta: async (plantaJardinId) => {

        await eliminarPlantaJardin(plantaJardinId);

        set((state) => ({
            plantas: state.plantas.filter(
                (planta) => planta.id !== plantaJardinId
            ),
        }));
    },

    // Limpiar los datos al cerrar sesión
    limpiarJardin: () => {
        set({
            plantas: [],
            cargando: false,
            error: null,
        });
    },

}));
