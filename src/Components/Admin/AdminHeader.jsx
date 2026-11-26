import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, PanelLeftClose, PanelLeftOpen, ChevronRight, ChevronDown, Bell, ShieldCheck, UserRound } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { obtenerNotificacionesSinLeer } from "../../services/api";
import PanelNotificaciones from "../PanelNotificaciones";
import perfil from "../../assets/perfil.png";

const secciones = { "/admin": "Inicio", "/admin/plantas": "Plantas", "/admin/plagas": "Plagas", "/admin/tratamientos": "Tratamientos", "/admin/medicamentos": "Medicamentos", "/admin/usuarios": "Usuarios", "/admin/sugerencias": "Sugerencias IA", "/admin/planes": "Planes", "/admin/suscripciones": "Suscripciones", "/admin/pagos": "Pagos", "/admin/perfil": "Mi perfil" };

function AdminHeader({ contraido, alternarMenu, abrirMenu }) {
    const location = useLocation();
    const usuario = useAuthStore((state) => state.usuario);
    const token = useAuthStore((state) => state.token);
    const menuPerfilRef = useRef(null);
    const [panelAbierto, setPanelAbierto] = useState(false);
    const [perfilAbierto, setPerfilAbierto] = useState(false);
    const [sinLeer, setSinLeer] = useState(0);
    const [errorImagen, setErrorImagen] = useState(false);
    const seccion = secciones[location.pathname.split("/").slice(0, 3).join("/")] || "Administración";
    const nombre = usuario?.nombre || "Administrador";
    const foto = !errorImagen && usuario?.imagen_url ? usuario.imagen_url : perfil;

    const consultarNotificaciones = useCallback(async () => {
        if (!token) { setSinLeer(0); return; }
        try {
            const respuesta = await obtenerNotificacionesSinLeer();
            if (useAuthStore.getState().token === token) setSinLeer(respuesta.sin_leer || 0);
        } catch (error) {
            console.error("Error al consultar notificaciones:", error);
        }
    }, [token]);

    useEffect(() => {
        consultarNotificaciones();
        const intervalo = setInterval(consultarNotificaciones, 30000);
        const actualizarAlVolver = () => { if (document.visibilityState === "visible") consultarNotificaciones(); };
        document.addEventListener("visibilitychange", actualizarAlVolver);
        window.addEventListener("florae:notificaciones", consultarNotificaciones);
        return () => {
            clearInterval(intervalo);
            document.removeEventListener("visibilitychange", actualizarAlVolver);
            window.removeEventListener("florae:notificaciones", consultarNotificaciones);
        };
    }, [consultarNotificaciones, location.pathname]);

    useEffect(() => {
        setPanelAbierto(false);
        setPerfilAbierto(false);
    }, [location.pathname]);

    useEffect(() => { setErrorImagen(false); }, [usuario?.imagen_url]);

    // Cerrar el menú al presionar fuera o usar Escape
    useEffect(() => {
        const cerrarFuera = (evento) => {
            if (!menuPerfilRef.current?.contains(evento.target)) setPerfilAbierto(false);
        };
        const cerrarEscape = (evento) => {
            if (evento.key === "Escape") setPerfilAbierto(false);
        };
        document.addEventListener("mousedown", cerrarFuera);
        document.addEventListener("keydown", cerrarEscape);
        return () => {
            document.removeEventListener("mousedown", cerrarFuera);
            document.removeEventListener("keydown", cerrarEscape);
        };
    }, []);

    useEffect(() => {
        document.documentElement.classList.add("scrollbar-hide");
        document.body.classList.add("scrollbar-hide");
        return () => {
            document.documentElement.classList.remove("scrollbar-hide");
            document.body.classList.remove("scrollbar-hide");
        };
    }, []);

    const botonMenu = "h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-transparent text-[#193F29] transition hover:bg-[#C1DCA6]";

    return (
        <>
            <header className="sticky top-0 z-30 flex min-h-[76px] w-full items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 font-nunito shadow-sm sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-3">
                    <button type="button" onClick={abrirMenu} aria-label="Abrir menú" className={`flex lg:hidden ${botonMenu}`}><Menu size={22} /></button>
                    <button type="button" onClick={alternarMenu} title={contraido ? "Expandir menú" : "Contraer menú"} aria-label={contraido ? "Expandir menú" : "Contraer menú"} aria-expanded={!contraido} className={`hidden lg:flex ${botonMenu}`}>{contraido ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}</button>
                    <div className="min-w-0">
                        <div className="hidden items-center gap-1.5 text-xs font-semibold text-secondary sm:flex"><span>Administración</span><ChevronRight size={13} /><span className="text-forest">{seccion}</span></div>
                        <h1 className="truncate font-nunito text-lg font-bold text-forest-dark sm:mt-1 sm:text-xl">{seccion === "Inicio" ? "Mi espacio de gestión" : seccion}</h1>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                    <button type="button" onClick={() => { setPanelAbierto((actual) => !actual); setPerfilAbierto(false); }} title="Notificaciones" aria-label={`Notificaciones, ${sinLeer} sin leer`} aria-expanded={panelAbierto} className={`relative flex h-11 w-11 items-center justify-center rounded-xl text-forest transition hover:bg-primary/25 ${panelAbierto ? "bg-[#C1DCA6]" : "bg-transparent"}`}>
                        <Bell size={22} strokeWidth={1.7} />
                        {sinLeer > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#193F29] px-1 text-[10px] font-extrabold text-white">{sinLeer > 99 ? "99+" : sinLeer}</span>}
                    </button>

                    <div ref={menuPerfilRef} className="relative">
                        <button type="button" onClick={() => { setPerfilAbierto((actual) => !actual); setPanelAbierto(false); }} aria-label="Opciones de mi cuenta" aria-expanded={perfilAbierto} className={`flex items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-pale md:pr-3 ${perfilAbierto ? "bg-pale" : "bg-transparent"}`}>
                            <div className="relative shrink-0">
                                <img src={foto} alt="Perfil del administrador" onError={() => setErrorImagen(true)} className="h-10 w-10 rounded-full border-2 border-primary/50 bg-pale object-cover sm:h-11 sm:w-11" />
                                <span title="Administrador" className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#234524] text-white"><ShieldCheck size={12} /></span>
                            </div>
                            <div className="hidden max-w-[180px] md:block">
                                <p className="truncate text-sm font-extrabold text-forest-dark">{nombre}</p>
                                <p className="mt-0.5 text-xs font-semibold text-secondary">Administrador</p>
                            </div>
                            <ChevronDown size={16} className={`text-forest transition-transform ${perfilAbierto ? "rotate-180" : ""}`} />
                        </button>

                        {perfilAbierto && (
                            <div className="absolute right-0 top-full z-40 mt-3 w-64 animate-scale-in overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
                                <div className="border-b border-border bg-soft px-4 py-4">
                                    <p className="text-sm font-extrabold text-forest-dark">{nombre}</p>
                                    <p className="mt-1 truncate text-xs text-secondary">{usuario?.email}</p>
                                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#DCE8D2] px-2.5 py-1 text-[11px] font-bold text-forest"><ShieldCheck size={13} /> Administrador</span>
                                </div>
                                <div className="p-2">
                                    <Link to="/admin/perfil" onClick={() => setPerfilAbierto(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-forest transition hover:bg-pale">
                                        <UserRound size={19} />
                                        <div className="flex-1">
                                            <p>Mi perfil</p>
                                            <p className="mt-0.5 text-xs font-normal text-secondary">Información y seguridad</p>
                                        </div>
                                        <ChevronRight size={15} />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <PanelNotificaciones abierto={panelAbierto} cerrar={() => setPanelAbierto(false)} alActualizar={consultarNotificaciones} />
        </>
    );
}

export default AdminHeader;