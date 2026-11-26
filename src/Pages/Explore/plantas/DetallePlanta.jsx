
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useJardinStore } from "../../../store/useJardinStore";
import { obtenerPlanta, obtenerImagen } from "../../../services/api";
import atras from "../../../assets/atras.png";

function DetallePlanta() {

    // obtenemos el id de la planta desde la url
    const { id } = useParams();

    // permite regresar a la pantalla anterior
    const navigate = useNavigate();

    const [mostrarModal, setMostrarModal] = useState(false);
    const [agregando, setAgregando] = useState(false);
    const [errorAgregar, setErrorAgregar] = useState("");

    const handleAgregarPlanta = async () => {
        if (!planta || agregando || yaAgregada) return;

        if (!localStorage.getItem("token")) {
            setErrorAgregar("Debes iniciar sesión para añadir plantas a tu jardín.");
            return;
        }

        setAgregando(true);
        setErrorAgregar("");

        try {
            await agregarPlanta(planta.id);
            setMostrarModal(true);
        } catch (error) {
            setErrorAgregar(error.message || "No se pudo agregar la planta.");
        } finally {
            setAgregando(false);
        }
    };

    // guardamos la información de la planta
    const [planta, setPlanta] = useState(null);

    // controlamos la carga
    const [cargando, setCargando] = useState(true);

    // guardamos posibles errores
    const [error, setError] = useState("");

    // Obtenemos las plantas y la acción del store
    const plantasJardin = useJardinStore(
        (state) => state.plantas
    );

    const agregarPlanta = useJardinStore((state) => state.agregarPlanta);
    const cargarPlantasJardin = useJardinStore((state) => state.cargarPlantas);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            cargarPlantasJardin().catch(console.error);
        }
    }, [cargarPlantasJardin]);

    // Comprobamos si la planta ya está en el jardín
    const yaAgregada = plantasJardin.some(
        (item) => String(item.planta_id ?? item.plant?.id) === String(planta?.id)
    );

    // Consultamos la ficha de la planta seleccionada
    useEffect(() => {
        let activo = true;

        const cargarPlanta = async () => {
            try {
                setCargando(true);
                setError("");
                const respuesta = await obtenerPlanta(id);
                const datos = respuesta?.data?.plant || respuesta?.data?.planta ||
                    respuesta?.data || respuesta?.plant || respuesta?.planta || respuesta;

                if (activo) {
                    if (datos?.id) setPlanta(datos);
                    else setError("No encontramos la información de esta planta.");
                }
            } catch (error) {
                if (activo) setError("No fue posible cargar la información.");
            } finally {
                if (activo) setCargando(false);
            }
        };

        cargarPlanta();
        return () => { activo = false; };
    }, [id]);

    // obtenemos la imagen de la planta
    const imagenPlanta = () => {

        const imagen =
            planta?.image_plant?.image ||
            planta?.imagenes?.[0]?.image ||
            planta?.imagenes?.[0]?.imagen ||
            planta?.imagenes?.[0]?.ruta ||
            planta?.image_url ||
            planta?.image ||
            planta?.imagen;

        return imagen ? obtenerImagen(imagen) : null;
    };

    // mostramos los datos principales
    const datosPlanta = [
        {
            nombre: "Tipo",
            valor: planta?.tipo || planta?.type || "No especificado",
            icono: "tipo"
        },
        {
            nombre: "Clima",
            valor: planta?.climate || planta?.clima || "No especificado",
            icono: "clima"
        },
        {
            nombre: "Tamaño",
            valor: planta?.size || planta?.tamano || "No especificado",
            icono: "tamano"
        }
    ];

    // iconos de los datos
    const IconoDato = ({ tipo }) => {

        if (tipo === "tipo") {
            return (
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 21V11" strokeLinecap="round" />
                    <path d="M12 13C5 13 4 7 4 4c5 0 8 2 8 9Z" />
                    <path d="M12 16c0-5 3-8 8-8 0 4-2 8-8 8Z" />
                </svg>
            );
        }

        if (tipo === "clima") {
            return (
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
                </svg>
            );
        }

        return (
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 3v18M8 7h8M8 17h8" />
                <path d="M9 3h6M9 21h6" />
            </svg>
        );
    };

    // mensaje de carga
    if (cargando) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F8F7F3]">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#DDE5D6] border-t-[#7DA46C]"></div>
                    <p className="text-lg text-[#718568]">
                        Cargando información de la planta...
                    </p>
                </div>
            </main>
        );
    }

    // mensaje de error
    if (error || !planta) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8F7F3] px-6 text-center">

                <h2 className="font-serif text-3xl font-bold text-[#3F5D3F]">
                    ¡Ups!
                </h2>

                <p className="mt-3 text-[#888888]">
                    {error || "No encontramos esta planta."}
                </p>

                <button
                    onClick={() => navigate("/explorar")}
                    className="mt-6 rounded-xl bg-[#7DA46C] px-7 py-3 font-semibold text-white transition hover:bg-[#5F8A52]"
                >
                    Volver a explorar
                </button>

            </main>
        );
    }


    return (
        <main className="min-h-screen bg-[#F8F6F1] font-serif">

            <section className="relative min-h-screen">

                {/* botón para regresar */}
                <button
                    onClick={() => navigate(-1)}
                    title="Volver"
                    aria-label="Volver a explorar"
                    className="absolute left-5 top-5 z-30 transition-transform duration-300 hover:-translate-x-1 sm:left-[5%] sm:top-3"
                >
                    <img
                        src={atras}
                        alt="Regresar"
                        className="h-[65px] w-[65px] cursor-pointer object-contain transition-all duration-300 ease-in-out hover:scale-110 hover:-translate-x-1"
                    />
                </button>

                {/* distribución principal */}
                <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-8 px-5 pb-10 pt-24 lg:min-h-screen lg:flex-row lg:items-start lg:gap-[5%] lg:px-[5%] lg:pb-0 lg:pt-3">

                    {/* fotografía */}
                    <div className="w-full lg:mt-[140px] lg:w-[52%] lg:shrink-0">

                        {imagenPlanta() ? (
                            <img
                                src={imagenPlanta()}
                                alt={planta.nombre_comun || planta.common_name}
                                className="h-[350px] w-full rounded-[25px] object-cover shadow-[1px_3px_6px_#555] sm:h-[480px] lg:h-[555px] lg:rounded-[30px]"
                            />
                        ) : (
                            <div className="flex h-[350px] items-center justify-center rounded-[25px] bg-[#E9EDE4] text-[#718568] sm:h-[480px] lg:h-[555px]">
                                Sin imagen disponible
                            </div>
                        )}

                    </div>

                    {/* tarjeta de información */}
                    <aside className="w-full rounded-[20px] border border-[#D0D0D0] bg-[#F8F6F1] px-6 py-10 shadow-[0_4px_10px_rgba(0,0,0,0.08)] sm:px-12 lg:min-h-[720px] lg:w-[48%] lg:shrink-0 lg:px-[7%] lg:py-[75px]">

                        <div className="mx-auto w-full max-w-[430px]">

                            {/* nombre de la planta */}
                            <h1 className="text-3xl font-bold leading-tight text-black sm:text-[36px]">
                                {planta.nombre_cientifico || planta.scientific_name || "Nombre científico no disponible"}
                            </h1>

                            {/* apodo */}
                            <p className="mt-6 text-xl italic text-[#B0B0B0] sm:text-[26px]">
                                "{planta.nickname || planta.local_nickname || planta.nombre_comun || planta.common_name}"
                            </p>

                            {/* descripción */}
                            <p className="mt-7 text-[17px] leading-[1.3] text-black sm:text-[20px]">
                                {planta.descripcion || planta.plant_description || "No hay una descripción disponible para esta planta."}
                            </p>

                            {/* origen */}
                            <p className="mt-5 text-base text-[#858585] sm:text-[19px]">
                                <strong>Origen:</strong> {planta.origen || planta.origin || "No especificado"}
                            </p>

                            {/* características */}
                            <div className="mt-5 grid grid-cols-3 gap-3">

                                {datosPlanta.map((dato) => (
                                    <div
                                        key={dato.nombre}
                                        className="flex flex-col items-center text-center"
                                    >

                                        {/* círculo del icono */}
                                        <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-[#D0D0D0] text-[#C0C5BE] sm:h-[63px] sm:w-[63px]">
                                            <IconoDato tipo={dato.icono} />
                                        </div>

                                        {/* información */}
                                        <p className="mt-3 text-[13px] text-[#858585] sm:text-[15px]">
                                            {dato.nombre}: {dato.valor}
                                        </p>

                                    </div>
                                ))}

                            </div>

                            {/* enlace a cuidados */}
                            <Link
                                to={`/cuidados/${planta.id}`}
                                className="mt-7 block text-center text-base text-[#858585] underline transition-colors hover:text-[#4F795B] sm:text-[18px]"
                            >
                                Ver cuidados detallados
                            </Link>

                            {errorAgregar && (
                                <p role="alert" className="mt-5 text-center text-sm text-red-600">
                                    {errorAgregar}
                                </p>
                            )}

                            {/* botón añadir al jardín */}
                            <button
                                type="button"
                                onClick={handleAgregarPlanta}
                                disabled={yaAgregada || agregando || mostrarModal}
                                className={`mx-auto mt-6 flex h-[46px] w-[85%] items-center justify-center rounded-[15px] text-base font-bold italic text-white transition-all duration-300 ${yaAgregada
                                    ? "cursor-not-allowed bg-[#A3B18A]"
                                    : "bg-[#7DA46C] hover:bg-[#5F8A52] hover:shadow-md"
                                    }`}
                            >
                                {agregando ? "Añadiendo..." : yaAgregada ? "✓ Añadida a mi Jardín" : "+ Añadir a mi Jardín"}
                            </button>

                        </div>

                    </aside>

                </div>

                {mostrarModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">

                        <div className="w-full max-w-sm rounded-3xl bg-[#F8F7F3] p-8 text-center shadow-2xl animate-in zoom-in duration-300">

                            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#E5EDDF]">
                                <span className="text-4xl text-[#5F8A52]">✓</span>
                            </div>

                            <h2 className="mb-3 text-2xl font-bold text-[#3F5D3F]">
                                ¡Excelente!
                            </h2>

                            <p className="mb-6 text-base text-gray-600">
                                ¡Planta añadida correctamente a tu jardín!
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/jardin")}
                                className="rounded-xl bg-[#7DA46C] px-6 py-3 font-semibold text-white hover:bg-[#5F8A52]"
                            >
                                Ir a Mi Jardín
                            </button>



                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}

export default DetallePlanta;