
import { create } from "zustand";

import {
    iniciarSesion,
    reactivarCuenta as reactivarCuentaAPI,
    obtenerUsuario,
    cerrarSesion,
} from "../services/api";

export const useAuthStore = create((set) => ({
    // Información del usuario autenticado
    usuario: null,

    // Token guardado en el navegador
    token: localStorage.getItem("token"),

    // Estado de autenticación
    autenticado: false,

    // Estado de carga
    cargando: false,

    // Mensaje de error
    error: null,

    // Guardar una sesión iniciada o reactivada
    guardarSesion: (datos) => {
        localStorage.setItem("token", datos.token);

        set({
            usuario: datos.user,
            token: datos.token,
            autenticado: true,
            cargando: false,
            error: null,
        });
    },

    // Limpiar los errores de autenticación
    limpiarError: () => {
        set({
            error: null,
        });
    },

    // Limpiar la sesión del usuario
    limpiarSesion: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("usuario");

        set({
            usuario: null,
            token: null,
            autenticado: false,
            cargando: false,
            error: null,
        });
    },

    // Iniciar sesión
    login: async (email, password) => {
        set({
            cargando: true,
            error: null,
        });

        try {
            const datos = await iniciarSesion(email, password);

            localStorage.setItem("token", datos.token);

            set({
                usuario: datos.user,
                token: datos.token,
                autenticado: true,
                cargando: false,
                error: null,
            });

            return datos;
        } catch (error) {
            set({
                cargando: false,
                error:
                    error.codigo === "CUENTA_REACTIVABLE"
                        ? null
                        : error.message,
            });

            throw error;
        }
    },

    // Reactivar una cuenta suspendida voluntariamente
    reactivarCuenta: async (email, password) => {
        set({
            cargando: true,
            error: null,
        });

        try {
            const datos = await reactivarCuentaAPI(email, password);

            localStorage.setItem("token", datos.token);

            set({
                usuario: datos.user,
                token: datos.token,
                autenticado: true,
                cargando: false,
                error: null,
            });

            return datos;
        } catch (error) {
            set({
                cargando: false,
                error: error.message,
            });

            throw error;
        }
    },

    // Recuperar y verificar la sesión
    verificarSesion: async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            set({
                usuario: null,
                token: null,
                autenticado: false,
                cargando: false,
                error: null,
            });

            return;
        }

        set({
            cargando: true,
            error: null,
        });

        try {
            const datos = await obtenerUsuario();

            const usuario = datos.user || datos.usuario || datos;

            set({
                usuario,
                token,
                autenticado: true,
                cargando: false,
                error: null,
            });

            return usuario;
        } catch (error) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("usuario");

            set({
                usuario: null,
                token: null,
                autenticado: false,
                cargando: false,
                error: error.message,
            });
        }
    },

    // Actualizar los datos del usuario en Zustand
    actualizarUsuario: (datosUsuario) => {
        if (!datosUsuario) return;

        const usuarioActualizado =
            datosUsuario.user ||
            datosUsuario.usuario ||
            datosUsuario;

        set((state) => ({
            usuario: {
                ...state.usuario,
                ...usuarioActualizado,
            },
        }));
    },

    // Cerrar sesión
    logout: async () => {
        set({
            cargando: true,
            error: null,
        });

        try {
            await cerrarSesion();
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("usuario");

            set({
                usuario: null,
                token: null,
                autenticado: false,
                cargando: false,
                error: null,
            });
        }
    },
}));
