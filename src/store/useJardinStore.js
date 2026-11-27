import { create } from "zustand";
import {
    obtenerPlantasJardin,
    agregarPlantaJardin,
    eliminarPlantaJardin,
} from "../services/api";

let solicitud = null;
let version = 0;

const tokenActual = () => localStorage.getItem("token");

export const useJardinStore = create((set, get) => ({
    plantas: [],
    cargando: false,
    error: null,
    tokenJardin: null,
    cargado: false,

    // Reutilizamos las plantas mientras se actualiza el jardín
    cargarPlantas: () => {
        const token = tokenActual();

        if (get().tokenJardin !== token) {
            get().limpiarJardin();
        }

        // Evitamos solicitudes simultáneas duplicadas
        if (solicitud?.token === token) {
            return solicitud.promesa;
        }

        const actual = ++version;

        set({
            tokenJardin: token,
            cargando: true,
            error: null,
        });

        const vigente = () =>
            actual === version && token === tokenActual();

        const promesa = Promise.resolve().then(async () => {
            try {
                const datos = await obtenerPlantasJardin();

                const plantas = Array.isArray(datos)
                    ? datos
                    : Array.isArray(datos?.jardin?.plantas_jardin)
                        ? datos.jardin.plantas_jardin
                        : Array.isArray(datos?.plantas)
                            ? datos.plantas
                            : Array.isArray(datos?.data)
                                ? datos.data
                                : [];

                if (!vigente()) return [];

                set({
                    plantas,
                    cargando: false,
                    cargado: true,
                });

                return plantas;
            } catch (error) {
                if (vigente()) {
                    set({
                        error: error.message,
                        cargando: false,
                    });
                }

                throw error;
            } finally {
                if (solicitud?.version === actual) {
                    solicitud = null;
                }
            }
        });

        solicitud = {
            token,
            version: actual,
            promesa,
        };

        return promesa;
    },

    // Agregamos la planta y actualizamos el listado
    agregarPlanta: async (plantaId) => {
        const token = tokenActual();
        const datos = await agregarPlantaJardin(plantaId);

        if (token === tokenActual()) {
            version++;
            solicitud = null;
            await get().cargarPlantas();
        }

        return datos;
    },

    // Eliminamos la planta sin volver a consultar todo el jardín
    eliminarPlanta: async (plantaJardinId) => {
        const token = tokenActual();

        await eliminarPlantaJardin(plantaJardinId);

        if (
            token !== tokenActual() ||
            get().tokenJardin !== token
        ) return;

        version++;
        solicitud = null;

        set((state) => ({
            plantas: state.plantas.filter(
                (planta) => String(planta.id) !== String(plantaJardinId)
            ),
            cargando: false,
        }));
    },

    // Limpiamos los datos de la sesión anterior
    limpiarJardin: () => {
        version++;
        solicitud = null;

        set({
            plantas: [],
            cargando: false,
            error: null,
            tokenJardin: null,
            cargado: false,
        });
    },
}));