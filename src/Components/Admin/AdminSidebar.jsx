import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Sprout, Bug, FlaskConical, Pill, Users, Sparkles, Layers, Crown, Wallet, LogOut, X, LoaderCircle } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import logo from "../../assets/logo.png";

// Opciones del menú administrativo
const grupos = [
    {
        titulo: "General",
        opciones: [
            { nombre: "Inicio", ruta: "/admin", icono: LayoutDashboard },
        ],
    },
    {
        titulo: "Catálogo natural",
        opciones: [
            { nombre: "Plantas", ruta: "/admin/plantas", icono: Sprout },
            { nombre: "Plagas", ruta: "/admin/plagas", icono: Bug },
            { nombre: "Tratamientos", ruta: "/admin/tratamientos", icono: FlaskConical },
            { nombre: "Medicamentos", ruta: "/admin/medicamentos", icono: Pill },
        ],
    },
    {
        titulo: "Comunidad",
        opciones: [
            { nombre: "Usuarios", ruta: "/admin/usuarios", icono: Users },
            { nombre: "Sugerencias IA", ruta: "/admin/sugerencias", icono: Sparkles },
        ],
    },
    {
        titulo: "Membresías",
        opciones: [
            { nombre: "Planes", ruta: "/admin/planes", icono: Layers },
            { nombre: "Suscripciones", ruta: "/admin/suscripciones", icono: Crown },
            { nombre: "Pagos", ruta: "/admin/pagos", icono: Wallet },
        ],
    },
];

function AdminSidebar({ abierto = true, contraido = false, cerrar = () => {} }) {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const [cerrandoSesion, setCerrandoSesion] = useState(false);
    const [confirmarSalida, setConfirmarSalida] = useState(false);

    // Cerrar la sesión del administrador
    const manejarLogout = async () => {
        if (cerrandoSesion) return;
        setCerrandoSesion(true);
        try {
            await logout();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            setCerrandoSesion(false);
            setConfirmarSalida(false);
            navigate("/login", { replace: true });
        }
    };

    return (
        <>
            {/* Fondo del menú en pantallas pequeñas */}
            {abierto && (
                <button type="button" onClick={cerrar} aria-label="Cerrar menú" className="fixed inset-0 z-40 bg-forest-dark/30 backdrop-blur-sm lg:hidden" />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[265px] shrink-0 flex-col border-r border-[#D3DDC4] bg-[#D4E2C8] text-forest font-nunito transition-all duration-300 lg:sticky lg:top-0 ${abierto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${contraido ? "lg:w-[85px]" : "lg:w-[265px]"}`}>

                {/* Identidad de Florae */}
                <div className="relative flex min-h-[80px] flex-col items-center justify-center border-b border-sage/30 px-4 py-2">
                    <button type="button" onClick={cerrar} aria-label="Cerrar menú" className="absolute right-3 top-3 rounded-lg p-1 text-forest hover:bg-sage/20 lg:hidden">
                        <X size={20} />
                    </button>

                    <NavLink to="/admin" onClick={cerrar} aria-label="Inicio de Florae">
                        {contraido ? (
                            <>
                                <img src={logo} alt="Florae" className="h-12 w-[100px] object-contain lg:hidden" />
                                <Sprout size={36} strokeWidth={1.6} className="hidden text-forest lg:block" />
                            </>
                        ) : (
                            <img src={logo} alt="Florae" className="h-12 w-[100px] object-contain" />
                        )}
                    </NavLink>

                    <p className={`mt-1 text-xs font-semibold tracking-wide text-forest/75 ${contraido ? "lg:hidden" : ""}`}>
                        Espacio de gestión
                    </p>
                </div>

                {/* Navegación administrativa */}
                <nav aria-label="Menú administrativo" className="scrollbar-hide min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
                    {grupos.map((grupo) => (
                        <div key={grupo.titulo}>
                            <p className={`mb-1.5 flex items-center gap-2 px-3 text-[10px] font-extrabold uppercase tracking-[1.5px] text-forest/80 ${contraido ? "lg:hidden" : ""}`}>
                                {grupo.titulo}
                                <span className="h-px flex-1 bg-[#B8C8A8]" />
                            </p>

                            <div className="space-y-1">
                                {grupo.opciones.map(({ nombre, ruta, icono: Icono }) => (
                                    <NavLink key={ruta} to={ruta} end={ruta === "/admin"} onClick={cerrar} title={nombre} aria-label={nombre}
                                        className={({ isActive }) => `group relative flex min-h-10 items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${contraido ? "lg:justify-center lg:px-0" : ""} ${isActive ? "bg-linear-to-br from-[#36583E] to-[#58765A] text-white shadow-sm" : "text-forest-dark hover:bg-[#D3DDC4]"}`}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isActive ? "text-white" : "text-[#193F29]"}`}>
                                                    <Icono size={19} strokeWidth={1.7} />
                                                </span>

                                                <span className={`flex-1 whitespace-nowrap ${contraido ? "lg:hidden" : ""}`}>
                                                    {nombre}
                                                </span>

                                                {isActive && <span className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-[#C1DCA6]" />}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Cerrar sesión */}
                <div className="shrink-0 border-t border-[#D3DDC4] bg-[#D4E2C8] p-3">
                    <button type="button" onClick={() => setConfirmarSalida(true)} title="Cerrar sesión" aria-label="Cerrar sesión" className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-forest transition hover:bg-danger-light hover:text-danger ${contraido ? "lg:justify-center lg:px-0" : ""}`}>
                        <LogOut size={21} strokeWidth={1.7} />
                        <span className={contraido ? "lg:hidden" : ""}>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Confirmación de cierre de sesión */}
            {confirmarSalida && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-dark/40 px-4 backdrop-blur-sm">
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-salida" className="w-full max-w-md animate-scale-in rounded-florae bg-surface p-7 text-center font-nunito shadow-florae">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-pale text-forest">
                            <LogOut size={28} strokeWidth={1.6} />
                        </div>

                        <h2 id="titulo-salida" className="font-lora text-xl font-bold text-forest-dark">
                            ¿Deseas cerrar sesión?
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-secondary">
                            Podrás regresar cuando quieras para seguir haciendo crecer Florae.
                        </p>

                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <button type="button" disabled={cerrandoSesion} onClick={() => setConfirmarSalida(false)} className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-forest transition hover:bg-pale disabled:opacity-50">
                                Cancelar
                            </button>

                            <button type="button" disabled={cerrandoSesion} onClick={manejarLogout} className="flex items-center justify-center gap-2 rounded-xl bg-[#193F29] px-4 py-3 text-sm font-bold text-white transition hover:bg-forest disabled:opacity-50">
                                {cerrandoSesion && <LoaderCircle size={17} className="animate-spin" />}
                                {cerrandoSesion ? "Saliendo..." : "Cerrar sesión"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminSidebar;