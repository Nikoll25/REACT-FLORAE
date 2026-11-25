import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, CheckCircle2, Pill, X, Droplets, Clock3, ClipboardList, Plus } from "lucide-react";
import { obtenerMedicamentosTratamiento, registrarMedicamentosAplicados, obtenerImagen } from "../../../services/api";

function ModalAgregarMedicamento({ aplicacion, registrados = [], onCerrar, onGuardado }) {
    const [medicamentos, setMedicamentos] = useState([]);
    const [seleccionado, setSeleccionado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [idsAgregados, setIdsAgregados] = useState([]);
    const tratamientoId = aplicacion?.tratamiento_id;

    useEffect(() => {
        if (!aplicacion) return;
        let activo = true;
        const cargar = async () => {
            try {
                setCargando(true);
                setError("");
                const datos = await obtenerMedicamentosTratamiento(tratamientoId);
                if (activo) setMedicamentos(datos);
            } catch (err) {
                if (activo) setError(err.message);
            } finally {
                if (activo) setCargando(false);
            }
        };
        cargar();
        return () => { activo = false; };
    }, [aplicacion?.id, tratamientoId]);

    if (!aplicacion) return null;

    const disponibles = medicamentos.filter((medicamento) =>
        !registrados.some((registro) => String(registro.medicamento_id) === String(medicamento.id)) &&
        !idsAgregados.includes(medicamento.id)
    );

    const imagenMedicamento = (medicamento) => {
        if (!medicamento.imagen) return null;
        return obtenerImagen(medicamento.imagen);
    };

    const volver = () => {
        setSeleccionado(null);
        setError("");
    };

    const agregar = async () => {
        if (!seleccionado || guardando) return;
        try {
            setGuardando(true);
            setError("");
            await registrarMedicamentosAplicados(aplicacion.id, [seleccionado.id]);
            setIdsAgregados((actuales) => [...actuales, seleccionado.id]);
            setMensaje(`${seleccionado.nombre} agregado correctamente.`);
            setSeleccionado(null);
            await onGuardado?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17251B]/65 p-3 backdrop-blur-[3px] sm:p-5" onMouseDown={(e) => { if (e.target === e.currentTarget && !guardando) onCerrar(); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="titulo-medicamentos" className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#E8EDE4] px-5 py-4 sm:px-8">
                    <button type="button" onClick={seleccionado ? volver : onCerrar} disabled={guardando} aria-label="Volver" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C8D8C0] text-[#4D7950] transition hover:bg-[#EEF5E9] disabled:opacity-50"><ArrowLeft size={22} /></button>
                    <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#86A77A]">Mi jardín · Tratamientos</span>
                    <button type="button" onClick={onCerrar} disabled={guardando} aria-label="Cerrar" className="rounded-xl p-2 text-[#6B7968] hover:bg-[#F1F5EE] disabled:opacity-50"><X size={21} /></button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
                    {!seleccionado ? (
                        <>
                            <h2 id="titulo-medicamentos" className="font-serif text-[25px] font-bold leading-tight text-[#3F5D3F] sm:text-[30px]">Medicamentos recomendados</h2>
                            <p className="mt-2 max-w-lg text-[15px] leading-7 text-[#667465]">Explora los medicamentos relacionados con este tratamiento y elige el que deseas utilizar.</p>
                            <div className="mt-5 h-1 w-16 rounded-full bg-[#89AB78]" />

                            {mensaje && <div role="status" className="mt-5 flex items-center gap-3 rounded-2xl border border-[#C8DFC0] bg-[#F0F8ED] px-4 py-3 text-sm font-bold text-[#3E7848]"><CheckCircle2 size={21} className="shrink-0" />{mensaje}</div>}
                            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

                            {cargando ? (
                                <div className="mt-7 space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-[#EDF3E9]" />)}</div>
                            ) : disponibles.length ? (
                                <div className="mt-7 space-y-4">
                                    {disponibles.map((medicamento) => (
                                        <button key={medicamento.id} type="button" onClick={() => { setSeleccionado(medicamento); setError(""); setMensaje(""); }} className="group flex w-full items-center gap-4 rounded-[22px] border border-[#DDE7D8] bg-[#FCFDFB] p-4 text-left shadow-[0_3px_12px_rgba(63,93,63,0.04)] transition hover:-translate-y-0.5 hover:border-[#89AB78] hover:shadow-md sm:p-5">
                                            <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#DFE9D9] bg-white shadow-sm">
                                                {imagenMedicamento(medicamento) ? <img src={imagenMedicamento(medicamento)} alt={medicamento.nombre} className="h-full w-full object-contain p-2" /> : <Pill size={34} className="text-[#7EA66E]" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-serif text-lg font-bold leading-snug text-[#3F5D3F]">{medicamento.nombre}</h3>
                                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#657365]">{medicamento.descripcion}</p>
                                                <span className="mt-3 inline-flex rounded-full bg-[#EAF3E6] px-3 py-1 text-xs font-extrabold text-[#5B8755]">Ver información</span>
                                            </div>
                                            <ChevronRight size={22} className="shrink-0 text-[#87A77D] transition group-hover:translate-x-1" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-7 rounded-2xl border border-dashed border-[#C9DBC2] bg-[#F7FAF5] px-5 py-10 text-center"><Pill size={32} className="mx-auto text-[#89AB78]" /><p className="mt-3 font-bold text-[#3F5D3F]">No hay más medicamentos disponibles</p><p className="mt-1 text-sm text-[#6B7868]">Ya registraste los disponibles o este tratamiento no tiene medicamentos asociados.</p></div>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#89AB78]">Ficha del medicamento</p>
                            <div className="mt-4 flex flex-wrap items-center gap-5">
                                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#D6E5CF] bg-white shadow-sm">
                                    {imagenMedicamento(seleccionado) ? <img src={imagenMedicamento(seleccionado)} alt={seleccionado.nombre} className="h-full w-full object-contain p-2" /> : <Pill size={43} className="text-[#7EA66E]" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 id="titulo-medicamentos" className="font-serif text-[26px] font-bold leading-tight text-[#3F5D3F] sm:text-[30px]">{seleccionado.nombre}</h2>
                                    <span className="mt-3 inline-flex rounded-full bg-[#EAF3E6] px-4 py-1.5 text-xs font-extrabold text-[#578351]">Disponible para este tratamiento</span>
                                </div>
                            </div>
                            <p className="mt-6 border-l-4 border-[#89AB78] pl-4 text-[15px] leading-7 text-[#586A59]">{seleccionado.descripcion}</p>
                            <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-[#DDE9D7] bg-[#F6FAF3] p-5 shadow-sm">
                                    <div className="flex items-center gap-2 text-[#557B50]"><Droplets size={19} /><h3 className="font-serif text-lg font-bold">Dosis</h3></div>
                                    <p className="mt-3 text-sm leading-7 text-[#586A59]">{seleccionado.dosis}</p>
                                </div>
                                <div className="rounded-2xl border border-[#DDE9D7] bg-[#F6FAF3] p-5 shadow-sm">
                                    <div className="flex items-center gap-2 text-[#557B50]"><Clock3 size={19} /><h3 className="font-serif text-lg font-bold">Frecuencia</h3></div>
                                    <p className="mt-3 text-sm leading-7 text-[#586A59]">{seleccionado.frecuencia}</p>
                                </div>
                            </div>
                            <div className="mt-4 rounded-2xl border border-[#DDE9D7] bg-[#F6FAF3] p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-[#557B50]"><ClipboardList size={19} /><h3 className="font-serif text-lg font-bold">Instrucciones de uso</h3></div>
                                <p className="mt-3 text-sm leading-7 text-[#586A59]">{seleccionado.instrucciones}</p>
                            </div>
                            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
                            <div className="mt-7 flex flex-wrap justify-end gap-3">
                                <button type="button" onClick={volver} disabled={guardando} className="rounded-xl border border-[#BFD1B8] bg-white px-6 py-3 text-sm font-extrabold text-[#4C7550] transition hover:bg-[#F2F7EF] disabled:opacity-50">Cancelar</button>
                                <button type="button" onClick={agregar} disabled={guardando} className="inline-flex items-center gap-2 rounded-xl bg-[#6F9964] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#557E4F] disabled:opacity-50"><Plus size={18} />{guardando ? "Agregando..." : "Agregar medicamento"}</button>
                            </div>
                        </>
                    )}
                </div>
                {!seleccionado && <div className="border-t border-[#E8EDE4] px-5 py-4 text-right sm:px-8"><button type="button" onClick={onCerrar} className="rounded-xl border border-[#C9D9C2] px-6 py-2.5 text-sm font-extrabold text-[#4C7550] hover:bg-[#F2F7EF]">Cerrar</button></div>}
            </div>
        </div>
    );
}

export default ModalAgregarMedicamento;
