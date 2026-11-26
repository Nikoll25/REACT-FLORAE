import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pill, Pencil, Clock, ClipboardList, FlaskConical, PauseCircle, PlayCircle, AlertCircle, LoaderCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { obtenerMedicamentoAdmin, suspenderMedicamento, activarMedicamento } from "../../../services/adminApi";

const seccion = "rounded-florae border border-border bg-surface p-6 shadow-florae";
const boton = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition disabled:opacity-50";

export default function DetalleMedicamento() {
    const { id } = useParams();
    const [medicamento, setMedicamento] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);
    const [modal, setModal] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [errorAccion, setErrorAccion] = useState("");
    const [mensaje, setMensaje] = useState("");

    // Consultamos el medicamento seleccionado
    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setError("");

        obtenerMedicamentoAdmin(id).then(datos => {
            if (!datos?.medicamento?.id) throw new Error("No se encontró el medicamento.");
            if (vigente) setMedicamento(datos.medicamento);
        }).catch(e => {
            if (vigente) setError(e.message || "No se pudo consultar el medicamento.");
        }).finally(() => {
            if (vigente) setCargando(false);
        });

        return () => { vigente = false; };
    }, [id, recarga]);

    useEffect(() => {
        if (!mensaje) return;
        const tiempo = setTimeout(() => setMensaje(""), 4500);
        return () => clearTimeout(tiempo);
    }, [mensaje]);

    const activo = medicamento?.estado === "activo";
    const tratamientos = medicamento?.tratamientos || [];

    // Suspendemos o reactivamos el medicamento
    const cambiarEstado = async () => {
        if (procesando) return;
        setProcesando(true);
        setErrorAccion("");

        try {
            const respuesta = await (activo ? suspenderMedicamento(id) : activarMedicamento(id));

            setMedicamento(actual => ({
                ...actual,
                ...respuesta.medicamento,
                estado: activo ? "suspendido" : "activo"
            }));

            setMensaje(respuesta.mensaje || "Estado actualizado correctamente.");
            setModal(false);
        } catch (e) {
            setErrorAccion(e.message || "No se pudo actualizar el estado.");
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) return (
        <div className="animate-pulse space-y-6">
            <div className="h-5 w-36 rounded bg-pale" />
            <div className="h-9 w-64 rounded bg-pale" />
            <div className={`${seccion} space-y-4`}>
                <div className="h-24 w-24 rounded-2xl bg-pale" />
                <div className="h-7 w-1/2 rounded bg-pale" />
                <div className="h-16 rounded-xl bg-soft" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map(n => <div key={n} className="h-28 rounded-florae border border-border bg-surface" />)}
            </div>
            <div className="h-40 rounded-florae border border-border bg-surface" />
        </div>
    );

    if (error || !medicamento) return (
        <div className={`${seccion} text-center`}>
            <AlertCircle size={42} className="mx-auto mb-4 text-danger" />
            <h2 className="font-lora text-xl font-bold text-forest-dark">No se pudo cargar el medicamento</h2>
            <p className="mt-2 text-sm text-secondary">{error || "Medicamento no encontrado."}</p>
            <div className="mt-5 flex justify-center gap-3">
                <Link to="/admin/medicamentos" className={`${boton} border border-border text-secondary`}>Regresar</Link>
                <button onClick={() => setRecarga(n => n + 1)} className={`${boton} bg-forest text-white`}>Reintentar</button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 font-nunito text-text animate-fade-in">
            <Link to="/admin/medicamentos" className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:text-primary">
                <ArrowLeft size={18} /> Volver a medicamentos
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-lora text-3xl font-bold text-forest-dark">Detalle del medicamento</h1>
                    <p className="mt-2 text-sm text-secondary">Consulta la información y los tratamientos asociados.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => { setErrorAccion(""); setModal(true); }} className={`${boton} ${activo ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}>
                        {activo ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                        {activo ? "Suspender" : "Reactivar"}
                    </button>
                    <Link to={`/admin/medicamentos/${id}/editar`} className={`${boton} bg-forest text-white hover:bg-forest-dark`}>
                        <Pencil size={18} /> Editar medicamento
                    </Link>
                </div>
            </div>

            {mensaje && (
                <div role="status" className="flex items-center gap-3 rounded-xl bg-success-light p-4 text-sm text-success">
                    <CheckCircle2 size={20} /> {mensaje}
                </div>
            )}

            {/* Información general */}
            <section className={seccion}>
                <div className="flex flex-wrap items-start gap-6">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-pale text-forest">
                        <Pill size={56} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${activo ? "bg-success-light text-success" : "bg-warning-light text-warning"}`}>
                            <span className="h-2 w-2 rounded-full bg-current" />
                            {activo ? "Activo" : "Suspendido"}
                        </span>
                        <h2 className="mt-3 font-lora text-3xl font-bold text-forest-dark">{medicamento.nombre}</h2>
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-secondary">{medicamento.descripcion}</p>
                    </div>
                </div>

                {!activo && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl bg-warning-light p-4 text-sm text-warning">
                        <AlertCircle size={20} className="shrink-0" />
                        Este medicamento está suspendido y no se encuentra disponible en el catálogo público de medicamentos.
                    </div>
                )}
            </section>

            {/* Resumen del medicamento */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { titulo: "Dosis", valor: medicamento.dosis, Icono: Pill },
                    { titulo: "Frecuencia", valor: medicamento.frecuencia, Icono: Clock },
                    { titulo: "Tratamientos asociados", valor: tratamientos.length, Icono: FlaskConical },
                    { titulo: "Aplicaciones registradas", valor: medicamento.aplicaciones_count ?? "—", Icono: ClipboardList }
                ].map(({ titulo, valor, Icono }) => (
                    <div key={titulo} className="flex items-start gap-3 rounded-florae border border-border bg-surface p-5 shadow-florae">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pale text-forest"><Icono size={23} /></div>
                        <div className="min-w-0">
                            <p className="text-xs text-secondary">{titulo}</p>
                            <p className="mt-2 break-words font-bold text-forest-dark">{valor}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Instrucciones de aplicación */}
            <section className={seccion}>
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pale text-forest"><ClipboardList size={25} /></div>
                    <div>
                        <h2 className="font-lora text-xl font-bold text-forest-dark">Instrucciones de aplicación</h2>
                        <p className="text-sm text-secondary">Indicaciones para utilizar el medicamento.</p>
                    </div>
                </div>
                <div className="rounded-xl bg-soft p-5">
                    <p className="whitespace-pre-line text-sm leading-7 text-text">{medicamento.instrucciones}</p>
                </div>
            </section>

            {/* Tratamientos asociados */}
            <section className={seccion}>
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pale text-forest"><FlaskConical size={25} /></div>
                    <div>
                        <h2 className="font-lora text-xl font-bold text-forest-dark">Tratamientos asociados</h2>
                        <p className="text-sm text-secondary">Tratamientos del catálogo que utilizan este medicamento.</p>
                    </div>
                </div>

                {tratamientos.length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {tratamientos.map(t => (
                            <Link key={t.id} to={`/admin/tratamientos/${t.id}`} className="flex items-center gap-4 rounded-xl border border-border bg-soft p-4 transition hover:border-primary">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pale text-forest"><FlaskConical size={24} /></div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-forest-dark">{t.nombre}</p>
                                    <p className="mt-1 line-clamp-2 text-xs text-secondary">{t.descripcion}</p>
                                    <span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-bold ${t.estado === "activo" ? "bg-success-light text-success" : "bg-warning-light text-warning"}`}>
                                        {t.estado === "activo" ? "Activo" : "Suspendido"}
                                    </span>
                                </div>
                                <ChevronRight size={19} className="shrink-0 text-primary" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl bg-soft p-8 text-center">
                        <FlaskConical size={35} className="mx-auto mb-3 text-primary" />
                        <p className="font-bold text-forest">No hay tratamientos asociados</p>
                        <p className="mt-2 text-sm text-secondary">Puedes asociar tratamientos desde la edición del medicamento.</p>
                        <Link to={`/admin/medicamentos/${id}/editar`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-forest hover:underline">
                            <Pencil size={15} /> Asociar tratamientos
                        </Link>
                    </div>
                )}
            </section>

            {/* Confirmación de cambio de estado */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => !procesando && setModal(false)}>
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-estado" className="w-full max-w-md rounded-florae bg-surface p-6 shadow-xl animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${activo ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}>
                            {activo ? <PauseCircle size={30} /> : <PlayCircle size={30} />}
                        </div>
                        <h2 id="titulo-estado" className="text-center font-lora text-xl font-bold text-forest-dark">{activo ? "Suspender medicamento" : "Reactivar medicamento"}</h2>
                        <p className="mt-3 text-center text-sm leading-relaxed text-secondary">
                            {activo ? "El medicamento dejará de estar disponible en el catálogo público, pero conservará sus registros." : "El medicamento volverá a estar disponible en el catálogo público."}
                        </p>

                        <div className="my-5 flex items-center gap-3 rounded-xl border border-border bg-soft p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pale text-forest"><Pill size={24} /></div>
                            <p className="font-bold text-forest-dark">{medicamento.nombre}</p>
                        </div>

                        {errorAccion && (
                            <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-danger-light p-3 text-sm text-danger">
                                <AlertCircle size={18} className="shrink-0" /> {errorAccion}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button disabled={procesando} onClick={() => setModal(false)} className={`${boton} border border-border text-secondary`}>Cancelar</button>
                            <button disabled={procesando} onClick={cambiarEstado} className={`${boton} text-white ${activo ? "bg-warning" : "bg-forest"}`}>
                                {procesando && <LoaderCircle size={17} className="animate-spin" />}
                                {procesando ? "Procesando..." : activo ? "Suspender" : "Reactivar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}