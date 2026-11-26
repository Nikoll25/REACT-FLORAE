import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sprout, Leaf, Users, Bug, Crown, Sparkles, ArrowUpRight, ArrowRight, FlaskConical, Pill, Wallet, CalendarDays, Sun, RefreshCw, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { obtenerEstadisticasAdmin } from "../../../services/adminApi";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import macetaDashboard from "../../../assets/Planta de interior en maceta beige.png";

// Tarjetas de estadísticas
const tarjetasEstadisticas = [
    { nombre: "Plantas registradas", campo: "plantas", icono: Sprout, fondo: "#C9DDBD", color: "#234524", ruta: "/admin/plantas", serie: "plantas", grupo: "catalogo" },
    { nombre: "Usuarios registrados", campo: "usuarios", icono: Users, fondo: "#C5D9E9", color: "#244F60", ruta: "/admin/usuarios", serie: "usuarios", grupo: "comunidad" },
    { nombre: "Plagas registradas", campo: "plagas", icono: Bug, fondo: "#E9D4BD", color: "#713B2C", ruta: "/admin/plagas", serie: "plagas", grupo: "catalogo" },
    { nombre: "Suscripciones activas", campo: "suscripciones_activas", icono: Crown, fondo: "#193F29", color: "#F2E4BD", ruta: "/admin/suscripciones", serie: "premium", grupo: "comunidad" },
];
// Accesos a los módulos principales
const accesosRapidos = [
    { nombre: "Plantas", descripcion: "Gestiona el catálogo natural", icono: Sprout, ruta: "/admin/plantas", fondo: "#42663C", pastel: "#C9DDBD" },
    { nombre: "Plagas", descripcion: "Identifica y registra amenazas", icono: Bug, ruta: "/admin/plagas", fondo: "#985B49", pastel: "#E9C9BB" },
    { nombre: "Tratamientos", descripcion: "Gestiona soluciones y cuidados", icono: FlaskConical, ruta: "/admin/tratamientos", fondo: "#427A76", pastel: "#C2DCD9" },
    { nombre: "Medicamentos", descripcion: "Administra los medicamentos", icono: Pill, ruta: "/admin/medicamentos", fondo: "#79628E", pastel: "#DCD0E7" },
    { nombre: "Usuarios", descripcion: "Gestiona nuestra comunidad", icono: Users, ruta: "/admin/usuarios", fondo: "#4C7593", pastel: "#C5D9E9" },
    { nombre: "Pagos", descripcion: "Consulta los pagos registrados", icono: Wallet, ruta: "/admin/pagos", fondo: "#927238", pastel: "#EADBB5" },
];
const estiloTarjeta = "group relative isolate overflow-hidden rounded-florae border border-border bg-surface p-5 shadow-florae transition-all duration-300 hover:shadow-florae-hover";
const estiloEnlace = "mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-forest transition hover:text-primary-hover";
const estiloEtiqueta = "mt-5 inline-block rounded-full bg-pale px-3 py-1 text-xs font-bold text-forest";
// Tarjeta de estadística
function TarjetaEstadistica({ estadistica, valor, cargando, historico }) {
    const { nombre, icono: Icono, fondo, color, ruta, serie } = estadistica;
    const datos = historico || [];
    return (
        <Link to={ruta} style={{ backgroundColor: fondo, color }} className="group relative min-w-0 overflow-hidden rounded-xl border border-black/5 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-florae-hover">
            <div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/35"><Icono size={29} strokeWidth={1.8} /></div><ArrowUpRight size={19} /></div>
            <h3 className="mt-4 text-sm font-bold">{nombre}</h3>
            {cargando ? <div className="mt-2 h-9 w-20 animate-pulse rounded bg-white/40" /> : <p className="mt-1 text-4xl font-extrabold tabular-nums">{valor == null ? "—" : valor.toLocaleString("es-CO")}</p>}
            <div className="mt-2 h-11" aria-hidden="true">
                {cargando ? <div className="h-full animate-pulse rounded bg-white/20" /> : datos.length > 1 && <ResponsiveContainer width="100%" height="100%"><AreaChart data={datos}><Area type="monotone" dataKey={serie} stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.23} isAnimationActive={false} /></AreaChart></ResponsiveContainer>}
            </div>
            <p className="mt-2 text-xs font-semibold">{datos.length > 1 ? "Registros del período" : "Ver detalles"}</p>
        </Link>
    );
}
// Gráficas con datos reales de la API
function Grafica({ datos, cargando, comunidad = false }) {
    const Icono = comunidad ? Users : Sprout;
    const titulo = comunidad ? "Crecimiento de la comunidad" : "Crecimiento del catálogo natural";
    const tooltip = { borderRadius: 12, border: "1px solid #DFE9D7", fontSize: 12 };
    return (
        <article className="min-w-0 rounded-xl border border-border bg-white p-4 shadow-florae">
            <div className="mb-3 flex items-center gap-2.5"><div className="rounded-lg bg-[#D4E2C8] p-2 text-[#193F29]"><Icono size={21} /></div><div><h3 className="font-lora text-base font-bold text-forest-dark">{titulo}</h3><p className="text-xs text-secondary">{comunidad ? "Usuarios y suscripciones Premium" : "Plantas y plagas registradas"}</p></div></div>
            {cargando ? <div className="h-48 animate-pulse rounded-xl bg-pale" /> : <div className="h-48 min-w-0"><ResponsiveContainer width="100%" height="100%">
                {comunidad ? <AreaChart data={datos} margin={{ left: -15, right: 10, top: 10 }}><CartesianGrid stroke="#C5CEC0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#303B30", fontWeight: 600 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#303B30", fontWeight: 600 }} /><Tooltip contentStyle={tooltip} /><Legend /><Area type="monotone" dataKey="usuarios" name="Usuarios" stroke="#4C7593" fill="#A6C3D9" fillOpacity={0.25} strokeWidth={2.5} /><Area type="monotone" dataKey="premium" name="Premium" stroke="#927238" fill="#D8C38E" fillOpacity={0.25} strokeWidth={2.5} /></AreaChart> : <BarChart data={datos} margin={{ left: -15, right: 10, top: 10 }}><CartesianGrid stroke="#C5CEC0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#303B30", fontWeight: 600 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#303B30", fontWeight: 600 }} /><Tooltip contentStyle={tooltip} /><Legend /><Bar dataKey="plantas" name="Plantas" fill="#8BAA79" maxBarSize={24} radius={[4,4,0,0]} /><Bar dataKey="plagas" name="Plagas" fill="#C58F79" maxBarSize={24} radius={[4,4,0,0]} /></BarChart>}
            </ResponsiveContainer></div>}
        </article>
    );
}
// Tarjeta de acceso rápido
function AccesoRapido({ acceso }) {
    const { nombre, descripcion, icono: Icono, ruta, fondo, pastel } = acceso;
    return (
        <Link to={ruta} style={{ borderLeftColor: pastel }} className="group flex min-w-0 items-center gap-3 rounded-xl border border-border border-l-4 bg-surface px-3 py-3 shadow-sm transition hover:bg-soft hover:shadow-florae focus-visible:outline-2 focus-visible:outline-forest">
            <div style={{ backgroundColor: pastel, color: fondo }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"><Icono size={21} strokeWidth={1.8} /></div>
            <div className="min-w-0 flex-1"><h3 style={{ color: fondo }} className="text-sm font-extrabold">{nombre}</h3><p className="mt-0.5 text-xs leading-4 text-secondary">{descripcion}</p></div>
            <ArrowUpRight size={16} style={{ color: fondo }} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
    );
}
// Validar los datos históricos de las gráficas
function validarHistorico(datos, campos, meses) {
    return Array.isArray(datos) && datos.length === meses && datos.every((registro) =>
        registro &&
        typeof registro.mes === "string" &&
        typeof registro.periodo === "string" &&
        campos.every((campo) => Number.isInteger(registro[campo]) && registro[campo] >= 0)
    );
}
function Dashboard() {
    const usuario = useAuthStore((state) => state.usuario);
    const token = useAuthStore((state) => state.token);
    const [estadisticas, setEstadisticas] = useState(null);
    const [crecimiento, setCrecimiento] = useState(null);
    const [meses, setMeses] = useState(6);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);
    const nombre = usuario?.nombre?.trim().split(/\s+/)[0] || "Administrador";
    const fecha = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
    const sugerenciasPendientes = estadisticas?.sugerencias_pendientes;
    // Consultar las estadísticas y el crecimiento de Florae
    useEffect(() => {
        let vigente = true;
        const consultaVigente = () => vigente && useAuthStore.getState().token === token;
        const cargarEstadisticas = async () => {
            setCargando(true);
            setError("");
            setEstadisticas(null);
            setCrecimiento(null);
            try {
                const datos = await obtenerEstadisticasAdmin(meses);
                const resultado = datos?.estadisticas;
                const historico = datos?.crecimiento;
                const campos = ["plantas", "usuarios", "plagas", "suscripciones_activas", "sugerencias_pendientes"];
                if (!resultado || !campos.every((campo) => Number.isInteger(resultado[campo]) && resultado[campo] >= 0)) {
                    throw new Error("La API devolvió estadísticas inválidas.");
                }
                if (!historico || historico.meses !== meses ||
                    !validarHistorico(historico.comunidad, ["usuarios", "premium"], meses) ||
                    !validarHistorico(historico.catalogo, ["plantas", "plagas"], meses)) {
                    throw new Error("La API devolvió datos de crecimiento inválidos.");
                }
                if (consultaVigente()) {
                    setEstadisticas(resultado);
                    setCrecimiento(historico);
                }
            } catch (error) {
                if (consultaVigente()) {
                    setError(error.message || "No se pudieron consultar las estadísticas.");
                    console.error("Error al cargar el dashboard:", error);
                }
            } finally {
                if (consultaVigente()) setCargando(false);
            }
        };
        cargarEstadisticas();
        return () => { vigente = false; };
    }, [token, recarga, meses]);
    const actualizarEstadisticas = () => {
        if (!cargando) setRecarga((actual) => actual + 1);
    };
    return (
        <div className="min-w-0 animate-fade-in space-y-6">
            {/* Bienvenida */}
            <section className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-forest">
                        <Sun size={19} strokeWidth={1.7} />
                        <span>Panel administrativo</span>
                    </div>
                    <h2 className="font-lora text-3xl font-bold text-forest-dark sm:text-4xl">¡Hola, {nombre}!</h2>
                    <p className="mt-2 text-sm text-secondary sm:text-base">Consulta el estado general de la plataforma.</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-forest">
                    <CalendarDays size={18} strokeWidth={1.7} />
                    <span className="capitalize">{fecha}</span>
                </div>
            </section>
            {/* Banner principal */}
            <section className="relative isolate grid overflow-hidden rounded-xl border border-[#496B50] bg-linear-to-br from-[#36583E] to-[#58765A] shadow-florae">
                <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7 md:pr-[32%]">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full text-xs font-extrabold uppercase tracking-[2px] text-[#E8EFE3]"><Leaf size={15} /> Cultivando conocimiento</div>
                    <h2 className="font-lora text-3xl font-bold leading-tight text-[#FFF9EA] sm:text-4xl">Sigamos creciendo juntos</h2>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-[#E8EFE3] sm:text-base">Gestiona nuestro catálogo natural, comparte nuevos conocimientos y acompaña el crecimiento de la comunidad Florae.</p>
                    <Link to="/admin/plantas" className="mt-5 inline-flex items-center gap-3 rounded-xl bg-[#F3E9D4] px-5 py-3 text-sm font-extrabold text-[#193F29] shadow-sm transition hover:bg-[#D4E2C8]"><Sprout size={19} /> Explorar catálogo <ArrowRight size={18} /></Link>
                </div>
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-0 hidden h-96 w-96 rounded-full border border-white/10 md:block" />
                <img src={macetaDashboard} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-2 right-4 hidden h-[92%] w-[28%] object-contain object-bottom md:block lg:right-8" />
            </section>
            {/* Estadísticas generales */}
            <section aria-busy={cargando}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="font-lora text-2xl font-bold text-forest-dark">Florae, en números</h2>
                        <p className="mt-1 text-sm text-secondary">Indicadores actuales de Florae.</p>
                    </div>
                    <button type="button" onClick={actualizarEstadisticas} disabled={cargando} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-forest transition hover:border-primary hover:bg-pale disabled:cursor-not-allowed disabled:opacity-60">
                        <RefreshCw size={17} className={cargando ? "animate-spin" : ""} /> Actualizar
                    </button>
                </div>
                {error && (
                    <div role="alert" className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-danger/20 bg-danger-light p-4 text-sm text-danger">
                        <AlertCircle size={22} className="shrink-0" />
                        <p className="flex-1">{error}</p>
                        <button type="button" onClick={actualizarEstadisticas} className="rounded-lg bg-surface px-4 py-2 font-bold transition hover:bg-white/70">Reintentar</button>
                    </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {tarjetasEstadisticas.map((estadistica) => (
                        <TarjetaEstadistica key={estadistica.campo} estadistica={estadistica} valor={estadisticas?.[estadistica.campo]} cargando={cargando} historico={crecimiento?.[estadistica.grupo]} />
                    ))}
                </div>
            </section>
            {/* Gráficas de crecimiento */}
            <section aria-busy={cargando}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="font-lora text-2xl font-bold text-forest-dark">Crecimiento de la plataforma</h2>
                        <p className="mt-1 text-sm text-secondary">Consulta la evolución del catálogo y los usuarios.</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
                        {[3, 6, 12].map((periodo) => (
                            <button key={periodo} type="button" onClick={() => setMeses(periodo)} aria-pressed={meses === periodo} className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${meses === periodo ? "bg-[#234524] text-white shadow-sm" : "text-secondary hover:bg-pale hover:text-forest"}`}>
                                {periodo} meses
                            </button>
                        ))}
                    </div>
                </div>
                {error ? (
                    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-florae border border-border bg-surface p-6 text-center">
                        <AlertCircle size={32} strokeWidth={1.5} className="text-danger" />
                        <p className="text-sm font-bold text-secondary">No se pudieron consultar las gráficas de crecimiento.</p>
                        <button type="button" onClick={actualizarEstadisticas} className="rounded-xl bg-pale px-4 py-2 text-sm font-bold text-forest transition hover:bg-primary/30">Reintentar</button>
                    </div>
                ) : (
                    <div className="grid min-w-0 gap-5 xl:grid-cols-2">
                        <Grafica comunidad datos={crecimiento?.comunidad || []} cargando={cargando} />
                        <Grafica datos={crecimiento?.catalogo || []} cargando={cargando} />
                    </div>
                )}
            </section>
            {/* Sugerencias y catálogo */}
            <section>
                <div className="mb-5">
                    <h2 className="font-lora text-2xl font-bold text-forest-dark">Gestión y seguimiento</h2>
                    <p className="mt-1 text-sm text-secondary">Revisa las tareas y mantén actualizado el catálogo.</p>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                    <article className={estiloTarjeta}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C1DCA6] text-[#234524]">
                                <Sparkles size={28} strokeWidth={1.6} />
                            </div>
                            {cargando ? (
                                <div className="h-7 w-28 animate-pulse rounded-full bg-pale" />
                            ) : sugerenciasPendientes > 0 ? (
                                <span className="rounded-full bg-[#C1DCA6] px-3 py-1.5 text-xs font-extrabold text-[#234524]">
                                    {sugerenciasPendientes} {sugerenciasPendientes === 1 ? "pendiente" : "pendientes"}
                                </span>
                            ) : sugerenciasPendientes === 0 ? (
                                <span className="rounded-full bg-pale px-3 py-1.5 text-xs font-bold text-forest">Al día</span>
                            ) : null}
                        </div>
                        <span className={estiloEtiqueta}>Inteligencia artificial</span>
                        <h3 className="mt-3 font-lora text-xl font-bold text-forest-dark">Sugerencias de IA</h3>
                        <p className="mt-3 max-w-sm text-sm leading-6 text-secondary">Revisa las nuevas especies y plagas sugeridas por nuestro asistente y decide cuáles formarán parte del catálogo de Florae.</p>
                        {!cargando && sugerenciasPendientes > 0 && (
                            <p className="mt-4 text-sm font-bold text-forest">
                                {sugerenciasPendientes === 1 ? "Tienes una nueva sugerencia por revisar." : `Tienes ${sugerenciasPendientes} sugerencias por revisar.`}
                            </p>
                        )}
                        {!cargando && sugerenciasPendientes === 0 && (
                            <p className="mt-4 text-sm font-semibold text-muted">No tienes sugerencias pendientes por revisar.</p>
                        )}
                        <Link to="/admin/sugerencias" className={estiloEnlace}>
                            Revisar sugerencias <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Sparkles aria-hidden="true" size={100} strokeWidth={0.8} className="pointer-events-none absolute -bottom-10 -right-8 text-primary/10" />
                    </article>
                    <article className={estiloTarjeta}>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pale text-forest">
                            <Sprout size={28} strokeWidth={1.6} />
                        </div>
                        <span className={estiloEtiqueta}>Catálogo natural</span>
                        <h3 className="mt-3 font-lora text-xl font-bold text-forest-dark">Gestión del catálogo</h3>
                        <p className="mt-3 max-w-sm text-sm leading-6 text-secondary">Mantén actualizada la información de nuestras plantas y sus cuidados para brindar una mejor experiencia a la comunidad.</p>
                        <Link to="/admin/plantas" className={estiloEnlace}>
                            Gestionar plantas <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Sprout aria-hidden="true" size={110} strokeWidth={0.8} className="pointer-events-none absolute -bottom-12 -right-8 rotate-12 text-primary/10" />
                    </article>
                </div>
            </section>
            {/* Accesos rápidos */}
            <section>
                <div className="mb-5">
                    <h2 className="font-lora text-2xl font-bold text-forest-dark">Accesos rápidos</h2>
                    <p className="mt-1 text-sm text-secondary">Accede directamente a los módulos de gestión.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {accesosRapidos.map((acceso) => (
                        <AccesoRapido key={acceso.nombre} acceso={acceso} />
                    ))}
                </div>
            </section>
        </div>
    );
}
export default Dashboard;