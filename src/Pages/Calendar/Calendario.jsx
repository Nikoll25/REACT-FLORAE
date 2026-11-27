
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import esLocale from "@fullcalendar/react/locales/es";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

import { obtenerImagen } from "../../services/api";

import useCalendario, {
    normalizar,
    fechaLocal,
    formatearFecha,
    nombreCuidado,
    obtenerEstado,
} from "./useCalendario";

import ModalResultado from "./ModalResultado";
import "./Calendario.css";

import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    Droplets,
    Flower2,
    Leaf,
    LoaderCircle,
    Send,
    Sprout,
    Sun,
    Thermometer,
} from "lucide-react";

const ZONA_HORARIA = "America/Bogota";

// Icono correspondiente a cada cuidado
function IconoCuidado({ tipo, size = 18 }) {
    const nombre = normalizar(tipo);

    if (nombre.includes("riego")) {
        return <Droplets size={size} />;
    }

    if (nombre.includes("fertiliz")) {
        return <Sprout size={size} />;
    }

    if (nombre.includes("luz")) {
        return <Sun size={size} />;
    }

    if (nombre.includes("temperatura")) {
        return <Thermometer size={size} />;
    }

    return <Leaf size={size} />;
}

// Colores de cada tipo de cuidado
const colorCuidado = (tipo) => {
    const nombre = normalizar(tipo);

    if (nombre.includes("riego")) {
        return {
            fondo: "#EAF5FD",
            texto: "#4189B8",
        };
    }

    if (nombre.includes("fertiliz")) {
        return {
            fondo: "#EAF2E3",
            texto: "#668C52",
        };
    }

    if (nombre.includes("luz")) {
        return {
            fondo: "#FFF5DE",
            texto: "#D59B36",
        };
    }

    return {
        fondo: "#F0EAF6",
        texto: "#9271A8",
    };
};

function Calendario() {
    const {
        calendarioRef,
        plantas,
        plantaSeleccionada,
        setPlantaSeleccionada,
        fechaSeleccionada,
        seleccionadas,
        setSeleccionadas,
        cargandoPlantas,
        cargandoActividades,
        enviando,
        mostrarPlantas,
        setMostrarPlantas,
        resultado,
        setResultado,
        error,
        eventos,
        tareasDelDia,
        tareasDisponibles,
        todasSeleccionadas,
        alternarTarea,
        alternarTodas,
        enviarActividades,
        cambiarMes,
        irHoy,
        seleccionarFecha,
    } = useCalendario();

    // Obtener la imagen de cada planta
    const imagenPlanta = (planta) => {
        const primera = planta?.imagenes?.[0];

        const imagen =
            (typeof primera === "string"
                ? primera
                : primera?.image ||
                  primera?.imagen ||
                  primera?.ruta ||
                  primera?.image_url) ||
            planta?.image_plant?.image ||
            planta?.image_url ||
            null;

        return imagen ? obtenerImagen(imagen) : null;
    };

    return (
        <main className="min-h-screen bg-[#F8F7F3] px-4 py-8 sm:px-7 lg:px-10">
            <div className="mx-auto max-w-[1400px]">

                {/* ENCABEZADO */}
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-[28px] border border-[#DFE9D7] bg-[#EEF3E8] p-5 sm:p-7">
                    <div>
                        <div className="mb-3 flex items-center gap-2 text-[#83A474]">
                            <Flower2 size={17} />

                            <span className="text-xs font-bold uppercase tracking-[0.2em]">
                                Un día a la vez
                            </span>
                        </div>

                        <h1 className="font-['Lora'] text-4xl font-bold text-[#3F5D3F]">
                            Calendario de mi jardín
                        </h1>

                        <p className="mt-3 text-sm text-[#7B8476]">
                            Cada pequeño cuidado ayuda a tus plantas a florecer.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={irHoy}
                        className="flex items-center gap-2 rounded-full border border-[#DCE5D6] bg-white px-5 py-2.5 text-sm font-semibold text-[#557B50] transition hover:bg-[#EFF5EB]"
                    >
                        <CalendarDays size={17} />
                        Ir a hoy
                    </button>
                </div>

                {/* MENSAJES DE ERROR */}
                {error && (
                    <div className="mb-5 rounded-2xl border border-[#EED2C2] bg-[#FFF2EA] p-4 text-sm text-[#A66E4B]">
                        {error}
                    </div>
                )}

                <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_330px]">

                    {/* CALENDARIO PRINCIPAL */}
                    <section className="min-w-0 overflow-hidden rounded-[28px] border border-[#DFE9D7] bg-white px-4 pb-7 pt-6 shadow-[0_10px_35px_rgba(45,70,40,0.035)] sm:px-7">

                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-8 w-1 rounded-full bg-[#89AB78]" />

                                <span className="text-sm font-medium text-[#84907D]">
                                    Mis días de cuidado
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => cambiarMes("anterior")}
                                    aria-label="Mes anterior"
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6EBE2] text-[#4E7048] hover:bg-[#F0F5EC]"
                                >
                                    <ArrowLeft size={18} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => cambiarMes("siguiente")}
                                    aria-label="Mes siguiente"
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6EBE2] text-[#4E7048] hover:bg-[#F0F5EC]"
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="calendario-natural">

                            {/* Resaltar la celda seleccionada sin dayCellClassNames */}
                            <style>
                                {`
                                    .calendario-natural
                                    .fc-daygrid-day[data-date="${fechaSeleccionada}"] {
                                        background-color: #DCE9D2 !important;
                                        box-shadow: inset 0 0 0 1px #89AB78;
                                    }
                                `}
                            </style>

                            <FullCalendar
                                ref={calendarioRef}
                                plugins={[
                                    classicThemePlugin,
                                    dayGridPlugin,
                                    interactionPlugin,
                                ]}
                                initialView="dayGridMonth"
                                locale={esLocale}
                                firstDay={1}
                                timeZone={ZONA_HORARIA}
                                height="auto"
                                fixedWeekCount={false}
                                dayMaxEvents={false}
                                headerToolbar={{
                                    left: "",
                                    center: "title",
                                    right: "",
                                }}
                                events={eventos}
                                editable={false}
                                selectable={false}
                                dateClick={(info) => {
                                    seleccionarFecha(info.dateStr);
                                }}
                                eventClick={(info) => {
                                    const actividad =
                                        info.event.extendedProps.actividad;

                                    seleccionarFecha(
                                        fechaLocal(
                                            actividad.fecha_programada
                                        )
                                    );
                                }}
                                eventContent={(info) => {
                                    const tipo = info.event.title;

                                    const actividad =
                                        info.event.extendedProps.actividad;

                                    const estado =
                                        obtenerEstado(actividad);

                                    const color =
                                        colorCuidado(tipo);

                                    return (
                                        <div
                                            title={`${tipo} · ${estado}`}
                                            className="flex items-center justify-center gap-1 rounded-md px-1 py-1"
                                            style={{
                                                background: color.fondo,
                                                color: color.texto,
                                            }}
                                        >
                                            <IconoCuidado
                                                tipo={tipo}
                                                size={17}
                                            />

                                            {estado === "completada" && (
                                                <Check size={11} />
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        {/* LEYENDA */}
                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#F0F0EA] pt-5">
                            {[
                                ["Riego", "#4189B8"],
                                ["Fertilización", "#668C52"],
                                ["Luz", "#D59B36"],
                                ["Temperatura", "#9271A8"],
                            ].map(([nombre, color]) => (
                                <span
                                    key={nombre}
                                    className="flex items-center gap-2 text-xs text-[#778273]"
                                >
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{
                                            background: color,
                                        }}
                                    />

                                    {nombre}
                                </span>
                            ))}

                            {cargandoActividades && (
                                <LoaderCircle
                                    size={16}
                                    className="animate-spin text-[#89AB78]"
                                />
                            )}
                        </div>
                    </section>

                    {/* PANEL LATERAL */}
                    <aside className="space-y-6">

                        {/* PLANTAS DEL JARDÍN */}
                        <section className="rounded-[28px] border border-[#DFE9D7] bg-[#F0F4EB] p-5">
                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarPlantas(!mostrarPlantas)
                                }
                                className="flex w-full items-center justify-between py-2 text-left"
                            >
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89AB78]">
                                        Mis compañeras verdes
                                    </span>

                                    <h2 className="mt-1 font-['Lora'] text-2xl font-bold text-[#3F5D3F]">
                                        Mi jardín
                                    </h2>
                                </div>

                                <ChevronDown
                                    size={21}
                                    className={`text-[#557B50] transition ${
                                        mostrarPlantas
                                            ? "rotate-180"
                                            : ""
                                    }`}
                                />
                            </button>

                            {mostrarPlantas && (
                                <div className="mt-4 max-h-[330px] space-y-2 overflow-y-auto pr-1">

                                    {cargandoPlantas ? (
                                        [1, 2, 3].map((item) => (
                                            <div
                                                key={item}
                                                className="h-[72px] animate-pulse rounded-2xl bg-[#E9EFE4]"
                                            />
                                        ))
                                    ) : plantas.length === 0 ? (
                                        <p className="py-5 text-sm text-[#879082]">
                                            Aún no tienes plantas en tu jardín.
                                        </p>
                                    ) : (
                                        plantas.map((registro) => {
                                            const planta =
                                                registro.plant || {};

                                            const activa =
                                                String(registro.id) ===
                                                String(plantaSeleccionada);

                                            const imagen =
                                                imagenPlanta(planta);

                                            return (
                                                <button
                                                    key={registro.id}
                                                    type="button"
                                                    disabled={enviando}
                                                    onClick={() => {
                                                        setPlantaSeleccionada(
                                                            registro.id
                                                        );
                                                        setSeleccionadas([]);
                                                    }}
                                                    className={`flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition ${
                                                        activa
                                                            ? "bg-[#DCE9D2]"
                                                            : "bg-white/70 hover:bg-white"
                                                    }`}
                                                >
                                                    <div
                                                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-[17px] bg-[#E1E9DA] ${
                                                            activa
                                                                ? "ring-2 ring-[#89AB78] ring-offset-2"
                                                                : ""
                                                        }`}
                                                    >
                                                        {imagen ? (
                                                            <img
                                                                src={imagen}
                                                                alt={
                                                                    planta.nombre_comun ||
                                                                    "Planta"
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-[#719662]">
                                                                <Leaf size={28} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-[#3F5D3F]">
                                                            {planta.nombre_comun ||
                                                                planta.nombre_cientifico ||
                                                                "Mi planta"}
                                                        </p>

                                                        <p className="mt-1 truncate text-xs italic text-[#6B7867]">
                                                            {planta.nombre_cientifico ||
                                                                "Mi jardín"}
                                                        </p>
                                                    </div>

                                                    {activa && (
                                                        <CheckCircle2
                                                            size={19}
                                                            className="text-[#719662]"
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </section>

                        {/* TAREAS DEL DÍA */}
                        <section className="rounded-[28px] border border-[#DFE9D7] bg-[#FDFEFB] p-5 shadow-[0_8px_25px_rgba(45,70,40,0.035)] sm:p-6">

                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF2E4] text-[#719662]">
                                    <CheckCircle2 size={25} />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#89AB78]">
                                        Un cuidado a la vez
                                    </p>

                                    <h2 className="font-['Lora'] text-xl font-bold text-[#3F5D3F]">
                                        Tareas del día
                                    </h2>
                                </div>
                            </div>

                            <p className="mb-5 rounded-xl bg-[#E8EFE3] px-3 py-2.5 text-sm capitalize text-[#587350]">
                                {formatearFecha(fechaSeleccionada)}
                            </p>

                            {cargandoActividades ? (
                                <div className="space-y-3">
                                    {[1, 2].map((item) => (
                                        <div
                                            key={item}
                                            className="h-16 animate-pulse rounded-xl bg-[#EDF2E9]"
                                        />
                                    ))}
                                </div>
                            ) : !plantaSeleccionada ? (
                                <p className="py-8 text-center text-sm text-[#879082]">
                                    Selecciona una planta de tu jardín.
                                </p>
                            ) : tareasDelDia.length === 0 ? (
                                <div className="py-7 text-center">
                                    <Flower2
                                        size={35}
                                        className="mx-auto mb-3 text-[#A3B18A]"
                                    />

                                    <p className="font-medium text-[#587350]">
                                        ¡Un día tranquilo!
                                    </p>

                                    <p className="mt-2 text-xs leading-5 text-[#6B7867]">
                                        No hay cuidados programados para esta fecha.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {tareasDisponibles.length > 1 && (
                                        <button
                                            type="button"
                                            disabled={enviando}
                                            onClick={alternarTodas}
                                            className="mb-3 text-xs font-semibold text-[#719662] hover:underline"
                                        >
                                            {todasSeleccionadas
                                                ? "Deseleccionar todas"
                                                : "Seleccionar todas"}
                                        </button>
                                    )}

                                    <div className="space-y-2">
                                        {tareasDelDia.map((actividad) => {
                                            const estado =
                                                obtenerEstado(actividad);

                                            const completada =
                                                estado === "completada";

                                            const marcada =
                                                seleccionadas.includes(
                                                    actividad.id
                                                );

                                            const tipo =
                                                nombreCuidado(actividad);

                                            const color =
                                                colorCuidado(tipo);

                                            return (
                                                <label
                                                    key={actividad.id}
                                                    style={{ backgroundColor: color.fondo }}
                                                    className={`flex items-start gap-3 rounded-2xl border border-white/80 p-3 ${
                                                        completada
                                                            ? "opacity-65"
                                                            : "cursor-pointer"
                                                    }`}
                                                >
                                                    <div
                                                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80"
                                                        style={{
                                                            background: "#FFFFFFB3",
                                                            color:
                                                                color.texto,
                                                        }}
                                                    >
                                                        <IconoCuidado
                                                            tipo={tipo}
                                                            size={20}
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className={`text-sm font-semibold ${
                                                                completada
                                                                    ? "text-[#6B7867] line-through"
                                                                    : "text-[#3F5D3F]"
                                                            }`}
                                                        >
                                                            {tipo}
                                                        </p>

                                                        <p className="mt-1 text-xs leading-5 text-[#6B7867]">
                                                            {actividad.plant_care?.descripcion ||
                                                                "Cuidado programado"}
                                                        </p>

                                                        <span
                                                            className={`mt-2 inline-block text-[11px] font-medium ${
                                                                completada
                                                                    ? "text-[#719662]"
                                                                    : estado === "vencida"
                                                                      ? "text-[#C28A55]"
                                                                      : "text-[#83927A]"
                                                            }`}
                                                        >
                                                            {completada
                                                                ? "Ya realizada"
                                                                : estado === "vencida"
                                                                  ? "Pendiente desde una fecha anterior"
                                                                  : "Por realizar"}
                                                        </span>
                                                    </div>

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            completada ||
                                                            marcada
                                                        }
                                                        disabled={
                                                            completada ||
                                                            enviando
                                                        }
                                                        onChange={() =>
                                                            alternarTarea(
                                                                actividad.id
                                                            )
                                                        }
                                                        className="mt-2 h-5 w-5 shrink-0 cursor-pointer accent-[#89AB78]"
                                                        aria-label={`Seleccionar ${tipo}`}
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-5">
                                        <p className="mb-3 text-center text-xs text-[#6B7867]">
                                            {seleccionadas.length
                                                ? `${seleccionadas.length} actividad(es) seleccionada(s)`
                                                : "Selecciona las tareas que realizaste"}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={enviarActividades}
                                            disabled={
                                                !seleccionadas.length ||
                                                enviando
                                            }
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#89AB78] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_5px_12px_rgba(137,171,120,0.18)] transition hover:bg-[#719662] disabled:cursor-not-allowed disabled:opacity-45"
                                        >
                                            {enviando ? (
                                                <>
                                                    <LoaderCircle
                                                        size={18}
                                                        className="animate-spin"
                                                    />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={17} />
                                                    Guardar actividades
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </section>

                        <p className="rounded-2xl bg-[#EEF3E8] p-4 text-center font-['Lora'] text-sm italic text-[#718568]">
                            “Cuidar una planta es disfrutar de sus pequeños cambios.”
                        </p>
                    </aside>
                </div>
            </div>

            {/* MODAL DE RESULTADOS */}
            <ModalResultado
                resultado={resultado}
                cerrar={() => setResultado(null)}
            />
        </main>
    );
}

export default Calendario;