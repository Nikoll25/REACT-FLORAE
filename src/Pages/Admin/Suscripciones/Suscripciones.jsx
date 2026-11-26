import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, CalendarX, CalendarDays, Crown, Search, Eye, Users, AlertCircle, RefreshCw, UserRound, X } from "lucide-react";
import { obtenerSuscripcionesAdmin } from "../../../services/adminApi";

const formatearFecha = (fecha) => fecha ? fecha.slice(0, 10).split("-").reverse().join("/") : "—";

function Suscripciones() {
    const [suscripciones, setSuscripciones] = useState([]);
    const [estadisticas, setEstadisticas] = useState({ total: 0, activas: 0, vencidas: 0 });
    const [buscar, setBuscar] = useState("");
    const [estado, setEstado] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);

    // Consultar las suscripciones y aplicar los filtros
    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setError("");

        const tiempo = setTimeout(async () => {
            try {
                const respuesta = await obtenerSuscripcionesAdmin({ buscar: buscar.trim(), estado });
                if (!Array.isArray(respuesta.suscripciones) || !respuesta.estadisticas) throw new Error("La respuesta de la API no es válida.");
                if (vigente) {
                    setSuscripciones(respuesta.suscripciones);
                    setEstadisticas(respuesta.estadisticas);
                }
            } catch (error) {
                if (vigente) setError(error.message || "No se pudieron consultar las suscripciones.");
            } finally {
                if (vigente) setCargando(false);
            }
        }, 300);

        return () => {
            vigente = false;
            clearTimeout(tiempo);
        };
    }, [buscar, estado, recarga]);

    const tarjetas = [
        { nombre: "Total de suscripciones", valor: estadisticas.total, icono: Users, estilo: "bg-[#D6DAEF] text-[#58658F]" },
        { nombre: "Suscripciones activas", valor: estadisticas.activas, icono: CalendarCheck, estilo: "bg-[#DCE8D2] text-[#42663C]" },
        { nombre: "Suscripciones vencidas", valor: estadisticas.vencidas, icono: CalendarX, estilo: "bg-[#F1DFD8] text-[#985B49]" },
    ];

    return (
        <div className="min-w-0 animate-fade-in space-y-6 font-nunito">
            {/* Encabezado */}
            <section className="relative isolate flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#B7BFDD] bg-linear-to-r from-[#EEF0F9] to-[#D6DAEF] px-6 py-5">
                <div className="relative z-10 min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#58658F]"><CalendarCheck size={16} /> Membresías Florae</div>
                    <h1 className="font-lora text-3xl font-bold text-forest-dark">Gestión de suscripciones</h1>
                    <p className="mt-2 max-w-xl text-sm text-secondary">Consulta y realiza el seguimiento de las membresías de los usuarios de Florae.</p>
                </div>
                <div aria-hidden="true" className="relative hidden h-24 w-32 shrink-0 items-center justify-center sm:flex">
                    <div className="absolute h-24 w-24 rounded-full border border-[#B7BFDD] bg-white/35" />
                    <CalendarCheck size={61} strokeWidth={1.2} className="relative text-[#58658F]" />
                    <div className="absolute bottom-0 right-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#B7BFDD] bg-[#EEF0F9]"><Crown size={21} strokeWidth={1.5} className="text-[#58658F]" /></div>
                </div>
            </section>

            {/* Estadísticas */}
            <section className="grid gap-4 sm:grid-cols-3">
                {tarjetas.map(({ nombre, valor, icono: Icono, estilo }) => (
                    <article key={nombre} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-florae">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${estilo}`}><Icono size={24} strokeWidth={1.7} /></div>
                        <div className="min-w-0">
                            {cargando ? <div className="h-7 w-12 animate-pulse rounded-lg bg-pale" /> : <p className="font-lora text-2xl font-bold text-forest-dark">{error ? "—" : valor}</p>}
                            <p className="mt-1 text-sm font-semibold text-secondary">{nombre}</p>
                        </div>
                    </article>
                ))}
            </section>

            {/* Listado de suscripciones */}
            <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-florae">
                <div className="border-b border-border p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-lora text-xl font-bold text-forest-dark">Suscripciones registradas</h2>
                            <p className="mt-1 text-sm text-secondary">Historial de membresías Premium.</p>
                        </div>
                        <button type="button" onClick={() => setRecarga((actual) => actual + 1)} disabled={cargando} title="Actualizar listado" aria-label="Actualizar listado" className="rounded-xl border border-border p-2.5 text-forest transition hover:bg-pale disabled:opacity-50">
                            <RefreshCw size={19} className={cargando ? "animate-spin" : ""} />
                        </button>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input type="text" value={buscar} onChange={(evento) => setBuscar(evento.target.value)} placeholder="Buscar por nombre o correo..." aria-label="Buscar usuario" maxLength={150} className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                            {buscar && <button type="button" onClick={() => setBuscar("")} aria-label="Limpiar búsqueda" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"><X size={17} /></button>}
                        </div>
                        <select value={estado} onChange={(evento) => setEstado(evento.target.value)} aria-label="Filtrar por estado" className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary">
                            <option value="">Todos los estados</option>
                            <option value="activa">Activas</option>
                            <option value="vencida">Vencidas</option>
                        </select>
                        {(buscar || estado) && <button type="button" onClick={() => { setBuscar(""); setEstado(""); }} className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-forest hover:bg-pale">Limpiar filtros</button>}
                    </div>
                </div>

                {cargando ? (
                    <div className="animate-pulse space-y-4 p-5">
                        {Array.from({ length: 4 }, (_, indice) => (
                            <div key={indice} className="flex items-center gap-4 border-b border-border pb-4">
                                <div className="h-11 w-11 shrink-0 rounded-full bg-pale" />
                                <div className="flex-1 space-y-2"><div className="h-4 w-32 rounded bg-pale" /><div className="h-3 w-40 max-w-full rounded bg-pale" /></div>
                                <div className="hidden h-6 w-24 rounded-lg bg-pale md:block" />
                                <div className="hidden h-6 w-24 rounded-lg bg-pale md:block" />
                                <div className="h-6 w-16 rounded-full bg-pale" />
                                <div className="h-9 w-9 rounded-lg bg-pale" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div role="alert" className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                        <AlertCircle size={40} strokeWidth={1.5} className="text-danger" />
                        <h3 className="font-lora text-xl font-bold text-forest-dark">No se pudieron consultar las suscripciones</h3>
                        <p className="text-sm text-secondary">{error}</p>
                        <button type="button" onClick={() => setRecarga((actual) => actual + 1)} className="rounded-xl bg-forest px-5 py-2.5 text-sm font-bold text-white">Reintentar</button>
                    </div>
                ) : suscripciones.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF0F9]"><CalendarDays size={39} strokeWidth={1.4} className="text-[#58658F]" /></div>
                        <h3 className="font-lora text-xl font-bold text-forest-dark">No se encontraron suscripciones</h3>
                        <p className="text-sm text-secondary">{buscar || estado ? "No hay resultados que coincidan con los filtros." : "Todavía no hay suscripciones registradas."}</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left text-sm">
                                <thead className="border-b border-border bg-soft text-xs font-extrabold uppercase tracking-wide text-forest">
                                    <tr>
                                        <th className="px-5 py-4">Usuario</th>
                                        <th className="px-4 py-4">Plan</th>
                                        <th className="px-4 py-4">Fecha de inicio</th>
                                        <th className="px-4 py-4">Vencimiento</th>
                                        <th className="px-4 py-4">Estado</th>
                                        <th className="px-4 py-4 text-center">Pagos</th>
                                        <th className="px-4 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {suscripciones.map((suscripcion) => (
                                        <tr key={suscripcion.id} className="transition hover:bg-soft">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF0F9] text-[#58658F]">
                                                        {suscripcion.user?.imagen_url ? <img src={suscripcion.user.imagen_url} alt="" className="h-full w-full object-cover" /> : <UserRound size={23} strokeWidth={1.5} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-forest-dark">{suscripcion.user?.nombre || "Usuario no disponible"}</p>
                                                        <p className="mt-0.5 text-xs text-secondary">{suscripcion.user?.email || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2EDE0] px-3 py-1.5 text-xs font-bold text-[#927238]"><Crown size={14} /> {suscripcion.plan?.nombre || "—"}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-secondary">{formatearFecha(suscripcion.fecha_inicio)}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-secondary">{formatearFecha(suscripcion.fecha_vencimiento)}</td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${suscripcion.estado === "activa" ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {suscripcion.estado === "activa" ? "Activa" : "Vencida"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-forest">{suscripcion.pagos_count ?? 0}</td>
                                            <td className="px-4 py-4 text-center">
                                                <Link to={`/admin/suscripciones/${suscripcion.id}`} title="Ver detalle" aria-label={`Ver suscripción ${suscripcion.id}`} className="inline-flex rounded-lg bg-pale p-2.5 text-forest transition hover:bg-primary hover:text-white"><Eye size={19} /></Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-border px-5 py-3 text-xs font-semibold text-secondary">Mostrando {suscripciones.length} de {estadisticas.total} suscripciones registradas.</div>
                    </>
                )}
            </section>
        </div>
    );
}

export default Suscripciones;