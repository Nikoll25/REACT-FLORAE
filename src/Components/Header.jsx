import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, UserRound, Settings, LogOut, LoaderCircle } from "lucide-react";
import Navbar from "./Navbar";
import PanelNotificaciones from "./PanelNotificaciones";
import { useAuthStore } from "../store/useAuthStore";
import { obtenerNotificacionesSinLeer } from "../services/api";
import logo from "../assets/logo.png";
import perfil from "../assets/perfil.png";
import campana from "../assets/campana.png";

const opciones = [
    { nombre: "Mi perfil", ruta: "/perfil", icono: UserRound },
    { nombre: "Gestión de cuenta", ruta: "/gestion-cuenta", icono: Settings },
];

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const usuario = useAuthStore((state) => state.usuario);
    const token = useAuthStore((state) => state.token);
    const logout = useAuthStore((state) => state.logout);
    const [panelAbierto, setPanelAbierto] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [contador, setContador] = useState({ token: null, cantidad: 0 });
    const sinLeer = contador.token === token ? contador.cantidad : 0;
    const solicitudRef = useRef(null);
    const ultimaConsulta = useRef(0);
    const [errorImagen, setErrorImagen] = useState(false);
    const [cerrandoSesion, setCerrandoSesion] = useState(false);
    const menuRef = useRef(null);

    // Obtener el nombre y la fotografía del usuario
    const nombre = usuario?.nombre?.trim().split(/\s+/)[0] || "Jardinero";
    const foto = !errorImagen && usuario?.imagen_url ? usuario.imagen_url : perfil;

    // Evitamos consultas duplicadas y actualizamos después de una lectura.
    const consultarNotificaciones = useCallback(async (forzar = false) => {
        if (!token || useAuthStore.getState().token !== token) return;
        const pendiente = solicitudRef.current;
        if (pendiente?.token === token) {
            if (forzar === true) pendiente.repetir = true;
            return pendiente.promesa;
        }
        const solicitud = { token, repetir: false };
        solicitudRef.current = solicitud;
        solicitud.promesa = (async () => {
            do {
                solicitud.repetir = false;
                try {
                    const respuesta = await obtenerNotificacionesSinLeer();
                    if (solicitudRef.current !== solicitud || useAuthStore.getState().token !== token) return;
                    setContador({ token, cantidad: Number(respuesta.sin_leer) || 0 });
                    ultimaConsulta.current = Date.now();
                } catch (error) {
                    console.error("Error al consultar notificaciones:", error);
                }
            } while (solicitud.repetir && solicitudRef.current === solicitud && useAuthStore.getState().token === token);
        })().finally(() => {
            if (solicitudRef.current === solicitud) solicitudRef.current = null;
        });
        return solicitud.promesa;
    }, [token]);

    useEffect(() => {
        ultimaConsulta.current = 0;
        if (!token) return;
        const actualizarSiVisible = () => {
            if (document.visibilityState === "visible" && Date.now() - ultimaConsulta.current >= 30000) {
                consultarNotificaciones();
            }
        };
        const actualizarPorEvento = () => consultarNotificaciones(true);
        actualizarSiVisible();
        const intervalo = setInterval(actualizarSiVisible, 30000);
        document.addEventListener("visibilitychange", actualizarSiVisible);
        window.addEventListener("florae:notificaciones", actualizarPorEvento);
        return () => {
            clearInterval(intervalo);
            document.removeEventListener("visibilitychange", actualizarSiVisible);
            window.removeEventListener("florae:notificaciones", actualizarPorEvento);
            solicitudRef.current = null;
        };
    }, [token, consultarNotificaciones]);

    // Al navegar solo consultamos si los datos necesitan actualizarse.
    useEffect(() => {
        if (token && document.visibilityState === "visible" && Date.now() - ultimaConsulta.current >= 30000) {
            consultarNotificaciones();
        }
    }, [location.pathname, token, consultarNotificaciones]);

    // Cerrar los paneles al cambiar de ruta
    useEffect(() => {
        setPanelAbierto(false);
        setMenuAbierto(false);
    }, [location.pathname]);

    useEffect(() => { setErrorImagen(false); }, [usuario?.imagen_url]);

    // Cerrar el menú al presionar fuera o pulsar Escape
    useEffect(() => {
        if (!menuAbierto) return;
        const cerrarMenu = (evento) => {
            if (menuRef.current && !menuRef.current.contains(evento.target)) setMenuAbierto(false);
        };
        const cerrarConEscape = (evento) => {
            if (evento.key === "Escape") setMenuAbierto(false);
        };
        document.addEventListener("pointerdown", cerrarMenu);
        document.addEventListener("keydown", cerrarConEscape);

        return () => {
            document.removeEventListener("pointerdown", cerrarMenu);
            document.removeEventListener("keydown", cerrarConEscape);
        };
    }, [menuAbierto]);

    const alternarNotificaciones = () => {
        setMenuAbierto(false);
        setPanelAbierto((actual) => !actual);
    };

    const alternarPerfil = () => {
        setPanelAbierto(false);
        setMenuAbierto((actual) => !actual);
    };

    // Cerrar sesión
    const cerrarSesion = async () => {
        if (cerrandoSesion) return;
        setCerrandoSesion(true);
        try {
            await logout();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            setCerrandoSesion(false);
            setMenuAbierto(false);
            navigate("/login", { replace: true });
        }
    };

    return (
        <>
            <header className="relative z-50 flex min-h-[80px] w-full flex-wrap items-center justify-between gap-y-2 border-b border-[#E8DED8] bg-[#FAF3F3] px-6 font-nunito shadow-[0_4px_12px_rgba(0,0,0,0.08)] xl:h-[80px] xl:flex-nowrap">
                {/* Logo y nombre de Florae */}
                <div className="flex items-center gap-8">
                    <Link to="/jardin" className="flex shrink-0 items-center">
                        <img src={logo} alt="Florae" className="w-[170px] object-contain" />
                        <div className="-ml-5 hidden sm:block">
                            <h1 className="font-lora text-[28px] font-bold italic leading-none text-[#3F5D3F]">Florae</h1>
                            <p className="mt-1 whitespace-nowrap text-[11px] font-semibold text-[#84917F]">Tu jardín inteligente</p>
                        </div>
                    </Link>
                    <div className="hidden xl:block">
                        <Navbar />
                    </div>
                </div>

                {/* Notificaciones y perfil */}
                <div className="flex shrink-0 items-center gap-4 sm:gap-6">
                    <button type="button" onClick={alternarNotificaciones} title="Notificaciones" aria-label={`Notificaciones, ${sinLeer} sin leer`} aria-expanded={panelAbierto} className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 hover:bg-[#E8EFE3] ${panelAbierto ? "bg-[#E8EFE3]" : ""}`}>
                        <img className="h-[28px] w-[28px] object-contain" src={campana} alt="" />
                        {sinLeer > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#FAF3F3] bg-[#D96565] px-1 text-[10px] font-bold text-white">
                                {sinLeer > 99 ? "99+" : sinLeer}
                            </span>
                        )}
                    </button>

                    <div className="hidden h-9 w-px bg-[#E8DED8] sm:block" />

                    {/* Perfil del usuario */}
                    <div ref={menuRef} className="relative">
                        <button type="button" onClick={alternarPerfil} aria-label="Abrir menú de perfil" aria-expanded={menuAbierto} className={`flex items-center gap-3 rounded-2xl border px-2 py-1.5 pr-3 transition-all duration-200 ${menuAbierto ? "border-[#A3B18A] bg-[#E8EFE3]" : "border-[#E8DED8] bg-white/70 hover:border-[#A3B18A] hover:bg-white"}`}>
                            <img src={foto} alt="Mi perfil" onError={() => setErrorImagen(true)} className="h-[45px] w-[45px] rounded-xl border-2 border-[#A5D6A7] bg-white object-cover" />
                            <div className="hidden max-w-[150px] text-left sm:block">
                                <p className="truncate text-sm font-extrabold text-[#3F5D3F]">¡Hola, {nombre}!</p>
                                <p className="mt-0.5 text-xs font-semibold text-[#84917F]">Mi perfil</p>
                            </div>
                            <ChevronDown size={17} className={`text-[#3F5D3F] transition-transform duration-200 ${menuAbierto ? "rotate-180" : ""}`} />
                        </button>

                        {/* Menú desplegable */}
                        {menuAbierto && (
                            <div className="absolute right-0 top-full z-[60] mt-4 w-[290px] max-w-[calc(100vw-32px)] animate-scale-in overflow-hidden rounded-2xl border border-[#E8DED8] bg-white shadow-[0_8px_30px_rgba(63,93,63,0.15)]">
                                <div className="border-b border-[#E8DED8] bg-[#FAF3F3] p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={foto} alt="Foto de perfil" onError={() => setErrorImagen(true)} className="h-14 w-14 shrink-0 rounded-xl border-2 border-[#A5D6A7] bg-white object-cover" />
                                        <div className="min-w-0">
                                            <p className="truncate font-extrabold text-[#3F5D3F]">{usuario?.nombre || "Usuario Florae"}</p>
                                            <p className="mt-1 truncate text-xs text-secondary">{usuario?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1 p-2">
                                    {opciones.map(({ nombre, ruta, icono: Icono }) => (
                                        <Link key={ruta} to={ruta} onClick={() => setMenuAbierto(false)} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-text transition hover:bg-[#E8EFE3]">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8EFE3] text-[#3F5D3F]">
                                                <Icono size={18} />
                                            </span>
                                            <span className="flex-1">{nombre}</span>
                                            <ChevronRight size={16} className="text-[#84917F] transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    ))}
                                    <div className="my-2 border-t border-[#E8DED8]" />
                                    <button type="button" onClick={cerrarSesion} disabled={cerrandoSesion} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[#A34C4C] transition hover:bg-[#F8ECEA] disabled:opacity-60">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8ECEA]">
                                            {cerrandoSesion ? <LoaderCircle size={18} className="animate-spin" /> : <LogOut size={18} />}
                                        </span>
                                        {cerrandoSesion ? "Cerrando sesión..." : "Cerrar sesión"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navegación en pantallas pequeñas */}
                <div className="w-full border-t border-[#E8DED8] py-2 xl:hidden">
                    <Navbar />
                </div>
            </header>
            <PanelNotificaciones abierto={panelAbierto} cerrar={() => setPanelAbierto(false)} alActualizar={() => consultarNotificaciones(true)} />
        </>
    );
};

export default Header;