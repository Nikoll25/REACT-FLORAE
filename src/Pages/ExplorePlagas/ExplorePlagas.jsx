
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerPlagas, obtenerImagen } from "../../services/api";

function ExplorarPlagas() {
    const [plagas, setPlagas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    // Consultamos las plagas registradas en Laravel
    useEffect(() => {
        const cargarPlagas = async () => {
            try {
                setCargando(true);
                setError("");

                const datos = await obtenerPlagas();

                setPlagas(Array.isArray(datos) ? datos : []);
            } catch (error) {
                console.error("Error al cargar plagas:", error);
                setError("No fue posible cargar las plagas.");
            } finally {
                setCargando(false);
            }
        };

        cargarPlagas();
    }, []);

    // Obtenemos el nombre científico
    const nombreCientifico = (plaga) => {
        return (
            plaga.scientific_name ||
            plaga.nombre_cientifico ||
            "Nombre científico no disponible"
        );
    };

    // Obtenemos el nombre común
    const nombreComun = (plaga) => {
        return (
            plaga.plague_name ||
            plaga.nombre_comun ||
            plaga.name ||
            plaga.nombre ||
            "Nombre común no disponible"
        );
    };

    // Obtenemos la imagen de la plaga
    const imagenPlaga = (plaga) => {
        const primeraImagen = plaga.imagenes?.[0];

        const imagen =
            plaga.image_plague?.image ||
            plaga.imageplague?.image ||
            (typeof primeraImagen === "string"
                ? primeraImagen
                : primeraImagen?.image ||
                  primeraImagen?.imagen ||
                  primeraImagen?.url ||
                  primeraImagen?.ruta) ||
            plaga.image_url ||
            plaga.image ||
            plaga.imagen;

        return imagen ? obtenerImagen(imagen) : null;
    };

    // Filtramos las plagas según el texto del buscador
    const plagasFiltradas = plagas.filter((plaga) => {
        const texto = busqueda.toLowerCase().trim();

        const nombres = [
            plaga.plague_name,
            plaga.scientific_name,
            plaga.nombre_comun,
            plaga.nombre_cientifico,
            plaga.name,
            plaga.nombre,
            plaga.plague_description,
            plaga.description,
            plaga.descripcion,
        ];

        return nombres.some((nombre) =>
            String(nombre || "").toLowerCase().includes(texto)
        );
    });

    return (
        <main className="min-h-screen bg-[#F8F7F3] pb-16">
            <section className="px-6 pt-12 sm:px-10 sm:pt-16 lg:px-16 xl:px-20">
                <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-[#171717] sm:text-5xl lg:text-[50px]">
                    Descubre y reconoce las plagas
                </h1>

                <p className="mt-4 max-w-2xl text-base text-[#858585] sm:text-lg">
                    Conoce las plagas que pueden afectar tus plantas y aprende
                    a identificarlas para proteger tu jardín.
                </p>

                <div className="relative mt-8 flex h-[68px] w-full max-w-[730px] items-center overflow-hidden rounded-[25px] border border-[#EEECE6] bg-white shadow-[0_3px_7px_rgba(0,0,0,0.12)] transition-all duration-300 focus-within:shadow-[0_5px_15px_rgba(91,120,76,0.15)]">
                    <input
                        type="text"
                        placeholder="Busca por nombre común o científico"
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

            <section className="px-6 pt-12 sm:px-10 lg:px-16 xl:px-20">
                {cargando && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-[320px] animate-pulse rounded-[20px] bg-white p-3 shadow-sm"
                            >
                                <div className="h-[205px] rounded-[16px] bg-[#E8EAE3]" />
                                <div className="mx-auto mt-5 h-4 w-3/4 rounded bg-[#E8EAE3]" />
                                <div className="mx-auto mt-3 h-3 w-1/2 rounded bg-[#EEEEEE]" />
                            </div>
                        ))}
                    </div>
                )}

                {!cargando && error && (
                    <div className="mx-auto max-w-lg rounded-[20px] border border-[#E9E5DC] bg-white px-6 py-12 text-center shadow-sm">
                        <p className="mb-5 text-lg text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="rounded-xl bg-[#88A675] px-6 py-3 font-medium text-white transition-colors hover:bg-[#6F8E5C]"
                        >
                            Intentar nuevamente
                        </button>
                    </div>
                )}

                {!cargando && !error && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {plagasFiltradas.map((plaga) => {
                            const imagen = imagenPlaga(plaga);
                            const cientifico = nombreCientifico(plaga);
                            const comun = nombreComun(plaga);

                            return (
                                <Link
                                    key={plaga.id}
                                    to={`/plaga/${plaga.id}`}
                                    className="group min-w-0 overflow-hidden rounded-[20px] border border-[#EFEEE9] bg-white p-3 shadow-[0_3px_7px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                                >
                                    <div className="h-[200px] w-full overflow-hidden rounded-[17px] bg-[#E9EDE4]">
                                        {imagen ? (
                                            <img
                                                src={imagen}
                                                alt={comun}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[#819475]">
                                                Sin imagen
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-2 pb-4 pt-4 text-center">
                                        <h3 className="truncate text-[21px] font-bold text-[#202020] group-hover:text-[#638052]">
                                            {cientifico}
                                        </h3>

                                        <p className="mt-1 truncate text-[18px] italic text-[#909090]">
                                            "{comun}"
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}

                        {plagasFiltradas.length === 0 && (
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
                                    No encontramos plagas
                                </h3>

                                <p className="mt-2 text-[#929292]">
                                    Intenta buscar con otro nombre o palabra.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setBusqueda("")}
                                    className="mt-5 rounded-full bg-[#88A675] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6F8E5C]"
                                >
                                    Ver todas las plagas
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}

export default ExplorarPlagas;
