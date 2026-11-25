import { useEffect, useState } from "react";
import { Crown, Sprout, CreditCard, CalendarDays, CheckCircle2, AlertCircle, RefreshCw, Receipt, History, Sparkles, Layers, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useCreditosStore } from "../../store/useCreditosStore";
import { obtenerPlanes, obtenerSuscripcionActual, obtenerSuscripciones, obtenerPagos } from "../../services/api";
import ModalContratarPlan from "./ModalContratarPlan";

const formatearPrecio = (precio) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(precio));

const formatearFecha = (fecha) => {
    if (!fecha) return "—";

    const fechaFormateada = new Date(`${String(fecha).slice(0, 10)}T00:00:00`);

    return isNaN(fechaFormateada.getTime()) ? "—" : fechaFormateada.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
};

const metodosPago = { pse: "PSE", tarjeta: "Tarjeta", nequi: "Nequi", daviplata: "Daviplata" };

const pestanas = [
    { id: "actual", nombre: "Mi plan", icono: Crown },
    { id: "planes", nombre: "Explorar planes", icono: Layers },
    { id: "suscripciones", nombre: "Suscripciones", icono: History },
    { id: "pagos", nombre: "Historial de pagos", icono: Receipt },
];

const filtros = [
    { id: "todas", nombre: "Todas" },
    { id: "activa", nombre: "Activas" },
    { id: "vencida", nombre: "Vencidas" },
    { id: "cancelada", nombre: "Canceladas" },
];

const coloresEstado = {
    activa: "bg-[#E8EFE3] text-[#3F5D3F]",
    vencida: "bg-[#F2EDE0] text-[#96763C]",
    cancelada: "bg-[#F8ECEA] text-[#A34C4C]",
};

const botonPrincipal = "rounded-xl bg-[#89AB78] px-5 py-3 font-bold text-white transition hover:bg-[#709261]";
const tarjeta = "rounded-[28px] border border-[#DFE9D7] bg-white/95 p-6 sm:p-8";
const estiloEtiqueta = "rounded-full bg-[#E8EFE3] px-3 py-1.5 text-xs font-bold text-[#3F5D3F]";

// Mostrar los beneficios de cada plan
function Beneficios({ creditos, actual = false }) {
    const beneficios = actual ? [
        `${creditos} créditos de IA por período`,
        "Consultas sobre plantas y jardinería",
        "Información sobre plagas y tratamientos",
        "Asistencia para el cuidado de tus plantas",
    ] : [
        `${creditos} créditos mensuales`,
        "Asistente inteligente de Florae",
        "Consultas sobre cuidados y plagas",
        "Orientación sobre tratamientos",
    ];

    return (
        <div className={actual ? "space-y-3 text-[#626B60]" : "mb-7 flex-1 space-y-4"}>
            {beneficios.map((beneficio) => (
                <div key={beneficio} className={`flex gap-3 text-[#626B60] ${actual ? "items-center" : "items-start text-sm"}`}>
                    <CheckCircle2 size={20} className="shrink-0 text-[#89AB78]" />
                    {beneficio}
                </div>
            ))}
        </div>
    );
}

// Mostrar información cuando no existen registros
function SinRegistros({ icono: Icono, titulo, descripcion }) {
    return (
        <div className="py-12 text-center">
            <Icono size={45} className="mx-auto mb-4 text-[#A3B18A]" />
            <h3 className="font-bold text-[#3F5D3F]">{titulo}</h3>
            <p className="mt-2 text-sm text-[#6B7280]">{descripcion}</p>
        </div>
    );
}

// Mostrar un dato del historial
function Dato({ titulo, valor, referencia = false }) {
    return (
        <div>
            <p className="text-[#6B7280]">{titulo}</p>
            <p className={`mt-1 font-semibold text-[#3F5D3F] ${referencia ? "break-all text-xs" : ""}`}>{valor}</p>
        </div>
    );
}

function PagosSuscripciones() {
    const usuario = useAuthStore((state) => state.usuario);
    const token = useAuthStore((state) => state.token);

    const creditos = useCreditosStore((state) => state.creditos);
    const consultarCreditos = useCreditosStore((state) => state.consultar);
    const cargandoCreditos = useCreditosStore((state) => state.cargando);
    const errorCreditos = useCreditosStore((state) => state.error);

    const [planActual, setPlanActual] = useState(null);
    const [suscripcionActual, setSuscripcionActual] = useState(null);
    const [planes, setPlanes] = useState([]);
    const [suscripciones, setSuscripciones] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [seccion, setSeccion] = useState("actual");
    const [filtro, setFiltro] = useState("todas");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);
    const [planSeleccionado, setPlanSeleccionado] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("");

    // Limpiar la información al cambiar de sesión
    useEffect(() => {
        setPlanSeleccionado(null);
        setMensajeExito("");
        setSeccion("actual");
        setFiltro("todas");
    }, [token, usuario?.id]);

    // Consultar la información del usuario
    useEffect(() => {
        if (!token || !usuario?.id) return;

        let vigente = true;

        const cargarInformacion = async () => {
            setCargando(true);
            setError("");
            setPlanActual(null);
            setSuscripcionActual(null);
            setPlanes([]);
            setSuscripciones([]);
            setPagos([]);

            try {
                const [actual, listaPlanes, historial, listaPagos] = await Promise.all([
                    obtenerSuscripcionActual(),
                    obtenerPlanes(),
                    obtenerSuscripciones(),
                    obtenerPagos(),
                    consultarCreditos(),
                ]);

                if (!vigente) return;

                if (!actual.plan || !Array.isArray(listaPlanes.planes) || !Array.isArray(historial.suscripciones) || !Array.isArray(listaPagos.pagos)) {
                    throw new Error("La API devolvió información incompleta.");
                }

                setPlanActual(actual.plan);
                setSuscripcionActual(actual.suscripcion);
                setPlanes(listaPlanes.planes);
                setSuscripciones(historial.suscripciones);
                setPagos(listaPagos.pagos);
            } catch (err) {
                if (vigente) setError(err.message || "No se pudo consultar la información.");
            } finally {
                if (vigente) setCargando(false);
            }
        };

        cargarInformacion();

        return () => { vigente = false; };
    }, [token, usuario?.id, recarga, consultarCreditos]);

    const esPremium = creditos?.es_premium === true;
    const porcentaje = creditos?.creditos_totales > 0 ? Math.min(100, Math.max(0, creditos.creditos_disponibles / creditos.creditos_totales * 100)) : 0;
    const suscripcionesFiltradas = suscripciones.filter((suscripcion) => filtro === "todas" || suscripcion.estado === filtro);

    const tieneSuscripcionAnterior = (planId) => suscripciones.some((suscripcion) => String(suscripcion.plan_id) === String(planId) && suscripcion.estado === "vencida");

    const actualizar = () => setRecarga((valor) => valor + 1);

    // Abrir el modal de contratación
    const abrirContratacion = (plan) => {
        if (esPremium || plan.nombre !== "Premium" || Number(plan.precio) <= 0) return;

        setMensajeExito("");
        setPlanSeleccionado(plan);
    };

    // Actualizar la información después del pago
    const compraExitosa = (resultado) => {
        setPlanSeleccionado(null);
        setMensajeExito(resultado.mensaje || "Tu suscripción se activó correctamente.");
        setSeccion("actual");
        actualizar();
    };

    if (!token || !usuario) {
        return <div className="rounded-3xl bg-white p-8 text-center text-[#3F5D3F]">Inicia sesión para consultar tus suscripciones.</div>;
    }

    if (cargando || cargandoCreditos) {
        return (
            <div className="animate-pulse space-y-5">
                <div className="h-10 w-72 max-w-full rounded-xl bg-[#E5EBDD]" />
                <div className="h-5 w-96 max-w-full rounded-lg bg-[#E5EBDD]" />
                <div className="h-14 rounded-2xl bg-[#E5EBDD]" />
                <div className="h-64 rounded-[28px] bg-[#E5EBDD]" />
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="h-40 rounded-3xl bg-[#E5EBDD]" />
                    <div className="h-40 rounded-3xl bg-[#E5EBDD]" />
                </div>
            </div>
        );
    }

    if (error || errorCreditos || !creditos || !planActual) {
        return (
            <section className={`${tarjeta} text-center`}>
                {mensajeExito && <p role="status" className="mb-5 rounded-xl bg-[#E8EFE3] p-4 text-[#3F5D3F]">{mensajeExito}</p>}
                <AlertCircle size={42} className="mx-auto mb-4 text-[#CF7657]" />
                <h2 className="text-xl font-bold text-[#254D2D]">No pudimos consultar tu información</h2>
                <p className="mt-3 text-sm text-[#6B7280]">{error || errorCreditos || "No se recibió la información del plan."}</p>
                <button type="button" onClick={actualizar} className={`${botonPrincipal} mx-auto mt-6 flex items-center gap-2`}>
                    <RefreshCw size={18} /> Reintentar
                </button>
            </section>
        );
    }

    return (
        <div className="mx-auto max-w-[1100px]">
            {/* Encabezado */}
            <div className="mb-7">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-[#254D2D] sm:text-4xl">Pagos y suscripciones</h1>
                    <CreditCard size={30} className="shrink-0 text-[#89AB78]" />
                </div>
                <p className="mt-3 text-[#626B60]">Administra tu plan y consulta tus créditos, suscripciones y pagos.</p>
            </div>

            {mensajeExito && (
                <div role="status" className="mb-6 flex items-center gap-3 rounded-2xl border border-[#CBD9C1] bg-[#E8EFE3] p-4 font-semibold text-[#3F5D3F]">
                    <CheckCircle2 size={24} className="shrink-0" />
                    <span className="flex-1">{mensajeExito}</span>
                    <button type="button" aria-label="Cerrar mensaje" onClick={() => setMensajeExito("")} className="rounded-full p-1 hover:bg-[#DCE7D5]">
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Navegación */}
            <nav aria-label="Pagos y suscripciones" className="mb-7 flex gap-2 overflow-x-auto rounded-2xl border border-[#DFE9D7] bg-white/90 p-2">
                {pestanas.map(({ id, nombre, icono: Icono }) => (
                    <button key={id} type="button" onClick={() => setSeccion(id)} className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition ${seccion === id ? "bg-[#89AB78] text-white" : "text-[#3F5D3F] hover:bg-[#EEF3E7]"}`}>
                        <Icono size={18} /> {nombre}
                    </button>
                ))}
            </nav>

            {/* Plan actual */}
            {seccion === "actual" && (
                <div className="space-y-6">
                    <section className={`${tarjeta} shadow-sm`}>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E8EFE3] text-[#3F5D3F]">
                                {esPremium ? <Crown size={32} /> : <Sprout size={32} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-[#6B7280]">Tu plan actual</p>
                                <h2 className="text-2xl font-bold text-[#254D2D]">Florae {planActual.nombre}</h2>
                            </div>
                            <span className="rounded-full bg-[#E8EFE3] px-4 py-2 text-sm font-bold text-[#3F5D3F]">{esPremium ? "Activa" : "Plan gratuito"}</span>
                        </div>

                        <div className="mt-6">
                            <span className="text-4xl font-bold text-[#254D2D]">{formatearPrecio(planActual.precio)}</span>
                            <span className="ml-2 text-[#6B7280]">COP / mes</span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-[#626B60]">{planActual.descripcion || "Disfruta del asistente inteligente de Florae para cuidar tus plantas."}</p>

                        <div className="my-6 border-t border-[#E4EBDD]" />

                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <span className="flex items-center gap-2 font-bold text-[#3F5D3F]"><Sparkles size={20} /> Créditos disponibles</span>
                            <span className="font-bold text-[#254D2D]">{creditos.creditos_disponibles}/{creditos.creditos_totales}</span>
                        </div>

                        <div role="progressbar" aria-label="Créditos disponibles" aria-valuenow={creditos.creditos_disponibles} aria-valuemin={0} aria-valuemax={creditos.creditos_totales} className="h-3 overflow-hidden rounded-full bg-[#E8EFE3]">
                            <div className="h-full rounded-full bg-[#89AB78] transition-all duration-500" style={{ width: `${porcentaje}%` }} />
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            {[
                                { titulo: "Créditos consumidos", valor: creditos.creditos_consumidos },
                                { titulo: "Créditos restantes", valor: creditos.creditos_disponibles },
                            ].map(({ titulo, valor }) => (
                                <div key={titulo} className="rounded-2xl bg-[#F5F7F1] p-4">
                                    <p className="text-sm text-[#626B60]">{titulo}</p>
                                    <p className="mt-1 text-2xl font-bold text-[#254D2D]">{valor}</p>
                                </div>
                            ))}
                        </div>

                        {!creditos.puede_consultar && (
                            <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-[#F0D4CA] bg-[#FDF3EF] p-4 text-sm text-[#A34C4C]">
                                <AlertCircle size={20} className="shrink-0" />
                                Has agotado tus créditos de IA. Puedes consultar los planes disponibles.
                            </div>
                        )}

                        <div className="mt-6 space-y-3 text-sm text-[#626B60]">
                            {[
                                { titulo: "Inicio del período:", fecha: creditos.fecha_inicio },
                                { titulo: "Fin del período:", fecha: creditos.fecha_vencimiento },
                            ].map(({ titulo, fecha }) => (
                                <p key={titulo} className="flex flex-wrap items-center gap-2">
                                    <CalendarDays size={19} className="text-[#89AB78]" />
                                    {titulo} <strong className="text-[#3F5D3F]">{formatearFecha(fecha)}</strong>
                                </p>
                            ))}
                        </div>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <button type="button" onClick={() => setSeccion("planes")} className={botonPrincipal}>
                                {esPremium ? "Explorar planes" : "Mejorar mi plan"}
                            </button>
                            <button type="button" onClick={actualizar} className="flex items-center gap-2 rounded-xl border border-[#DDE5D6] px-5 py-3 font-bold text-[#3F5D3F] transition hover:bg-[#EEF3E7]">
                                <RefreshCw size={18} /> Actualizar
                            </button>
                        </div>
                    </section>

                    <section className="rounded-[25px] border border-[#DFE9D7] bg-white/90 p-6">
                        <h3 className="mb-4 text-xl font-bold text-[#254D2D]">Beneficios de tu plan</h3>
                        <Beneficios creditos={creditos.creditos_totales} actual />
                    </section>
                </div>
            )}

            {/* Planes disponibles */}
            {seccion === "planes" && (
                <section>
                    <h2 className="text-2xl font-bold text-[#254D2D]">Encuentra tu plan ideal</h2>
                    <p className="mb-6 mt-2 text-[#626B60]">Elige la cantidad de créditos que necesitas para cuidar tu jardín.</p>

                    {planes.length === 0 ? (
                        <div className="rounded-3xl bg-white p-8 text-center text-[#626B60]">No hay planes disponibles actualmente.</div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {planes.map((plan) => {
                                const esActual = String(plan.id) === String(creditos.plan_id);
                                const esPlanPremium = plan.nombre === "Premium" && Number(plan.precio) > 0;
                                const puedeContratar = esPlanPremium && !esActual && !esPremium;
                                const esRenovable = tieneSuscripcionAnterior(plan.id);

                                let textoBoton = "No disponible";

                                if (esActual) textoBoton = "Tu plan actual";
                                else if (Number(plan.precio) === 0) textoBoton = "Plan gratuito";
                                else if (esPlanPremium && esPremium) textoBoton = "Ya tienes una suscripción activa";
                                else if (puedeContratar) textoBoton = esRenovable ? "Renovar Premium" : "Contratar Premium";

                                return (
                                    <article key={plan.id} className={`flex flex-col rounded-[28px] border bg-white p-7 shadow-sm ${esPlanPremium ? "border-[#89AB78]" : "border-[#DFE9D7]"}`}>
                                        <div className="mb-5 flex items-center justify-between gap-3">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EFE3] text-[#3F5D3F]">
                                                {esPlanPremium ? <Crown size={28} /> : <Sprout size={28} />}
                                            </div>
                                            {esActual && <span className={estiloEtiqueta}>Plan actual</span>}
                                        </div>

                                        <h3 className="text-2xl font-bold text-[#254D2D]">Florae {plan.nombre}</h3>

                                        <div className="mt-4">
                                            <span className="text-3xl font-bold text-[#254D2D]">{formatearPrecio(plan.precio)}</span>
                                            <span className="ml-2 text-sm text-[#6B7280]">/ mes</span>
                                        </div>

                                        <p className="mt-4 text-sm leading-6 text-[#626B60]">{plan.descripcion || "Asistencia inteligente para el cuidado de tus plantas."}</p>

                                        <div className="my-5 border-t border-[#E4EBDD]" />

                                        <Beneficios creditos={plan.creditos_mensuales} />

                                        <button type="button" disabled={!puedeContratar} onClick={() => abrirContratacion(plan)} className={`w-full rounded-xl px-5 py-3 font-bold transition ${puedeContratar ? "bg-[#89AB78] text-white hover:bg-[#709261]" : "cursor-not-allowed bg-[#E8EFE3] text-[#63775E]"}`}>
                                            {textoBoton}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {/* Historial de suscripciones */}
            {seccion === "suscripciones" && (
                <section className={tarjeta}>
                    <h2 className="text-2xl font-bold text-[#254D2D]">Mis suscripciones</h2>
                    <p className="mt-2 text-[#626B60]">Consulta las suscripciones que has tenido en Florae.</p>

                    <div className="my-6 flex flex-wrap gap-2">
                        {filtros.map(({ id, nombre }) => (
                            <button key={id} type="button" onClick={() => setFiltro(id)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${filtro === id ? "bg-[#89AB78] text-white" : "bg-[#EEF3E7] text-[#3F5D3F]"}`}>
                                {nombre}
                            </button>
                        ))}
                    </div>

                    {suscripcionesFiltradas.length === 0 ? (
                        <SinRegistros icono={History} titulo="No tienes suscripciones en esta categoría" descripcion="Aquí podrás consultar tu historial." />
                    ) : (
                        <div className="space-y-4">
                            {suscripcionesFiltradas.map((suscripcion) => (
                                <article key={suscripcion.id} className="rounded-2xl border border-[#DFE9D7] p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EFE3] text-[#3F5D3F]">
                                                <Crown size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#254D2D]">Florae {suscripcion.plan?.nombre || "—"}</h3>
                                                <p className="text-xs text-[#6B7280]">Suscripción #{suscripcion.id}</p>
                                            </div>
                                        </div>
                                        <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${coloresEstado[suscripcion.estado] || coloresEstado.cancelada}`}>
                                            {suscripcion.estado}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                                        <Dato titulo="Fecha de inicio" valor={formatearFecha(suscripcion.fecha_inicio)} />
                                        <Dato titulo="Fecha de vencimiento" valor={formatearFecha(suscripcion.fecha_vencimiento)} />
                                    </div>

                                    {String(suscripcion.id) === String(suscripcionActual?.id) && (
                                        <p className="mt-4 text-xs font-bold text-[#709261]">Suscripción actual</p>
                                    )}

                                    {suscripcion.estado === "vencida" && !esPremium && (
                                        <button type="button" onClick={() => setSeccion("planes")} className={`${botonPrincipal} mt-5 text-sm`}>
                                            Renovar suscripción
                                        </button>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Historial de pagos */}
            {seccion === "pagos" && (
                <section className={tarjeta}>
                    <h2 className="text-2xl font-bold text-[#254D2D]">Historial de pagos</h2>
                    <p className="mb-6 mt-2 text-[#626B60]">Consulta los pagos registrados de tus suscripciones.</p>

                    {pagos.length === 0 ? (
                        <SinRegistros icono={Receipt} titulo="Todavía no tienes pagos registrados" descripcion="Tus pagos aparecerán en esta sección." />
                    ) : (
                        <div className="space-y-4">
                            {pagos.map((pago) => (
                                <article key={pago.id} className="rounded-2xl border border-[#DFE9D7] p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EFE3] text-[#3F5D3F]">
                                                <CreditCard size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#254D2D]">Florae {pago.suscripcion?.plan?.nombre || "—"}</h3>
                                                <p className="mt-1 text-xs text-[#6B7280]">{formatearFecha(pago.fecha_pago)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-[#254D2D]">{formatearPrecio(pago.monto)}</p>
                                            <p className="text-xs text-[#6B7280]">COP</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                                        <Dato titulo="Método de pago" valor={metodosPago[pago.metodo_pago] || pago.metodo_pago || "—"} />
                                        <Dato titulo="Referencia" valor={pago.referencia_pago || "—"} referencia />
                                    </div>

                                    {String(pago.referencia_pago || "").startsWith("SIM-") && (
                                        <span className="mt-4 inline-flex rounded-full bg-[#F2EDE0] px-3 py-1.5 text-xs font-bold text-[#96763C]">Pago simulado</span>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {planSeleccionado && (
                <ModalContratarPlan plan={planSeleccionado} esRenovacion={tieneSuscripcionAnterior(planSeleccionado.id)} onCerrar={() => setPlanSeleccionado(null)} onExito={compraExitosa} />
            )}
        </div>
    );
}

export default PagosSuscripciones;