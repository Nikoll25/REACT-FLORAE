import { useCallback, useEffect, useRef, useState } from "react";
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
    riego: { icono: Droplets, color: "#5287A6", fondo: "#E7F1F7", borde: "#D1E2ED" },
    fertilizacion: { icono: Sprout, color: "#709261", fondo: "#E8EFE3", borde: "#D5E1CD" },
    luz: { icono: Sun, color: "#A68A45", fondo: "#F7EED9", borde: "#E8DDBF" },
    temperatura: { icono: Thermometer, color: "#A66E56", fondo: "#F6EAE3", borde: "#EAD5C9" },
    tratamiento: { icono: FlaskConical, color: "#927DA5", fondo: "#F0EAF5", borde: "#E1D7E9" },
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
const formatoFecha = new Intl.DateTimeFormat("es-CO", {
    day: "numeric", month: "short", year: "numeric",
});
const formatearFecha = (fecha) => {
    const valor = new Date(fecha);
    return fecha && !Number.isNaN(valor.getTime()) ? formatoFecha.format(valor) : "";
};

function PanelNotificacionesSesion({ abierto, cerrar, alActualizar, token }) {
    const [notificaciones, setNotificaciones] = useState([]);
    const [sinLeer, setSinLeer] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(null);
    const [error, setError] = useState("");
    const solicitud = useRef(null);
    const operacion = useRef(false);
    const version = useRef(0);
    const vigente = useCallback(() => localStorage.getItem("token") === token, [token]);

    // Conservamos la lista visible mientras se actualiza.
    const cargarNotificaciones = useCallback(() => {
        if (!vigente() || operacion.current) return;
        if (solicitud.current) return solicitud.current;
        const actual = version.current;
        setError("");
        const promesa = Promise.resolve().then(async () => {
            try {
                const respuesta = await obtenerNotificaciones(1);
                if (!vigente() || actual !== version.current) return;
                setNotificaciones(respuesta.notificaciones?.data || []);
                setSinLeer(respuesta.sin_leer || 0);
            } catch (err) {
                if (vigente() && actual === version.current) {
                    setError(err.message || "No se pudieron cargar las notificaciones.");
                }
            } finally {
                if (solicitud.current === promesa) solicitud.current = null;
                if (vigente() && actual === version.current) setCargando(false);
            }
        });
        solicitud.current = promesa;
        return promesa;
    }, [vigente]);

    useEffect(() => {
        if (abierto) cargarNotificaciones();
    }, [abierto, cargarNotificaciones]);

    useEffect(() => {
        if (!abierto) return;
        const cerrarConEscape = (event) => {
            if (event.key === "Escape") cerrar();
        };
        document.addEventListener("keydown", cerrarConEscape);
        return () => document.removeEventListener("keydown", cerrarConEscape);
    }, [abierto, cerrar]);

    // Actualizamos la lista solo cuando Laravel confirma el cambio.
    const marcar = async (id, todas = false) => {
        if (operacion.current || !vigente()) return;
        operacion.current = true;
        version.current++;
        solicitud.current = null;
        setProcesando(todas ? "todas" : id);
        setError("");
        try {
            if (todas) await marcarTodasNotificacionesLeidas();
            else await marcarNotificacionLeida(id);
            if (!vigente()) return;
            const fecha = new Date().toISOString();
            setNotificaciones((lista) => lista.map((item) =>
                !item.fecha_lectura && (todas || String(item.id) === String(id))
                    ? { ...item, fecha_lectura: fecha }
                    : item
            ));
            setSinLeer((cantidad) => todas ? 0 : Math.max(0, cantidad - 1));
            try {
                await alActualizar?.();
            } catch (err) {
                if (vigente()) setError("No se pudo actualizar el contador de notificaciones.");
            }
        } catch (err) {
            if (vigente()) setError(err.message || "No se pudo actualizar la notificación.");
        } finally {
            operacion.current = false;
            if (vigente()) {
                setProcesando(null);
                setCargando(false);
            }
        }
    };
    const marcarLeida = (id) => marcar(id);
    const marcarTodas = () => marcar(null, true);
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
                <div className="border-b border-[#DDE5D6] bg-[#EDF2E7] px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCE8D3] text-[#52744A]"><Bell size={22} /></div>
                            <h2
                                id="titulo-notificaciones"
                                className="font-lora text-xl font-bold text-[#3F5D3F]"
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
                    <p className="mt-2 text-sm text-[#788771]">
                        Tu jardín necesita de ti.
                    </p>
                    {!cargando && <p className="mt-3 text-xs font-semibold text-[#607458]">{sinLeer > 0 ? `${sinLeer} ${sinLeer === 1 ? "notificación sin leer" : "notificaciones sin leer"}` : "Estás al día con tu jardín"}</p>}
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
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E8EFE3] text-[#89AB78]"><Bell size={36} /></div>
                            <h3 className="mt-4 font-bold text-[#303B30]">
                                No tienes notificaciones
                            </h3>
                            <p className="mt-2 text-sm text-[#6B7280]">
                                Los recordatorios de tus plantas aparecerán aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 bg-[#F8F7F3] p-3">
                            {notificaciones.map((notificacion) => {
                                const leida = Boolean(notificacion.fecha_lectura);
                                const estilo = obtenerEstilo(notificacion);
                                const Icono = estilo.icono;
                                return (
                                    <div
                                        key={notificacion.id}
                                        className="flex gap-3 rounded-2xl border p-3 shadow-sm transition hover:shadow-md"
                                        style={{
                                            borderColor: leida ? "#EBEDE7" : "#DDE6D5",
                                            backgroundColor: leida ? "#FFFFFF" : "#F8FAF5",
                                        }}
                                    >
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                            style={{
                                                backgroundColor: estilo.fondo,
                                                color: estilo.color,
                                            }}
                                        >
                                            <Icono size={21} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-sm font-bold text-[#3F493B]">
                                                    {notificacion.titulo}
                                                </h3>
                                                {!leida && (
                                                    <span
                                                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                                                        style={{ backgroundColor: "#89AB78" }}
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
                                                        disabled={procesando !== null || cargando}
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
                                                {leida && <span className="text-xs text-[#90988B]">Leída</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {sinLeer > 0 && (
                    <div className="border-t border-[#E8EFE3] bg-[#F8F7F3] p-3">
                        <button
                            type="button"
                            onClick={marcarTodas}
                            disabled={procesando !== null || cargando}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5EDDF] px-4 py-3 text-sm font-bold text-[#3F5D3F] transition hover:bg-[#DFEAD5] disabled:opacity-50"
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
function PanelNotificaciones(props) {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return <PanelNotificacionesSesion key={token} token={token} {...props} />;
}

export default PanelNotificaciones;
