
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bug,
    Plus,
    CheckCircle2,
    RotateCcw,
    LoaderCircle,
    X,
    ArrowRight,
    History,
} from "lucide-react";

import {
    obtenerImagen,
    obtenerPlagasJardin,
    erradicarPlagaJardin,
    reactivarPlagaJardin,
} from "../../../services/api";

import ModalHistorialPlaga from "./ModalHistorialPlaga";

const extraerPlagas = (respuesta) => {
    if (Array.isArray(respuesta)) return respuesta;

    const opciones = [
        respuesta?.plagas,
        respuesta?.plagas_jardin,
        respuesta?.registros,
        respuesta?.data?.plagas,
        respuesta?.data,
    ];

    return opciones.find(Array.isArray) || [];
};

const estaErradicada = (estado) =>
    ["erradicada", "erradicado"].includes(
        String(estado || "").toLowerCase().trim()
    );

function SeccionPlagas({
    plagas = [],
    onActualizar,
    onAgregarTratamiento,
    errorExterno = "",
}) {
    const navigate = useNavigate();

    const [confirmacion, setConfirmacion] = useState(null);
    const [actualizando, setActualizando] = useState(null);
    const [error, setError] = useState("");

    const [plagaHistorial, setPlagaHistorial] = useState(null);

    const cambiarEstado = async () => {
        if (!confirmacion) return;

        const plaga = confirmacion;

        setActualizando(plaga.id);
        setError("");

        try {
            if (estaErradicada(plaga.estado)) {
                await reactivarPlagaJardin(plaga.id);
            } else {
                await erradicarPlagaJardin(plaga.id);
            }

            const respuesta = await obtenerPlagasJardin();

            onActualizar?.(extraerPlagas(respuesta));

            setConfirmacion(null);
        } catch (err) {
            setError(
                err.message || "No se pudo actualizar la plaga."
            );
            setConfirmacion(null);
        } finally {
            setActualizando(null);
        }
    };

    const activas = plagas.filter(
        (plaga) => !estaErradicada(plaga.estado)
    ).length;

    return (
        <>
            <section className="mb-10 rounded-[24px] border border-[#E5EBDD] bg-white p-5 shadow-[0_4px_18px_rgba(63,93,63,0.05)] sm:p-7">

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#89AB78]">
                            Protección de tu planta
                        </p>

                        <div className="mt-1 flex items-center gap-3">
                            <h2 className="font-serif text-2xl font-bold text-[#3F5D3F] sm:text-3xl">
                                Plagas
                            </h2>

                            {plagas.length > 0 && (
                                <span className="rounded-full bg-[#EDF3E9] px-3 py-1 text-xs font-semibold text-[#557B50]">
                                    {activas}{" "}
                                    {activas === 1 ? "activa" : "activas"}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/explorar/plagas")}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#89AB78] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#709261] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F5D3F]"
                    >
                        <Plus size={19} />
                        Agregar plaga
                    </button>
                </div>

                {(error || errorExterno) && (
                    <p
                        role="alert"
                        className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error || errorExterno}
                    </p>
                )}

                {plagas.length === 0 ? (
                    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#CAD9C2] bg-[#F8FAF6] px-5 py-9 text-center">
                        <Bug
                            size={30}
                            className="mb-3 text-[#89AB78]"
                        />

                        <p className="font-semibold text-[#3F5D3F]">
                            Todavía no hay plagas registradas
                        </p>

                        <p className="mt-1 text-sm text-[#737B6D]">
                            Puedes agregar una desde el botón superior.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {plagas.map((item) => {
                            const catalogo =
                                item.plaga || item.plague || {};

                            const nombre =
                                catalogo.nombre_comun ||
                                item.nombre_comun ||
                                "Plaga registrada";

                            const erradicada = estaErradicada(item.estado);

                            const imagenPrincipal =
                                catalogo.imagenes?.find(
                                    (imagen) => imagen.es_principal
                                ) || catalogo.imagenes?.[0];

                            const ruta =
                                typeof imagenPrincipal === "string"
                                    ? imagenPrincipal
                                    : imagenPrincipal?.ruta ||
                                      imagenPrincipal?.imagen;

                            const imagen = ruta
                                ? obtenerImagen(ruta)
                                : null;

                            const guardando = actualizando === item.id;

                            return (
                                <article
                                    key={item.id}
                                    className="group overflow-hidden rounded-2xl border border-[#E4EADD] bg-white shadow-[0_2px_10px_rgba(63,93,63,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="relative h-36 overflow-hidden bg-[#E8EFE3]">
                                        {imagen ? (
                                            <img
                                                src={imagen}
                                                alt={nombre}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Bug
                                                    size={38}
                                                    className="text-[#89AB78]"
                                                />
                                            </div>
                                        )}

                                        <span
                                            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                                                erradicada
                                                    ? "bg-white/95 text-[#557B50]"
                                                    : "bg-[#FFF1E5] text-[#A76C38]"
                                            }`}
                                        >
                                            {erradicada
                                                ? "Erradicada"
                                                : "Activa"}
                                        </span>
                                    </div>

                                    <div className="p-4 sm:p-5">
                                        <h3 className="line-clamp-2 text-lg font-bold text-[#3F5D3F]">
                                            {nombre}
                                        </h3>

                                        <p className="mt-1 min-h-5 truncate text-sm italic text-[#858B7D]">
                                            {catalogo.nombre_cientifico ||
                                                "Plaga registrada en tu jardín"}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPlagaHistorial(item)
                                            }
                                            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#CBDCC2] bg-[#F5F8F2] px-4 py-2.5 text-sm font-semibold text-[#3F5D3F] transition hover:border-[#89AB78] hover:bg-[#EAF2E5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F5D3F]"
                                        >
                                            <History size={18} />
                                            Ver información e historial
                                            <ArrowRight size={16} />
                                        </button>

                                        {!erradicada &&
                                            onAgregarTratamiento && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onAgregarTratamiento(item)
                                                    }
                                                    className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#89AB78] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#709261] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F5D3F]"
                                                >
                                                    <Plus size={18} />
                                                    Agregar tratamiento
                                                    <ArrowRight size={16} />
                                                </button>
                                            )}

                                        <button
                                            type="button"
                                            disabled={guardando}
                                            onClick={() =>
                                                setConfirmacion(item)
                                            }
                                            className={`mt-3 flex min-h-10 w-full items-center justify-center gap-2 text-sm font-semibold transition disabled:opacity-50 ${
                                                erradicada
                                                    ? "text-[#557B50] hover:text-[#3F5D3F]"
                                                    : "text-[#8C7662] hover:text-[#705640]"
                                            }`}
                                        >
                                            {guardando ? (
                                                <LoaderCircle
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : erradicada ? (
                                                <RotateCcw size={16} />
                                            ) : (
                                                <CheckCircle2 size={16} />
                                            )}

                                            {guardando
                                                ? "Guardando..."
                                                : erradicada
                                                  ? "Reactivar plaga"
                                                  : "Marcar como erradicada"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {confirmacion && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => {
                        if (
                            e.target === e.currentTarget &&
                            actualizando === null
                        ) {
                            setConfirmacion(null);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirmar-plaga-titulo"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <h3
                                id="confirmar-plaga-titulo"
                                className="font-serif text-xl font-bold text-[#3F5D3F]"
                            >
                                {estaErradicada(confirmacion.estado)
                                    ? "¿Reactivar esta plaga?"
                                    : "¿Marcar como erradicada?"}
                            </h3>

                            <button
                                type="button"
                                aria-label="Cerrar"
                                disabled={actualizando !== null}
                                onClick={() =>
                                    setConfirmacion(null)
                                }
                                className="rounded-lg p-1 text-[#737B6D] hover:bg-[#F1F4ED]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-[#737B6D]">
                            {estaErradicada(confirmacion.estado)
                                ? "Se registrará una nueva aparición de esta plaga en el historial de tu planta."
                                : "Se guardará la fecha de erradicación de esta aparición. Podrás reactivar la plaga más adelante sin perder su historial."}
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                disabled={actualizando !== null}
                                onClick={() =>
                                    setConfirmacion(null)
                                }
                                className="min-h-11 flex-1 rounded-xl border border-[#DCE5D6] px-4 py-2.5 font-semibold text-[#557B50] hover:bg-[#F7F9F5]"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                disabled={actualizando !== null}
                                onClick={cambiarEstado}
                                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#89AB78] px-4 py-2.5 font-semibold text-white hover:bg-[#709261] disabled:opacity-60"
                            >
                                {actualizando !== null && (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />
                                )}
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {plagaHistorial && (
                <ModalHistorialPlaga
                    plaga={plagaHistorial}
                    onClose={() => setPlagaHistorial(null)}
                />
            )}
        </>
    );
}

export default SeccionPlagas;
