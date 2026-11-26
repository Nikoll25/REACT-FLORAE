import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, Receipt, CalendarDays, Search, Eye, RefreshCw, AlertCircle, UserRound, Info, CreditCard, X, Sprout } from "lucide-react";
import { obtenerPagosAdmin } from "../../../services/adminApi";

const formatearPrecio = (precio) => Number(precio).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 2, minimumFractionDigits: 0 });
const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString("es-CO", { timeZone: "America/Bogota" }) : "—";
const metodos = { pse: "PSE", tarjeta: "Tarjeta", nequi: "Nequi", daviplata: "Daviplata" };
const filtrosIniciales = { buscar: "", metodo_pago: "", fecha_desde: "", fecha_hasta: "" };

function Pagos() {
    const [pagos, setPagos] = useState([]);
    const [estadisticas, setEstadisticas] = useState({ total_pagos: 0, ingresos_totales: 0, ingresos_mes: 0 });
    const [filtros, setFiltros] = useState(filtrosIniciales);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);

    const fechasInvalidas = filtros.fecha_desde && filtros.fecha_hasta && filtros.fecha_desde > filtros.fecha_hasta;
    const hayFiltros = Object.values(filtros).some(Boolean);

    // Consultar los pagos y aplicar los filtros
    useEffect(() => {
        let vigente = true;
        if (fechasInvalidas) {
            setCargando(false);
            setError("");
            return;
        }

        setCargando(true);
        setError("");

        const tiempo = setTimeout(async () => {
            try {
                const respuesta = await obtenerPagosAdmin(filtros);
                if (!Array.isArray(respuesta.pagos) || !respuesta.estadisticas) throw new Error("La respuesta de la API no es válida.");
                if (vigente) {
                    setPagos(respuesta.pagos);
                    setEstadisticas(respuesta.estadisticas);
                }
            } catch (error) {
                if (vigente) setError(error.message || "No se pudieron consultar los pagos.");
            } finally {
                if (vigente) setCargando(false);
            }
        }, 300);

        return () => {
            vigente = false;
            clearTimeout(tiempo);
        };
    }, [filtros, recarga, fechasInvalidas]);

    const cambiarFiltro = (evento) => setFiltros((actual) => ({ ...actual, [evento.target.name]: evento.target.value }));

    const tarjetas = [
        { nombre: "Ingresos totales simulados", valor: formatearPrecio(estadisticas.ingresos_totales), icono: Wallet, estilo: "bg-[#E3E6C7] text-[#747D40]" },
        { nombre: "Pagos registrados", valor: estadisticas.total_pagos, icono: Receipt, estilo: "bg-[#C5D9E9] text-[#4C7593]" },
        { nombre: "Ingresos simulados del mes", valor: formatearPrecio(estadisticas.ingresos_mes), icono: CalendarDays, estilo: "bg-[#DCE8D2] text-[#42663C]" },
    ];

    const estiloCampo = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

    return (
        <div className="min-w-0 animate-fade-in space-y-6 font-nunito">
            {/* Encabezado */}
            <section className="relative isolate flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#C8CEA1] bg-linear-to-r from-[#F4F5E9] to-[#E3E6C7] px-6 py-5">
                <div className="relative z-10">
                    <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#747D40]"><Wallet size={16} /> Gestión financiera</div>
                    <h1 className="font-lora text-3xl font-bold text-forest-dark">Gestión de pagos</h1>
                    <p className="mt-2 max-w-xl text-sm text-secondary">Consulta los pagos y realiza el seguimiento de los ingresos de las membresías de Florae.</p>
                </div>
                <div aria-hidden="true" className="relative hidden h-24 w-32 shrink-0 items-center justify-center sm:flex">
                    <div className="absolute h-24 w-24 rounded-full border border-[#C8CEA1] bg-white/35" />
                    <Wallet size={62} strokeWidth={1.2} className="relative text-[#747D40]" />
                    <div className="absolute bottom-0 right-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#C8CEA1] bg-[#F4F5E9]"><Sprout size={21} className="text-[#747D40]" /></div>
                </div>
            </section>

            {/* Estadísticas */}
            <section className="grid gap-4 sm:grid-cols-3">
                {tarjetas.map(({ nombre, valor, icono: Icono, estilo }) => (
                    <article key={nombre} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-florae">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${estilo}`}><Icono size={24} strokeWidth={1.7} /></div>
                        <div className="min-w-0">
                            {cargando ? <div className="h-7 w-24 animate-pulse rounded-lg bg-pale" /> : <p className="font-lora text-2xl font-bold text-forest-dark">{error ? "—" : valor}</p>}
                            <p className="mt-1 text-sm font-semibold text-secondary">{nombre}</p>
                        </div>
                    </article>
                ))}
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-florae">
                <div className="border-b border-border p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-lora text-xl font-bold text-forest-dark">Historial de pagos</h2>
                            <p className="mt-1 text-sm text-secondary">Consulta las transacciones registradas en Florae.</p>
                        </div>
                        <button type="button" onClick={() => setRecarga((actual) => actual + 1)} disabled={cargando || fechasInvalidas} title="Actualizar listado" aria-label="Actualizar listado" className="rounded-xl border border-border p-2.5 text-forest hover:bg-pale disabled:opacity-50">
                            <RefreshCw size={19} className={cargando ? "animate-spin" : ""} />
                        </button>
                    </div>

                    {/* Filtros */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label htmlFor="buscar" className="mb-1.5 block text-xs font-bold text-secondary">Buscar pago</label>
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                <input id="buscar" name="buscar" value={filtros.buscar} onChange={cambiarFiltro} placeholder="Usuario o referencia..." maxLength={150} className={`${estiloCampo} pl-9 pr-9`} />
                                {filtros.buscar && <button type="button" onClick={() => setFiltros((actual) => ({ ...actual, buscar: "" }))} aria-label="Limpiar búsqueda" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"><X size={16} /></button>}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="metodo_pago" className="mb-1.5 block text-xs font-bold text-secondary">Método de pago</label>
                            <select id="metodo_pago" name="metodo_pago" value={filtros.metodo_pago} onChange={cambiarFiltro} className={estiloCampo}>
                                <option value="">Todos los métodos</option>
                                {Object.entries(metodos).map(([valor, nombre]) => <option key={valor} value={valor}>{nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="fecha_desde" className="mb-1.5 block text-xs font-bold text-secondary">Desde</label>
                            <input id="fecha_desde" type="date" name="fecha_desde" value={filtros.fecha_desde} onChange={cambiarFiltro} className={estiloCampo} />
                        </div>
                        <div>
                            <label htmlFor="fecha_hasta" className="mb-1.5 block text-xs font-bold text-secondary">Hasta</label>
                            <input id="fecha_hasta" type="date" name="fecha_hasta" value={filtros.fecha_hasta} onChange={cambiarFiltro} className={estiloCampo} />
                        </div>
                    </div>

                    {hayFiltros && <button type="button" onClick={() => setFiltros(filtrosIniciales)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-forest hover:text-primary"><X size={15} /> Limpiar filtros</button>}
                </div>

                {/* Listado */}
                {fechasInvalidas ? (
                    <div role="alert" className="flex items-center gap-3 bg-danger-light p-5 text-sm text-danger"><AlertCircle size={21} className="shrink-0" /> La fecha final debe ser igual o posterior a la fecha inicial.</div>
                ) : cargando ? (
                    <div className="animate-pulse space-y-4 p-5">
                        {Array.from({ length: 4 }, (_, indice) => (
                            <div key={indice} className="flex items-center gap-4 border-b border-border pb-4">
                                <div className="h-11 w-11 shrink-0 rounded-full bg-pale" />
                                <div className="flex-1 space-y-2"><div className="h-4 w-32 rounded bg-pale" /><div className="h-3 w-40 max-w-full rounded bg-pale" /></div>
                                <div className="hidden h-6 w-24 rounded bg-pale md:block" />
                                <div className="hidden h-6 w-24 rounded bg-pale md:block" />
                                <div className="h-6 w-20 rounded bg-pale" />
                                <div className="h-9 w-9 rounded-lg bg-pale" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div role="alert" className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                        <AlertCircle size={40} strokeWidth={1.5} className="text-danger" />
                        <h3 className="font-lora text-xl font-bold text-forest-dark">No se pudieron consultar los pagos</h3>
                        <p className="text-sm text-secondary">{error}</p>
                        <button type="button" onClick={() => setRecarga((actual) => actual + 1)} className="rounded-xl bg-forest px-5 py-2.5 text-sm font-bold text-white">Reintentar</button>
                    </div>
                ) : pagos.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F4F5E9]"><Receipt size={39} strokeWidth={1.4} className="text-[#747D40]" /></div>
                        <h3 className="font-lora text-xl font-bold text-forest-dark">No se encontraron pagos</h3>
                        <p className="text-sm text-secondary">{hayFiltros ? "No hay pagos que coincidan con los filtros." : "Todavía no hay pagos registrados."}</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left text-sm">
                                <thead className="border-b border-border bg-soft text-xs font-extrabold uppercase tracking-wide text-forest">
                                    <tr>
                                        <th className="px-5 py-4">Usuario</th>
                                        <th className="px-4 py-4">Monto</th>
                                        <th className="px-4 py-4">Método</th>
                                        <th className="px-4 py-4">Fecha</th>
                                        <th className="px-4 py-4">Referencia</th>
                                        <th className="px-4 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {pagos.map((pago) => {
                                        const usuario = pago.suscripcion?.user;

                                        return (
                                            <tr key={pago.id} className="transition hover:bg-soft">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F4F5E9] text-[#747D40]">
                                                            {usuario?.imagen_url ? <img src={usuario.imagen_url} alt="" className="h-full w-full object-cover" /> : <UserRound size={23} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-forest-dark">{usuario?.nombre || "Usuario no disponible"}</p>
                                                            <p className="mt-0.5 text-xs text-secondary">{usuario?.email || "—"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 font-extrabold text-forest">{formatearPrecio(pago.monto)}</td>
                                                <td className="px-4 py-4">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F5E9] px-3 py-1.5 text-xs font-bold text-[#747D40]"><CreditCard size={14} /> {metodos[pago.metodo_pago] || pago.metodo_pago}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-secondary">{formatearFecha(pago.fecha_pago)}</td>
                                                <td className="px-4 py-4">
                                                    <p title={pago.referencia_pago} className="max-w-40 truncate text-xs font-semibold text-secondary">{pago.referencia_pago || "—"}</p>
                                                    {pago.referencia_pago?.startsWith("SIM-") && <span className="mt-1 inline-block rounded-full bg-info-light px-2 py-1 text-[11px] font-bold text-info">Simulado</span>}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <Link to={`/admin/pagos/${pago.id}`} title="Ver detalle" aria-label={`Ver pago ${pago.id}`} className="inline-flex rounded-lg bg-pale p-2.5 text-forest transition hover:bg-primary hover:text-white"><Eye size={19} /></Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-border px-5 py-3 text-xs font-semibold text-secondary">Mostrando {pagos.length} de {estadisticas.total_pagos} pagos registrados.</div>
                    </>
                )}
            </section>

            <div className="flex items-start gap-3 rounded-xl border border-[#C8CEA1] bg-[#F4F5E9] p-4 text-sm text-[#747D40]">
                <Info size={21} className="shrink-0" />
                <p>Los pagos registrados corresponden a transacciones simuladas. Los montos representan el valor original de cada contratación o renovación, no ingresos reales.</p>
            </div>
        </div>
    );
}

export default Pagos;