import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Sprout, Leaf, Pencil, MapPin, Thermometer, Ruler, Images, Star, Clock, PauseCircle, PlayCircle, CheckCircle2, AlertCircle, ImageOff, RefreshCw, LoaderCircle, X, HeartHandshake } from "lucide-react";
import { obtenerPlantaAdmin, suspenderPlanta, activarPlanta } from "../../../services/adminApi";
import { obtenerImagen } from "../../../services/api";
import gota from "../../../assets/riegoazul.png";
import sol from "../../../assets/sun (3).png";
import temperatura from "../../../assets/temperatura2.png";
import fertilizante from "../../../assets/fertilizacionverde.png";

const tiposCuidados = {
    riego: { imagen: gota, color: "text-info", fondo: "bg-info-light" },
    luz: { imagen: sol, color: "text-warning", fondo: "bg-warning-light" },
    temperatura: { imagen: temperatura, color: "text-danger", fondo: "bg-danger-light" },
    fertilizacion: { imagen: fertilizante, color: "text-success", fondo: "bg-success-light" },
};

function normalizar(texto) {
    return String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Mostrar una imagen o su reemplazo si no está disponible
function ImagenPlanta({ imagen, nombre, clase = "" }) {
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

// Mostrar el estado de la planta
function EstadoPlanta({ estado }) {
    const activa = estado === "activa";

    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${activa ? "bg-success-light text-success" : "bg-warning-light text-warning"}`}>
            <span className="h-2 w-2 rounded-full bg-current" />
            {activa ? "Activa" : "Suspendida"}
        </span>
    );
}

// Mostrar una característica de la planta
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

// Mostrar los cuidados registrados
function TarjetaCuidado({ cuidado }) {
    const configuracion = tiposCuidados[normalizar(cuidado.tipo)];
    
    const frecuencia = cuidado.frecuencia_dias;

    return (
        <article className="rounded-2xl border border-border bg-soft p-5 transition hover:shadow-florae">
            <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${configuracion?.fondo || "bg-pale"} ${configuracion?.color || "text-forest"}`}>
                    {configuracion?.imagen ? <img src={configuracion.imagen} alt="" className="h-7 w-7 object-contain" /> : <Leaf size={23} strokeWidth={1.7} />}
                </div>
                <h3 className="font-lora text-lg font-bold capitalize text-forest-dark">{cuidado.tipo}</h3>
            </div>

            <p className="whitespace-pre-line text-sm leading-7 text-secondary">{cuidado.descripcion}</p>

            <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs font-semibold text-forest">
                <Clock size={16} strokeWidth={1.8} />
                {frecuencia ? `Cada ${frecuencia} ${Number(frecuencia) === 1 ? "día" : "días"}` : "Sin frecuencia específica"}
            </div>
        </article>
    );
}

// Skeleton mientras se consulta la planta
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

function DetallePlanta() {
    const { id } = useParams();

    const [planta, setPlanta] = useState(null);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);
    const [modal, setModal] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [errorAccion, setErrorAccion] = useState("");
    const [mensaje, setMensaje] = useState("");

    // Consultar la información completa de la planta
    useEffect(() => {
        let vigente = true;

        const cargarPlanta = async () => {
            setCargando(true);
            setError("");
            setPlanta(null);
            setImagenSeleccionada(null);

            try {
                const datos = await obtenerPlantaAdmin(id);

                if (!datos?.id) {
                    throw new Error("La API devolvió información inválida de la planta.");
                }

                const imagenes = Array.isArray(datos.imagenes) ? datos.imagenes : [];
                const principal = imagenes.find((imagen) => imagen.es_principal) || imagenes[0];

                if (vigente) {
                    setPlanta(datos);
                    setImagenSeleccionada(principal?.id || null);
                }
            } catch (error) {
                if (vigente) {
                    setError(error.message || "No se pudo consultar la planta.");
                    console.error("Error al consultar la planta:", error);
                }
            } finally {
                if (vigente) setCargando(false);
            }
        };

        cargarPlanta();

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

    const imagenes = Array.isArray(planta?.imagenes) ? planta.imagenes : [];
    const cuidados = Array.isArray(planta?.cuidados) ? planta.cuidados : [];
    const imagenActual = imagenes.find((imagen) => imagen.id === imagenSeleccionada) || imagenes.find((imagen) => imagen.es_principal) || imagenes[0];
    const activa = planta?.estado === "activa";

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

    // Suspender o reactivar la planta
    const cambiarEstado = async () => {
        if (!planta || procesando) return;

        setProcesando(true);
        setErrorAccion("");

        try {
            const respuesta = activa ? await suspenderPlanta(planta.id) : await activarPlanta(planta.id);
            const nuevoEstado = activa ? "suspendida" : "activa";

            setPlanta((actual) => ({
                ...actual,
                ...respuesta?.planta,
                estado: nuevoEstado,
            }));

            setMensaje(respuesta?.mensaje || (activa ? "Planta suspendida correctamente." : "Planta reactivada correctamente."));
            setModal(false);
        } catch (error) {
            setErrorAccion(error.message || "No se pudo cambiar el estado de la planta.");
            console.error("Error al cambiar el estado de la planta:", error);
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) return <SkeletonDetalle />;

    if (error || !planta) {
        return (
            <div className="animate-fade-in space-y-6">
                <Link to="/admin/plantas" className="inline-flex items-center gap-2 text-sm font-bold text-forest transition hover:text-primary-hover">
                    <ArrowLeft size={19} /> Volver al catálogo
                </Link>

                <section role="alert" className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-florae border border-border bg-surface p-8 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-danger-light text-danger">
                        <AlertCircle size={40} strokeWidth={1.4} />
                    </div>

                    <h2 className="font-lora text-2xl font-bold text-forest-dark">No pudimos consultar la planta</h2>
                    <p className="max-w-md text-sm leading-6 text-secondary">{error || "La planta no está disponible."}</p>

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
                <Link to="/admin/plantas" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-forest transition hover:text-primary-hover">
                    <ArrowLeft size={19} /> Volver al catálogo
                </Link>

                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
                            <Sprout size={19} /> Catálogo natural
                        </div>
                        <h1 className="font-lora text-3xl font-bold text-forest-dark sm:text-4xl">Detalle de la planta</h1>
                        <p className="mt-2 text-sm text-secondary">Conoce toda la información de esta especie.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={abrirModal} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${activa ? "bg-warning-light text-warning hover:bg-warning/20" : "bg-success-light text-success hover:bg-success/20"}`}>
                            {activa ? <PauseCircle size={19} /> : <PlayCircle size={19} />}
                            {activa ? "Suspender planta" : "Reactivar planta"}
                        </button>

                        <Link to={`/admin/plantas/${planta.id}/editar`} className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-florae transition hover:bg-forest-dark">
                            <Pencil size={18} /> Editar planta
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

            {/* Información de la planta */}
            <section className="grid gap-7 rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7 lg:grid-cols-2">

                {/* Galería de imágenes */}
                <div className="min-w-0">
                    <div className="relative overflow-hidden rounded-2xl">
                        <ImagenPlanta key={imagenActual?.id || "sin-imagen"} imagen={imagenActual} nombre={planta.nombre_comun} clase="h-72 w-full animate-fade-in sm:h-96" />

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
                                    <ImagenPlanta imagen={imagen} nombre={`${planta.nombre_comun} - Imagen ${indice + 1}`} clase="h-full w-full" />

                                    {imagen.es_principal && (
                                        <span className="absolute bottom-1 right-1 rounded-full bg-forest p-1.5 text-white">
                                            <Star size={11} fill="currentColor" />
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 text-center text-sm text-muted">Esta planta todavía no tiene imágenes registradas.</p>
                    )}
                </div>

                {/* Información general */}
                <div className="min-w-0">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-pale px-4 py-2 text-xs font-bold text-forest">
                            <Leaf size={15} /> {planta.tipo}
                        </span>

                        <EstadoPlanta estado={planta.estado} />
                    </div>

                    <h2 className="break-words font-lora text-3xl font-bold text-forest-dark sm:text-4xl">{planta.nombre_comun}</h2>
                    <p className="mt-2 text-lg italic text-secondary">{planta.nombre_cientifico}</p>

                    <div className="mt-6">
                        <h3 className="mb-3 font-lora text-lg font-bold text-forest-dark">Acerca de esta planta</h3>
                        <p className="whitespace-pre-line text-sm leading-7 text-secondary">{planta.descripcion}</p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <Caracteristica icono={MapPin} titulo="Origen" valor={planta.origen} />
                        <Caracteristica icono={Leaf} titulo="Categoría" valor={planta.tipo} />
                        <Caracteristica icono={Thermometer} titulo="Clima" valor={planta.clima} />
                        <Caracteristica icono={Ruler} titulo="Tamaño" valor={planta.size} />
                    </div>
                </div>
            </section>

            {/* Aviso de suspensión */}
            {!activa && (
                <div className="flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning-light p-4 text-warning">
                    <PauseCircle size={23} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold">Esta planta está suspendida</p>
                        <p className="mt-1 text-sm leading-6">Actualmente no está disponible en el catálogo público. Su información se conserva y puedes reactivarla cuando lo necesites.</p>
                    </div>
                </div>
            )}

            {/* Guía de cuidados */}
            <section className="rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-pale text-forest">
                            <HeartHandshake size={27} strokeWidth={1.7} />
                        </div>

                        <div>
                            <h2 className="font-lora text-xl font-bold text-forest-dark">Guía de cuidados</h2>
                            <p className="mt-1 text-sm text-secondary">Todo lo que esta planta necesita para crecer.</p>
                        </div>
                    </div>

                    <span className="rounded-full bg-pale px-4 py-2 text-xs font-bold text-forest">
                        {cuidados.length} {cuidados.length === 1 ? "cuidado registrado" : "cuidados registrados"}
                    </span>
                </div>

                {cuidados.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {cuidados.map((cuidado) => (
                            <TarjetaCuidado key={cuidado.id} cuidado={cuidado} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-soft p-8 text-center">
                        <Leaf size={40} strokeWidth={1.4} className="mb-4 text-primary" />
                        <h3 className="font-lora text-lg font-bold text-forest-dark">Cada planta necesita amor</h3>
                        <p className="mt-2 max-w-md text-sm leading-6 text-secondary">Todavía no se han registrado cuidados para esta planta. Puedes agregarlos desde la edición.</p>

                        <Link to={`/admin/plantas/${planta.id}/editar`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-pale px-5 py-3 text-sm font-bold text-forest transition hover:bg-primary/25">
                            <Pencil size={17} /> Agregar cuidados
                        </Link>
                    </div>
                )}
            </section>

            {/* Resumen del registro */}
            <section className="rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7">
                <h2 className="mb-5 font-lora text-xl font-bold text-forest-dark">Resumen del registro</h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Caracteristica icono={Images} titulo="Imágenes registradas" valor={String(imagenes.length)} />
                    <Caracteristica icono={HeartHandshake} titulo="Cuidados registrados" valor={String(cuidados.length)} />
                    <Caracteristica icono={Clock} titulo="Cuidados programables" valor={String(cuidados.filter((cuidado) => Number(cuidado.frecuencia_dias) > 0).length)} />
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
                            {activa ? "Suspender planta" : "Reactivar planta"}
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-secondary">
                            ¿Deseas {activa ? "suspender" : "reactivar"} la planta <strong className="text-forest-dark">{planta.nombre_comun}</strong>?
                        </p>

                        <p className="mt-2 text-sm leading-6 text-secondary">
                            {activa ? "La planta dejará de aparecer en el catálogo público, pero conservará toda su información." : "La planta volverá a estar disponible en el catálogo público de Florae."}
                        </p>

                        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-soft p-3">
                            <ImagenPlanta imagen={imagenes.find((imagen) => imagen.es_principal) || imagenes[0]} nombre={planta.nombre_comun} clase="h-16 w-16 shrink-0 rounded-xl" />

                            <div className="min-w-0">
                                <p className="truncate font-bold text-forest-dark">{planta.nombre_comun}</p>
                                <p className="mt-1 truncate text-xs italic text-secondary">{planta.nombre_cientifico}</p>
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

export default DetallePlanta;