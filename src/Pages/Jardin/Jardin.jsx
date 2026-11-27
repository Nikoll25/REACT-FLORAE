
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AsistenteFlorae from "../../Components/AsistenteFlorae";
import { CircleCheck, Droplets, Sprout, AlertTriangle, HeartPulse, MoreVertical, Leaf, Trash2, LoaderCircle, AlertCircle } from "lucide-react";
import { useJardinStore } from "../../store/useJardinStore";
import { obtenerImagen, obtenerActividadesPlanta, obtenerPlagasJardin, consultarAsistenteIA } from "../../services/api";

const listaVacia = [];

function JardinContenido() {


    const token = localStorage.getItem("token");
    const plantas = useJardinStore((state) => state.tokenJardin === token ? state.plantas : listaVacia);
    const cargado = useJardinStore((state) => state.tokenJardin === token && state.cargado);
    const cargarPlantas = useJardinStore((state) => state.cargarPlantas);
    const eliminarPlanta = useJardinStore((state) => state.eliminarPlanta);
    const cargando = useJardinStore((state) => state.cargando);
    const error = useJardinStore((state) => state.error);


    const [tipoSeleccionado, setTipoSeleccionado] = useState("todas");
    const [plantaSeleccionada, setPlantaSeleccionada] = useState(null);
    const [menuAbierto, setMenuAbierto] = useState(null);
    useEffect(() => {
        const cerrar = (evento) => { if (evento.type === "keydown" ? evento.key === "Escape" : !evento.target.closest("[data-menu-planta]")) setMenuAbierto(null); };
        document.addEventListener("pointerdown", cerrar);
        document.addEventListener("keydown", cerrar);
        return () => { document.removeEventListener("pointerdown", cerrar); document.removeEventListener("keydown", cerrar); };
    }, []);
    const [eliminando, setEliminando] = useState(false);
    const [errorEliminacion, setErrorEliminacion] = useState("");
    // CARGAR PLANTAS DESDE LA API

    useEffect(() => {

        cargarPlantas().catch((error) => {
            console.error("Error al cargar el jardín:", error);
        });

    }, [cargarPlantas, token]);

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
            const consultaPlagas = obtenerPlagasJardin().then((datos) => {
                const lista = datos?.plagas || datos?.plagas_jardin || datos?.registros || datos?.data || datos;
                return { disponible: Array.isArray(lista), plagas: Array.isArray(lista) ? lista : [] };
            }).catch(() => ({ disponible: false, plagas: [] }));

            await Promise.all(plantas.map(async (registro) => {
                let estado;
                try {
                    const [respuesta, { disponible, plagas }] = await Promise.all([
                        obtenerActividadesPlanta(registro.id), consultaPlagas,
                    ]);
                    const tienePlaga = plagas.some((item) =>
                        String(item.planta_jardin_id ?? item.plant_jardin_id ?? item.planta_jardin?.id ?? "") === String(registro.id) &&
                        ["activa", "activo"].includes(normalizar(item.estado))
                    );
                    const pendientes = Array.isArray(respuesta?.pendientes) ? respuesta.pendientes : [];
                    const tipos = [...new Set(pendientes.filter((actividad) =>
                        actividad.estado === "pendiente" && actividad.estado_visual === "vencida"
                    ).map((actividad) => normalizar(actividad.plant_care?.tipo || actividad.tipo)).filter(Boolean))];
                    const nombres = tipos.map((tipo) => tipo === "fertilizacion" ? "fertilización" : tipo);
                    estado = tienePlaga ? { texto: "Enferma", color: "#B54848" }
                        : nombres.length ? { texto: `Le falta ${nombres.join(" y ")}`, color: "#B7791F" }
                        : disponible ? { texto: "Saludable", color: "#478863" }
                        : { texto: "Estado no disponible", color: "#777777" };
                } catch {
                    estado = { texto: "Estado no disponible", color: "#777777" };
                }
                if (vigente && token === localStorage.getItem("token")) {
                    setSaludPlantas((anteriores) => ({ ...anteriores, [registro.id]: estado }));
                }
            }));
        };

        cargarSalud();
        return () => { vigente = false; };
    }, [plantas, token]);
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
        const texto = String(estado || "Consultando estado...").trim();
        const normalizado = normalizar(texto);
        let Icono = CircleCheck;
        let color = "bg-[#E8EFE3] text-[#478863]";
        if (normalizado === "enferma") {
            Icono = HeartPulse;
            color = "bg-[#F8E8E4] text-[#B54848]";
        } else if (normalizado === "le falta riego" || normalizado === "le falta agua") {
            Icono = Droplets;
            color = "bg-[#E7F1F8] text-[#35779F]";
        } else if (normalizado.startsWith("le falta")) {
            Icono = AlertTriangle;
            color = "bg-[#F8EFD9] text-[#96763C]";
        } else if (normalizado === "en crecimiento") {
            Icono = Sprout;
            color = "bg-[#F0F2DC] text-[#77833E]";
        } else if (normalizado !== "saludable") {
            Icono = normalizado.startsWith("consultando") ? LoaderCircle : AlertCircle;
            color = "bg-[#F0F1ED] text-[#777777]";
        }
        return (
            <div className={`mt-3 mb-3 flex w-[83%] items-center justify-center gap-2 rounded-xl px-3 py-2 ${color}`}>
                <Icono size={20} strokeWidth={2.2} className={`shrink-0 ${normalizado.startsWith("consultando") ? "animate-spin" : ""}`} />
                <span className="text-center text-sm font-semibold leading-tight">{texto}</span>
            </div>
        );
    };

    return (

        <main className="min-h-screen bg-[#F8F7F3] pb-16">

            <section className="flex flex-col gap-6 px-6 pb-5 pt-8 lg:ml-[100px] lg:flex-row lg:items-center lg:gap-6 lg:px-12">
                <div className="flex shrink-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3ECDD] text-[#628557]">
                        <Sprout size={26} strokeWidth={1.7} />
                    </div>
                    <div>
                        <h1 className="font-['Lora'] text-3xl font-bold text-[#3F5D3F]">Mi Jardín</h1>
                        <p className="mt-1 text-xs text-[#84917F]">Mi pequeño refugio verde.</p>
                    </div>
                </div>

                {/* FILTROS */}

                <nav className="w-full min-w-0 max-w-[500px] overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-[#A1A1A1] lg:flex-1">

                    <div className="flex w-max gap-10">

                        {filtros.map((filtro) => (

                            <button
                                key={filtro.tipo}
                                type="button"
                                onClick={() =>
                                    (setTipoSeleccionado(filtro.tipo), setMenuAbierto(null))
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

                {(cargando || !cargado && !error) && !cargado ? (

                    <div className="flex flex-wrap gap-8">

                        {[1, 2, 3].map((item) => (

                            <div
                                key={item}
                                className="h-[310px] w-full animate-pulse rounded-[20px] border border-[#DFE9D7] bg-white p-5 shadow-sm sm:w-[270px]"
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
                                    className="relative flex min-h-[310px] w-full flex-col items-center rounded-[20px] border border-[#DFE9D7] bg-white shadow-[0_3px_9px_rgba(63,93,63,0.09)] transition-shadow duration-300 hover:shadow-md sm:w-[270px]"
                                >

                                    {/* MENÚ DE OPCIONES */}

                                    <div data-menu-planta className={`absolute right-2 top-1.5 ${menuAbierto === registro.id ? "z-30" : "z-10"}`}>
                                        <button type="button" onClick={() => setMenuAbierto(menuAbierto === registro.id ? null : registro.id)} aria-label="Opciones de planta" aria-expanded={menuAbierto === registro.id} className="flex h-7 w-7 items-center justify-center rounded-full text-[#3F5D3F] transition hover:bg-[#E8EFE3]">
                                            <MoreVertical size={21} />
                                        </button>
                                        {menuAbierto === registro.id && (
                                            <div className="absolute right-0 top-9 w-[185px] rounded-2xl border border-[#DFE9D7] bg-white p-1.5 shadow-lg">
                                                <Link to={`/jardin/vermas/${registro.id}`} onClick={() => setMenuAbierto(null)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#3F5D3F] hover:bg-[#E8EFE3]">
                                                    <Leaf size={17} /> Ver detalles
                                                </Link>
                                                <button type="button" onClick={() => { setMenuAbierto(null); setErrorEliminacion(""); setPlantaSeleccionada(registro); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#B54848] hover:bg-[#F8E8E4]">
                                                    <Trash2 size={17} /> Eliminar planta
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* IMAGEN */}

                                    {imagen ? (

                                        <img
                                            src={imagen}
                                            loading="lazy"
                                            decoding="async"
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

function Jardin() {
    const token = localStorage.getItem("token");
    return <JardinContenido key={token || "sin-sesion"} />;
}

export default Jardin;