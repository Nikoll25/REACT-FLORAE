import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Sprout, Bug, CalendarDays, ShieldCheck, CheckCircle2, XCircle, Clock, AlertCircle, LoaderCircle, Info } from "lucide-react";
import { obtenerSugerenciaIA, aceptarSugerenciaIA, rechazarSugerenciaIA } from "../../../services/adminApi";

const estados = {
    pendiente: { nombre: "Pendiente", estilo: "bg-warning-light text-warning", icono: Clock },
    aceptada: { nombre: "Aceptada", estilo: "bg-success-light text-success", icono: CheckCircle2 },
    rechazada: { nombre: "Rechazada", estilo: "bg-danger-light text-danger", icono: XCircle }
};

const formatoFecha = fecha => fecha ? new Date(fecha).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" }) : "Sin registrar";

export default function DetalleSugerencia() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sugerencia, setSugerencia] = useState(null);
    const [adicionales, setAdicionales] = useState({});
    const [aviso, setAviso] = useState("");
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");
    const [errorAccion, setErrorAccion] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [modal, setModal] = useState(false);
    const [recargar, setRecargar] = useState(0);

    // Consultar el detalle de la sugerencia
    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setError("");

        obtenerSugerenciaIA(id)
            .then(respuesta => { if (vigente) { setSugerencia(respuesta.sugerencia); setAdicionales(respuesta.datos_adicionales || {}); setAviso(respuesta.aviso || ""); } })
            .catch(e => { if (vigente) setError(e.message || "No se pudo consultar la sugerencia."); })
            .finally(() => { if (vigente) setCargando(false); });

        return () => { vigente = false; };
    }, [id, recargar]);

    // Abrir el formulario con los datos de la sugerencia
    const aceptar = async () => {
        if (procesando) return;
        setProcesando(true);
        setErrorAccion("");

        try {
            const respuesta = await aceptarSugerenciaIA(id);
            const ruta = respuesta.tipo === "planta" ? "/admin/plantas/crear" : "/admin/plagas/crear";

            navigate(ruta, {
                state: {
                    sugerencia: {
                        id: respuesta.sugerencia_id,
                        ...respuesta.datos,
                        ...adicionales
                    }
                }
            });
        } catch (e) {
            setErrorAccion(e.message || "No se pudo preparar la sugerencia.");
        } finally {
            setProcesando(false);
        }
    };

    // Confirmar el rechazo de la sugerencia
    const rechazar = async () => {
        if (procesando) return;
        setProcesando(true);
        setErrorAccion("");

        try {
            const respuesta = await rechazarSugerenciaIA(id);
            setSugerencia(respuesta.sugerencia);
            setMensaje(respuesta.mensaje);
            setModal(false);
        } catch (e) {
            setErrorAccion(e.message || "No se pudo rechazar la sugerencia.");
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) return (
        <div className="space-y-5">
            <div className="h-6 w-40 animate-pulse rounded-lg bg-pale" />
            <div className="h-48 animate-pulse rounded-florae bg-pale" />
            <div className="h-64 animate-pulse rounded-florae bg-pale" />
        </div>
    );

    if (error || !sugerencia) return (
        <div className="space-y-5">
            <Link to="/admin/sugerencias" className="flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={19} /> Volver a sugerencias</Link>
            <div className="flex flex-col items-center gap-4 rounded-florae border border-border bg-surface p-12 text-center">
                <AlertCircle size={40} className="text-danger" />
                <p className="text-danger">{error || "La sugerencia no existe."}</p>
                <button onClick={() => setRecargar(v => v + 1)} className="rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white">Reintentar</button>
            </div>
        </div>
    );

    const esPlanta = sugerencia.tipo === "planta";
    const Icono = esPlanta ? Sprout : Bug;
    const estado = estados[sugerencia.estado] || { nombre: sugerencia.estado, estilo: "bg-soft text-secondary", icono: Info };
    const IconoEstado = estado.icono;
    const pendiente = sugerencia.estado === "pendiente";

    return (
        <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
            <Link to="/admin/sugerencias" className="flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={19} /> Volver a sugerencias</Link>

            {/* Información principal */}
            <section className="rounded-florae border border-border bg-surface p-6 shadow-florae">
                <div className="flex flex-wrap items-center gap-5">
                    <div className={`flex h-24 w-24 items-center justify-center rounded-3xl ${esPlanta ? "bg-pale text-forest" : "bg-danger-light text-danger"}`}><Icono size={46} strokeWidth={1.5} /></div>

                    <div className="min-w-0 flex-1">
                        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary"><Sparkles size={16} /> Sugerencia de IA #{sugerencia.id}</p>
                        <h1 className="font-lora text-3xl font-bold text-forest-dark">{sugerencia.nombre_comun}</h1>
                        <p className="mt-1 italic text-secondary">{sugerencia.nombre_cientifico || "Nombre científico sin identificar"}</p>
                        <span className="mt-3 inline-block rounded-full bg-soft px-3 py-1 text-xs font-bold capitalize text-forest">{sugerencia.tipo}</span>
                    </div>

                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${estado.estilo}`}><IconoEstado size={17} />{estado.nombre}</span>
                </div>
            </section>

            {mensaje && <p role="status" className="flex items-center gap-2 rounded-xl bg-success-light p-4 text-sm text-success"><CheckCircle2 size={20} />{mensaje}</p>}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Descripción de la especie */}
                <section className="rounded-florae border border-border bg-surface p-6 shadow-florae lg:col-span-2">
                    <h2 className="flex items-center gap-2 font-lora text-xl font-bold text-forest-dark"><Sparkles size={22} className="text-primary" /> Información sugerida</h2>
                    <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-secondary">{sugerencia.descripcion || "El asistente no proporcionó una descripción."}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {(esPlanta ? [["origen", "Origen"], ["tipo", "Categoría"], ["clima", "Clima"], ["size", "Tamaño"]] : Array.from({ length: 4 }, (_, i) => [`sintoma_${i + 1}`, `Síntoma ${i + 1}`])).map(([campo, nombre]) => <div key={campo} className="rounded-xl bg-soft p-4"><p className="text-xs text-secondary">{nombre}</p><p className="mt-1 text-sm font-semibold text-forest-dark">{adicionales[campo] || "Sin información sugerida"}</p></div>)}
                    </div>
                    {esPlanta && adicionales.cuidados?.length > 0 && <div className="mt-6 space-y-3"><h3 className="font-lora text-lg font-bold text-forest-dark">Cuidados sugeridos</h3><div className="grid gap-3 sm:grid-cols-2">{adicionales.cuidados.map(c => <div key={c.tipo} className="rounded-xl border border-border bg-soft p-4"><h4 className="font-bold text-forest">{c.tipo}</h4><p className="mt-2 text-sm text-secondary">{c.descripcion}</p><p className="mt-2 text-xs text-secondary">{c.frecuencia_dias ? `Cada ${c.frecuencia_dias} días` : "Sin frecuencia fija"}</p></div>)}</div></div>}
                    {aviso && <p role="status" className="mt-4 rounded-xl bg-warning-light p-3 text-sm text-warning">{aviso}</p>}

                    <div className="mt-6 flex gap-3 rounded-xl bg-pale p-4 text-sm leading-6 text-forest">
                        <Info size={21} className="shrink-0" />
                        <p>Esta información fue generada por inteligencia artificial. Verifica su exactitud antes de incorporarla al catálogo de Florae.</p>
                    </div>
                </section>

                {/* Datos de revisión */}
                <section className="space-y-5 rounded-florae border border-border bg-surface p-6 shadow-florae">
                    <h2 className="font-lora text-xl font-bold text-forest-dark">Datos de revisión</h2>

                    <div className="flex gap-3">
                        <CalendarDays size={21} className="shrink-0 text-primary" />
                        <div><p className="text-xs text-secondary">Fecha de registro</p><p className="mt-1 text-sm font-semibold text-forest-dark">{formatoFecha(sugerencia.created_at)}</p></div>
                    </div>

                    <div className="flex gap-3">
                        <ShieldCheck size={21} className="shrink-0 text-primary" />
                        <div><p className="text-xs text-secondary">Administrador responsable</p><p className="mt-1 text-sm font-semibold text-forest-dark">{pendiente ? "Pendiente de revisión" : sugerencia.administrador?.nombre || "No disponible"}</p></div>
                    </div>

                    <div className="flex gap-3">
                        <Clock size={21} className="shrink-0 text-primary" />
                        <div><p className="text-xs text-secondary">Fecha de revisión</p><p className="mt-1 text-sm font-semibold text-forest-dark">{formatoFecha(sugerencia.fecha_revision)}</p></div>
                    </div>
                    <div><p className="text-xs text-secondary">Última actualización</p><p className="mt-1 text-sm font-semibold text-forest-dark">{formatoFecha(sugerencia.updated_at)}</p></div>
                </section>
            </div>

            {/* Acciones de revisión */}
            <section className="rounded-florae border border-border bg-surface p-6 shadow-florae">
                <h2 className="font-lora text-xl font-bold text-forest-dark">Gestionar sugerencia</h2>

                {pendiente ? (
                    <>
                        <p className="mt-3 text-sm leading-6 text-secondary">Si aceptas esta sugerencia, se abrirá el formulario de registro de {esPlanta ? "plantas" : "plagas"} con la información precargada. Podrás editarla y completar los datos faltantes antes de guardar.</p>

                        {errorAccion && !modal && <p role="alert" className="mt-4 rounded-xl bg-danger-light p-4 text-sm text-danger">{errorAccion}</p>}

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button disabled={procesando} onClick={() => { setErrorAccion(""); setModal(true); }} className="flex items-center gap-2 rounded-xl border border-danger px-5 py-3 text-sm font-bold text-danger transition hover:bg-danger-light disabled:opacity-50"><XCircle size={19} /> Rechazar sugerencia</button>

                            <button disabled={procesando} onClick={aceptar} className="flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-dark disabled:opacity-50">
                                {procesando && !modal ? <LoaderCircle size={19} className="animate-spin" /> : <CheckCircle2 size={19} />}
                                {procesando && !modal ? "Preparando..." : "Aceptar sugerencia"}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={`mt-4 flex items-center gap-3 rounded-xl p-4 text-sm ${estado.estilo}`}><IconoEstado size={22} />Esta sugerencia ya fue {sugerencia.estado} y no requiere otra revisión.</div>
                )}
            </section>

            {/* Modal de rechazo */}
            {modal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-rechazo" className="w-full max-w-md space-y-5 rounded-florae bg-surface p-7 shadow-xl">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-light text-danger"><XCircle size={32} /></div>

                        <h2 id="titulo-rechazo" className="text-center font-lora text-2xl font-bold text-forest-dark">¿Rechazar sugerencia?</h2>

                        <p className="text-center text-sm leading-6 text-secondary">La sugerencia de <strong>{sugerencia.nombre_comun}</strong> será marcada como rechazada. No se agregará al catálogo y no podrás cambiar esta decisión desde el panel.</p>

                        {errorAccion && <p role="alert" className="rounded-xl bg-danger-light p-3 text-sm text-danger">{errorAccion}</p>}

                        <div className="flex justify-end gap-3">
                            <button disabled={procesando} onClick={() => { setModal(false); setErrorAccion(""); }} className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-secondary">Cancelar</button>
                            <button disabled={procesando} onClick={rechazar} className="flex items-center gap-2 rounded-xl bg-danger px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{procesando && <LoaderCircle size={18} className="animate-spin" />}{procesando ? "Rechazando..." : "Confirmar rechazo"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}