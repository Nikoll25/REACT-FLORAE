import { create } from "zustand";
import { obtenerCreditos } from "../services/api";
import { useAuthStore } from "./useAuthStore";

let version = 0;

export const useCreditosStore = create((set) => ({
    creditos: null,
    cargando: false,
    error: "",

    // Limpiar los créditos
    limpiar: () => {
        version++;

        set({
            creditos: null,
            cargando: false,
            error: "",
        });
    },

    // Actualizar los créditos
    actualizar: (creditos, token) => {
        if (!token || token !== useAuthStore.getState().token) return;

        version++;

        set({
            creditos,
            cargando: false,
            error: "",
        });
    },

    // Consultar los créditos desde Laravel
    consultar: async () => {
        const token = useAuthStore.getState().token;

        if (!token) return;

        const solicitud = ++version;

        set({
            cargando: true,
            error: "",
        });

        try {
            const datos = await obtenerCreditos();

            if (typeof datos.creditos?.puede_consultar !== "boolean") {
                throw new Error("No se recibió un saldo válido.");
            }

            if (
                solicitud === version &&
                token === useAuthStore.getState().token
            ) {
                set({
                    creditos: datos.creditos,
                    cargando: false,
                });
            }
        } catch (error) {
            if (
                solicitud === version &&
                token === useAuthStore.getState().token
            ) {
                set({
                    creditos: null,
                    cargando: false,
                    error: error.message,
                });
            }
        }
    },
}));

// Limpiar el saldo al cambiar de sesión
useAuthStore.subscribe((actual, anterior) => {
    if (
        actual.token !== anterior.token ||
        actual.usuario?.id !== anterior.usuario?.id
    ) {
        useCreditosStore.getState().limpiar();
    }
});