import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bug, Pencil, Images, Star, FlaskConical, Activity, PauseCircle, PlayCircle, CheckCircle2, AlertCircle, ImageOff, RefreshCw, LoaderCircle, X } from "lucide-react";
import { obtenerPlagaAdmin, suspenderPlaga, reactivarPlaga } from "../../../services/adminApi";
import { obtenerImagen } from "../../../services/api";
// Mostrar una imagen o su reemplazo si no está disponible
function ImagenPlaga({ imagen, nombre, clase = "" }) {
    const ruta = imagen?.ruta ? obtenerImagen(imagen.ruta) : null;
    const [imagenFallida, setImagenFallida] = useState(null);
    return ruta && imagenFallida !== ruta ? (
        <img src={ruta} alt={nombre} onError={() => setImagenFallida(ruta)} className={`object-cover ${clase}`} />
    ) : (
        <div className={`flex items-center justify-center bg-pale text-primary ${clase}`}>
            <ImageOff size={40} strokeWidth={1.3} />
        </div>
    );
}
// Mostrar el estado de la plaga
function EstadoPlaga({ estado }) {
    const activa = estado === "activo";
    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${activa ? "bg-success-light text-success" : "bg-warning-light text-warning"}`}>
            <span className="h-2 w-2 rounded-full bg-current" />
            {activa ? "Activa" : "Suspendida"}
        </span>
    );
}
// Mostrar una característica de la plaga
function Caracteristica({ icono: Icono, titulo, valor }) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-soft p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pale text-forest">
                <Icono size={22} strokeWidth={1.7} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold text-muted">{titulo}</p>
                <p className="mt-1 break-words text-sm font-bold text-forest-dark">{valor || "Sin especificar"}</p>
            </div>
        </div>
    );
}
// Skeleton mientras se consulta la plaga
function SkeletonDetalle() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-5 w-36 rounded-lg bg-pale" />
            <div className="h-9 w-64 rounded-xl bg-pale" />
            <div className="h-4 w-48 rounded-lg bg-pale" />
            <section className="grid gap-6 rounded-florae border border-border bg-surface p-6 lg:grid-cols-2">
                <div>
                    <div className="h-80 rounded-2xl bg-pale" />
                    <div className="mt-4 flex gap-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-20 w-20 rounded-xl bg-pale" />
                        ))}
                    </div>
                </div>
                <div className="space-y-5">
                    <div className="h-7 w-24 rounded-full bg-pale" />
                    <div className="h-9 w-3/4 rounded-xl bg-pale" />
                    <div className="h-5 w-1/2 rounded-lg bg-pale" />
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-4 w-full rounded-lg bg-pale" />
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="h-20 rounded-2xl bg-pale" />
                        ))}
                    </div>
                </div>
            </section>
            <section className="rounded-florae border border-border bg-surface p-6">
                <div className="mb-6 h-7 w-48 rounded-lg bg-pale" />
                <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="h-44 rounded-2xl bg-pale" />
                    ))}
                </div>
            </section>
        </div>
    );
}
function DetallePlaga() {
    const { id } = useParams();
    const [plaga, setPlaga] = useState(null);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);
    const [modal, setModal] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [errorAccion, setErrorAccion] = useState("");
    const [mensaje, setMensaje] = useState("");
    // Consultar la información completa de la plaga
    useEffect(() => {
        let vigente = true;
        const cargarPlaga = async () => {
            setCargando(true);
            setError("");
            setPlaga(null);
            setImagenSeleccionada(null);
            try {
                const { plaga: datos } = await obtenerPlagaAdmin(id);
                if (!datos?.id) {
                    throw new Error("La API devolvió información inválida de la plaga.");
                }
                const imagenes = Array.isArray(datos.imagenes) ? datos.imagenes : [];
                const principal = imagenes.find((imagen) => imagen.es_principal) || imagenes[0];
                if (vigente) {
                    setPlaga(datos);
                    setImagenSeleccionada(principal?.id || null);
                }
            } catch (error) {
                if (vigente) {
                    setError(error.message || "No se pudo consultar la plaga.");
                    console.error("Error al consultar la plaga:", error);
                }
            } finally {
                if (vigente) setCargando(false);
            }
        };
        cargarPlaga();
        return () => { vigente = false; };
    }, [id, recarga]);
    // Ocultar el mensaje después de unos segundos
    useEffect(() => {
        if (!mensaje) return;
        const temporizador = setTimeout(() => setMensaje(""), 4500);
        return () => clearTimeout(temporizador);
    }, [mensaje]);
    // Cerrar el modal con Escape
    useEffect(() => {
        if (!modal || procesando) return;
        const manejarTecla = (evento) => {
            if (evento.key === "Escape") {
                setModal(false);
                setErrorAccion("");
            }
        };
        window.addEventListener("keydown", manejarTecla);
        return () => window.removeEventListener("keydown", manejarTecla);
    }, [modal, procesando]);
    const imagenes = Array.isArray(plaga?.imagenes) ? plaga.imagenes : [];
    const sintomas = [1, 2, 3, 4].map(n => plaga?.[`sintoma_${n}`]).filter(s => s?.trim());
    const tratamientos = Array.isArray(plaga?.tratamientos) ? plaga.tratamientos : [];
    const imagenActual = imagenes.find((imagen) => imagen.id === imagenSeleccionada) || imagenes.find((imagen) => imagen.es_principal) || imagenes[0];
    const activa = plaga?.estado === "activo";
    const abrirModal = () => {
        setErrorAccion("");
        setMensaje("");
        setModal(true);
    };
    const cerrarModal = () => {
        if (procesando) return;
        setModal(false);
        setErrorAccion("");
    };
    // Suspender o reactivar la plaga
    const cambiarEstado = async () => {
        if (!plaga || procesando) return;
        setProcesando(true);
        setErrorAccion("");
        try {
            const respuesta = activa ? await suspenderPlaga(plaga.id) : await reactivarPlaga(plaga.id);
            const nuevoEstado = activa ? "suspendido" : "activo";
            setPlaga((actual) => ({
                ...actual,
                ...respuesta?.plaga,
                estado: nuevoEstado,
            }));
            setMensaje(respuesta?.mensaje || (activa ? "Plaga suspendida correctamente." : "Plaga reactivada correctamente."));
            setModal(false);
        } catch (error) {
            setErrorAccion(error.message || "No se pudo cambiar el estado de la plaga.");
            console.error("Error al cambiar el estado de la plaga:", error);
        } finally {
            setProcesando(false);
        }
    };
    if (cargando) return <SkeletonDetalle />;
    if (error || !plaga) {
        return (
            <div className="animate-fade-in space-y-6">
                <Link to="/admin/plagas" className="inline-flex items-center gap-2 text-sm font-bold text-forest transition hover:text-primary-hover">
                    <ArrowLeft size={19} /> Volver al catálogo
                </Link>
                <section role="alert" className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-florae border border-border bg-surface p-8 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-danger-light text-danger">
                        <AlertCircle size={40} strokeWidth={1.4} />
                    </div>
                    <h2 className="font-lora text-2xl font-bold text-forest-dark">No pudimos consultar la plaga</h2>
                    <p className="max-w-md text-sm leading-6 text-secondary">{error || "La plaga no está disponible."}</p>
                    <button type="button" onClick={() => setRecarga((actual) => actual + 1)} className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-dark">
                        <RefreshCw size={18} /> Reintentar
                    </button>
                </section>
            </div>
        );
    }
    return (
        <div className="mx-auto max-w-7xl animate-fade-in space-y-7">
            {/* Encabezado */}
            <section>
                <Link to="/admin/plagas" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-forest transition hover:text-primary-hover">
                    <ArrowLeft size={19} /> Volver al catálogo
                </Link>
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
                            <Bug size={19} /> Catálogo de plagas
                        </div>
                        <h1 className="font-lora text-3xl font-bold text-forest-dark sm:text-4xl">Detalle de la plaga</h1>
                        <p className="mt-2 text-sm text-secondary">Consulta los síntomas y tratamientos de esta plaga.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={abrirModal} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${activa ? "bg-warning-light text-warning hover:bg-warning/20" : "bg-success-light text-success hover:bg-success/20"}`}>
                            {activa ? <PauseCircle size={19} /> : <PlayCircle size={19} />}
                            {activa ? "Suspender plaga" : "Reactivar plaga"}
                        </button>
                        <Link to={`/admin/plagas/${plaga.id}/editar`} className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-florae transition hover:bg-forest-dark">
                            <Pencil size={18} /> Editar plaga
                        </Link>
                    </div>
                </div>
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
            {/* Información de la plaga */}
            <section className="grid gap-7 rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7 lg:grid-cols-2">
                {/* Galería de imágenes */}
                <div className="min-w-0">
                    <div className="relative overflow-hidden rounded-2xl">
                        <ImagenPlaga key={imagenActual?.id || "sin-imagen"} imagen={imagenActual} nombre={plaga.nombre_comun} clase="h-72 w-full animate-fade-in sm:h-96" />
                        {imagenActual?.es_principal && (
                            <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm">
                                <Star size={14} fill="currentColor" /> Imagen principal
                            </span>
                        )}
                        {imagenes.length > 0 && (
                            <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                                <Images size={15} /> {imagenes.length} {imagenes.length === 1 ? "imagen" : "imágenes"}
                            </span>
                        )}
                    </div>
                    {imagenes.length > 0 ? (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {imagenes.map((imagen, indice) => (
                                <button key={imagen.id} type="button" onClick={() => setImagenSeleccionada(imagen.id)} aria-label={`Ver imagen ${indice + 1}`} aria-pressed={imagenActual?.id === imagen.id} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-24 ${imagenActual?.id === imagen.id ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"}`}>
                                    <ImagenPlaga imagen={imagen} nombre={`${plaga.nombre_comun} - Imagen ${indice + 1}`} clase="h-full w-full" />
                                    {imagen.es_principal && (
                                        <span className="absolute bottom-1 right-1 rounded-full bg-forest p-1.5 text-white">
                                            <Star size={11} fill="currentColor" />
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 text-center text-sm text-muted">Esta plaga todavía no tiene imágenes registradas.</p>
                    )}
                </div>
                {/* Información general */}
                <div className="min-w-0">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        <EstadoPlaga estado={plaga.estado} />
                    </div>
                    <h2 className="break-words font-lora text-3xl font-bold text-forest-dark sm:text-4xl">{plaga.nombre_comun}</h2>
                    <p className="mt-2 text-lg italic text-secondary">{plaga.nombre_cientifico}</p>
                    <div className="mt-6">
                        <h3 className="mb-3 font-lora text-lg font-bold text-forest-dark">Acerca de esta plaga</h3>
                        <p className="whitespace-pre-line text-sm leading-7 text-secondary">{plaga.descripcion}</p>
                    </div>
                </div>
            </section>
            {/* Aviso de suspensión */}
            {!activa && (
                <div className="flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning-light p-4 text-warning">
                    <PauseCircle size={23} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold">Esta plaga está suspendida</p>
                        <p className="mt-1 text-sm leading-6">Actualmente no está disponible en el catálogo público. Su información se conserva y puedes reactivarla cuando lo necesites.</p>
                    </div>
                </div>
            )}
            {/* Síntomas y tratamientos */}
            <section className="rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7">
                <h2 className="mb-5 flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><Activity size={24} /> Síntomas principales</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    {sintomas.map((sintoma, i) => <article key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-soft p-5"><span className="rounded-xl bg-warning-light p-3 font-bold text-warning">{i + 1}</span><p className="text-sm leading-7 text-secondary">{sintoma}</p></article>)}
                </div>
                {!sintomas.length && <p className="text-sm text-secondary">No hay síntomas registrados.</p>}
            </section>
            <section className="rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7">
                <h2 className="mb-5 flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><FlaskConical size={24} /> Tratamientos asociados ({tratamientos.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    {tratamientos.map(t => <article key={t.id} className="rounded-2xl border border-border bg-soft p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-lora text-lg font-bold text-forest-dark">{t.nombre}</h3><EstadoPlaga estado={t.estado} /></div><p className="mt-3 whitespace-pre-line text-sm leading-7 text-secondary">{t.descripcion}</p></article>)}
                </div>
                {!tratamientos.length && <p className="rounded-2xl border border-dashed border-border bg-soft p-8 text-center text-sm text-secondary">Todavía no hay tratamientos asociados a esta plaga.</p>}
            </section>
            <section className="rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7">
                <h2 className="mb-5 font-lora text-xl font-bold text-forest-dark">Resumen del registro</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Caracteristica icono={Images} titulo="Imágenes registradas" valor={String(imagenes.length)} />
                    <Caracteristica icono={Activity} titulo="Síntomas registrados" valor={String(sintomas.length)} />
                    <Caracteristica icono={FlaskConical} titulo="Tratamientos asociados" valor={String(tratamientos.length)} />
                    <Caracteristica icono={Bug} titulo="Registros en jardines" valor={String(plaga.plagas_jardin_count ?? 0)} />
                </div>
            </section>
            {/* Modal de confirmación */}
            {modal && (
                <div onClick={cerrarModal} className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal-estado" onClick={(evento) => evento.stopPropagation()} className="relative max-h-[90dvh] w-full max-w-md animate-scale-in overflow-y-auto rounded-florae border border-border bg-surface p-7 shadow-xl">
                        <button type="button" onClick={cerrarModal} disabled={procesando} aria-label="Cerrar modal" className="absolute right-4 top-4 rounded-lg p-2 text-muted transition hover:bg-pale disabled:opacity-50">
                            <X size={21} />
                        </button>
                        <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${activa ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}>
                            {activa ? <PauseCircle size={32} strokeWidth={1.6} /> : <PlayCircle size={32} strokeWidth={1.6} />}
                        </div>
                        <h2 id="titulo-modal-estado" className="font-lora text-2xl font-bold text-forest-dark">
                            {activa ? "Suspender plaga" : "Reactivar plaga"}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-secondary">
                            ¿Deseas {activa ? "suspender" : "reactivar"} la plaga <strong className="text-forest-dark">{plaga.nombre_comun}</strong>?
                        </p>
                        <p className="mt-2 text-sm leading-6 text-secondary">
                            {activa ? "La plaga dejará de aparecer en el catálogo público, pero conservará toda su información." : "La plaga volverá a estar disponible en el catálogo público de Florae."}
                        </p>
                        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-soft p-3">
                            <ImagenPlaga imagen={imagenes.find((imagen) => imagen.es_principal) || imagenes[0]} nombre={plaga.nombre_comun} clase="h-16 w-16 shrink-0 rounded-xl" />
                            <div className="min-w-0">
                                <p className="truncate font-bold text-forest-dark">{plaga.nombre_comun}</p>
                                <p className="mt-1 truncate text-xs italic text-secondary">{plaga.nombre_cientifico}</p>
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
                            <button type="button" onClick={cambiarEstado} disabled={procesando} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${activa ? "bg-warning hover:opacity-90" : "bg-forest hover:bg-forest-dark"}`}>
                                {procesando ? <LoaderCircle size={18} className="animate-spin" /> : activa ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                                {procesando ? "Procesando..." : activa ? "Suspender" : "Reactivar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default DetallePlaga;