
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AsistenteFlorae from "../../Components/AsistenteFlorae";
import { CircleCheck, Droplets, Sprout, AlertTriangle, HeartPulse, } from "lucide-react";
import { useJardinStore } from "../../store/useJardinStore";
import { obtenerImagen, obtenerActividadesPlanta, obtenerPlagasJardin, consultarAsistenteIA } from "../../services/api";

function Jardin() {


    const plantas = useJardinStore((state) => state.plantas);
    const cargarPlantas = useJardinStore((state) => state.cargarPlantas);
    const eliminarPlanta = useJardinStore((state) => state.eliminarPlanta);
    const cargando = useJardinStore((state) => state.cargando);
    const error = useJardinStore((state) => state.error);


    const [tipoSeleccionado, setTipoSeleccionado] = useState("todas");
    const [plantaSeleccionada, setPlantaSeleccionada] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [errorEliminacion, setErrorEliminacion] = useState("");
    // CARGAR PLANTAS DESDE LA API

    useEffect(() => {

        cargarPlantas().catch((error) => {
            console.error("Error al cargar el jardín:", error);
        });

    }, [cargarPlantas]);

    // Los tipos se obtienen de las plantas que tiene el usuario.
    const datosPlanta = (registro) => registro?.plant || {};

    const normalizar = (valor) => String(valor || "")
        .trim()
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const tipos = new Map();
    plantas.forEach((registro) => {
        const tipo = String(datosPlanta(registro).tipo || "").trim();
        if (tipo && !tipos.has(normalizar(tipo))) {
            tipos.set(normalizar(tipo), tipo);
        }
    });

    const filtros = [
        { nombre: "Todas", tipo: "todas" },
        ...Array.from(tipos, ([tipo, nombre]) => ({ nombre, tipo }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    ];

    useEffect(() => {
        if (!filtros.some((filtro) => filtro.tipo === tipoSeleccionado)) {
            setTipoSeleccionado("todas");
        }
    }, [plantas, tipoSeleccionado]);

    const plantasFiltradas = plantas.filter((registro) =>
        tipoSeleccionado === "todas" ||
        normalizar(datosPlanta(registro).tipo) === tipoSeleccionado
    );

    // Se consulta la salud de cada ejemplar por separado.
    const [saludPlantas, setSaludPlantas] = useState({});

    useEffect(() => {
        let vigente = true;
        if (!plantas.length) {
            setSaludPlantas({});
            return () => { vigente = false; };
        }

        const cargarSalud = async () => {
            const [resultadoPlagas, ...resultados] = await Promise.allSettled([
                obtenerPlagasJardin(),
                ...plantas.map((registro) => obtenerActividadesPlanta(registro.id)),
            ]);
            if (!vigente) return;

            const listaPlagas = resultadoPlagas.status === "fulfilled"
                ? resultadoPlagas.value?.plagas || resultadoPlagas.value?.plagas_jardin ||
                resultadoPlagas.value?.registros || resultadoPlagas.value?.data || resultadoPlagas.value
                : [];
            const plagas = Array.isArray(listaPlagas) ? listaPlagas : [];
            const estados = {};

            plantas.forEach((registro, indice) => {
                const resultado = resultados[indice];
                if (resultado.status !== "fulfilled") {
                    estados[registro.id] = { texto: "Estado no disponible", color: "#777777" };
                    return;
                }

                const tienePlaga = plagas.some((item) =>
                    String(item.planta_jardin_id ?? item.plant_jardin_id ?? item.planta_jardin?.id ?? "") === String(registro.id) &&
                    ["activa", "activo"].includes(normalizar(item.estado))
                );

                if (tienePlaga) {
                    estados[registro.id] = { texto: "Enferma", color: "#B54848" };
                    return;
                }

                const pendientes = resultado.value?.pendientes || [];
                const vencidas = (Array.isArray(pendientes) ? pendientes : []).filter((actividad) =>
                    actividad.estado === "pendiente" && actividad.estado_visual === "vencida"
                );
                const tiposVencidos = [...new Set(vencidas.map((actividad) =>
                    normalizar(actividad.plant_care?.tipo || actividad.tipo)
                ).filter(Boolean))];
                const nombres = tiposVencidos.map((tipo) =>
                    tipo === "fertilizacion" ? "fertilización" : tipo
                );
                estados[registro.id] = nombres.length
                    ? { texto: `Le falta ${nombres.join(" y ")}`, color: "#B7791F" }
                    : { texto: "Saludable", color: "#478863" };
            });

            if (resultadoPlagas.status !== "fulfilled") {
                // Sin datos de plagas no podemos asegurar que esté saludable.
                Object.keys(estados).forEach((id) => {
                    if (estados[id].texto === "Saludable") {
                        estados[id] = { texto: "Estado no disponible", color: "#777777" };
                    }
                });
            }
            setSaludPlantas(estados);
        };

        cargarSalud();
        return () => { vigente = false; };
    }, [plantas]);
    // OBTENER IMAGEN DE LA PLANTA

    const imagenPlanta = (registro) => {

        const planta = datosPlanta(registro);

        const primeraImagen = planta.imagenes?.[0];

        const rutaImagen =
            typeof primeraImagen === "string"
                ? primeraImagen
                : primeraImagen?.image ||
                primeraImagen?.imagen ||
                primeraImagen?.ruta ||
                primeraImagen?.image_url ||
                planta?.image_plant?.image ||
                planta?.image ||
                planta?.image_url ||
                planta?.imagen ||
                null;

        if (!rutaImagen) {
            return null;
        }

        return obtenerImagen(rutaImagen);
    };
    // ELIMINAR PLANTA DEL JARDÍN

    const confirmarEliminacion = async () => {

        if (!plantaSeleccionada || eliminando) {
            return;
        }

        setEliminando(true);
        setErrorEliminacion("");

        try {

            // ID del ejemplar en planta_jardins
            await eliminarPlanta(plantaSeleccionada.id);

            setPlantaSeleccionada(null);

        } catch (error) {

            console.error("Error al eliminar la planta:", error);

            setErrorEliminacion(error.message);

        } finally {

            setEliminando(false);

        }
    };
    // COMPONENTE

    const mostrarEstado = (estado) => {
        const texto = String(estado || "Saludable").trim();
        const normalizado = texto.toLowerCase();

        let Icono = CircleCheck;
        let color = "text-[#478863]";

        if (normalizado === "enferma") {
            Icono = HeartPulse;
            color = "text-[#B54848]";
        } else if (
            normalizado.includes("riego") ||
            normalizado.includes("agua")
        ) {
            Icono = Droplets;
            color = "text-[#B54848]";
        } else if (normalizado.startsWith("le falta")) {
            Icono = AlertTriangle;
            color = "text-[#B54848]";
        } else if (normalizado === "en crecimiento") {
            Icono = Sprout;
            color = "text-[#A5A51F]";
        }

        return (
            <div className={`mt-3 flex items-center justify-center gap-2 ${color}`}>
                <Icono size={21} strokeWidth={2.3} />

                <span className="text-[16px] font-medium">
                    {texto}
                </span>
            </div>
        );
    };

    return (

        <main className="min-h-screen bg-[#F8F7F3] pb-16">

            <section className="flex flex-col gap-6 px-6 pb-5 pt-10 lg:ml-[100px] lg:flex-row lg:items-center lg:gap-5 lg:px-12">

                <h1 className="shrink-0 font-serif text-3xl font-bold text-[#202020]">
                    Mi Jardín
                </h1>

                {/* FILTROS */}

                <nav className="w-full max-w-[500px] overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-[#A1A1A1]">

                    <div className="flex w-max gap-10">

                        {filtros.map((filtro) => (

                            <button
                                key={filtro.tipo}
                                type="button"
                                onClick={() =>
                                    setTipoSeleccionado(filtro.tipo)
                                }
                                className={`shrink-0 pb-2 text-xl transition-colors ${tipoSeleccionado === filtro.tipo
                                    ? "border-b-2 border-[#89AB78] font-semibold italic text-[#89AB78]"
                                    : "text-black hover:text-[#89AB78]"
                                    }`}
                            >

                                {filtro.nombre}

                            </button>

                        ))}

                    </div>

                </nav>

                {/* AÑADIR PLANTA */}

                <Link
                    to="/explorar"
                    className="flex w-full max-w-[200px] shrink-0 items-center justify-center rounded-[15px] bg-[#89AB78] px-7 py-3 text-base font-medium text-white shadow-[2px_3px_4px_rgba(88,88,88,0.25)] transition-colors hover:bg-[#709261]"
                >

                    + Añadir planta

                </Link>

            </section>

            <section className="px-6 lg:ml-[100px] lg:px-12">

                {/* CARGANDO */}

                {cargando ? (

                    <div className="flex flex-wrap gap-8">

                        {[1, 2, 3].map((item) => (

                            <div
                                key={item}
                                className="h-[310px] w-full animate-pulse bg-white p-5 shadow-sm sm:w-[270px]"
                            >

                                <div className="mt-5 h-[170px] rounded-[20px] bg-[#E8EFE3]" />

                                <div className="mx-auto mt-5 h-6 w-3/4 rounded-lg bg-[#E8EFE3]" />

                                <div className="mx-auto mt-4 h-4 w-1/2 rounded-lg bg-[#E8EFE3]" />

                            </div>

                        ))}

                    </div>

                ) : error ? (

                    /* ERROR DE CONEXIÓN */

                    <div className="rounded-[20px] border border-red-200 bg-white px-6 py-12 text-center">

                        <h2 className="text-xl font-bold text-red-700">
                            No se pudo cargar tu jardín
                        </h2>

                        <p className="mt-3 text-[#777777]">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                cargarPlantas().catch(console.error)
                            }
                            className="mt-6 rounded-xl bg-[#89AB78] px-6 py-3 font-semibold text-white hover:bg-[#709261]"
                        >
                            Intentar nuevamente
                        </button>

                    </div>

                ) : plantasFiltradas.length > 0 ? (

                    /* ======================================
                        TARJETAS DE PLANTAS
                    ====================================== */

                    <div className="flex flex-wrap gap-8">

                        {plantasFiltradas.map((registro) => {

                            // Información de la especie
                            const planta = datosPlanta(registro);

                            // Imagen de la especie
                            const imagen = imagenPlanta(registro);

                            // Nombre de la planta
                            const nombre =
                                planta.nombre_comun ||
                                planta.common_name ||
                                planta.nombre_cientifico ||
                                planta.scientific_name ||
                                "Planta sin nombre";

                            return (

                                <article
                                    key={registro.id}
                                    className="relative flex h-[310px] w-full flex-col items-center bg-white shadow-[0_3px_6px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-[270px]"
                                >

                                    {/* MENÚ DE OPCIONES */}

                                    <div className="group absolute right-0 top-0 z-20">

                                        <button
                                            type="button"
                                            className="px-2 text-[30px] leading-none text-[#555555]"
                                            aria-label="Opciones de planta"
                                        >
                                            ⋮
                                        </button>

                                        <div className="invisible absolute right-0 top-7 min-w-[170px] rounded-xl bg-white py-2 opacity-0 shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition group-hover:visible group-hover:opacity-100">

                                            {/* VER DETALLES */}

                                            <Link
                                                to={`/jardin/vermas/${registro.id}`}
                                                className="block px-4 py-2 text-base text-[#333333] hover:bg-[#F5F5F5]"
                                            >
                                                Ver detalles
                                            </Link>

                                            {/* ELIMINAR PLANTA */}

                                            <button
                                                type="button"
                                                onClick={() => {

                                                    setErrorEliminacion("");

                                                    setPlantaSeleccionada(registro);

                                                }}
                                                className="w-full px-4 py-2 text-left text-base text-red-600 hover:bg-[#F5F5F5]"
                                            >
                                                Eliminar planta
                                            </button>

                                        </div>

                                    </div>

                                    {/* IMAGEN */}

                                    {imagen ? (

                                        <img
                                            src={imagen}
                                            alt={nombre}
                                            className="mt-[35px] h-[170px] w-[83%] shrink-0 rounded-[20px] object-cover shadow-[0_4px_5px_rgba(0,0,0,0.2)]"
                                        />

                                    ) : (

                                        <div className="mt-[35px] flex h-[170px] w-[83%] items-center justify-center rounded-[20px] bg-[#E9EDE4] text-[#819475]">
                                            Sin imagen
                                        </div>

                                    )}

                                    {/* NOMBRE DE LA PLANTA */}

                                    <h3 className="mt-5 px-3 text-center font-['Nunito_Sans'] text-[22px] font-bold leading-tight text-[#222222]">
                                        {nombre}
                                    </h3>

                                    {/* Estado de salud */}
                                    {mostrarEstado(
                                        saludPlantas[registro.id]?.texto || "Consultando estado..."
                                    )}

                                </article>

                            );

                        })}

                    </div>

                ) : (

                    /* ======================================
                        JARDÍN VACÍO
                    ====================================== */

                    <div className="rounded-[20px] border border-[#E5E5E0] bg-white px-5 py-16 text-center shadow-sm">

                        <h2 className="font-serif text-2xl font-bold text-[#3F5D3F]">

                            {plantas.length === 0
                                ? "Tu jardín está vacío"
                                : "No tienes plantas en esta categoría"}

                        </h2>

                        <p className="mt-3 text-[#858585]">
                            {plantas.length === 0 ? "Añade plantas a tu jardín para verlas aquí." : "Prueba con otra categoría."}
                        </p>

                        <Link
                            to="/explorar"
                            className="mt-6 inline-flex rounded-[15px] bg-[#89AB78] px-7 py-3 font-medium text-white transition hover:bg-[#709261]"
                        >
                            Explorar plantas
                        </Link>

                    </div>

                )}

            </section>

            {plantaSeleccionada && (

                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-5">

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-eliminar-planta"
                        className="relative w-full max-w-[450px] rounded-[20px] bg-[#F4F4F4] px-6 pb-8 pt-[65px] text-center shadow-[0_15px_40px_rgba(0,0,0,0.25)]"
                    >

                        {/* IMAGEN DE LA PLANTA */}

                        {imagenPlanta(plantaSeleccionada) && (

                            <img
                                src={imagenPlanta(plantaSeleccionada)}
                                alt={
                                    datosPlanta(plantaSeleccionada).nombre_comun ||
                                    datosPlanta(plantaSeleccionada).common_name ||
                                    "Planta"
                                }
                                className="absolute left-1/2 top-0 h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white object-cover"
                            />

                        )}

                        {/* TÍTULO */}

                        <h2
                            id="titulo-eliminar-planta"
                            className="text-2xl font-bold text-[#222222]"
                        >
                            ¿Eliminar esta planta?
                        </h2>

                        {/* MENSAJE */}

                        <p className="mt-4 text-base italic leading-relaxed text-[#666666]">

                            ¿Estás seguro de que deseas eliminar{" "}

                            <strong>

                                {datosPlanta(plantaSeleccionada).nombre_comun ||
                                    datosPlanta(plantaSeleccionada).common_name ||
                                    "esta planta"}

                            </strong>

                            {" "}de tu jardín?

                            Esta acción eliminará también sus actividades
                            de cuidado asociadas.

                        </p>

                        {/* ERROR AL ELIMINAR */}

                        {errorEliminacion && (

                            <p
                                role="alert"
                                className="mt-3 text-sm text-red-600"
                            >
                                {errorEliminacion}
                            </p>

                        )}

                        {/* BOTONES */}

                        <div className="mt-8 flex justify-center gap-4">

                            <button
                                type="button"
                                disabled={eliminando}
                                onClick={() =>
                                    setPlantaSeleccionada(null)
                                }
                                className="h-[40px] w-[135px] rounded-xl bg-[#B7C3B0] font-medium text-[#2B2B2B] transition hover:bg-[#AAB5A3] disabled:opacity-60"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                disabled={eliminando}
                                onClick={confirmarEliminacion}
                                className="h-[40px] w-[135px] rounded-xl bg-[#B54848] font-medium text-white transition hover:bg-[#9F3D3D] disabled:opacity-60"
                            >

                                {eliminando ? "Eliminando..." : "Eliminar"}

                            </button>

                        </div>

                    </div>

                </div>
            )}
            <AsistenteFlorae enviarMensaje={consultarAsistenteIA} />
        </main>
    );
}

export default Jardin;