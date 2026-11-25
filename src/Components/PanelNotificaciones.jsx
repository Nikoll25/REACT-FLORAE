
import { useCallback, useEffect, useState } from "react";
import {
    Bell,
    X,
    Check,
    CheckCheck,
    Droplets,
    Sprout,
    Sun,
    Thermometer,
    FlaskConical,
    AlertCircle,
    LoaderCircle,
} from "lucide-react";

import {
    obtenerNotificaciones,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas,
} from "../services/api";

const normalizarTipo = (valor) =>
    String(valor || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

const estilosPorTipo = {
    riego: { icono: Droplets, color: "#2563EB", fondo: "#EFF6FF", borde: "#BFDBFE" },
    fertilizacion: { icono: Sprout, color: "#16A34A", fondo: "#F0FDF4", borde: "#BBF7D0" },
    luz: { icono: Sun, color: "#D97706", fondo: "#FFFBEB", borde: "#FDE68A" },
    temperatura: { icono: Thermometer, color: "#EA580C", fondo: "#FFF7ED", borde: "#FED7AA" },
    tratamiento: { icono: FlaskConical, color: "#9333EA", fondo: "#FAF5FF", borde: "#E9D5FF" },
    general: { icono: Bell, color: "#3F5D3F", fondo: "#EEF3E7", borde: "#CBD9C1" },
};

const obtenerEstilo = (notificacion) => {
    if (normalizarTipo(notificacion.tipo) === "tratamiento") {
        return estilosPorTipo.tratamiento;
    }

    // Preferimos el tipo de cuidado que devuelve la API.
    const tipo = normalizarTipo(
        notificacion.tipo_cuidado ||
        notificacion.actividad_cuidado?.plant_care?.tipo ||
        notificacion.actividad_cuidado?.plantCare?.tipo
    );

    if (estilosPorTipo[tipo]) return estilosPorTipo[tipo];

    // Permite colorear las notificaciones anteriores mientras se actualiza la API.
    const mensaje = normalizarTipo(notificacion.mensaje);
    const encontrado = ["riego", "fertilizacion", "luz", "temperatura"]
        .find((cuidado) => mensaje.includes(cuidado));

    return estilosPorTipo[encontrado] || estilosPorTipo.general;
};

function PanelNotificaciones({ abierto, cerrar, alActualizar }) {
    const [notificaciones, setNotificaciones] = useState([]);
    const [sinLeer, setSinLeer] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(null);
    const [error, setError] = useState("");

    const cargarNotificaciones = useCallback(async () => {
        try {
            setError("");

            const respuesta = await obtenerNotificaciones(1);

            setNotificaciones(respuesta.notificaciones?.data || []);
            setSinLeer(respuesta.sin_leer || 0);
        } catch (err) {
            setError(err.message || "No se pudieron cargar las notificaciones.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        if (!abierto) return;

        setCargando(true);
        cargarNotificaciones();
    }, [abierto, cargarNotificaciones]);

    useEffect(() => {
        if (!abierto) return;

        const cerrarConEscape = (event) => {
            if (event.key === "Escape") cerrar();
        };

        document.addEventListener("keydown", cerrarConEscape);

        return () => {
            document.removeEventListener("keydown", cerrarConEscape);
        };
    }, [abierto, cerrar]);

    const marcarLeida = async (id) => {
        try {
            setProcesando(id);
            setError("");

            await marcarNotificacionLeida(id);
            await cargarNotificaciones();
            alActualizar();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(null);
        }
    };

    const marcarTodas = async () => {
        try {
            setProcesando("todas");
            setError("");

            await marcarTodasNotificacionesLeidas();
            await cargarNotificaciones();
            alActualizar();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(null);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "";

        return new Date(fecha).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (!abierto) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[90] bg-black/15"
                onClick={cerrar}
                aria-hidden="true"
            />

            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-notificaciones"
                className="fixed right-4 top-[88px] z-[100] flex max-h-[min(600px,calc(100vh-105px))] w-[calc(100vw-32px)] max-w-[390px] flex-col overflow-hidden rounded-[24px] border border-[#DFE9D7] bg-white shadow-[0_15px_45px_rgba(0,0,0,0.16)] sm:right-7"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
                <div className="border-b border-[#E8EFE3] px-5 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell size={22} className="text-[#3F5D3F]" />

                            <h2
                                id="titulo-notificaciones"
                                className="text-xl font-extrabold text-[#303B30]"
                            >
                                Notificaciones
                            </h2>

                            {sinLeer > 0 && (
                                <span className="rounded-full bg-[#E8EFE3] px-2 py-0.5 text-xs font-bold text-[#3F5D3F]">
                                    {sinLeer}
                                </span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={cerrar}
                            aria-label="Cerrar notificaciones"
                            className="rounded-full p-2 text-[#6B7280] transition hover:bg-[#EEF3E7]"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="mt-1 text-sm text-[#6B7280]">
                        Mantente al día con tu jardín.
                    </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {error && (
                        <div
                            role="alert"
                            className="m-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600"
                        >
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {cargando ? (
                        <div className="space-y-3 p-4">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="h-24 animate-pulse rounded-xl bg-[#EEF3E7]"
                                />
                            ))}
                        </div>
                    ) : notificaciones.length === 0 ? (
                        <div className="flex flex-col items-center px-6 py-14 text-center">
                            <Bell size={42} className="text-[#89AB78]" />

                            <h3 className="mt-4 font-bold text-[#303B30]">
                                No tienes notificaciones
                            </h3>

                            <p className="mt-2 text-sm text-[#6B7280]">
                                Los recordatorios de tus plantas aparecerán aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#EDF1E9]">
                            {notificaciones.map((notificacion) => {
                                const leida = Boolean(notificacion.fecha_lectura);
                                const estilo = obtenerEstilo(notificacion);
                                const Icono = estilo.icono;

                                return (
                                    <div
                                        key={notificacion.id}
                                        className="flex gap-3 border-l-4 px-5 py-4"
                                        style={{
                                            borderLeftColor: estilo.color,
                                            backgroundColor: leida ? "#FFFFFF" : estilo.fondo,
                                        }}
                                    >
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                            style={{
                                                backgroundColor: leida ? estilo.fondo : "#FFFFFF",
                                                color: estilo.color,
                                            }}
                                        >
                                            <Icono size={21} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-sm font-extrabold text-[#303B30]">
                                                    {notificacion.titulo}
                                                </h3>

                                                {!leida && (
                                                    <span
                                                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                                                        style={{ backgroundColor: estilo.color }}
                                                    />
                                                )}
                                            </div>

                                            <p className="mt-1 text-sm leading-5 text-[#657165]">
                                                {notificacion.mensaje}
                                            </p>

                                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-xs text-[#8A948A]">
                                                    {formatearFecha(notificacion.fecha_envio)}
                                                </span>

                                                {!leida && (
                                                    <button
                                                        type="button"
                                                        disabled={procesando !== null}
                                                        onClick={() => marcarLeida(notificacion.id)}
                                                        className="flex items-center gap-1 text-xs font-bold text-[#3F5D3F] hover:underline disabled:opacity-50"
                                                    >
                                                        {procesando === notificacion.id ? (
                                                            <LoaderCircle
                                                                size={14}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Check size={14} />
                                                        )}
                                                        Marcar como leída
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {sinLeer > 0 && (
                    <div className="border-t border-[#E8EFE3] bg-white p-4">
                        <button
                            type="button"
                            onClick={marcarTodas}
                            disabled={procesando !== null}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EEF3E7] px-4 py-3 text-sm font-bold text-[#3F5D3F] transition hover:bg-[#DFEAD5] disabled:opacity-50"
                        >
                            {procesando === "todas" ? (
                                <LoaderCircle
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <CheckCheck size={18} />
                            )}

                            Marcar todas como leídas
                        </button>
                    </div>
                )}
            </section>
        </>
    );
}

export default PanelNotificaciones;
