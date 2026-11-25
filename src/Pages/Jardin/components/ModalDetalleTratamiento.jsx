import { useEffect, useState } from "react";
import {
    CalendarDays, Clock3, FlaskConical, Bug, X, Pill,
    Plus, Trash2, Droplets, ClipboardList, LoaderCircle,
} from "lucide-react";
import {
    obtenerEstadoTratamiento,
    obtenerMedicamentosAplicados,
    retirarMedicamentoAplicado,
} from "../../../services/api";
import ModalAgregarMedicamento from "./ModalAgregarMedicamento";

const mostrarFecha = (valor) => {
    if (!valor) return "Sin fecha";
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(valor)
        ? new Date(`${valor}T12:00:00-05:00`)
        : new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "Sin fecha";
    return new Intl.DateTimeFormat("es-CO", {
        day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota",
    }).format(fecha);
};

const obtenerPasos = (tratamiento) => {
    const pasos = Array.from({ length: 12 }, (_, indice) => tratamiento?.[`paso_${indice + 1}`])
        .filter((paso) => typeof paso === "string" && paso.trim());
    if (pasos.length) return pasos;
    return Array.isArray(tratamiento?.pasos)
        ? tratamiento.pasos.map((paso) => typeof paso === "string" ? paso : paso?.descripcion || paso?.nombre || "").filter(Boolean)
        : [];
};

function ModalDetalleTratamiento({ tratamiento, plaga, onCerrar }) {
    const [medicamentos, setMedicamentos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [mostrarAgregar, setMostrarAgregar] = useState(false);
    const [eliminando, setEliminando] = useState(null);
    const aplicacionId = tratamiento?.id;

    const cargarMedicamentos = async () => {
        if (!aplicacionId) return;
        try {
            setCargando(true);
            setError("");
            const respuesta = await obtenerMedicamentosAplicados(aplicacionId);
            setMedicamentos(respuesta.medicamentos || []);
        } catch (err) {
            setError(err.message || "No se pudieron consultar los medicamentos.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (!aplicacionId) {
            setMedicamentos([]);
            return;
        }
        let activo = true;
        setCargando(true);
        setError("");
        obtenerMedicamentosAplicados(aplicacionId)
            .then((respuesta) => { if (activo) setMedicamentos(respuesta.medicamentos || []); })
            .catch((err) => { if (activo) setError(err.message || "No se pudieron consultar los medicamentos."); })
            .finally(() => { if (activo) setCargando(false); });
        return () => { activo = false; };
    }, [aplicacionId]);

    useEffect(() => {
        if (!tratamiento) return;
        const cerrar = (evento) => {
            if (evento.key === "Escape" && !mostrarAgregar) onCerrar?.();
        };
        window.addEventListener("keydown", cerrar);
        return () => window.removeEventListener("keydown", cerrar);
    }, [tratamiento, mostrarAgregar, onCerrar]);

    const eliminarMedicamento = async (registroId) => {
        if (!window.confirm("¿Quieres retirar este medicamento del tratamiento?")) return;
        try {
            setEliminando(registroId);
            setError("");
            await retirarMedicamentoAplicado(registroId);
            await cargarMedicamentos();
        } catch (err) {
            setError(err.message || "No se pudo retirar el medicamento.");
        } finally {
            setEliminando(null);
        }
    };

    if (!tratamiento) return null;

    const catalogo = tratamiento.tratamiento || tratamiento.treatment || {};
    const nombre = catalogo.nombre || tratamiento.nombre || "Tratamiento registrado";
    const nombrePlaga =
        plaga?.plaga?.nombre_comun ||
        tratamiento.historial_plaga?.plaga_jardin?.plaga?.nombre_comun ||
        "Plaga asociada";
    const pasos = obtenerPasos(catalogo);
    const estado = obtenerEstadoTratamiento(tratamiento.fecha_fin);
    const finalizado = estado === "Finalizado";

    return (
        <>
            <div
                className="fixed inset-0 z-[80] flex items-center justify-center bg-[#17251B]/65 p-3 backdrop-blur-[3px] sm:p-5"
                onMouseDown={(evento) => {
                    if (evento.target === evento.currentTarget && !mostrarAgregar) onCerrar?.();
                }}
            >
                <div role="dialog" aria-modal="true" aria-labelledby="detalle-tratamiento-titulo" className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
                    <header className="flex items-start justify-between gap-4 border-b border-[#E8EDE4] px-5 py-5 sm:px-8">
                        <div className="min-w-0">
                            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#89AB78]">Mi jardín · Tratamiento registrado</p>
                            <h2 id="detalle-tratamiento-titulo" className="mt-2 font-serif text-[25px] font-bold leading-tight text-[#3F5D3F] sm:text-[30px]">{nombre}</h2>
                            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#667465]"><Bug size={16} className="text-[#7EA66E]" /> Para: {nombrePlaga}</p>
                            <div className="mt-4 h-1 w-16 rounded-full bg-[#89AB78]" />
                        </div>
                        <button type="button" onClick={onCerrar} aria-label="Cerrar detalle" className="rounded-xl p-2 text-[#6B7968] hover:bg-[#F1F5EE]"><X size={21} /></button>
                    </header>

                    <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-8">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DFE9D9] bg-[#F6FAF3] text-[#7EA66E]"><FlaskConical size={25} /></span>
                            {catalogo.duracion_dias != null && (
                                <span className="inline-flex items-center gap-2 text-sm font-extrabold text-[#557B50]"><Clock3 size={17} /> {catalogo.duracion_dias} días de duración</span>
                            )}
                            <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${finalizado ? "bg-[#EDF0EB] text-[#637363]" : "bg-[#EAF3E6] text-[#578351]"}`}>{estado}</span>
                        </div>

                        <p className="border-l-4 border-[#89AB78] pl-4 text-[15px] leading-7 text-[#586A59]">
                            {catalogo.descripcion || tratamiento.descripcion || "No hay descripción disponible."}
                        </p>

                        <section>
                            <h3 className="font-serif text-xl font-bold text-[#3F5D3F]">Procedimiento</h3>
                            <div className="mt-2 h-1 w-12 rounded-full bg-[#89AB78]" />
                            {pasos.length ? (
                                <ol className="mt-4 space-y-3">
                                    {pasos.map((paso, indice) => (
                                        <li key={indice} className="flex gap-3 rounded-xl border border-[#DDE9D7] bg-[#F9FCF7] p-4">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#89AB78] text-sm font-extrabold text-white">{indice + 1}</span>
                                            <p className="pt-1 text-sm leading-6 text-[#586A59]">{paso}</p>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p className="mt-3 text-sm text-[#667465]">No hay pasos registrados para este tratamiento.</p>
                            )}
                        </section>

                        <section>
                            <h3 className="font-serif text-xl font-bold text-[#3F5D3F]">Información de la aplicación</h3>
                            <div className="mt-2 h-1 w-12 rounded-full bg-[#89AB78]" />
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-[#DDE9D7] bg-[#F6FAF3] p-5 shadow-sm">
                                    <div className="flex items-center gap-2 text-[#557B50]"><CalendarDays size={19} /><h4 className="font-serif text-lg font-bold">Fecha de inicio</h4></div>
                                    <p className="mt-3 text-sm leading-7 text-[#586A59]">{mostrarFecha(tratamiento.fecha_inicio)}</p>
                                </div>
                                <div className="rounded-2xl border border-[#DDE9D7] bg-[#F6FAF3] p-5 shadow-sm">
                                    <div className="flex items-center gap-2 text-[#557B50]"><CalendarDays size={19} /><h4 className="font-serif text-lg font-bold">Fecha de finalización</h4></div>
                                    <p className="mt-3 text-sm leading-7 text-[#586A59]">{mostrarFecha(tratamiento.fecha_fin)}</p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-[#DDE9D7] bg-[#F8FBF6] p-5">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#89AB78]">Productos utilizados</p>
                                    <h3 className="mt-1 font-serif text-xl font-bold text-[#3F5D3F]">Medicamentos</h3>
                                </div>
                                <button type="button" onClick={() => setMostrarAgregar(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#6F9964] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#557E4F]"><Plus size={17} /> Agregar medicamento</button>
                            </div>

                            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

                            {cargando ? (
                                <div className="mt-5 space-y-3">{[1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-[#E8EFE3]" />)}</div>
                            ) : medicamentos.length ? (
                                <div className="mt-5 space-y-4">
                                    {medicamentos.map((registro) => {
                                        const medicamento = registro.medicamento || {};
                                        return (
                                            <article key={registro.id} className="rounded-[22px] border border-[#DDE7D8] bg-white p-5 shadow-sm">
                                                <div className="flex items-start gap-3">
                                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3E6] text-[#7EA66E]"><Pill size={24} /></span>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-serif text-lg font-bold leading-snug text-[#3F5D3F]">{medicamento.nombre}</h4>
                                                        <p className="mt-2 text-sm leading-6 text-[#657365]">{medicamento.descripcion || "Sin descripción disponible."}</p>
                                                    </div>
                                                    <button type="button" onClick={() => eliminarMedicamento(registro.id)} disabled={eliminando === registro.id} aria-label={`Retirar ${medicamento.nombre}`} className="rounded-xl p-2 text-[#B66A65] transition hover:bg-red-50 disabled:opacity-50">
                                                        {eliminando === registro.id ? <LoaderCircle size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                    </button>
                                                </div>
                                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                                    <div className="rounded-2xl border border-[#DDE9D7] bg-[#F6FAF3] p-4">
                                                        <div className="flex items-center gap-2 text-[#557B50]"><Droplets size={18} /><h5 className="font-serif text-lg font-bold">Dosis</h5></div>
                                                        <p className="mt-2 text-sm leading-6 text-[#586A59]">{medicamento.dosis || "No indicada"}</p>
                                                    </div>
                                                    <div className="rounded-2xl border border-[#DDE9D7] bg-[#F6FAF3] p-4">
                                                        <div className="flex items-center gap-2 text-[#557B50]"><Clock3 size={18} /><h5 className="font-serif text-lg font-bold">Frecuencia</h5></div>
                                                        <p className="mt-2 text-sm leading-6 text-[#586A59]">{medicamento.frecuencia || "No indicada"}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 rounded-2xl border border-[#DDE9D7] bg-[#F6FAF3] p-4">
                                                    <div className="flex items-center gap-2 text-[#557B50]"><ClipboardList size={18} /><h5 className="font-serif text-lg font-bold">Instrucciones de uso</h5></div>
                                                    <p className="mt-2 text-sm leading-6 text-[#586A59]">{medicamento.instrucciones || "No hay instrucciones registradas."}</p>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="mt-5 rounded-2xl border border-dashed border-[#C9DBC2] bg-white px-5 py-9 text-center">
                                    <Pill size={30} className="mx-auto text-[#89AB78]" />
                                    <p className="mt-3 font-bold text-[#3F5D3F]">Sin medicamentos registrados</p>
                                    <p className="mt-1 text-sm text-[#6B7868]">Puedes agregar medicamentos relacionados con este tratamiento.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    <footer className="border-t border-[#E8EDE4] px-5 py-4 text-right sm:px-8">
                        <button type="button" onClick={onCerrar} className="rounded-xl border border-[#C9D9C2] px-6 py-2.5 text-sm font-extrabold text-[#4C7550] hover:bg-[#F2F7EF]">Cerrar</button>
                    </footer>
                </div>
            </div>
            {mostrarAgregar && (
                <ModalAgregarMedicamento
                    aplicacion={tratamiento}
                    registrados={medicamentos}
                    onCerrar={() => setMostrarAgregar(false)}
                    onGuardado={cargarMedicamentos}
                />
            )}
        </>
    );
}

export default ModalDetalleTratamiento;
