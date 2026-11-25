import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

function AdminRoute() {
    const usuario = useAuthStore((state) => state.usuario);
    const token = useAuthStore((state) => state.token);
    const autenticado = useAuthStore((state) => state.autenticado);
    const verificarSesion = useAuthStore((state) => state.verificarSesion);

    const [verificando, setVerificando] = useState(true);

    // Verificar la sesión antes de ingresar al administrador
    useEffect(() => {
        let vigente = true;

        const verificar = async () => {
            setVerificando(true);

            try {
                if (token) await verificarSesion();
            } finally {
                if (vigente) setVerificando(false);
            }
        };

        verificar();

        return () => { vigente = false; };
    }, [token, verificarSesion]);

    if (!token) return <Navigate to="/login" replace />;

    // Mostrar un skeleton mientras se verifica la sesión
    if (verificando) {
        return (
            <div className="flex min-h-screen bg-background font-nunito">
                <aside className="hidden w-64 animate-pulse border-r border-border bg-surface p-6 lg:block">
                    <div className="mb-10 h-12 w-36 rounded-xl bg-pale" />
                    {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="mb-4 h-11 rounded-xl bg-pale" />
                    ))}
                </aside>

                <main className="flex-1 animate-pulse p-8">
                    <div className="mb-4 h-10 w-64 max-w-full rounded-xl bg-pale" />
                    <div className="mb-8 h-5 w-80 max-w-full rounded-lg bg-pale" />
                    <div className="mb-8 h-48 rounded-florae bg-pale" />

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="h-36 rounded-florae bg-pale" />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (!autenticado || !usuario) return <Navigate to="/login" replace />;

    // Comprobar el rol y el estado de la cuenta
    if (usuario.estado !== "activa") return <Navigate to="/login" replace />;

    const esAdministrador = usuario.role?.nombre?.toLowerCase() === "administrador";

    if (!esAdministrador) return <Navigate to="/jardin" replace />;

    return <Outlet />;
}

export default AdminRoute;