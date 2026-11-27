import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    UserRound, Pencil, ShieldCheck, Bell, CreditCard, Settings,
    LogOut, Mail, Leaf, Sprout, LoaderCircle, AlertCircle,
    Flower2, CalendarCheck2, Droplets, Bug, X, Save, CheckCircle2,
    ChevronRight, Camera,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useJardinStore } from "../../store/useJardinStore";
import { actualizarPerfil, actualizarFotoPerfil, obtenerEstadisticasPerfil } from "../../services/api";
import Seguridad from "./Seguridad";
import Notificaciones from "./Notificaciones";
import GestionCuenta from "./GestionCuenta";
import PagosSuscripciones from "./PagosSuscripciones";
import perfil from "../../assets/perfil.png";
import fondoPerfil from "../../assets/fondoPerfil2.png";
import macetaPerfil from "../../assets/macetaPerfil.png";

const temas = {
    perfil: { fondo: "#E5EEDC", tono: "#42663C" },
    seguridad: { fondo: "#EFF5F8", tono: "#365C78" },
    notificaciones: { fondo: "#FAF5E8", tono: "#76591F" },
    pagos: { fondo: "#F3EFF7", tono: "#674D80" },
    cuenta: { fondo: "#FAEFEC", tono: "#864D3C" },
};

const opciones = [
    { id: "seguridad", titulo: "Seguridad", descripcion: "Cambia tu contraseña y protege tu cuenta.", icono: ShieldCheck, estiloActivo: "bg-[#E5EFF5] text-[#365C78]" },
    { id: "notificaciones", titulo: "Notificaciones", descripcion: "Configura los recordatorios de tus plantas.", icono: Bell, estiloActivo: "bg-[#F6EEDB] text-[#76591F]" },
    { id: "pagos", titulo: "Pagos y suscripciones", descripcion: "Consulta tus créditos, planes e historial de pagos.", icono: CreditCard, estiloActivo: "bg-[#F0EAF5] text-[#674D80]" },
    { id: "cuenta", titulo: "Gestión de cuenta", descripcion: "Suspende o elimina tu cuenta.", icono: Settings, estiloActivo: "bg-[#F7EAE5] text-[#864D3C]" },
];

function Perfil() {
    const navigate = useNavigate();
    const usuario = useAuthStore((state) => state.usuario);
    const token = useAuthStore((state) => state.token);
    const cargando = useAuthStore((state) => state.cargando);
    const verificarSesion = useAuthStore((state) => state.verificarSesion);
    const actualizarUsuario = useAuthStore((state) => state.actualizarUsuario);
    const logout = useAuthStore((state) => state.logout);

    const plantas = useJardinStore((state) => state.plantas);
    const cargarPlantas = useJardinStore((state) => state.cargarPlantas);
    const cargandoPlantas = useJardinStore((state) => state.cargando);
    const errorPlantas = useJardinStore((state) => state.error);

    const [seccion, setSeccion] = useState("perfil");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [cerrando, setCerrando] = useState(false);
    const [confirmarSalida, setConfirmarSalida] = useState(false);
    const [errorSalida, setErrorSalida] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const verificacionIniciada = useRef(false);
    const [resumen, setResumen] = useState(null);
    const [cargandoResumen, setCargandoResumen] = useState(false);
    const [errorResumen, setErrorResumen] = useState("");
    const [subiendoFoto, setSubiendoFoto] = useState(false);
    const [errorFoto, setErrorFoto] = useState("");


    useEffect(() => {
        if (token && !usuario && !verificacionIniciada.current) {
            verificacionIniciada.current = true;
            verificarSesion();
        }
    }, [token, usuario, verificarSesion]);

    useEffect(() => {
        if (token && usuario) cargarPlantas();
    }, [token, usuario?.id, cargarPlantas]);

    useEffect(() => {
        if (!token || !usuario?.id) return;

        let vigente = true;

        const cargarResumen = async () => {
            setCargandoResumen(true);
            setErrorResumen("");
            setResumen(null);

            try {
                const datos = await obtenerEstadisticasPerfil();
                if (vigente) setResumen(datos);
            } catch (err) {
                if (vigente) setErrorResumen(err.message || "No se pudo consultar el resumen.");
            } finally {
                if (vigente) setCargandoResumen(false);
            }
        };

        cargarResumen();
        return () => { vigente = false; };
    }, [token, usuario?.id]);

    const cambiarFoto = async (evento) => {
        const archivo = evento.target.files?.[0];
        if (!archivo) return;

        setErrorFoto("");
        setMensaje("");
        evento.target.value = "";

        if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) {
            setErrorFoto("Selecciona una imagen JPG, PNG o WEBP.");
            return;
        }

        if (archivo.size > 5 * 1024 * 1024) {
            setErrorFoto("La imagen no puede superar los 5 MB.");
            return;
        }

        setSubiendoFoto(true);
        try {
            const resultado = await actualizarFotoPerfil(archivo);
            const usuarioActualizado = resultado.usuario || resultado.user || resultado.data?.usuario || resultado.data?.user;
            if (!usuarioActualizado?.imagen_url) {
                throw new Error("La API no devolvió la fotografía actualizada.");
            }
            actualizarUsuario(usuarioActualizado);
            setMensaje("Tu foto de perfil se actualizó correctamente.");
        } catch (err) {
            setErrorFoto(err.message || "No se pudo actualizar la foto de perfil.");
        } finally {
            setSubiendoFoto(false);
        }
    };

    const abrirEdicion = () => {
        setNombre(usuario?.nombre || "");
        setEmail(usuario?.email || "");
        setError("");
        setMensaje("");
        setModalAbierto(true);
    };

    const guardarInformacion = async (evento) => {
        evento.preventDefault();
        setGuardando(true);
        setError("");
        try {
            const resultado = await actualizarPerfil({ nombre: nombre.trim(), email: email.trim() });
            const usuarioActualizado = resultado.user || resultado.usuario;
            if (!usuarioActualizado) {
                throw new Error("La API no devolvió los datos actualizados.");
            }
            actualizarUsuario(usuarioActualizado);
            setModalAbierto(false);
            setMensaje("Tus datos se actualizaron correctamente.");
        } catch (err) {
            setError(err.message || "No se pudo actualizar la información.");
        } finally {
            setGuardando(false);
        }
    };

    const abrirConfirmacionSalida = () => {
        setErrorSalida("");
        setConfirmarSalida(true);
    };

    const cerrarSesion = async () => {
        if (cerrando) return;
        setCerrando(true);
        setErrorSalida("");
        try {
            await logout();
            navigate("/login", { replace: true });
        } catch {
            setErrorSalida("No se pudo cerrar sesión correctamente.");
        } finally {
            setCerrando(false);
        }
    };

    if (token && !usuario && (cargando || !verificacionIniciada.current)) {
        return (
            <main className="min-h-[75vh] bg-[#F8F7F3] p-10">
                <div className="mx-auto max-w-5xl animate-pulse space-y-5">
                    <div className="h-12 w-52 rounded-xl bg-[#E5EBDD]" />
                    <div className="h-48 rounded-3xl bg-[#E5EBDD]" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="h-32 rounded-3xl bg-[#E5EBDD]" />
                        <div className="h-32 rounded-3xl bg-[#E5EBDD]" />
                    </div>
                </div>
            </main>
        );
    }

    if (!token || !usuario) {
        return (
            <main className="flex min-h-[75vh] flex-col items-center justify-center gap-5 bg-[#F8F7F3] px-6 text-center">
                <Sprout size={54} className="text-[#3F5D3F]" />
                <h1 className="text-3xl font-bold text-[#254D2D]">Tu espacio en Florae</h1>
                <p className="text-[#6B7280]">Inicia sesión para consultar tu perfil.</p>
                <button type="button" onClick={() => navigate("/login")} className="rounded-2xl bg-[#89AB78] px-7 py-3 font-bold text-white">Iniciar sesión</button>
            </main>
        );
    }

    const estadisticas = [
        { titulo: "Plantas en mi jardín", valor: cargandoPlantas ? "..." : errorPlantas ? "—" : Array.isArray(plantas) ? plantas.length : "—", icono: Flower2, color: "#F0F5EB", tono: "#42663C" },
        { titulo: "Cuidados de hoy", valor: cargandoResumen ? "..." : resumen?.cuidadosHoy ?? "—", icono: CalendarCheck2, color: "#EFF5F8", tono: "#365C78" },
        { titulo: "Cuidados pendientes", valor: cargandoResumen ? "..." : resumen?.cuidadosPendientes ?? "—", icono: Droplets, color: "#FAF5E8", tono: "#76591F" },
        { titulo: "Plagas activas", valor: cargandoResumen ? "..." : resumen?.plagasActivas ?? "—", icono: Bug, color: "#FAEFEC", tono: "#864D3C" },
    ];

    return (
        <main
            className="relative min-h-[calc(100vh-80px)] bg-[#F8F7F3] text-[#303B30]"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
        >
            <div className="relative flex w-full flex-col lg:flex-row">
                <aside className="w-full shrink-0 border-b border-[#D5DFCE] bg-[#F5F6F0] px-4 py-5 backdrop-blur-sm lg:min-h-[calc(100vh-80px)] lg:w-[245px] lg:border-b-0 lg:border-r lg:py-9 xl:w-[270px]">
                    <div className="mb-7 hidden items-center gap-3 lg:flex">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8EFE3] text-[#3F5D3F]"><Sprout size={27} /></div>
                        <div><h2 className="font-['Lora'] text-xl font-bold text-[#254D2D]">Mi espacio</h2><p className="text-xs text-[#60785A]">Cultiva tu bienestar</p></div>
                    </div>
                    <p className="mb-3 hidden border-t border-[#D5DFCE] px-2 pt-5 text-xs font-bold tracking-widest text-[#60785A] lg:block">MI CUENTA</p>
                    <nav aria-label="Opciones de la cuenta" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                        {[{ id: "perfil", titulo: "Mi Perfil", icono: UserRound, estiloActivo: "bg-[#E8EFE3] text-[#42663C]" }, ...opciones].map(({ id, titulo, icono: Icono, estiloActivo }) => (
                            <button key={id} type="button" onClick={() => setSeccion(id)} aria-current={seccion === id ? "page" : undefined} className={`flex shrink-0 items-center gap-2.5 rounded-2xl p-2.5 text-left text-sm font-semibold transition lg:w-full ${seccion === id ? estiloActivo : "text-[#3F5D3F] hover:bg-white/70"}`}>
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${seccion === id ? "bg-white/65" : "bg-transparent"}`}><Icono size={20} /></span>
                                <span className="flex-1">{titulo}</span>
                                {seccion === id && <ChevronRight size={16} className="hidden shrink-0 lg:block" />}
                            </button>
                        ))}
                        <div className="my-2 hidden border-t border-[#D5DFCE] lg:block" />
                        <button type="button" onClick={abrirConfirmacionSalida} disabled={cerrando} className="flex shrink-0 items-center gap-2.5 rounded-2xl p-2.5 text-left text-sm font-semibold text-[#A65D42] transition hover:bg-[#F5E1D9] disabled:opacity-60 lg:w-full">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAEFEC]"><LogOut size={20} /></span> Cerrar sesión
                        </button>
                    </nav>
                    <div className="mt-8 hidden overflow-hidden rounded-[24px] border border-[#D1DFC6] bg-[#F0F3EA] px-3 pb-5 pt-3 text-center lg:block">
                        <img src={macetaPerfil} alt="" className="pointer-events-none mx-auto h-32 w-full object-contain" />
                        <p className="mt-2 font-['Lora'] text-sm font-bold text-[#3F5D3F]">Crece a tu propio ritmo</p>
                        <p className="mt-2 text-xs leading-5 text-[#60785A]">Cada pequeño cuidado cuenta.</p>
                    </div>
                </aside>

                <div className="relative min-w-0 flex-1 bg-cover bg-top bg-no-repeat px-5 py-9 sm:px-8 lg:px-10 lg:py-10 xl:px-14" style={{ backgroundImage: `linear-gradient(rgba(248,247,243,0.65), rgba(248,247,243,0.65)), url(${fondoPerfil})` }}>
                    {seccion === "perfil" ? (
                        <>
                            <div className="relative mb-7 overflow-hidden">
                                <Sprout aria-hidden="true" size={120} strokeWidth={0.8} className="pointer-events-none absolute -bottom-8 right-4 rotate-12 text-[#89AB78]/35" />
                                <div className="relative flex items-center gap-3">
                                    <h1 className="font-['Lora'] text-3xl font-bold text-[#254D2D] sm:text-4xl">Mi Perfil</h1>
                                    <Leaf size={32} className="rotate-45 text-[#89AB78]" strokeWidth={1.5} />
                                </div>
                                <p className="mt-3 text-[#626B60]">Conoce tu jardín y administra tu información personal.</p>
                            </div>

                            <section className="relative mb-7 overflow-hidden rounded-[30px] border border-[#D5DFC9] bg-white p-6 shadow-[0_8px_24px_rgba(57,82,44,0.08)] sm:p-8">
                                <img src={macetaPerfil} alt="" className="pointer-events-none absolute -bottom-9 right-0 hidden h-44 w-44 object-contain opacity-15 md:block" />
                                <div className="relative flex flex-col items-center gap-6 sm:flex-row">
                                    <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
                                        <img
                                            src={usuario?.imagen_url || perfil}
                                            alt="Foto de perfil"
                                            className="h-full w-full rounded-full border-[5px] border-[#E4EDD9] bg-[#EEF3E7] object-cover"
                                        />
                                        <label
                                            htmlFor="cambiar-foto-perfil"
                                            className={`absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#89AB78] text-white shadow-md transition hover:bg-[#709261] ${subiendoFoto ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                                            title="Cambiar foto de perfil"
                                        >
                                            {subiendoFoto ? <LoaderCircle size={19} className="animate-spin" /> : <Camera size={19} />}
                                        </label>
                                        <input
                                            id="cambiar-foto-perfil"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={cambiarFoto}
                                            disabled={subiendoFoto}
                                            className="sr-only"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1 text-center sm:text-left">
                                        <h2 className="break-words text-2xl font-bold text-[#254D2D] sm:text-3xl">{usuario.nombre}</h2>
                                        <p className="mt-2 flex items-center justify-center gap-2 break-all text-sm text-[#626B60] sm:justify-start sm:text-base"><Mail size={18} className="shrink-0" />{usuario.email}</p>
                                        <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#E8EFE3] px-4 py-1.5 text-sm font-bold capitalize text-[#3F5D3F]"><Leaf size={15} />{usuario.role?.nombre || "Usuario"}</span>
                                    </div>
                                    <button type="button" onClick={abrirEdicion} className="relative inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#89AB78] bg-white px-4 py-3 font-bold text-[#3F5D3F] transition hover:bg-[#EEF3E7]">
                                        <Pencil size={18} /> Editar información
                                    </button>
                                </div>
                            </section>

                            {errorFoto && <p role="alert" className="mb-5 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={18} />{errorFoto}</p>}
                            {mensaje && <p role="status" className="mb-5 flex items-center gap-2 rounded-xl bg-[#E8EFE3] p-4 text-[#3F5D3F]"><CheckCircle2 size={20} />{mensaje}</p>}

                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h2 className="font-['Lora'] text-2xl font-bold text-[#254D2D]">Resumen de mi jardín</h2>
                                <button type="button" onClick={() => navigate("/jardin")} className="text-sm font-bold text-[#3F5D3F] hover:underline">Ver mi jardín</button>
                            </div>
                            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {estadisticas.map(({ titulo, valor, icono: Icono, color, tono }) => (
                                    <div key={titulo} className="rounded-[24px] border border-[#E5E9DF] p-5 shadow-[0_6px_20px_rgba(57,82,44,0.07)]" style={{ backgroundColor: color }}>
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80" style={{ color: tono }}><Icono size={25} /></div>
                                        <p className="text-3xl font-bold" style={{ color: tono }}>{valor}</p>
                                        <p className="mt-1 text-sm font-semibold" style={{ color: "#626B60" }}>{titulo}</p>
                                    </div>
                                ))}
                            </div>
                            {errorResumen && (
                                <p role="alert" className="mb-7 flex items-center gap-2 text-sm text-red-700">
                                    <AlertCircle size={18} /> {errorResumen}
                                </p>
                            )}

                            <div className="mb-5 flex items-center justify-between gap-3">
                                <h2 className="font-['Lora'] text-2xl font-bold text-[#254D2D]">Configuración de mi cuenta</h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {opciones.map(({ id, titulo, descripcion, icono: Icono }) => (
                                    <button key={id} type="button" onClick={() => setSeccion(id)} className="flex min-h-[112px] items-center gap-4 rounded-[25px] border border-white/80 bg-[#FFFEFB]/95 p-5 text-left shadow-[0_6px_20px_rgba(57,82,44,0.07)] transition hover:border-[#C7D9BA] hover:shadow-lg">
                                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: temas[id].fondo, color: temas[id].tono }}><Icono size={27} /></span>
                                        <span className="min-w-0 flex-1"><span className="block text-lg font-extrabold text-[#254D2D]">{titulo}</span><span className="mt-1 block text-sm text-[#6B7280]">{descripcion}</span></span>
                                        <ChevronRight size={20} className="shrink-0" style={{ color: temas[id].tono }} />
                                    </button>
                                ))}
                            </div>
                            <div className="mx-auto mt-8 max-w-[520px]">
                                <button type="button" onClick={abrirConfirmacionSalida} disabled={cerrando} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#CF7657] px-6 py-4 font-extrabold text-white transition hover:bg-[#B96246] disabled:opacity-60">
                                    {cerrando ? <LoaderCircle size={21} className="animate-spin" /> : <LogOut size={21} />}
                                    {cerrando ? "Cerrando sesión..." : "Cerrar sesión"}
                                </button>
                            </div>
                        </>
                    ) : seccion === "notificaciones" ? (
                        <div className="mx-auto max-w-[850px]">
                            <Notificaciones />
                            <button
                                type="button"
                                onClick={() => setSeccion("perfil")}
                                className="mt-6 rounded-xl border border-[#DDE5D6] bg-white px-5 py-3 font-bold text-[#3F5D3F] transition hover:bg-[#EEF3E7]"
                            >
                                Volver a Mi Perfil
                            </button>
                        </div>
                    ) : seccion === "seguridad" ? (
                        <div className="mx-auto max-w-[850px]">
                            <Seguridad />
                            <button type="button" onClick={() => setSeccion("perfil")} className="mt-6 rounded-xl border border-[#DDE5D6] bg-white px-5 py-3 font-bold text-[#3F5D3F] transition hover:bg-[#EEF3E7]">
                                Volver a Mi Perfil
                            </button>
                        </div>
                    ) : seccion === "pagos" ? (
                        <div className="mx-auto max-w-[1100px]">
                            <PagosSuscripciones key={`${usuario.id}-${token}`} />
                            <button
                                type="button"
                                onClick={() => setSeccion("perfil")}
                                className="mt-6 rounded-xl border border-[#DDE5D6] bg-white px-5 py-3 font-bold text-[#3F5D3F] transition hover:bg-[#EEF3E7]"
                            >
                                Volver a Mi Perfil
                            </button>
                        </div>
                    ) : seccion === "cuenta" ? (
                        <div className="mx-auto max-w-[850px]">
                            <GestionCuenta />
                            <button
                                type="button"
                                onClick={() => setSeccion("perfil")}
                                className="mt-6 rounded-xl border border-[#DDE5D6] bg-white px-5 py-3 font-bold text-[#3F5D3F] transition hover:bg-[#EEF3E7]"
                            >
                                Volver a Mi Perfil
                            </button>
                        </div>
                    ) : (
                        <section className="rounded-[30px] border border-[#DFE9D7] bg-white/90 p-7 shadow-sm sm:p-10">
                            {(() => {
                                const opcion = opciones.find((item) => item.id === seccion);
                                const Icono = opcion.icono;
                                return (
                                    <>
                                        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8EFE3] text-[#3F5D3F]"><Icono size={32} /></span>
                                        <h1 className="text-3xl font-bold text-[#254D2D]">{opcion.titulo}</h1>
                                        <p className="mt-3 text-[#626B60]">{opcion.descripcion}</p>
                                        <p className="mt-6 text-sm text-[#6B7280]">Próximamente configuraremos las funciones de esta sección.</p>
                                        <button type="button" onClick={() => setSeccion("perfil")} className="mt-6 rounded-xl bg-[#89AB78] px-5 py-3 font-bold text-white">Volver a Mi Perfil</button>
                                    </>
                                );
                            })()}
                        </section>
                    )}
                    {error && !modalAbierto && <p role="alert" className="mt-4 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={18} />{error}</p>}
                </div>
            </div>

            {confirmarSalida && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1D3322]/55 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget && !cerrando) setConfirmarSalida(false); }} onKeyDown={(e) => { if (e.key === "Escape" && !cerrando) setConfirmarSalida(false); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="titulo-salida" className="relative w-full max-w-[420px] rounded-[28px] bg-[#FFFEFB] p-7 text-center shadow-2xl">
                        <button type="button" aria-label="Cerrar ventana" disabled={cerrando} onClick={() => setConfirmarSalida(false)} className="absolute right-4 top-4 rounded-full p-2 text-[#626B60] hover:bg-[#F5E1D9] disabled:opacity-50"><X size={22} /></button>
                        <div className="mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#F5E1D9] text-[#B96246]"><LogOut size={30} /></div>
                        <h2 id="titulo-salida" className="font-['Lora'] text-2xl font-bold text-[#254D2D]">¿Deseas cerrar sesión?</h2>
                        <p className="mt-3 text-sm leading-6 text-[#626B60]">Tu jardín y tus actividades estarán aquí cuando regreses. ¿Estás seguro de que quieres salir de Florae?</p>
                        {errorSalida && <p role="alert" className="mt-4 text-sm text-[#A34C4C]">{errorSalida}</p>}
                        <div className="mt-7 flex gap-3">
                            <button type="button" autoFocus disabled={cerrando} onClick={() => setConfirmarSalida(false)} className="flex-1 rounded-xl border border-[#DDE5D6] px-3 py-3 font-bold text-[#3F5D3F] hover:bg-[#EEF3E7] disabled:opacity-50">Cancelar</button>
                            <button type="button" disabled={cerrando} onClick={cerrarSesion} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#CF7657] px-3 py-3 font-bold text-white hover:bg-[#B96246] disabled:opacity-60">{cerrando ? <><LoaderCircle size={18} className="animate-spin" /> Saliendo...</> : "Cerrar sesión"}</button>
                        </div>
                    </section>
                </div>
            )}

            {modalAbierto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D3322]/55 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget && !guardando) setModalAbierto(false); }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-editar" className="w-full max-w-[520px] rounded-[28px] bg-[#FFFEFB] p-6 shadow-2xl sm:p-8">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <h2 id="titulo-editar" className="text-2xl font-bold text-[#254D2D]">Editar información</h2>
                            <button type="button" aria-label="Cerrar" disabled={guardando} onClick={() => setModalAbierto(false)} className="rounded-full p-2 text-[#626B60] hover:bg-[#EEF3E7]"><X size={22} /></button>
                        </div>
                        <form onSubmit={guardarInformacion} className="space-y-5">
                            <div>
                                <label htmlFor="perfil-nombre" className="mb-2 block font-bold text-[#3F5D3F]">Nombre completo</label>
                                <input id="perfil-nombre" autoFocus type="text" required maxLength={100} value={nombre} onChange={(e) => setNombre(e.target.value)} className="h-14 w-full rounded-2xl border border-[#DDE5D6] bg-[#FAFCF8] px-4 outline-none focus:border-[#89AB78]" />
                            </div>
                            <div>
                                <label htmlFor="perfil-email" className="mb-2 block font-bold text-[#3F5D3F]">Correo electrónico</label>
                                <input id="perfil-email" type="email" required maxLength={150} value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 w-full rounded-2xl border border-[#DDE5D6] bg-[#FAFCF8] px-4 outline-none focus:border-[#89AB78]" />
                            </div>
                            {error && <p role="alert" className="flex items-center gap-2 text-sm text-red-700"><AlertCircle size={18} />{error}</p>}
                            <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
                                <button type="button" disabled={guardando} onClick={() => setModalAbierto(false)} className="rounded-xl border border-[#DDE5D6] px-5 py-3 font-bold text-[#3F5D3F]">Cancelar</button>
                                <button type="submit" disabled={guardando || !nombre.trim() || !email.trim() || (nombre.trim() === usuario.nombre && email.trim() === usuario.email)} className="flex items-center justify-center gap-2 rounded-xl bg-[#89AB78] px-5 py-3 font-bold text-white hover:bg-[#709261] disabled:opacity-50">
                                    {guardando ? <LoaderCircle size={19} className="animate-spin" /> : <Save size={19} />}
                                    {guardando ? "Guardando..." : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
export default Perfil;