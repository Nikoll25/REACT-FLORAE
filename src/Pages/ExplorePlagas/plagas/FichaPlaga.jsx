
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScanSearch } from "lucide-react";
import {
    obtenerPlaga,
    obtenerImagen,
    registrarPlagaJardin,
} from "../../../services/api";
import { useJardinStore } from "../../../store/useJardinStore";
import GaleriaPlanta from "../../../Components/GaleriaPlanta";
import atras from "../../../assets/atras.png";

function FichaPlaga() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [plaga, setPlaga] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const [mostrarModal, setMostrarModal] = useState(false);
    const [registroExitoso, setRegistroExitoso] = useState(false);
    const [plantaSeleccionada, setPlantaSeleccionada] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [errorRegistro, setErrorRegistro] = useState("");
    const [cargandoJardin, setCargandoJardin] = useState(false);

    const plantasJardin = useJardinStore((state) => state.plantas);
    const cargarPlantas = useJardinStore((state) => state.cargarPlantas);

    // Consultamos la plaga seleccionada
    useEffect(() => {
        let activo = true;

        const cargarPlaga = async () => {
            try {
                setCargando(true);
                setError("");
                setPlaga(null);

                const datos = await obtenerPlaga(id);

                if (!activo) return;

                const encontrada =
                    datos?.plaga ||
                    datos?.data?.plaga ||
                    datos?.data ||
                    datos;

                if (encontrada?.id) {
                    setPlaga(encontrada);
                } else {
                    setError("No encontramos esta plaga.");
                }
            } catch (error) {
                if (!activo) return;

                console.error("Error al cargar la plaga:", error);
                setError(error.message);
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        };

        cargarPlaga();

        return () => {
            activo = false;
        };
    }, [id]);

    // Obtenemos el nombre de una planta del jardín
    const nombrePlanta = (registro) => {
        const planta = registro.plant || registro.planta || {};

        return (
            planta.nombre_comun ||
            planta.common_name ||
            planta.nombre_cientifico ||
            planta.scientific_name ||
            registro.nombre_comun ||
            `Planta ${registro.planta_id || registro.id}`
        );
    };

    // Obtenemos la imagen de una planta del jardín
    const imagenPlanta = (registro) => {
        const planta = registro.plant || registro.planta || {};

        const primeraImagen = planta.imagenes?.[0];

        const ruta =
            planta.imagenes?.find((imagen) => imagen.es_principal)?.ruta ||
            primeraImagen?.ruta ||
            primeraImagen?.image ||
            planta.image_plant?.image ||
            planta.image_url ||
            planta.image ||
            planta.imagen;

        return ruta ? obtenerImagen(ruta) : null;
    };

    // Abrimos el modal y consultamos las plantas del jardín
    const abrirModal = async () => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }

        setMostrarModal(true);
        setRegistroExitoso(false);
        setPlantaSeleccionada(null);
        setErrorRegistro("");
        setCargandoJardin(true);

        try {
            await cargarPlantas();
        } catch (error) {
            setErrorRegistro(error.message);
        } finally {
            setCargandoJardin(false);
        }
    };

    // Registramos la plaga en la planta seleccionada
    const agregarPlaga = async () => {
        if (plantaSeleccionada === null || guardando) {
            return;
        }

        try {
            setGuardando(true);
            setErrorRegistro("");

            await registrarPlagaJardin(
                Number(id),
                plantaSeleccionada
            );

            setRegistroExitoso(true);
        } catch (error) {
            console.error("Error al registrar la plaga:", error);
            setErrorRegistro(error.message);
        } finally {
            setGuardando(false);
        }
    };

    const cerrarModal = () => {
        if (guardando) return;

        setMostrarModal(false);
        setRegistroExitoso(false);
        setPlantaSeleccionada(null);
        setErrorRegistro("");
    };

    // Organizamos los cuatro síntomas de la plaga
    const sintomas = [
        plaga?.sintoma_1,
        plaga?.sintoma_2,
        plaga?.sintoma_3,
        plaga?.sintoma_4,
    ].filter(Boolean);

    if (cargando) {
        return (
            <main className="min-h-screen bg-[#F8F7F3] px-6 py-16">
                <div className="mx-auto flex max-w-[1400px] flex-col gap-8 lg:flex-row">
                    <div className="h-[450px] animate-pulse rounded-[30px] bg-[#E8EAE3] lg:w-1/2" />
                    <div className="h-[650px] animate-pulse rounded-[30px] bg-[#E8EAE3] lg:w-1/2" />
                </div>
            </main>
        );
    }

    if (error || !plaga) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8F7F3] px-6 text-center">
                <h2 className="font-serif text-3xl font-bold text-[#3F5D3F]">
                    ¡Ups!
                </h2>

                <p className="mt-3 text-[#888888]">
                    {error || "No encontramos esta plaga."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/explorar/plagas")}
                    className="mt-6 rounded-xl bg-[#7DA46C] px-7 py-3 font-semibold text-white hover:bg-[#5F8A52]"
                >
                    Volver a explorar
                </button>
            </main>
        );
    }

    const nombreComun =
        plaga.nombre_comun ||
        "Nombre común no disponible";

    const nombreCientifico =
        plaga.nombre_cientifico ||
        "Nombre científico no disponible";

    const descripcion =
        plaga.descripcion ||
        "No hay una descripción disponible para esta plaga.";


    return (
        <main className="min-h-screen bg-[#F8F6F1] font-serif">
            <section className="relative min-h-screen">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    title="Volver"
                    aria-label="Volver a explorar"
                    className="absolute left-5 top-5 z-30 transition-transform duration-300 hover:-translate-x-1 sm:left-[5%] sm:top-3"
                >
                    <img
                        src={atras}
                        alt="Regresar"
                        className="h-[65px] w-[65px] object-contain transition-all duration-300 hover:scale-110"
                    />
                </button>

                <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-8 px-5 pb-10 pt-24 lg:min-h-screen lg:flex-row lg:items-start lg:gap-[5%] lg:px-[5%] lg:pb-0 lg:pt-3">
                    <div className="w-full lg:mt-[140px] lg:w-[52%] lg:shrink-0">
                        <GaleriaPlanta key={plaga.id} planta={{ ...plaga, imagenes: [...(plaga.imagenes || [])].sort((a, b) => Number(Boolean(b?.es_principal)) - Number(Boolean(a?.es_principal))) }} />
                    </div>

                    <aside className="w-full rounded-[20px] border border-[#D0D0D0] bg-[#F8F6F1] px-6 py-10 shadow-[0_4px_10px_rgba(0,0,0,0.08)] sm:px-12 lg:min-h-[720px] lg:w-[48%] lg:shrink-0 lg:px-[7%] lg:py-[75px]">
                        <div className="mx-auto w-full max-w-[500px]">
                            <h1 className="text-3xl font-bold leading-tight text-black sm:text-[36px]">
                                {nombreCientifico}
                            </h1>

                            <p className="mt-5 text-xl italic text-[#B0B0B0] sm:text-[26px]">
                                "{nombreComun}"
                            </p>

                            <p className="mt-7 text-[17px] leading-[1.5] text-black sm:text-[19px]">
                                {descripcion}
                            </p>

                            <div className="mt-8">
                                <h2 className="mb-5 text-xl font-bold text-[#3F5D3F]">Síntomas principales</h2>
                                {sintomas.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {sintomas.map((sintoma, index) => (
                                            <div key={index} className="flex min-h-[180px] min-w-0 flex-col items-center gap-3 rounded-[20px] border-2 border-[#CBD5C3]  px-3 py-4 text-center shadow-[1px_3px_5px_rgba(90,110,80,0.12)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_6px_16px_rgba(90,110,80,0.16)]">
                                                <p className="font-nunito text-sm font-bold text-[#65775D]">Síntoma {index + 1}</p>
                                                <div className="flex h-[55px] w-[55px] shrink-0 items-center justify-center rounded-full border-2 border-[#CBD9C1] bg-[#E8EFE3] text-[#7DA46C]">
                                                    <ScanSearch size={25} strokeWidth={1.7} aria-hidden="true" />
                                                </div>
                                                <p className="break-words font-nunito text-[14px] leading-relaxed text-[#717171]">{sintoma}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[#858585]">No hay síntomas registrados para esta plaga.</p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={abrirModal}
                                className="mx-auto mt-8 flex h-[46px] w-[85%] items-center justify-center rounded-[15px] bg-[#7DA46C] text-base font-bold italic text-white transition-all duration-300 hover:bg-[#5F8A52] hover:shadow-md"
                            >
                                + Añadir
                            </button>
                        </div>
                    </aside>
                </div>
            </section>

            {mostrarModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Registrar plaga"
                        className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-[25px] bg-[#F8F7F3] p-6 shadow-2xl sm:p-8"
                    >
                        {registroExitoso ? (
                            <div className="text-center">
                                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#E5EDDF]">
                                    <span className="text-4xl text-[#5F8A52]">
                                        ✓
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-[#3F5D3F]">
                                    ¡Plaga registrada!
                                </h2>

                                <p className="mt-4 text-base text-[#777777]">
                                    La plaga se registró correctamente en tu planta.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => navigate("/jardin")}
                                    className="mt-7 w-full rounded-xl bg-[#7DA46C] px-5 py-3 font-semibold text-white hover:bg-[#5F8A52]"
                                >
                                    Ir a Mi Jardín
                                </button>

                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="mt-3 w-full py-2 text-[#777777] hover:text-[#3F5D3F]"
                                >
                                    Cerrar
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#3F5D3F]">
                                            Selecciona una planta
                                        </h2>

                                        <p className="mt-2 font-sans text-sm text-[#858585]">
                                            ¿Cuál de tus plantas está afectada por {nombreComun}?
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={cerrarModal}
                                        disabled={guardando}
                                        aria-label="Cerrar"
                                        className="text-2xl text-[#858585] hover:text-[#3F5D3F]"
                                    >
                                        ×
                                    </button>
                                </div>

                                {cargandoJardin ? (
                                    <div className="mt-6 space-y-3">
                                        {[1, 2, 3].map((item) => (
                                            <div
                                                key={item}
                                                className="h-[78px] animate-pulse rounded-2xl bg-[#E8EAE3]"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="mt-6 max-h-[330px] space-y-3 overflow-y-auto pr-1">
                                            {plantasJardin.map((registro) => {
                                                const seleccionada =
                                                    plantaSeleccionada === registro.id;

                                                const imagenPlantaJardin =
                                                    imagenPlanta(registro);

                                                return (
                                                    <button
                                                        key={registro.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setPlantaSeleccionada(registro.id)
                                                        }
                                                        disabled={guardando}
                                                        className={`flex w-full items-center gap-4 rounded-2xl border-2 p-3 text-left transition ${
                                                            seleccionada
                                                                ? "border-[#7DA46C] bg-[#EEF3E7]"
                                                                : "border-[#E3E5DF] bg-white hover:border-[#A3B18A]"
                                                        }`}
                                                    >
                                                        {imagenPlantaJardin ? (
                                                            <img
                                                                src={imagenPlantaJardin}
                                                                alt={nombrePlanta(registro)}
                                                                className="h-[58px] w-[58px] rounded-xl object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-[58px] w-[58px] items-center justify-center rounded-xl bg-[#E9EDE4] text-[#819475]">
                                                                🌿
                                                            </div>
                                                        )}

                                                        <span className="min-w-0 flex-1 font-sans font-semibold text-[#3F5D3F]">
                                                            {nombrePlanta(registro)}
                                                        </span>

                                                        <span
                                                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                                                seleccionada
                                                                    ? "border-[#7DA46C] bg-[#7DA46C] text-white"
                                                                    : "border-[#BDBDBD]"
                                                            }`}
                                                        >
                                                            {seleccionada ? "✓" : ""}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {plantasJardin.length === 0 && !errorRegistro && (
                                            <div className="mt-5 rounded-2xl bg-white p-5 text-center">
                                                <p className="text-[#777777]">
                                                    Todavía no tienes plantas en tu jardín.
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() => navigate("/explorar")}
                                                    className="mt-3 font-semibold text-[#7DA46C] underline"
                                                >
                                                    Explorar plantas
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {errorRegistro && (
                                    <p
                                        role="alert"
                                        className="mt-4 rounded-xl bg-red-50 p-3 font-sans text-sm text-red-600"
                                    >
                                        {errorRegistro}
                                    </p>
                                )}

                                <div className="mt-7 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={cerrarModal}
                                        disabled={guardando}
                                        className="flex-1 rounded-xl border border-[#C9D3C2] px-4 py-3 font-semibold text-[#607458] disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={agregarPlaga}
                                        disabled={
                                            plantaSeleccionada === null ||
                                            guardando ||
                                            cargandoJardin ||
                                            Boolean(
                                                errorRegistro &&
                                                plantasJardin.length === 0
                                            )
                                        }
                                        className="flex-1 rounded-xl bg-[#7DA46C] px-4 py-3 font-semibold text-white transition hover:bg-[#5F8A52] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {guardando
                                            ? "Guardando..."
                                            : "Registrar plaga"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

export default FichaPlaga;
