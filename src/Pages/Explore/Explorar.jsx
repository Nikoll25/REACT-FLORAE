
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerPlantas, obtenerImagen } from "../../services/api";

function Explorar() {

    // guardamos las plantas que vienen de la api
    const [plantas, setPlantas] = useState([]);

    // controlamos el texto del buscador
    const [busqueda, setBusqueda] = useState("");

    // controlamos la carga de información
    const [cargando, setCargando] = useState(true);

    // guardamos los posibles errores
    const [error, setError] = useState("");

    // consultamos las plantas al abrir la pantalla
    useEffect(() => {
        const cargarPlantas = async () => {
            try {
                setCargando(true);
                setError("");

                const datos = await obtenerPlantas();
                setPlantas(datos);

            } catch (error) {
                console.error("error al cargar plantas:", error);
                setError("No fue posible cargar las plantas.");
            } finally {
                setCargando(false);
            }
        };

        cargarPlantas();
    }, []);

    // filtramos las plantas por nombre común, científico o apodos
    const plantasFiltradas = plantas.filter((planta) => {

        const texto = busqueda.toLowerCase().trim();

        const nombres = [
            planta.common_name || "",
            planta.scientific_name || "",
            planta.nickname || "",
            planta.local_nickname || "",
            ...(Array.isArray(planta.apodos) ? planta.apodos : [planta.apodos || ""])
        ];

        return nombres.some((nombre) =>
            String(nombre).toLowerCase().includes(texto)
        );
    });

    // obtenemos la imagen de cada planta
    const imagenPlanta = (planta) => {
        const imagen =
            planta.image_plant?.image ||
            planta.image_url ||
            planta.image ||
            planta.imagen;

        return imagen ? obtenerImagen(imagen) : null;
    };

    return (
        <main className="min-h-screen bg-[#F8F7F3] pb-16">

            {/* encabezado */}
            <section className="px-6 pt-12 sm:px-10 sm:pt-16 lg:px-16 xl:px-20">

                <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-[#171717] sm:text-5xl lg:text-[50px]">
                    Encuentra y expande tu colección
                </h1>

                <p className="mt-4 max-w-2xl text-base text-[#858585] sm:text-lg">
                    Descubre nuevas especies y encuentra la planta perfecta
                    para darle vida a tu espacio.
                </p>

                {/* buscador */}
                <div className="relative mt-8 flex h-[68px] w-full max-w-[730px] items-center overflow-hidden rounded-[25px] border border-[#EEECE6] bg-white shadow-[0_3px_7px_rgba(0,0,0,0.12)] transition-all duration-300 focus-within:shadow-[0_5px_15px_rgba(91,120,76,0.15)]">

                    <input
                        type="text"
                        placeholder="Busca por nombre común, científico o apodos"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="h-full min-w-0 flex-1 bg-transparent px-5 text-base text-[#333333] outline-none placeholder:text-[#AAAAAA] sm:px-[30px] sm:text-[18px]"
                    />

                    {busqueda && (
                        <button
                            type="button"
                            onClick={() => setBusqueda("")}
                            className="mr-2 rounded-full px-3 py-2 text-sm text-[#888888] transition-colors hover:bg-[#F1F2EC] hover:text-[#48643F]"
                            aria-label="Limpiar búsqueda"
                        >
                            Limpiar
                        </button>
                    )}

                    <div className="flex h-full w-[78px] shrink-0 items-center justify-center rounded-[23px] bg-[#EEEEEE] text-[#888888]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="27"
                            height="27"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>

                </div>

            </section>

            {/* accesos laterales */}
            <aside className="fixed right-3 top-8 z-20 flex flex-col gap-2 sm:right-5 sm:top-9">

                {/* acceso a plantas */}
                <Link
                    to="/explorar"
                    className="flex h-[58px] w-[62px] items-center justify-center rounded-[20px] bg-[#88A675] text-white shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#779765] hover:shadow-lg sm:h-[61px] sm:w-[72px]"
                    title="Plantas"
                    aria-label="Explorar plantas"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="27"
                        height="27"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M11 20A7 7 0 0 1 4 13c0-5 8-10 8-10s8 5 8 10a7 7 0 0 1-9 7Z" />
                        <path d="M12 22V12" />
                    </svg>
                </Link>

                {/* acceso a plagas */}
                <Link
                    to="/explorarplaga"
                    className="flex h-[58px] w-[62px] items-center justify-center rounded-[20px] bg-white text-[#48643F] shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#F0F4EC] hover:shadow-lg sm:h-[61px] sm:w-[72px]"
                    title="Plagas"
                    aria-label="Explorar plagas"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="27"
                        height="27"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 12v.01" />
                        <path d="M12 7V4" />
                        <path d="M12 16v4" />
                        <path d="M7 12H4" />
                        <path d="M20 12h-3" />
                        <path d="m5 5 2 2" />
                        <path d="m17 17 2 2" />
                        <path d="m19 5-2 2" />
                        <path d="m7 17-2 2" />
                        <circle cx="12" cy="12" r="5" />
                    </svg>
                </Link>

            </aside>

            {/* listado de plantas */}
            <section className="px-6 pt-12 sm:px-10 lg:px-16 xl:px-20">
                {/* mensaje de carga */}
                {cargando && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-[320px] animate-pulse rounded-[20px] bg-white p-3 shadow-sm"
                            >
                                <div className="h-[205px] rounded-[16px] bg-[#E8EAE3]"></div>
                                <div className="mx-auto mt-5 h-4 w-3/4 rounded bg-[#E8EAE3]"></div>
                                <div className="mx-auto mt-3 h-3 w-1/2 rounded bg-[#EEEEEE]"></div>
                            </div>
                        ))}

                    </div>
                )}

                {/* mensaje de error */}
                {!cargando && error && (
                    <div className="mx-auto max-w-lg rounded-[20px] border border-[#E9E5DC] bg-white px-6 py-12 text-center shadow-sm">

                        <p className="mb-5 text-lg text-red-600">
                            {error}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-xl bg-[#88A675] px-6 py-3 font-medium text-white transition-colors hover:bg-[#6F8E5C]"
                        >
                            Intentar nuevamente
                        </button>

                    </div>
                )}

                {/* tarjetas de plantas */}
                {!cargando && !error && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {plantasFiltradas.map((planta) => {

                            const imagen = imagenPlanta(planta);

                            return (

                                <Link
                                    key={planta.id}
                                    to={`/planta/${planta.id}`}
                                    className="group min-w-0 overflow-hidden rounded-[20px] border border-[#EFEEE9] bg-white p-3 shadow-[0_3px_7px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                                >
                                    {/* imagen */}
                                    <div className="h-[200px] w-full overflow-hidden rounded-[17px] bg-[#E9EDE4]">
                                        {imagenPlanta(planta) ? (
                                            <img
                                                src={imagenPlanta(planta)}
                                                alt={planta.common_name}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[#819475]">
                                                Sin imagen
                                            </div>
                                        )}
                                    </div>

                                    {/* información */}
                                    <div className="px-2 pb-4 pt-4 text-center">
                                        <h3 className="truncate text-[21px] font-bold text-[#202020] group-hover:text-[#638052]">
                                            {planta.scientific_name}
                                        </h3>

                                        <p className="mt-1 truncate text-[18px] italic text-[#909090]">
                                            {planta.common_name || "Nombre común no disponible"}
                                        </p>
                                    </div>
                                </Link>

                            );
                        })}

                        {/* cuando no hay resultados */}
                        {plantasFiltradas.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center rounded-[20px] border border-[#EAE8E0] bg-white px-5 py-16 text-center shadow-sm">

                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E9EDE4] text-[#789267]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="30"
                                        height="30"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                </div>

                                <h3 className="font-serif text-2xl font-bold text-[#333333]">
                                    No encontramos plantas
                                </h3>

                                <p className="mt-2 text-[#929292]">
                                    Intenta buscar con otro nombre o palabra.
                                </p>

                                <button
                                    onClick={() => setBusqueda("")}
                                    className="mt-5 rounded-full bg-[#88A675] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6F8E5C]"
                                >
                                    Ver todas las plantas
                                </button>

                            </div>
                        )}

                    </div>
                )}

            </section>

        </main>
    );
}

export default Explorar;
