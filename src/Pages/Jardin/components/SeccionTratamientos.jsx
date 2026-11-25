import { useState } from "react";
import { CalendarDays, ChevronRight, Clock3, FlaskConical, Plus, Bug } from "lucide-react";
import { obtenerEstadoTratamiento } from "../../../services/api";
import ModalDetalleTratamiento from "./ModalDetalleTratamiento";

const erradicada = (estado) => ["erradicada", "erradicado"].includes(String(estado || "").toLowerCase().trim());

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

function SeccionTratamientos({ tratamientos = [], plagas = [], onAgregarTratamiento }) {
    const [seleccionado, setSeleccionado] = useState(null);
    const [seleccionandoPlaga, setSeleccionandoPlaga] = useState(false);
    const plagasActivas = plagas.filter((item) => !erradicada(item.estado));

    const nombrePlaga = (plaga) =>
        plaga?.plaga?.nombre_comun || plaga?.plague?.nombre_comun || plaga?.nombre_comun || "Plaga registrada";

    const agregar = () => {
        if (!onAgregarTratamiento || plagasActivas.length === 0) return;
        if (plagasActivas.length === 1) {
            onAgregarTratamiento(plagasActivas[0]);
            return;
        }
        setSeleccionandoPlaga(true);
    };

    return (
        <section className="mb-12 rounded-[24px] border border-[#E8EBDD] bg-white p-5 shadow-[0_4px_18px_rgba(63,93,63,0.05)] sm:p-8">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#89AB78]">Protección de tu planta</p>
                    <h2 className="mt-1 font-serif text-[25px] font-bold leading-tight text-[#3F5D3F] sm:text-[30px]">Tratamientos</h2>
                    <p className="mt-2 text-[15px] leading-7 text-[#667465]">Consulta los tratamientos aplicados y sus medicamentos.</p>
                    <div className="mt-4 h-1 w-16 rounded-full bg-[#89AB78]" />
                </div>
                <button
                    type="button"
                    onClick={agregar}
                    disabled={!plagasActivas.length || !onAgregarTratamiento}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#6F9964] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#557E4F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus size={18} /> Agregar tratamiento
                </button>
            </div>

            {!plagasActivas.length && (
                <p className="mb-5 rounded-xl bg-[#F6FAF3] px-4 py-3 text-sm leading-6 text-[#667465]">
                    Para agregar un tratamiento, primero debes tener una plaga activa registrada en esta planta.
                </p>
            )}

            {tratamientos.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    {tratamientos.map((item) => {
                        const catalogo = item.tratamiento || item.treatment || {};
                        const plaga = plagas.find((registro) =>
                            String(registro.id) === String(item.historial_plaga?.plaga_jardin_id)
                        );
                        const nombre = catalogo.nombre || item.nombre || "Tratamiento registrado";
                        const estado = obtenerEstadoTratamiento(item.fecha_fin);
                        const finalizado = estado === "Finalizado";
                        const plagaNombre =
                            item.historial_plaga?.plaga_jardin?.plaga?.nombre_comun ||
                            nombrePlaga(plaga);

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setSeleccionado({ tratamiento: item, plaga })}
                                className="group flex w-full items-start gap-4 rounded-[22px] border border-[#DDE7D8] bg-[#FCFDFB] p-5 text-left shadow-[0_3px_12px_rgba(63,93,63,0.04)] transition hover:-translate-y-0.5 hover:border-[#89AB78] hover:shadow-md"
                            >
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#DFE9D9] bg-white text-[#7EA66E] shadow-sm">
                                    <FlaskConical size={27} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-serif text-lg font-bold leading-snug text-[#3F5D3F]">{nombre}</span>
                                    <span className="mt-2 flex items-center gap-2 text-sm text-[#657365]"><Bug size={15} /> {plagaNombre}</span>
                                    <span className="mt-2 flex items-center gap-2 text-sm text-[#657365]"><CalendarDays size={15} /> Inicio: {mostrarFecha(item.fecha_inicio)}</span>
                                    <span className="mt-2 flex items-center gap-2 text-sm text-[#657365]"><Clock3 size={15} /> Fin: {mostrarFecha(item.fecha_fin)}</span>
                                    <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${finalizado ? "bg-[#EDF0EB] text-[#637363]" : "bg-[#EAF3E6] text-[#578351]"}`}>
                                        {estado}
                                    </span>
                                    <span className="mt-3 flex items-center gap-1 text-xs font-extrabold text-[#5B8755]">Ver detalles <ChevronRight size={15} /></span>
                                </span>
                                <ChevronRight size={21} className="mt-3 shrink-0 text-[#87A77D] transition group-hover:translate-x-1" />
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-[#C9DBC2] bg-[#F7FAF5] px-5 py-10 text-center">
                    <FlaskConical size={32} className="mx-auto text-[#89AB78]" />
                    <p className="mt-3 font-bold text-[#3F5D3F]">Todavía no hay tratamientos registrados</p>
                    <p className="mt-1 text-sm text-[#6B7868]">Cuando agregues uno, aparecerá aquí con sus fechas y medicamentos.</p>
                </div>
            )}

            {seleccionandoPlaga && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#17251B]/65 p-4 backdrop-blur-[3px]" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setSeleccionandoPlaga(false); }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="seleccionar-plaga-titulo" className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#89AB78]">Mi jardín · Tratamientos</p>
                        <h3 id="seleccionar-plaga-titulo" className="mt-2 font-serif text-[25px] font-bold text-[#3F5D3F]">Selecciona una plaga</h3>
                        <p className="mt-2 text-[15px] leading-7 text-[#667465]">Elige la plaga activa que deseas tratar.</p>
                        <div className="mt-5 space-y-3">
                            {plagasActivas.map((plaga) => (
                                <button
                                    key={plaga.id}
                                    type="button"
                                    onClick={() => { setSeleccionandoPlaga(false); onAgregarTratamiento?.(plaga); }}
                                    className="flex w-full items-center justify-between rounded-2xl border border-[#DDE7D8] bg-[#FCFDFB] px-4 py-4 text-left font-semibold text-[#3F5D3F] transition hover:border-[#89AB78] hover:bg-[#F6FAF3]"
                                >
                                    <span className="flex items-center gap-3"><Bug size={19} className="text-[#7EA66E]" /> {nombrePlaga(plaga)}</span>
                                    <ChevronRight size={20} className="text-[#87A77D]" />
                                </button>
                            ))}
                        </div>
                        <div className="mt-6 text-right">
                            <button type="button" onClick={() => setSeleccionandoPlaga(false)} className="rounded-xl border border-[#C9D9C2] px-6 py-2.5 text-sm font-extrabold text-[#4C7550] hover:bg-[#F2F7EF]">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {seleccionado && (
                <ModalDetalleTratamiento
                    tratamiento={seleccionado.tratamiento}
                    plaga={seleccionado.plaga}
                    onCerrar={() => setSeleccionado(null)}
                />
            )}
        </section>
    );
}

export default SeccionTratamientos;
