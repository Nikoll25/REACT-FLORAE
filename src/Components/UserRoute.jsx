import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

function UserRoute() {
    const usuario = useAuthStore((state) => state.usuario);
    const token = useAuthStore((state) => state.token);
    const autenticado = useAuthStore((state) => state.autenticado);
    const verificarSesion = useAuthStore((state) => state.verificarSesion);
    const [tokenVerificado, setTokenVerificado] = useState(null);

    // Verificar la sesión antes de ingresar
    useEffect(() => {
        let vigente = true;

        const verificar = async () => {
            if (!token) return;
            try {
                await verificarSesion();
            } finally {
                if (vigente) setTokenVerificado(token);
            }
        };

        verificar();
        return () => { vigente = false; };
    }, [token, verificarSesion]);

    if (!token) return <Navigate to="/login" replace />;

    // Mostrar un skeleton mientras se verifica la sesión
    if (tokenVerificado !== token) {
        return (
            <div className="min-h-screen animate-pulse bg-background">
                <div className="flex h-20 items-center justify-between border-b border-border bg-surface px-6">
                    <div className="h-12 w-32 rounded-xl bg-pale" />
                    <div className="hidden gap-6 sm:flex">
                        {Array.from({ length: 3 }, (_, i) => (
                            <div key={i} className="h-5 w-24 rounded-lg bg-pale" />
                        ))}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-pale" />
                </div>
                <main className="mx-auto max-w-7xl px-6 py-10">
                    <div className="mb-8 h-10 w-48 rounded-xl bg-pale" />
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }, (_, i) => (
                            <div key={i} className="h-72 rounded-florae bg-pale" />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (!autenticado || !usuario || usuario.estado !== "activa") return <Navigate to="/login" replace />;

    // Comprobar el rol del usuario
    const rol = usuario.role?.nombre?.toLowerCase();

    if (rol === "administrador") return <Navigate to="/admin" replace />;
    if (rol !== "usuario") return <Navigate to="/login" replace />;

    return <Outlet />;
}

export default UserRoute;