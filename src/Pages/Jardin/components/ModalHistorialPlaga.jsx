
import { useEffect, useState } from "react";
import {
    X,
    Bug,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FlaskConical,
    LoaderCircle,
    AlertCircle,
    History,
} from "lucide-react";

import {
    API_URL,
    obtenerImagen,
} from "../../../services/api";

const fechaColombia = (fecha) => {
    if (!fecha) return null;

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) return null;

    return valor.toLocaleDateString("es-CO", {
        timeZone: "America/Bogota",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const estaErradicada = (estado) =>
    ["erradicada", "erradicado"].includes(
        String(estado || "").toLowerCase().trim()
    );

function ModalHistorialPlaga({ plaga, onClose }) {
    const [historiales, setHistoriales] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!plaga?.id) return;

        const controlador = new AbortController();

        const cargarHistorial = async () => {
            setCargando(true);
            setError("");

            try {
                const token = localStorage.getItem("token");

                const respuesta = await fetch(
                    `${API_URL}/jardin/plagas/${plaga.id}/historial`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            ...(token
                                ? {
                                      Authorization: `Bearer ${token}`,
                                  }
                                : {}),
                        },
                        signal: controlador.signal,
                    }
                );

                if (!respuesta.ok) {
                    throw new Error(
                        "No se pudo consultar el historial de esta plaga."
                    );
                }

                const datos = await respuesta.json();

                setHistoriales(
                    Array.isArray(datos.historiales)
                        ? datos.historiales
                        : []
                );
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(
                        err.message ||
                            "Ocurrió un error al cargar el historial."
                    );
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        };

        cargarHistorial();

        return () => controlador.abort();
    }, [plaga?.id]);

    useEffect(() => {
        const cerrarConEscape = (evento) => {
            if (evento.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", cerrarConEscape);

        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener(
                "keydown",
                cerrarConEscape
            );

            document.body.style.overflow = overflowAnterior;
        };
    }, [onClose]);

    if (!plaga) return null;

    const catalogo = plaga.plaga || {};

    const nombre =
        catalogo.nombre_comun ||
        plaga.nombre_comun ||
        "Plaga registrada";

    const nombreCientifico = catalogo.nombre_cientifico;

    const descripcion = catalogo.descripcion;

    const erradicada = estaErradicada(plaga.estado);

    const imagenPrincipal =
        catalogo.imagenes?.find(
            (imagen) => imagen.es_principal
        ) || catalogo.imagenes?.[0];

    const rutaImagen =
        imagenPrincipal?.ruta ||
        imagenPrincipal?.imagen ||
        null;

    const imagen = rutaImagen
        ? obtenerImagen(rutaImagen)
        : null;

    const historialOrdenado = [...historiales].sort(
        (a, b) =>
            new Date(b.fecha_deteccion) -
            new Date(a.fecha_deteccion)
    );

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-historial-plaga"
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-[#E5EBDD] px-5 py-4 sm:px-7">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#89AB78]">
                            Mi jardín
                        </p>

                        <h2
                            id="titulo-historial-plaga"
                            className="font-serif text-xl font-bold text-[#3F5D3F] sm:text-2xl"
                        >
                            Información de la plaga
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                        className="rounded-xl p-2 text-[#737B6D] transition hover:bg-[#F1F4ED]"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                    <div className="flex flex-col gap-5 sm:flex-row">
                        <div className="h-44 w-full shrink-0 overflow-hidden rounded-2xl bg-[#E8EFE3] sm:h-40 sm:w-40">
                            {imagen ? (
                                <img
                                    src={imagen}
                                    alt={nombre}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <Bug
                                        size={45}
                                        className="text-[#89AB78]"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <h3 className="font-serif text-2xl font-bold text-[#3F5D3F]">
                                {nombre}
                            </h3>

                            {nombreCientifico && (
                                <p className="mt-1 text-sm italic text-[#858B7D]">
                                    {nombreCientifico}
                                </p>
                            )}

                            <span
                                className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                                    erradicada
                                        ? "bg-[#EDF3E9] text-[#557B50]"
                                        : "bg-[#FFF1E5] text-[#A76C38]"
                                }`}
                            >
                                {erradicada ? (
                                    <CheckCircle2 size={14} />
                                ) : (
                                    <Bug size={14} />
                                )}

                                {erradicada
                                    ? "Erradicada"
                                    : "Activa"}
                            </span>

                            {descripcion && (
                                <p className="mt-4 text-sm leading-6 text-[#667465]">
                                    {descripcion}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="my-6 border-t border-[#E5EBDD]" />

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <History
                                size={22}
                                className="text-[#89AB78]"
                            />

                            <h3 className="font-serif text-xl font-bold text-[#3F5D3F]">
                                Historial de apariciones
                            </h3>
                        </div>

                        {!cargando && !error && (
                            <span className="rounded-full bg-[#EDF3E9] px-3 py-1 text-xs font-semibold text-[#557B50]">
                                {historiales.length}{" "}
                                {historiales.length === 1
                                    ? "aparición"
                                    : "apariciones"}
                            </span>
                        )}
                    </div>

                    {cargando ? (
                        <div className="flex items-center justify-center gap-3 py-12 text-[#667465]">
                            <LoaderCircle
                                size={22}
                                className="animate-spin text-[#89AB78]"
                            />
                            <span className="text-sm">
                                Consultando historial...
                            </span>
                        </div>
                    ) : error ? (
                        <div
                            role="alert"
                            className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700"
                        >
                            <AlertCircle
                                size={20}
                                className="shrink-0"
                            />
                            <p>{error}</p>
                        </div>
                    ) : historialOrdenado.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#CAD9C2] bg-[#F8FAF6] px-5 py-9 text-center">
                            <History
                                size={30}
                                className="mx-auto mb-3 text-[#89AB78]"
                            />

                            <p className="font-semibold text-[#3F5D3F]">
                                No hay apariciones registradas
                            </p>

                            <p className="mt-1 text-sm text-[#737B6D]">
                                Cuando se registre una aparición,
                                podrás consultarla aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {historialOrdenado.map(
                                (historial, indice) => {
                                    const finalizada =
                                        historial.fecha_erradicacion !== null;

                                    const numeroAparicion =
                                        historialOrdenado.length -
                                        indice;

                                    const tratamientos =
                                        historial.aplicaciones_tratamientos ||
                                        [];

                                    return (
                                        <div
                                            key={historial.id}
                                            className="overflow-hidden rounded-2xl border border-[#E4EADD] bg-white"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8FAF6] px-4 py-4 sm:px-5">
                                                <div>
                                                    <p className="text-xs font-semibold text-[#89AB78]">
                                                        Aparición {numeroAparicion}
                                                    </p>

                                                    <h4 className="mt-1 font-serif text-lg font-bold text-[#3F5D3F]">
                                                        {finalizada
                                                            ? "Plaga erradicada"
                                                            : "Plaga activa"}
                                                    </h4>
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                                        finalizada
                                                            ? "bg-[#E6F1E3] text-[#557B50]"
                                                            : "bg-[#FFF1E5] text-[#A76C38]"
                                                    }`}
                                                >
                                                    {finalizada
                                                        ? "Erradicada"
                                                        : "Activa"}
                                                </span>
                                            </div>

                                            <div className="space-y-4 p-4 sm:p-5">
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div className="flex items-start gap-3">
                                                        <CalendarDays
                                                            size={18}
                                                            className="mt-0.5 shrink-0 text-[#89AB78]"
                                                        />

                                                        <div>
                                                            <p className="text-xs font-semibold text-[#667465]">
                                                                Fecha de detección
                                                            </p>

                                                            <p className="mt-1 text-sm text-[#3F5D3F]">
                                                                {fechaColombia(
                                                                    historial.fecha_deteccion
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3">
                                                        {finalizada ? (
                                                            <CheckCircle2
                                                                size={18}
                                                                className="mt-0.5 shrink-0 text-[#89AB78]"
                                                            />
                                                        ) : (
                                                            <Clock3
                                                                size={18}
                                                                className="mt-0.5 shrink-0 text-[#A76C38]"
                                                            />
                                                        )}

                                                        <div>
                                                            <p className="text-xs font-semibold text-[#667465]">
                                                                Fecha de erradicación
                                                            </p>

                                                            <p className="mt-1 text-sm text-[#3F5D3F]">
                                                                {finalizada
                                                                    ? fechaColombia(
                                                                          historial.fecha_erradicacion
                                                                      )
                                                                    : "Aún no erradicada"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-t border-[#E5EBDD] pt-4">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <FlaskConical
                                                            size={18}
                                                            className="text-[#89AB78]"
                                                        />

                                                        <h5 className="font-semibold text-[#3F5D3F]">
                                                            Tratamientos aplicados
                                                        </h5>
                                                    </div>

                                                    {tratamientos.length === 0 ? (
                                                        <p className="rounded-xl bg-[#F8FAF6] px-4 py-3 text-sm text-[#737B6D]">
                                                            No se registraron tratamientos durante esta aparición.
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {tratamientos.map(
                                                                (aplicacion) => {
                                                                    const tratamiento =
                                                                        aplicacion.tratamiento ||
                                                                        {};

                                                                    const hoy =
                                                                        new Date();

                                                                    const fechaFin =
                                                                        new Date(
                                                                            aplicacion.fecha_fin
                                                                        );

                                                                    const activo =
                                                                        !Number.isNaN(
                                                                            fechaFin.getTime()
                                                                        ) &&
                                                                        fechaFin >=
                                                                            new Date(
                                                                                hoy.getFullYear(),
                                                                                hoy.getMonth(),
                                                                                hoy.getDate()
                                                                            );

                                                                    return (
                                                                        <div
                                                                            key={aplicacion.id}
                                                                            className="rounded-xl border border-[#E5EBDD] bg-[#F8FAF6] p-4"
                                                                        >
                                                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                                                <p className="flex-1 text-sm font-bold text-[#3F5D3F]">
                                                                                    {tratamiento.nombre ||
                                                                                        "Tratamiento registrado"}
                                                                                </p>

                                                                                <span
                                                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                                        activo
                                                                                            ? "bg-[#E6F1E3] text-[#557B50]"
                                                                                            : "bg-[#EAECE8] text-[#667465]"
                                                                                    }`}
                                                                                >
                                                                                    {activo
                                                                                        ? "Activo"
                                                                                        : "Finalizado"}
                                                                                </span>
                                                                            </div>

                                                                            <p className="mt-2 text-xs leading-5 text-[#667465]">
                                                                                Inicio:{" "}
                                                                                {fechaColombia(
                                                                                    aplicacion.fecha_inicio
                                                                                )}
                                                                            </p>

                                                                            <p className="mt-1 text-xs leading-5 text-[#667465]">
                                                                                Último día:{" "}
                                                                                {fechaColombia(
                                                                                    aplicacion.fecha_fin
                                                                                )}
                                                                            </p>

                                                                            <p className="mt-1 text-xs leading-5 text-[#667465]">
                                                                                Duración:{" "}
                                                                                {aplicacion.duracion_dias}{" "}
                                                                                {Number(
                                                                                    aplicacion.duracion_dias
                                                                                ) === 1
                                                                                    ? "día"
                                                                                    : "días"}
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end border-t border-[#E5EBDD] bg-white px-5 py-4 sm:px-7">
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-11 rounded-xl bg-[#89AB78] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#709261]"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalHistorialPlaga;
