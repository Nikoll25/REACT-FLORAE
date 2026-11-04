
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPlantas, obtenerImagen } from "../../services/api";

import atras from "../../assets/atras.png";
import gota from "../../assets/gota.png";
import sol from "../../assets/sol.png";
import temperatura from "../../assets/temperatura.png";
import fertilizante from "../../assets/Fertilizante.png";
import alerta from "../../assets/alerta.png";
import idea from "../../assets/idea.png";

function CuidadosPlanta() {

    // obtenemos el id de la planta desde la url
    const { id } = useParams();

    // permite regresar a la pantalla anterior
    const navigate = useNavigate();

    // guardamos la información de la planta
    const [planta, setPlanta] = useState(null);

    // controlamos la carga
    const [cargando, setCargando] = useState(true);

    // guardamos posibles errores
    const [error, setError] = useState("");

    // consultamos las plantas y buscamos la seleccionada
    useEffect(() => {

        const cargarPlanta = async () => {
            try {
                setCargando(true);
                setError("");

                const respuesta = await obtenerPlantas();

                // comprobamos cómo viene la respuesta de la api
                const datos = Array.isArray(respuesta)
                    ? respuesta
                    : respuesta?.data || respuesta?.plants || [];

                console.log("respuesta de plantas:", respuesta);

                const plantaEncontrada = datos.find(
                    (item) => String(item.id) === String(id)
                );

                if (plantaEncontrada) {
                    console.log("planta encontrada:", plantaEncontrada);
                    console.log("cuidados de la planta:", plantaEncontrada.plant_cares);

                    setPlanta(plantaEncontrada);
                } else {
                    setError("No encontramos la información de esta planta.");
                }

            } catch (error) {
                console.error("error al cargar la planta:", error);
                setError("No fue posible cargar la información.");
            } finally {
                setCargando(false);
            }
        };

        cargarPlanta();

    }, [id]);

    // obtenemos la imagen de la planta
    const imagenPlanta = () => {

        const imagen =
            planta?.image_plant?.image ||
            planta?.image_url ||
            planta?.image ||
            planta?.imagen;

        return imagen ? obtenerImagen(imagen) : null;
    };

    // obtenemos los cuidados registrados para la planta
    const cuidados = Array.isArray(planta?.plant_cares)
        ? planta.plant_cares
        : [];

    // buscamos cada tipo de cuidado
    const obtenerCuidado = (tipo) => {

        const normalizar = (texto) => {
            return String(texto || "")
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
        };

        const cuidado = cuidados.find(
            (item) => normalizar(item.tipo) === normalizar(tipo)
        );

        if (!cuidado) {
            return "No especificado";
        }

        const frecuencia = cuidado.frecuencia || "";
        const descripcion = cuidado.descripcion || "";

        return [frecuencia, descripcion]
            .filter(Boolean)
            .join(". ");
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

                {/* distribución principal */}
                <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-8 px-5 pb-10 pt-24 lg:min-h-screen lg:flex-row lg:items-start lg:gap-[5%] lg:px-[5%] lg:pb-0 lg:pt-3">

                    {/* fotografía */}
                    <div className="w-full lg:mt-[140px] lg:w-[52%] lg:shrink-0">

                        {imagenPlanta() ? (
                            <img
                                src={imagenPlanta()}
                                alt={planta.common_name}
                                className="h-[350px] w-full rounded-[25px] object-cover shadow-[1px_3px_6px_#555] sm:h-[480px] lg:h-[555px] lg:rounded-[30px]"
                            />
                        ) : (
                            <div className="flex h-[350px] items-center justify-center rounded-[25px] bg-[#E9EDE4] text-[#718568] sm:h-[480px] lg:h-[555px]">
                                Sin imagen disponible
                            </div>
                        )}

                    </div>
                    {/* tarjeta de información */}
                    <aside className="relative w-full rounded-[20px] border border-[#D0D0D0] bg-[#F8F6F1] px-6 py-10 shadow-[0_4px_10px_rgba(0,0,0,0.08)] sm:px-12 lg:min-h-[720px] lg:w-[48%] lg:shrink-0 lg:px-[7%] lg:py-[75px]">

                        {/* botón para regresar */}
                        <button
                            onClick={() => navigate(-1)}
                            title="Volver"
                            aria-label="Volver"
                            className="absolute left-5 top-4 z-20 transition-transform duration-300 hover:-translate-x-1"
                        >
                            <img
                                src={atras}
                                alt="Regresar"
                                className="h-[50px] w-[50px] cursor-pointer object-contain transition-transform duration-300 hover:scale-110"
                            />
                        </button>

                        <div className="mx-auto w-full max-w-[430px] text-center">

                            {/* aquí continúa todo tu contenido actual */}

                            {/* encabezado */}
                            <h1 className="mb-2 pt-2 font-sans text-[30px] font-semibold text-[#424242]">
                                Cuidados esenciales
                            </h1>

                            {/* nombre de la planta */}
                            <div className="mb-5 px-4">
                                <h3 className="text-[25px] font-semibold text-[#333333]">
                                    {planta.common_name}
                                </h3>

                                <p className="text-[19px] text-[#999999]">
                                    <i>
                                        "{planta.nickname || planta.local_nickname || planta.common_name}"
                                    </i>
                                </p>
                            </div>

                            {/* cuadros de cuidados */}
                            <div className="flex w-full flex-wrap justify-center gap-4">

                                {/* riego */}
                                <div className="flex h-[170px] w-[195px] flex-none flex-col items-center justify-start gap-2.5 rounded-[20px] border-[3.5px] border-[#adadad] px-2 pt-2.5 shadow-[1px_3px_rgba(173,173,173,0.214)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]">

                                    <p className="font-sans text-[#717171]">
                                        <b>Riego</b>
                                    </p>

                                    <div className="mt-1 flex h-[55px] w-[55px] flex-none items-center justify-center rounded-full border-2 border-[#afafaf]">
                                        <img src={gota} alt="Riego" className="w-[60%]" />
                                    </div>

                                    <p className="font-sans text-[13px] text-[#717171]">
                                        {obtenerCuidado("Riego")}
                                    </p>

                                </div>

                                {/* luz */}
                                <div className="flex h-[170px] w-[195px] flex-none flex-col items-center justify-start gap-2.5 rounded-[20px] border-[3.5px] border-[#adadad] px-2 pt-2.5 shadow-[1px_3px_rgba(173,173,173,0.214)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]">

                                    <p className="font-sans text-[#717171]">
                                        <b>Luz</b>
                                    </p>

                                    <div className="mt-1 flex h-[55px] w-[55px] flex-none items-center justify-center rounded-full border-2 border-[#afafaf]">
                                        <img src={sol} alt="Luz" className="w-[60%]" />
                                    </div>

                                    <p className="font-sans text-[13px] text-[#717171]">
                                        {obtenerCuidado("Luz")}
                                    </p>

                                </div>

                                {/* temperatura */}
                                <div className="flex h-[170px] w-[195px] flex-none flex-col items-center justify-start gap-2.5 rounded-[20px] border-[3.5px] border-[#adadad] px-2 pt-2.5 shadow-[1px_3px_rgba(173,173,173,0.214)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]">

                                    <p className="font-sans text-[#717171]">
                                        <b>Temperatura</b>
                                    </p>

                                    <div className="mt-1 flex h-[55px] w-[55px] flex-none items-center justify-center rounded-full border-2 border-[#afafaf]">
                                        <img src={temperatura} alt="Temperatura" className="w-[60%]" />
                                    </div>

                                    <p className="font-sans text-[13px] text-[#717171]">
                                        {obtenerCuidado("Temperatura")}
                                    </p>

                                </div>

                                {/* fertilización */}
                                <div className="flex h-[170px] w-[195px] flex-none flex-col items-center justify-start gap-2.5 rounded-[20px] border-[3.5px] border-[#adadad] px-2 pt-2.5 shadow-[1px_3px_rgba(173,173,173,0.214)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]">

                                    <p className="font-sans text-[#717171]">
                                        <b>Fertilización</b>
                                    </p>

                                    <div className="mt-1 flex h-[55px] w-[55px] flex-none items-center justify-center rounded-full border-2 border-[#afafaf]">
                                        <img src={fertilizante} alt="Fertilización" className="w-[60%]" />
                                    </div>

                                    <p className="font-sans text-[12px] text-[#717171]">
                                        {obtenerCuidado("Fertilización")}
                                    </p>

                                </div>

                            </div>

                            {/* recomendaciones y advertencias */}
                            <h6 className="mb-3 mt-5 font-sans text-[21px] font-semibold text-[#424242]">
                                Recomendaciones y advertencias
                            </h6>

                            <div className="flex w-full flex-col items-center gap-3">

                                {/* advertencia */}
                                <div className="flex min-h-[80px] w-full items-center justify-center rounded-[20px] border border-[#9e9e9e] p-2 shadow-[1px_3px_3px_rgba(164,164,164,0.205)]">

                                    <div className="flex min-h-[58px] w-full items-center gap-2 rounded-[15px] bg-[#f0e4cf] px-3 py-2 transition-all duration-300 hover:border-l-[3px] hover:border-[#c0392b]">

                                        <img
                                            src={alerta}
                                            alt="Advertencia"
                                            className="h-[35px] w-[35px] flex-none object-contain"
                                        />

                                        <p className="text-left font-sans text-[13px] text-[#555555]">
                                            {planta.warning || planta.advertencia || "No hay advertencias disponibles."}
                                        </p>

                                    </div>
                                </div>

                                {/* recomendación */}
                                <div className="flex min-h-[80px] w-full items-center justify-center rounded-[20px] border border-[#9e9e9e] p-2 shadow-[1px_3px_3px_rgba(164,164,164,0.205)]">

                                    <div className="flex min-h-[58px] w-full items-center gap-2 rounded-[15px] bg-[#f8f6f1] px-3 py-2 transition-all duration-300 hover:border-l-[3px] hover:border-[#c0392b]">

                                        <img
                                            src={idea}
                                            alt="Recomendación"
                                            className="h-[35px] w-[35px] flex-none object-contain"
                                        />

                                        <p className="text-left font-sans text-[13px] text-[#555555]">
                                            {planta.recomendacion || planta.recommendation || "No hay recomendaciones disponibles."}
                                        </p>

                                    </div>
                                </div>

                            </div>

                        </div>

                    </aside>

                </div>

            </section>

        </main>
    );
}

export default CuidadosPlanta;
