import { useEffect, useState } from "react";
import {
    ArrowLeft, CalendarDays, Check, ChevronRight, Clock3,
    FlaskConical, LoaderCircle, X, Plus,
} from "lucide-react";

const pasosDe = (tratamiento) => {
    const pasos = [];
    for (let i = 1; i <= 12; i++) {
        const valor = tratamiento?.[`paso_${i}`];
        if (typeof valor === "string" && valor.trim()) pasos.push(valor.trim());
    }
    if (!pasos.length && Array.isArray(tratamiento?.pasos)) {
        return tratamiento.pasos
            .map((paso) => typeof paso === "string" ? paso : paso?.descripcion || paso?.nombre || "")
            .filter(Boolean);
    }
    return pasos;
};

function ModalAgregarTratamiento({
    plaga,
    tratamientos = [],
    cargando = false,
    guardando = false,
    error = "",
    onCerrar,
    onAgregar,
}) {
    const [seleccionado, setSeleccionado] = useState(null);

    useEffect(() => {
        setSeleccionado(null);
    }, [plaga?.id]);

    useEffect(() => {
        if (!plaga) return;
        const cerrar = (evento) => {
            if (evento.key === "Escape" && !guardando) onCerrar?.();
        };
        window.addEventListener("keydown", cerrar);
        return () => window.removeEventListener("keydown", cerrar);
    }, [plaga, guardando, onCerrar]);

    if (!plaga) return null;

    const nombrePlaga =
        plaga.plaga?.nombre_comun ||
        plaga.plague?.nombre_comun ||
        plaga.nombre_comun ||
        "esta plaga";
    const pasos = pasosDe(seleccionado);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17251B]/65 p-3 backdrop-blur-[3px] sm:p-5"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget && !guardando) onCerrar?.();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-agregar-tratamiento"
                className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
            >
                <header className="flex items-center justify-between border-b border-[#E8EDE4] px-5 py-4 sm:px-8">
                    <button
                        type="button"
                        onClick={seleccionado ? () => setSeleccionado(null) : onCerrar}
                        disabled={guardando}
                        aria-label={seleccionado ? "Volver a tratamientos" : "Cerrar"}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C8D8C0] text-[#4D7950] transition hover:bg-[#EEF5E9] disabled:opacity-50"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <span className="text-center text-xs font-extrabold uppercase tracking-[0.18em] text-[#86A77A]">
                        Mi jardín · Tratamientos
                    </span>
                    <button
                        type="button"
                        onClick={onCerrar}
                        disabled={guardando}
                        aria-label="Cerrar"
                        className="rounded-xl p-2 text-[#6B7968] hover:bg-[#F1F5EE] disabled:opacity-50"
                    >
                        <X size={21} />
                    </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
                    {!seleccionado ? (
                        <>
                            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#89AB78]">
                                Protección de tu planta
                            </p>
                            <h2
                                id="titulo-agregar-tratamiento"
                                className="mt-2 font-serif text-[25px] font-bold leading-tight text-[#3F5D3F] sm:text-[30px]"
                            >
                                Tratamientos para {nombrePlaga}
                            </h2>
                            <p className="mt-2 max-w-lg text-[15px] leading-7 text-[#667465]">
                                Explora los tratamientos disponibles y elige el que deseas aplicar a tu planta.
                            </p>
                            <div className="mt-5 h-1 w-16 rounded-full bg-[#89AB78]" />

                            {error && (
                                <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                                    {error}
                                </p>
                            )}

                            {cargando ? (
                                <div className="mt-7 space-y-4">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="h-28 animate-pulse rounded-2xl bg-[#EDF3E9]" />
                                    ))}
                                </div>
                            ) : tratamientos.length > 0 ? (
                                <div className="mt-7 space-y-4">
                                    {tratamientos.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setSeleccionado(item)}
                                            className="group flex w-full items-center gap-4 rounded-[22px] border border-[#DDE7D8] bg-[#FCFDFB] p-4 text-left shadow-[0_3px_12px_rgba(63,93,63,0.04)] transition hover:-translate-y-0.5 hover:border-[#89AB78] hover:shadow-md sm:p-5"
                                        >
                                            <span className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-2xl border border-[#DFE9D9] bg-white text-[#7EA66E] shadow-sm sm:h-[88px] sm:w-[88px]">
                                                <FlaskConical size={34} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block font-serif text-lg font-bold leading-snug text-[#3F5D3F]">
                                                    {item.nombre}
                                                </span>
                                                <span className="mt-2 block line-clamp-2 text-sm leading-6 text-[#657365]">
                                                    {item.descripcion || "Sin descripción disponible."}
                                                </span>
                                                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#EAF3E6] px-3 py-1 text-xs font-extrabold text-[#5B8755]">
                                                    <Clock3 size={13} />
                                                    {item.duracion_dias ? `${item.duracion_dias} días` : "Duración no indicada"}
                                                </span>
                                            </span>
                                            <ChevronRight size={22} className="shrink-0 text-[#87A77D] transition group-hover:translate-x-1" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-7 rounded-2xl border border-dashed border-[#C9DBC2] bg-[#F7FAF5] px-5 py-10 text-center">
                                    <FlaskConical size={32} className="mx-auto text-[#89AB78]" />
                                    <p className="mt-3 font-bold text-[#3F5D3F]">No hay tratamientos disponibles</p>
                                    <p className="mt-1 text-sm text-[#6B7868]">Esta plaga no tiene tratamientos activos en el catálogo.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#89AB78]">
                                Ficha del tratamiento
                            </p>
                            <div className="mt-4 flex items-center gap-5">
                                <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-[#D6E5CF] bg-white text-[#7EA66E] shadow-sm">
                                    <FlaskConical size={42} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h2
                                        id="titulo-agregar-tratamiento"
                                        className="font-serif text-[26px] font-bold leading-tight text-[#3F5D3F] sm:text-[30px]"
                                    >
                                        {seleccionado.nombre}
                                    </h2>
                                    <span className="mt-3 inline-flex rounded-full bg-[#EAF3E6] px-4 py-1.5 text-xs font-extrabold text-[#578351]">
                                        Disponible para esta plaga
                                    </span>
                                </div>
                            </div>
                            <p className="mt-6 border-l-4 border-[#89AB78] pl-4 text-[15px] leading-7 text-[#586A59]">
                                {seleccionado.descripcion || "Sin descripción disponible."}
                            </p>
                            <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-[#DDE9D7] bg-[#F6FAF3] p-5 shadow-sm">
                                    <div className="flex items-center gap-2 text-[#557B50]">
                                        <CalendarDays size={19} />
                                        <h3 className="font-serif text-lg font-bold">Duración</h3>
                                    </div>
                                    <p className="mt-3 text-sm leading-7 text-[#586A59]">
                                        {seleccionado.duracion_dias ? `${seleccionado.duracion_dias} días` : "No indicada"}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#DDE9D7] bg-[#F6FAF3] p-5 shadow-sm">
                                    <div className="flex items-center gap-2 text-[#557B50]">
                                        <Check size={19} />
                                        <h3 className="font-serif text-lg font-bold">Pasos</h3>
                                    </div>
                                    <p className="mt-3 text-sm leading-7 text-[#586A59]">{pasos.length} pasos registrados</p>
                                </div>
                            </div>
                            <section className="mt-7">
                                <h3 className="font-serif text-xl font-bold text-[#3F5D3F]">Procedimiento</h3>
                                <div className="mt-2 h-1 w-12 rounded-full bg-[#89AB78]" />
                                {pasos.length > 0 ? (
                                    <ol className="mt-4 space-y-3">
                                        {pasos.map((paso, indice) => (
                                            <li key={indice} className="flex gap-3 rounded-xl border border-[#DDE9D7] bg-[#F9FCF7] p-4">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#89AB78] text-sm font-bold text-white">
                                                    {indice + 1}
                                                </span>
                                                <p className="pt-1 text-sm leading-6 text-[#586A59]">{paso}</p>
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="mt-3 text-sm text-[#667465]">No hay pasos registrados para este tratamiento.</p>
                                )}
                            </section>
                            <p className="mt-6 text-xs leading-6 text-[#879084]">
                                La fecha de inicio se registrará automáticamente. Laravel calculará la fecha de finalización según la duración del tratamiento.
                            </p>
                            {error && (
                                <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
                            )}
                            <div className="mt-7 flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSeleccionado(null)}
                                    disabled={guardando}
                                    className="rounded-xl border border-[#BFD1B8] bg-white px-6 py-3 text-sm font-extrabold text-[#4C7550] transition hover:bg-[#F2F7EF] disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onAgregar?.(seleccionado)}
                                    disabled={guardando}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#6F9964] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#557E4F] disabled:opacity-50"
                                >
                                    {guardando ? <LoaderCircle size={18} className="animate-spin" /> : <Plus size={18} />}
                                    {guardando ? "Agregando..." : "Agregar tratamiento"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
                {!seleccionado && (
                    <footer className="border-t border-[#E8EDE4] px-5 py-4 text-right sm:px-8">
                        <button
                            type="button"
                            onClick={onCerrar}
                            disabled={guardando}
                            className="rounded-xl border border-[#C9D9C2] px-6 py-2.5 text-sm font-extrabold text-[#4C7550] hover:bg-[#F2F7EF] disabled:opacity-50"
                        >
                            Cerrar
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
}

export default ModalAgregarTratamiento;
