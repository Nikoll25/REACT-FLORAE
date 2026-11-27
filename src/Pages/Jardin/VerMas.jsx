import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SeccionPlagas from "./components/SeccionPlagas";
import SeccionTratamientos from "./components/SeccionTratamientos";
import ModalAgregarTratamiento from "./components/ModalAgregarTratamiento";
import { useJardinStore } from "../../store/useJardinStore";
import {
    obtenerActividadesPlanta,
    obtenerImagen,
    obtenerPlagasJardin,
    obtenerTratamientosJardin,
    obtenerTratamientos,
    registrarTratamientoJardin,
} from "../../services/api";
import {
    ArrowLeft,
    HeartPulse,
    Droplets,
    Sprout,
    Sun,
    Thermometer,
    CheckCircle2,
    Leaf,
    CalendarDays,
    AlertCircle,
} from "lucide-react";
// Imágenes originales de los cuidados
import riego from "../../assets/riego.png";
import solamarillo from "../../assets/solamarillo.png";
import temperatura2 from "../../assets/temperatura2.png";
import fertilizacionverde from "../../assets/fertilizacionverde.png";
const normalizar = (texto) =>
    String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
// Laravel devuelve las fechas de actividades en UTC.
// Usamos la zona horaria de Colombia para mostrar
// correctamente los días del calendario.
const fechaColombia = (fecha) => {
    if (!fecha) return "Sin fecha";
    const fechaValida = new Date(fecha);
    if (Number.isNaN(fechaValida.getTime())) {
        return "Fecha no disponible";
    }
    return new Intl.DateTimeFormat("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "America/Bogota",
    }).format(fechaValida);
};
const nombreActividad = (actividad) =>
    actividad?.plant_care?.tipo || "Cuidado";
const estilosHistorial = {
    riego: { icono: Droplets, color: "#5287A6", fondo: "#E7F1F7" },
    fertilizacion: { icono: Sprout, color: "#709261", fondo: "#E8EFE3" },
    luz: { icono: Sun, color: "#B3954F", fondo: "#F7EED9" },
    temperatura: { icono: Thermometer, color: "#B47E68", fondo: "#F8EDE8" },
    general: { icono: Leaf, color: "#3F5D3F", fondo: "#EEF3E7" },
};
function VerMas() {
    const { id } = useParams();
    return <DetalleJardin key={`${localStorage.getItem("token")}:${id}`} id={id} />;
}

function DetalleJardin({ id }) {
    const cargarPlantas = useJardinStore(
        (state) => state.cargarPlantas
    );
    const [registro, setRegistro] = useState(null);
    const [actividades, setActividades] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [plagasJardin, setPlagasJardin] = useState([]);
    const [tratamientosJardin, setTratamientosJardin] = useState([]);
    const [errorRelaciones, setErrorRelaciones] = useState("");
    const [cargandoPlagas, setCargandoPlagas] = useState(true);
    const [cargandoAplicaciones, setCargandoAplicaciones] = useState(true);
    const [errorPlagas, setErrorPlagas] = useState(false);
    const [errorAplicaciones, setErrorAplicaciones] = useState("");
    const [plagaTratamiento, setPlagaTratamiento] = useState(null);
    const [tratamientosDisponibles, setTratamientosDisponibles] = useState([]);
    const [guardandoTratamiento, setGuardandoTratamiento] = useState(false);
    const [cargandoTratamientos, setCargandoTratamientos] = useState(false);
    const [errorTratamiento, setErrorTratamiento] = useState("");
    useEffect(() => {
        let activo = true;
        const token = localStorage.getItem("token");
        const vigente = () => activo && token === localStorage.getItem("token");
        const extraerLista = (valor, claves) => {
            if (Array.isArray(valor)) return valor;
            for (const clave of claves) {
                if (Array.isArray(valor?.[clave])) return valor[clave];
                if (Array.isArray(valor?.data?.[clave])) return valor.data[clave];
            }
            return Array.isArray(valor?.data) ? valor.data : [];
        };
        setCargando(true);
        setError("");
        setErrorRelaciones("");
        setErrorPlagas(false);
        setErrorAplicaciones("");
        setCargandoPlagas(true);
        setCargandoAplicaciones(true);

        // Consultamos las relaciones en paralelo con las actividades.
        obtenerPlagasJardin().then((respuesta) => {
            if (vigente()) setPlagasJardin(extraerLista(respuesta, ["plagas", "plagas_jardin", "registros"]));
        }).catch(() => {
            if (vigente()) {
                setErrorPlagas(true);
                setErrorRelaciones("No se pudieron consultar las plagas del jardín.");
            }
        }).finally(() => {
            if (vigente()) setCargandoPlagas(false);
        });
        obtenerTratamientosJardin().then((respuesta) => {
            if (vigente()) setTratamientosJardin(extraerLista(respuesta, ["aplicaciones"]));
        }).catch(() => {
            if (vigente()) setErrorAplicaciones("No se pudieron consultar los tratamientos del jardín.");
        }).finally(() => {
            if (vigente()) setCargandoAplicaciones(false);
        });

        const cargarInformacion = async () => {
            try {
                const respuesta = await obtenerActividadesPlanta(id);
                if (!vigente()) return;
                const estado = useJardinStore.getState();
                let registroJardin = estado.tokenJardin === token
                    ? estado.plantas.find((item) => String(item.id) === String(id))
                    : null;
                if (!registroJardin) {
                    // Recuperamos el catálogo completo si no está en memoria.
                    const lista = await cargarPlantas();
                    registroJardin = lista.find((item) => String(item.id) === String(id));
                }
                if (!vigente()) return;
                setRegistro(registroJardin || respuesta.planta);
                setActividades(respuesta);
            } catch (error) {
                if (vigente()) setError(error.message);
            } finally {
                if (vigente()) setCargando(false);
            }
        };
        cargarInformacion();
        return () => { activo = false; };
    }, [id, cargarPlantas]);
    if (cargando) {
        return (
            <main className="min-h-screen bg-[#F8F7F3] px-6 py-12">
                <div className="mx-auto max-w-7xl animate-pulse">
                    <div className="mb-10 h-6 w-40 rounded-lg bg-[#E8EFE3]" />
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="h-[350px] rounded-[28px] bg-[#E8EFE3]" />
                        <div className="space-y-5 py-8">
                            <div className="h-10 w-3/4 rounded-lg bg-[#E8EFE3]" />
                            <div className="h-6 w-1/2 rounded-lg bg-[#E8EFE3]" />
                            <div className="h-24 rounded-lg bg-[#E8EFE3]" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }
    if (error || !registro || !actividades) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F8F7F3] px-6">
                <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
                    <Leaf
                        size={38}
                        className="mx-auto mb-4 text-[#89AB78]"
                    />
                    <h2 className="font-serif text-2xl font-bold text-[#3F5D3F]">
                        Planta no encontrada
                    </h2>
                    <p className="mt-3 text-[#737B6D]">
                        {error || "No encontramos este ejemplar."}
                    </p>
                    <Link
                        to="/jardin"
                        className="mt-6 inline-flex rounded-xl bg-[#89AB78] px-6 py-3 text-white"
                    >
                        Volver a Mi Jardín
                    </Link>
                </div>
            </main>
        );
    }
    const planta = registro.plant || {};
    const nombre =
        planta.nombre_comun ||
        planta.nombre_cientifico ||
        "Planta sin nombre";
    const nombreCientifico =
        planta.nombre_cientifico || "";
    const descripcion =
        planta.descripcion ||
        "No hay descripción disponible.";
    const origen =
        planta.origen || "No especificado";
    const tipo =
        planta.tipo || "No especificado";
    const primeraImagen = planta.imagenes?.[0];
    const rutaImagen =
        typeof primeraImagen === "string"
            ? primeraImagen
            : primeraImagen?.image ||
              primeraImagen?.imagen ||
              primeraImagen?.ruta ||
              primeraImagen?.image_url ||
              planta.image_url ||
              null;
    const urlImagen = rutaImagen
        ? obtenerImagen(rutaImagen)
        : null;
    const pendientes = Array.isArray(actividades.pendientes)
        ? actividades.pendientes
        : [];
    const historial = Array.isArray(actividades.historial)
        ? actividades.historial
        : [];
    // Las actividades futuras pueden estar pendientes sin
    // afectar la salud. Solo las vencidas generan alertas.
    const vencidas = pendientes.filter(
        (actividad) =>
            actividad.estado === "pendiente" &&
            actividad.estado_visual === "vencida"
    );
    const tiposVencidos = [
        ...new Set(
            vencidas
                .map((actividad) => normalizar(nombreActividad(actividad)))
                .filter(Boolean)
        ),
    ];
    const nombresVencidos = tiposVencidos.map((tipo) => {
        if (tipo === "riego") return "riego";
        if (tipo === "fertilizacion") return "fertilización";
        return tipo;
    });
    // Cada planta tiene sus propias plagas registradas.
    const plagasPlanta = plagasJardin.filter((item) =>
        String(item.planta_jardin_id ?? item.plant_jardin_id ?? item.planta_jardin?.id ?? "") === String(id)
    );

    // Una plaga deja de afectar la salud cuando está erradicada.
    const plagasActivas = plagasPlanta.filter((item) =>
        !["erradicada", "erradicado"].includes(normalizar(item.estado))
    );
    const tienePlagas = plagasActivas.length > 0;
    const tieneCuidadosVencidos = vencidas.length > 0;

    const saludSinConfirmar = cargandoPlagas || errorPlagas;
    const estadoSalud = saludSinConfirmar
        ? (cargandoPlagas ? "Consultando estado..." : "Estado no disponible")
        : tienePlagas
        ? "Enferma"
        : tieneCuidadosVencidos
            ? `Le falta ${nombresVencidos.join(" y ")}`
            : "Saludable";

    const textoPlagas = `${plagasActivas.length} ${plagasActivas.length === 1 ? "plaga activa" : "plagas activas"}`;
    const textoCuidados = `${vencidas.length} ${vencidas.length === 1 ? "cuidado vencido" : "cuidados vencidos"}`;

    const mensajeSalud = saludSinConfirmar
        ? (cargandoPlagas ? "Estamos consultando las plagas de tu planta." : "No se pudo confirmar el estado de salud.")
        : tienePlagas
        ? tieneCuidadosVencidos
            ? `Tu planta tiene ${textoPlagas} y ${textoCuidados}.`
            : `Tu planta tiene ${textoPlagas}.`
        : tieneCuidadosVencidos
            ? `Tienes ${textoCuidados}.`
            : "Tu planta tiene sus cuidados al día.";

    const colorSalud = saludSinConfirmar
        ? { fondo: "bg-[#F0F1ED]", icono: "text-[#777777]", titulo: "text-[#777777]", mensaje: "text-[#777777]" }
        : tienePlagas
        ? { fondo: "bg-[#FDECEC]", icono: "text-[#C86D6D]", titulo: "text-[#B85353]", mensaje: "text-[#A45F5F]" }
        : tieneCuidadosVencidos
            ? { fondo: "bg-[#FFF1E7]", icono: "text-[#C58451]", titulo: "text-[#B77943]", mensaje: "text-[#9A7657]" }
            : { fondo: "bg-[#EDF3E9]", icono: "text-[#71966B]", titulo: "text-[#557B50]", mensaje: "text-[#71816B]" };
    // Ignoramos los vencidos en esta tarjeta. Permanecen
    // pendientes y se muestran en el estado de salud.
    const cuidadosFuturos = pendientes
        .filter((actividad) =>
            actividad.estado === "pendiente" &&
            actividad.estado_visual !== "vencida" &&
            actividad.fecha_programada &&
            !Number.isNaN(new Date(actividad.fecha_programada).getTime())
        )
        .sort((a, b) =>
            new Date(a.fecha_programada) - new Date(b.fecha_programada)
        );
    const proximoCuidado = cuidadosFuturos[0] || null;
    const tipoProximo = proximoCuidado?.plant_care?.tipo || "";
    const fechaProxima = proximoCuidado?.fecha_programada || null;
    const textoProximo = proximoCuidado
        ? `${tipoProximo}: ${fechaColombia(fechaProxima)}`
        : "Sin próximos cuidados programados";
    // El listado del jardín devuelve plant.cuidados.
    // Si no estuviera disponible, recuperamos los
    // cuidados que aparecen en las actividades.
    const cuidadosCatalogo = Array.isArray(planta.cuidados)
        ? planta.cuidados
        : [];
    const cuidadosActividades = [
        ...pendientes,
        ...historial,
    ]
        .map((actividad) => actividad.plant_care)
        .filter(Boolean);
    const cuidados = cuidadosCatalogo.length > 0
        ? cuidadosCatalogo
        : cuidadosActividades;
    const obtenerCuidado = (tipo) => {
        const cuidado = cuidados.find(
            (item) =>
                normalizar(item.tipo) === normalizar(tipo)
        );
        if (!cuidado) {
            return "No especificado";
        }
        const frecuencia = cuidado.frecuencia_dias;
        return [
            cuidado.descripcion,
            frecuencia
                ? `Cada ${frecuencia} día${frecuencia === 1 ? "" : "s"}`
                : null,
        ]
            .filter(Boolean)
            .join(" · ");
    };
    const cuidadosVisuales = [
        {
            nombre: "Luz",
            valor: obtenerCuidado("Luz"),
            imagen: solamarillo,
            fondo: "#FBF4E4",
        },
        {
            nombre: "Riego",
            valor: obtenerCuidado("Riego"),
            imagen: riego,
            fondo: "#EAF1F8",
        },
        {
            nombre: "Fertilización",
            valor: obtenerCuidado("Fertilización"),
            imagen: fertilizacionverde,
            fondo: "#EDF3E9",
        },
        {
            nombre: "Temperatura",
            valor: obtenerCuidado("Temperatura"),
            imagen: temperatura2,
            fondo: "#F8EDE8",
        },
    ];
    // Cada aplicación pertenece a una plaga registrada en esta planta.
    const tratamientosPlanta = tratamientosJardin.filter((item) => {
        const plantaId = item.historial_plaga?.plaga_jardin?.planta_jardin_id;
        return String(plantaId) === String(id);
    });
    const listaRespuesta = (respuesta, clave) =>
        Array.isArray(respuesta) ? respuesta : respuesta?.[clave] || respuesta?.data?.[clave] || respuesta?.data || [];
    const abrirTratamientos = async (plaga) => {
        setPlagaTratamiento(plaga);
        setTratamientosDisponibles([]);
        setErrorTratamiento("");
        setCargandoTratamientos(true);
        try {
            const respuesta = await obtenerTratamientos();
            const lista = listaRespuesta(respuesta, "tratamientos");
            setTratamientosDisponibles(Array.isArray(lista) ? lista.filter(
                (item) => String(item.plaga_id) === String(plaga.plaga_id ?? plaga.plaga?.id)
                    && normalizar(item.estado) !== "suspendido"
            ) : []);
        } catch (error) {
            setErrorTratamiento(error.message);
        } finally {
            setCargandoTratamientos(false);
        }
    };
    const agregarTratamiento = async (tratamiento) => {
        if (!tratamiento?.id || !plagaTratamiento) return;
        setGuardandoTratamiento(true);
        setErrorTratamiento("");
        try {
            await registrarTratamientoJardin(plagaTratamiento.id, Number(tratamiento.id));
            const respuesta = await obtenerTratamientosJardin();
            setTratamientosJardin(respuesta.aplicaciones || []);
            setPlagaTratamiento(null);
        } catch (error) {
            setErrorTratamiento(error.message);
        } finally {
            setGuardandoTratamiento(false);
        }
    };
    return (
        <main className="min-h-screen bg-[#F8F7F3] pb-16">
            <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-12">
                <div className="mb-8">
                    <Link
                        to="/jardin"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#3F5D3F] transition hover:text-[#89AB78]"
                    >
                        <ArrowLeft size={20} />
                        Volver a Mi Jardín
                    </Link>
                </div>
                <section className="mb-12 grid items-center gap-8 md:grid-cols-[0.95fr_1.05fr] lg:gap-14">
                    <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_5px_20px_rgba(63,93,63,0.08)]">
                        {urlImagen ? (
                            <img
                                src={urlImagen}
                                fetchPriority="high"
                                decoding="async"
                                alt={nombre}
                                className="h-[280px] w-full object-cover sm:h-[390px]"
                            />
                        ) : (
                            <div className="flex h-[280px] items-center justify-center bg-[#E9EEE4] sm:h-[390px]">
                                <Leaf
                                    size={65}
                                    className="text-[#89AB78]"
                                />
                            </div>
                        )}
                    </div>
                    <div className="py-3">
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#89AB78]">
                            Tu jardín personal
                        </p>
                        <h1 className="font-serif text-3xl font-bold uppercase leading-tight text-[#3F5D3F] sm:text-4xl lg:text-5xl">
                            {nombre}
                        </h1>
                        {nombreCientifico && (
                            <p className="mt-3 text-base italic text-[#7B806F] sm:text-lg">
                                {nombreCientifico}
                            </p>
                        )}
                        <div className="my-6 h-[2px] w-20 rounded-full bg-[#A3B18A]" />
                        <p className="max-w-lg text-sm leading-7 text-[#656D60] sm:text-base">
                            {descripcion}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <span className="rounded-full bg-[#EDF3E9] px-4 py-2 text-sm text-[#557B50]">
                                {tipo}
                            </span>
                            <span className="rounded-full bg-[#EDF3E9] px-4 py-2 text-sm text-[#557B50]">
                                Origen: {origen}
                            </span>
                        </div>
                    </div>
                </section>
                <section className="mb-12">
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#89AB78]">
                            Seguimiento
                        </p>
                        <h2 className="mt-1 font-serif text-2xl font-bold text-[#3F5D3F] sm:text-3xl">
                            Salud actual
                        </h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="rounded-[22px] border border-[#E7EBDD] bg-white p-6 shadow-[0_3px_12px_rgba(63,93,63,0.04)]">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colorSalud.fondo}`}>
                                    <HeartPulse size={29} className={colorSalud.icono} />
                                </div>
                                <div>
                                    <p className="text-sm text-[#858B7D]">
                                        Estado de tu planta
                                    </p>
                                    <h3 className={`mt-1 text-xl font-bold ${colorSalud.titulo}`}>
                                        {estadoSalud}
                                    </h3>
                                </div>
                            </div>
                            <div className={`mt-5 flex items-center gap-2 text-sm ${colorSalud.mensaje}`}>
                                {saludSinConfirmar || tienePlagas || tieneCuidadosVencidos ? (
                                    <AlertCircle size={17} />
                                ) : (
                                    <CheckCircle2 size={17} />
                                )}
                                <span>{mensajeSalud}</span>
                            </div>
                        </div>
                        <div className="rounded-[22px] border border-[#E1EAF1] bg-[#F0F5F8] p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                                    <Droplets
                                        size={25}
                                        className="text-[#6287B2]"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#7A91A3]">
                                        Próximo cuidado
                                    </p>
                                    <h3 className="mt-1 text-lg font-bold text-[#456C8B]">
                                        {textoProximo}
                                    </h3>
                                </div>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-[#6D8291]">
                                {proximoCuidado
                                    ? proximoCuidado.plant_care?.descripcion ||
                                      "Consulta las actividades de cuidado de tu planta."
                                    : "No tienes próximos cuidados programados."}
                            </p>
                        </div>
                    </div>
                </section>
                <section className="mb-12 rounded-[24px] border border-[#E8EBDD] bg-white p-5 shadow-[0_4px_18px_rgba(63,93,63,0.05)] sm:p-8">
                    <div className="mb-7">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#89AB78]">
                            Cuida cada detalle
                        </p>
                        <h2 className="mt-1 font-serif text-2xl font-bold text-[#3F5D3F] sm:text-3xl">
                            Guía de cuidados específicos
                        </h2>
                        <p className="mt-2 text-sm text-[#818779]">
                            Cuidados registrados para esta especie.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {cuidadosVisuales.map((cuidado) => (
                            <article
                                key={cuidado.nombre}
                                className="flex flex-col items-center rounded-2xl border border-[#D1D1D1] bg-white p-5 text-center transition duration-300 hover:-translate-y-1 hover:shadow-md"
                            >
                                <div
                                    className="mb-4 flex h-[65px] w-[65px] items-center justify-center rounded-full border-2 border-[#D8DDD2]"
                                    style={{
                                        backgroundColor: cuidado.fondo,
                                    }}
                                >
                                    <img
                                        src={cuidado.imagen}
                                        alt={cuidado.nombre}
                                        className="h-[38px] w-[38px] object-contain"
                                    />
                                </div>
                                <h3 className="font-semibold text-[#3F5D3F]">
                                    {cuidado.nombre}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-[#737B6D]">
                                    {cuidado.valor}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
                <section className="mb-12 rounded-[24px] border border-[#E8EBDD] bg-white p-5 shadow-[0_4px_18px_rgba(63,93,63,0.05)] sm:p-8">
                    <div className="mb-8">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#89AB78]">
                            Registro de cuidados
                        </p>
                        <h2 className="mt-1 font-serif text-2xl font-bold text-[#3F5D3F] sm:text-3xl">
                            Historial de actividad
                        </h2>
                    </div>
                    {historial.length > 0 ? (
                        <div className="relative ml-5 space-y-8 border-l-2 border-[#DCE6D5] pl-6">
                            {historial.map((actividad) => {
                                const tipo = normalizar(nombreActividad(actividad));
                                const estilo = estilosHistorial[tipo] || estilosHistorial.general;
                                const Icono = estilo.icono;
                                return (
                                    <div key={actividad.id} className="relative min-h-[48px]">
                                        <div className="absolute -left-[44px] top-0 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white shadow-sm" style={{ backgroundColor: estilo.fondo, color: estilo.color }}>
                                            <Icono size={19} />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: estilo.color }}>{fechaColombia(actividad.fecha_realizacion)}</p>
                                        <h3 className="mt-1 font-semibold" style={{ color: estilo.color }}>{nombreActividad(actividad)} {tipo === "fertilizacion" || tipo === "luz" || tipo === "temperatura" ? "completada" : "completado"}</h3>
                                        <p className="mt-1 text-sm text-[#858B7D]">{actividad.plant_care?.descripcion}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-[#F8F9F6] px-5 py-10 text-center">
                            <CalendarDays
                                size={30}
                                className="mx-auto mb-3 text-[#89AB78]"
                            />
                            <p className="text-sm text-[#737B6D]">
                                Todavía no has completado actividades de cuidado.
                            </p>
                        </div>
                    )}
                </section>
                {cargandoPlagas ? (
                    <div aria-busy="true" className="mb-12 h-40 animate-pulse rounded-[24px] bg-[#E8EFE3]" />
                ) : (
                    <SeccionPlagas
                        plagas={plagasPlanta}
                        onActualizar={setPlagasJardin}
                        onAgregarTratamiento={abrirTratamientos}
                        errorExterno={errorRelaciones}
                    />
                )}
                {cargandoAplicaciones || cargandoPlagas ? (
                    <div aria-busy="true" className="mb-12 h-40 animate-pulse rounded-[24px] bg-[#E8EFE3]" />
                ) : errorAplicaciones ? (
                    <p role="alert" className="mb-12 rounded-2xl bg-white p-5 text-sm text-[#B85353]">{errorAplicaciones}</p>
                ) : (
                    <SeccionTratamientos
                        tratamientos={tratamientosPlanta}
                        plagas={plagasPlanta}
                        onAgregarTratamiento={abrirTratamientos}
                    />
                )}
            </div>
            <ModalAgregarTratamiento
                plaga={plagaTratamiento}
                tratamientos={tratamientosDisponibles}
                cargando={cargandoTratamientos}
                guardando={guardandoTratamiento}
                error={errorTratamiento}
                onCerrar={() => setPlagaTratamiento(null)}
                onAgregar={agregarTratamiento}
            />
        </main>
    );
}
export default VerMas;
