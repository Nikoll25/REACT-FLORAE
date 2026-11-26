import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bug, Plus, Search, Eye, Pencil, Trash2, PauseCircle, PlayCircle, CheckCircle2, RefreshCw, AlertCircle, X, LoaderCircle, ImageOff, LayoutGrid, List, Sprout } from "lucide-react";
import { obtenerPlagasAdmin, suspenderPlaga, reactivarPlaga, eliminarPlaga } from "../../../services/adminApi";
import { obtenerImagen } from "../../../services/api";
const acciones = {
    suspender: {
        titulo: "Suspender plaga",
        descripcion: "La plaga dejará de estar disponible en el catálogo público, pero conservará su información.",
        boton: "Suspender",
        estilo: "bg-warning hover:opacity-90",
        icono: PauseCircle,
        funcion: suspenderPlaga,
    },
    activar: {
        titulo: "Reactivar plaga",
        descripcion: "La plaga volverá a estar disponible en el catálogo público de Florae.",
        boton: "Reactivar",
        estilo: "bg-forest hover:bg-forest-dark",
        icono: PlayCircle,
        funcion: reactivarPlaga,
    },
    eliminar: {
        titulo: "Eliminar plaga",
        descripcion: "Esta acción eliminará permanentemente la plaga y sus registros relacionados. No podrás recuperar esta información.",
        boton: "Eliminar definitivamente",
        estilo: "bg-danger hover:opacity-90",
        icono: Trash2,
        funcion: (id) => eliminarPlaga(id, true),
    },
};
function cantidadSintomas(plaga) {
    return [1, 2, 3, 4].filter((numero) => plaga[`sintoma_${numero}`]?.trim()).length;
}
// Obtener la imagen principal de la plaga
function imagenPrincipal(plaga) {
    const imagenes = Array.isArray(plaga.imagenes) ? plaga.imagenes : [];
    const imagen = imagenes.find((item) => item.es_principal) || imagenes[0];
    return imagen?.ruta ? obtenerImagen(imagen.ruta) : null;
}
// Normalizar los textos para facilitar la búsqueda
function normalizar(texto) {
    return String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
// Imagen de la plaga
function ImagenPlaga({ plaga, clase = "" }) {
    const imagen = imagenPrincipal(plaga);
    const [imagenFallida, setImagenFallida] = useState(null);
    return imagen && imagenFallida !== imagen ? (
        <img src={imagen} alt={plaga.nombre_comun} loading="lazy" onError={() => setImagenFallida(imagen)} className={`object-cover ${clase}`} />
    ) : (
        <div className={`flex items-center justify-center bg-pale text-primary ${clase}`}>
            <ImageOff size={32} strokeWidth={1.3} />
        </div>
    );
}
// Estado de la plaga
function EstadoPlaga({ estado }) {
    const activa = estado === "activo";
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${activa ? "bg-success-light text-success" : "bg-warning-light text-warning"}`}>
            <span className="h-2 w-2 rounded-full bg-current" />
            {activa ? "Activa" : "Suspendida"}
        </span>
    );
}
// Acciones disponibles para cada plaga
function AccionesPlaga({ plaga, confirmar }) {
    const activa = plaga.estado === "activo";
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Link to={`/admin/plagas/${plaga.id}`} title="Ver detalles" aria-label="Ver detalles" className="rounded-xl bg-pale p-2.5 text-forest transition hover:bg-primary/30">
                <Eye size={18} strokeWidth={1.8} />
            </Link>
            <Link to={`/admin/plagas/${plaga.id}/editar`} title="Editar plaga" aria-label="Editar plaga" className="rounded-xl bg-info-light p-2.5 text-info transition hover:bg-info/20">
                <Pencil size={18} strokeWidth={1.8} />
            </Link>
            <button type="button" onClick={() => confirmar(plaga, activa ? "suspender" : "activar")} title={activa ? "Suspender plaga" : "Reactivar plaga"} aria-label={activa ? "Suspender plaga" : "Reactivar plaga"} className={`rounded-xl p-2.5 transition ${activa ? "bg-warning-light text-warning hover:bg-warning/20" : "bg-success-light text-success hover:bg-success/20"}`}>
                {activa ? <PauseCircle size={18} strokeWidth={1.8} /> : <PlayCircle size={18} strokeWidth={1.8} />}
            </button>
            <button type="button" onClick={() => confirmar(plaga, "eliminar")} title="Eliminar plaga" aria-label="Eliminar plaga" className="rounded-xl bg-danger-light p-2.5 text-danger transition hover:bg-danger/20">
                <Trash2 size={18} strokeWidth={1.8} />
            </button>
        </div>
    );
}
// Tarjeta de una plaga
function TarjetaPlaga({ plaga, confirmar }) {
    return (
        <article className="group min-w-0 overflow-hidden rounded-florae border border-border bg-surface shadow-florae transition-all duration-300 hover:-translate-y-1 hover:shadow-florae-hover">
            <div className="relative overflow-hidden">
                <ImagenPlaga plaga={plaga} clase="h-52 w-full transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute right-3 top-3">
                    <EstadoPlaga estado={plaga.estado} />
                </div>
            </div>
            <div className="p-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-pale px-3 py-1 text-xs font-bold text-forest">
                    <Bug size={13} /> {cantidadSintomas(plaga)} síntomas
                </span>
                <h3 className="mt-3 truncate font-lora text-xl font-bold text-forest-dark" title={plaga.nombre_comun}>
                    {plaga.nombre_comun}
                </h3>
                <p className="mt-1 truncate text-sm italic text-secondary" title={plaga.nombre_cientifico}>
                    {plaga.nombre_cientifico}
                </p>
                <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-secondary">
                    {plaga.descripcion}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                    <span>{plaga.imagenes?.length || 0} imágenes</span>
                    <span>{plaga.tratamientos_count ?? 0} tratamientos</span>
                </div>
                <div className="mt-4 flex justify-between gap-2 border-t border-border pt-4">
                    <AccionesPlaga plaga={plaga} confirmar={confirmar} />
                </div>
            </div>
        </article>
    );
}
// Skeleton de las tarjetas
function SkeletonPlaga() {
    return (
        <div className="animate-pulse overflow-hidden rounded-florae border border-border bg-surface">
            <div className="h-52 bg-pale" />
            <div className="space-y-4 p-5">
                <div className="h-6 w-24 rounded-full bg-pale" />
                <div className="h-6 w-3/4 rounded-lg bg-pale" />
                <div className="h-4 w-1/2 rounded-lg bg-pale" />
                <div className="h-4 w-full rounded-lg bg-pale" />
                <div className="h-4 w-4/5 rounded-lg bg-pale" />
                <div className="flex gap-2 border-t border-border pt-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="h-10 w-10 rounded-xl bg-pale" />
                    ))}
                </div>
            </div>
        </div>
    );
}
function Plagas() {
    const location = useLocation();
    const navigate = useNavigate();
    const [plagas, setPlagas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("todos");
    const [vista, setVista] = useState("tarjetas");
    const [recarga, setRecarga] = useState(0);
    const [modal, setModal] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [errorAccion, setErrorAccion] = useState("");
    const [mensaje, setMensaje] = useState(location.state?.mensaje || "");
    // Recibir el mensaje después de registrar o editar una plaga
    useEffect(() => {
        if (location.state?.mensaje) {
            setMensaje(location.state.mensaje);
            navigate(
                {
                    pathname: location.pathname,
                    search: location.search,
                    hash: location.hash,
                },
                { replace: true, state: null }
            );
        }
    }, [location.state, location.pathname, location.search, location.hash, navigate]);
    // Consultar las plagas del catálogo
    useEffect(() => {
        let vigente = true;
        const cargarPlagas = async () => {
            setCargando(true);
            setError("");
            try {
                const datos = await obtenerPlagasAdmin();
                if (!Array.isArray(datos.plagas)) {
                    throw new Error("La API devolvió un listado de plagas inválido.");
                }
                if (vigente) setPlagas(datos.plagas);
            } catch (error) {
                if (vigente) {
                    setError(error.message || "No se pudieron consultar las plagas.");
                    console.error("Error al consultar las plagas:", error);
                }
            } finally {
                if (vigente) setCargando(false);
            }
        };
        cargarPlagas();
        return () => { vigente = false; };
    }, [recarga]);
    // Ocultar el mensaje de éxito después de unos segundos
    useEffect(() => {
        if (!mensaje) return;
        const temporizador = setTimeout(() => setMensaje(""), 4500);
        return () => clearTimeout(temporizador);
    }, [mensaje]);
    // Cerrar el modal con la tecla Escape
    useEffect(() => {
        if (!modal || procesando) return;
        const manejarTecla = (evento) => {
            if (evento.key === "Escape") {
                setModal(null);
                setErrorAccion("");
            }
        };
        window.addEventListener("keydown", manejarTecla);
        return () => window.removeEventListener("keydown", manejarTecla);
    }, [modal, procesando]);
    // Calcular las estadísticas del catálogo
    const totalPlagas = plagas.length;
    const plagasActivas = plagas.filter((plaga) => plaga.estado === "activo").length;
    const plagasSuspendidas = plagas.filter((plaga) => plaga.estado === "suspendido").length;
    const estadisticas = [
        { nombre: "Total de plagas", valor: totalPlagas, icono: Bug, fondo: "bg-pale", color: "text-forest" },
        { nombre: "Plagas activas", valor: plagasActivas, icono: CheckCircle2, fondo: "bg-success-light", color: "text-success" },
        { nombre: "Plagas suspendidas", valor: plagasSuspendidas, icono: PauseCircle, fondo: "bg-warning-light", color: "text-warning" },
    ];
    // Filtrar las plagas por nombre y estado
    const textoBusqueda = normalizar(busqueda);
    const plagasFiltradas = plagas.filter((plaga) => {
        const coincideBusqueda = normalizar(plaga.nombre_comun).includes(textoBusqueda) || normalizar(plaga.nombre_cientifico).includes(textoBusqueda);
        const coincideEstado = estado === "todos" || plaga.estado === estado;
        return coincideBusqueda && coincideEstado;
    });
    const limpiarFiltros = () => {
        setBusqueda("");
        setEstado("todos");
    };
    const abrirModal = (plaga, accion) => {
        setErrorAccion("");
        setMensaje("");
        setModal({ plaga, accion });
    };
    const cerrarModal = () => {
        if (procesando) return;
        setModal(null);
        setErrorAccion("");
    };
    // Suspender, reactivar o eliminar una plaga
    const confirmarAccion = async () => {
        if (!modal || procesando) return;
        setProcesando(true);
        setErrorAccion("");
        try {
            const { plaga, accion } = modal;
            const respuesta = await acciones[accion].funcion(plaga.id);
            if (accion === "eliminar") {
                setPlagas((actuales) => actuales.filter((item) => item.id !== plaga.id));
            } else {
                const nuevoEstado = accion === "activar" ? "activo" : "suspendido";
                setPlagas((actuales) => actuales.map((item) =>
                    item.id === plaga.id ? { ...item, ...respuesta?.plaga, estado: nuevoEstado } : item
                ));
            }
            setMensaje(respuesta?.mensaje || "La operación se realizó correctamente.");
            setModal(null);
        } catch (error) {
            setErrorAccion(error.message || "No se pudo realizar la operación.");
            console.error("Error al gestionar la plaga:", error);
        } finally {
            setProcesando(false);
        }
    };
    const configuracionModal = modal ? acciones[modal.accion] : null;
    const IconoModal = configuracionModal?.icono;
    return (
        <div className="min-w-0 animate-fade-in space-y-7">
            {/* Encabezado */}
            <section className="relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#E9C9BB] bg-linear-to-br from-[#EED9CD] to-white p-5 shadow-florae sm:px-6 sm:py-6">
                <div className="relative z-10 min-w-0 flex-1 basis-64">
                    <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#985B49]"><Bug size={17} /> Sanidad vegetal</p>
                    <h1 className="font-lora text-2xl font-bold text-forest-dark sm:text-3xl">Gestión de plagas</h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#465447]">Administra las plagas y sus registros en el catálogo.</p>
                </div>
                <div aria-hidden="true" className="pointer-events-none relative hidden h-24 w-28 shrink-0 items-center justify-center md:flex">
                    <span className="absolute h-24 w-24 rounded-full border border-[#E9C9BB] bg-[#E9C9BB]/50" />
                    <Bug size={57} strokeWidth={1.35} className="relative -rotate-12 text-[#985B49]" />
                    <Sprout size={25} strokeWidth={1.5} className="absolute bottom-0 right-0 rotate-12 rounded-full bg-white p-1 text-[#985B49]" />
                </div>
                <Link to="/admin/plagas/crear" className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-linear-to-br from-[#36583E] to-[#58765A] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50">
                    <Plus size={20} /> Nueva plaga
                </Link>
            </section>
            {/* Estadísticas */}
            <section className="grid gap-4 sm:grid-cols-3">
                {estadisticas.map(({ nombre, valor, icono: Icono, fondo, color }) => (
                    <article key={nombre} className="flex items-center gap-4 rounded-florae border border-border bg-surface p-5 shadow-florae">
                        <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${fondo} ${color}`}>
                            <Icono size={25} strokeWidth={1.7} />
                        </div>
                        <div className="min-w-0">
                            {cargando ? (
                                <div className="mb-2 h-8 w-12 animate-pulse rounded-lg bg-pale" />
                            ) : (
                                <p className="font-lora text-3xl font-bold text-forest-dark">{error ? "—" : valor}</p>
                            )}
                            <p className="mt-1 text-sm font-semibold text-secondary">{nombre}</p>
                        </div>
                    </article>
                ))}
            </section>
            {/* Mensaje de éxito */}
            {mensaje && (
                <div role="status" className="flex animate-slide-up items-center gap-3 rounded-2xl border border-success/20 bg-success-light p-4 text-sm text-success">
                    <CheckCircle2 size={22} className="shrink-0" />
                    <p className="flex-1 font-semibold">{mensaje}</p>
                    <button type="button" onClick={() => setMensaje("")} aria-label="Cerrar mensaje" className="rounded-lg p-1 hover:bg-white/50">
                        <X size={18} />
                    </button>
                </div>
            )}
            {/* Buscador y filtros */}
            <section className="rounded-florae border border-border bg-surface p-5 shadow-florae">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
                    <div className="relative min-w-0">
                        <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por nombre común o científico..." aria-label="Buscar plagas" className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <select value={estado} onChange={(evento) => setEstado(evento.target.value)} aria-label="Filtrar por estado" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text outline-none focus:border-primary">
                        <option value="todos">Todos los estados</option>
                        <option value="activo">Activas</option>
                        <option value="suspendido">Suspendidas</option>
                    </select>
                    <button type="button" onClick={limpiarFiltros} className="rounded-xl bg-pale px-4 py-3 text-sm font-bold text-forest transition hover:bg-primary/25">
                        Limpiar filtros
                    </button>
                </div>
            </section>
            {/* Listado de plagas */}
            <section aria-busy={cargando}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-lora text-2xl font-bold text-forest-dark">Nuestro catálogo</h2>
                        {!cargando && !error && (
                            <p className="mt-1 text-sm text-secondary">
                                Mostrando {plagasFiltradas.length} de {totalPlagas} plagas
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setRecarga((actual) => actual + 1)} disabled={cargando || procesando} title="Actualizar catálogo" aria-label="Actualizar catálogo" className="rounded-xl border border-border bg-surface p-3 text-forest transition hover:bg-pale disabled:opacity-50">
                            <RefreshCw size={19} className={cargando ? "animate-spin" : ""} />
                        </button>
                        <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
                            <button type="button" onClick={() => setVista("tarjetas")} aria-label="Vista de tarjetas" aria-pressed={vista === "tarjetas"} className={`rounded-lg p-2.5 transition ${vista === "tarjetas" ? "bg-forest text-white" : "text-muted hover:bg-pale"}`}>
                                <LayoutGrid size={19} />
                            </button>
                            <button type="button" onClick={() => setVista("lista")} aria-label="Vista de lista" aria-pressed={vista === "lista"} className={`rounded-lg p-2.5 transition ${vista === "lista" ? "bg-forest text-white" : "text-muted hover:bg-pale"}`}>
                                <List size={19} />
                            </button>
                        </div>
                    </div>
                </div>
                {cargando ? (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => <SkeletonPlaga key={item} />)}
                    </div>
                ) : error ? (
                    <div role="alert" className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-florae border border-border bg-surface p-8 text-center">
                        <AlertCircle size={45} strokeWidth={1.4} className="text-danger" />
                        <h3 className="font-lora text-xl font-bold text-forest-dark">No pudimos consultar el catálogo</h3>
                        <p className="max-w-md text-sm text-secondary">{error}</p>
                        <button type="button" onClick={() => setRecarga((actual) => actual + 1)} className="rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-dark">
                            Reintentar
                        </button>
                    </div>
                ) : plagasFiltradas.length === 0 ? (
                    <div className="flex min-h-80 animate-fade-in flex-col items-center justify-center rounded-florae border border-dashed border-primary/50 bg-surface p-8 text-center">
                        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-pale">
                            <Bug size={48} strokeWidth={1.3} className="animate-float text-primary" />
                        </div>
                        <h3 className="font-lora text-2xl font-bold text-forest-dark">
                            {totalPlagas === 0 ? "Aún no hay plagas registradas" : "No encontramos plagas"}
                        </h3>
                        <p className="mt-3 max-w-md text-sm leading-6 text-secondary">
                            {totalPlagas === 0
                                ? "Registra la primera plaga para ampliar el catálogo de Florae."
                                : "No hay plagas que coincidan con los filtros seleccionados. Intenta realizar otra búsqueda."}
                        </p>
                        {totalPlagas === 0 ? (
                            <Link to="/admin/plagas/crear" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-dark">
                                <Plus size={19} /> Registrar primera plaga
                            </Link>
                        ) : (
                            <button type="button" onClick={limpiarFiltros} className="mt-6 rounded-xl bg-pale px-5 py-3 text-sm font-bold text-forest transition hover:bg-primary/25">
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                ) : vista === "tarjetas" ? (
                    <div className="grid animate-fade-in gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {plagasFiltradas.map((plaga) => (
                            <TarjetaPlaga key={plaga.id} plaga={plaga} confirmar={abrirModal} />
                        ))}
                    </div>
                ) : (
                    <div className="animate-fade-in overflow-x-auto rounded-florae border border-border bg-surface shadow-florae">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="border-b border-border bg-pale/60 text-xs font-extrabold uppercase tracking-wide text-forest">
                                <tr>
                                    <th className="px-5 py-4">Plaga</th>
                                    <th className="px-5 py-4">Síntomas</th>
                                    <th className="px-5 py-4">Tratamientos</th>
                                    <th className="px-5 py-4">Estado</th>
                                    <th className="px-5 py-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {plagasFiltradas.map((plaga) => (
                                    <tr key={plaga.id} className="transition hover:bg-soft">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <ImagenPlaga plaga={plaga} clase="h-14 w-14 shrink-0 rounded-xl" />
                                                <div>
                                                    <p className="font-bold text-forest-dark">{plaga.nombre_comun}</p>
                                                    <p className="mt-1 text-xs italic text-secondary">{plaga.nombre_cientifico}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-secondary">{cantidadSintomas(plaga)}</td>
                                        <td className="px-5 py-4 text-secondary">{plaga.tratamientos_count ?? 0}</td>
                                        <td className="px-5 py-4"><EstadoPlaga estado={plaga.estado} /></td>
                                        <td className="px-5 py-4"><AccionesPlaga plaga={plaga} confirmar={abrirModal} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
            {/* Modal de confirmación */}
            {modal && configuracionModal && (
                <div onClick={cerrarModal} className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal-plaga" onClick={(evento) => evento.stopPropagation()} className="relative max-h-[90dvh] w-full max-w-md animate-scale-in overflow-y-auto rounded-florae border border-border bg-surface p-7 shadow-xl">
                        <button type="button" onClick={cerrarModal} disabled={procesando} aria-label="Cerrar modal" className="absolute right-4 top-4 rounded-lg p-2 text-muted transition hover:bg-pale disabled:opacity-40">
                            <X size={21} />
                        </button>
                        <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${modal.accion === "eliminar" ? "bg-danger-light text-danger" : modal.accion === "suspender" ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}>
                            <IconoModal size={31} strokeWidth={1.6} />
                        </div>
                        <h2 id="titulo-modal-plaga" className="font-lora text-2xl font-bold text-forest-dark">
                            {configuracionModal.titulo}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-secondary">
                            ¿Deseas {modal.accion === "activar" ? "reactivar" : modal.accion} la plaga <strong className="text-forest-dark">{modal.plaga.nombre_comun}</strong>?
                        </p>
                        <p className="mt-2 text-sm leading-6 text-secondary">
                            {configuracionModal.descripcion}
                        </p>
                        {modal.accion === "eliminar" && (
                            <div className="mt-4 rounded-xl border border-warning/20 bg-warning-light p-4 text-sm text-warning">
                                <div className="mb-2 flex items-center gap-2 font-bold">
                                    <AlertCircle size={20} /> Ten en cuenta
                                </div>
                                <p>Al eliminar esta plaga también se eliminarán sus registros dependientes:</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    <li>{modal.plaga.imagenes?.length || 0} imágenes registradas.</li>
                                    <li>{modal.plaga.tratamientos_count ?? 0} tratamientos registrados.</li>
                                    <li>{modal.plaga.plagas_jardin_count ?? 0} registros en jardines de usuarios.</li>
                                    <li>Historiales, aplicaciones de tratamientos y notificaciones dependientes.</li>
                                </ul>
                                <p className="mt-3 font-semibold">Si deseas conservar esta información, puedes suspender la plaga.</p>
                            </div>
                        )}
                        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-soft p-3">
                            <ImagenPlaga plaga={modal.plaga} clase="h-16 w-16 shrink-0 rounded-xl" />
                            <div className="min-w-0">
                                <p className="truncate font-bold text-forest-dark">{modal.plaga.nombre_comun}</p>
                                <p className="mt-1 truncate text-xs italic text-secondary">{modal.plaga.nombre_cientifico}</p>
                            </div>
                        </div>
                        {errorAccion && (
                            <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-danger-light p-3 text-sm text-danger">
                                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                                <p>{errorAccion}</p>
                            </div>
                        )}
                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button type="button" onClick={cerrarModal} disabled={procesando} className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-secondary transition hover:bg-soft disabled:opacity-50">
                                Cancelar
                            </button>
                            <button type="button" onClick={confirmarAccion} disabled={procesando} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${configuracionModal.estilo}`}>
                                {procesando ? <LoaderCircle size={18} className="animate-spin" /> : <IconoModal size={18} />}
                                {procesando ? "Procesando..." : configuracionModal.boton}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Plagas;
