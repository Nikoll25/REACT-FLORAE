import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Sprout, Bug, Clock, CheckCircle2, XCircle, Search, Eye, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { obtenerSugerenciasIA } from "../../../services/adminApi";

const estados = {
    pendiente: { nombre: "Pendiente", estilo: "bg-warning-light text-warning" },
    aceptada: { nombre: "Aceptada", estilo: "bg-success-light text-success" },
    rechazada: { nombre: "Rechazada", estilo: "bg-danger-light text-danger" }
};

const formatoFecha = fecha => fecha ? new Date(fecha).toLocaleDateString("es-CO") : "Sin fecha";
const input = "rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary";

export default function SugerenciasIA() {
    const [sugerencias, setSugerencias] = useState([]);
    const [estadisticas, setEstadisticas] = useState({});
    const [busqueda, setBusqueda] = useState("");
    const [tipo, setTipo] = useState("");
    const [estado, setEstado] = useState("");
    const [pagina, setPagina] = useState(1);
    const [ultimaPagina, setUltimaPagina] = useState(1);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recargar, setRecargar] = useState(0);

    // Consultar las sugerencias según los filtros
    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setError("");

        const temporizador = setTimeout(async () => {
            try {
                const respuesta = await obtenerSugerenciasIA({ buscar: busqueda.trim(), tipo, estado, page: pagina });
                if (!vigente) return;

                setSugerencias(respuesta.sugerencias.data);
                setEstadisticas(respuesta.estadisticas);
                setUltimaPagina(respuesta.sugerencias.last_page);
            } catch (e) {
                if (vigente) setError(e.message || "No se pudieron consultar las sugerencias.");
            } finally {
                if (vigente) setCargando(false);
            }
        }, 300);

        return () => {
            vigente = false;
            clearTimeout(temporizador);
        };
    }, [busqueda, tipo, estado, pagina, recargar]);

    const cambiarFiltro = (setter, valor) => {
        setter(valor);
        setPagina(1);
    };

    const tarjetas = [
        { nombre: "Total de sugerencias", cantidad: estadisticas.total, icono: Sparkles, estilo: "bg-pale text-forest" },
        { nombre: "Pendientes", cantidad: estadisticas.pendientes, icono: Clock, estilo: "bg-warning-light text-warning" },
        { nombre: "Aceptadas", cantidad: estadisticas.aceptadas, icono: CheckCircle2, estilo: "bg-success-light text-success" },
        { nombre: "Rechazadas", cantidad: estadisticas.rechazadas, icono: XCircle, estilo: "bg-danger-light text-danger" }
    ];

    return (
        <div className="animate-fade-in space-y-6">
            <section className="relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#EADBB5] bg-linear-to-br from-[#E8E0C7] to-white p-5 shadow-florae sm:px-6 sm:py-6">
                <div className="relative z-10 min-w-0 flex-1 basis-64">
                    <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#806733]"><Sparkles size={17} /> Inteligencia y naturaleza</p>
                    <h1 className="font-lora text-2xl font-bold text-forest-dark sm:text-3xl">Sugerencias de IA</h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#465447]">Revisa las plantas y plagas identificadas por el asistente de Florae.</p>
                </div>
                <div aria-hidden="true" className="pointer-events-none relative hidden h-24 w-28 shrink-0 items-center justify-center md:flex">
                    <span className="absolute h-24 w-24 rounded-full border border-[#EADBB5] bg-[#EADBB5]/50" />
                    <Sparkles size={57} strokeWidth={1.35} className="relative -rotate-12 text-[#806733]" />
                    <Sprout size={25} strokeWidth={1.5} className="absolute bottom-0 right-0 rotate-12 rounded-full bg-white p-1 text-[#806733]" />
                </div>

            </section>

            {/* Estadísticas */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {tarjetas.map(({ nombre, cantidad, icono: Icono, estilo }) => (
                    <div key={nombre} className="rounded-florae border border-border bg-surface p-5 shadow-florae">
                        <div className="flex items-center justify-between">
                            <span className={`rounded-xl p-3 ${estilo}`}><Icono size={24} /></span>
                            {cargando ? <div className="h-8 w-12 animate-pulse rounded-lg bg-pale" /> : <span className="text-3xl font-bold text-forest-dark">{error ? "—" : cantidad ?? 0}</span>}
                        </div>
                        <p className="mt-4 text-sm font-semibold text-secondary">{nombre}</p>
                    </div>
                ))}
            </div>

            <section className="overflow-hidden rounded-florae border border-border bg-surface shadow-florae">
                {/* Buscador y filtros */}
                <div className="flex flex-wrap gap-3 border-b border-border p-5">
                    <div className="relative min-w-56 flex-1">
                        <Search size={19} className="absolute left-4 top-3.5 text-muted" />
                        <input value={busqueda} onChange={e => cambiarFiltro(setBusqueda, e.target.value)} maxLength={150} placeholder="Buscar por nombre común o científico..." className={`${input} w-full pl-11`} />
                    </div>

                    <select value={tipo} onChange={e => cambiarFiltro(setTipo, e.target.value)} className={input}>
                        <option value="">Todos los tipos</option>
                        <option value="planta">Plantas</option>
                        <option value="plaga">Plagas</option>
                    </select>

                    <select value={estado} onChange={e => cambiarFiltro(setEstado, e.target.value)} className={input}>
                        <option value="">Todos los estados</option>
                        {Object.entries(estados).map(([valor, datos]) => <option key={valor} value={valor}>{datos.nombre}</option>)}
                    </select>
                </div>

                {error ? (
                    <div className="flex flex-col items-center gap-4 p-12 text-center">
                        <AlertCircle size={36} className="text-danger" />
                        <p className="text-sm text-danger">{error}</p>
                        <button onClick={() => setRecargar(v => v + 1)} className="rounded-xl bg-forest px-5 py-2 text-sm font-bold text-white">Reintentar</button>
                    </div>
                ) : cargando ? (
                    <div className="space-y-4 p-5">
                        {Array.from({ length: 5 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-pale" />)}
                    </div>
                ) : sugerencias.length === 0 ? (
                    <div className="flex flex-col items-center p-12 text-center">
                        <Sparkles size={45} className="mb-4 text-primary" />
                        <h3 className="font-lora text-xl font-bold text-forest-dark">No hay sugerencias</h3>
                        <p className="mt-2 text-sm text-secondary">No se encontraron sugerencias con los filtros seleccionados.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-soft text-forest-dark">
                                <tr>
                                    {["Especie", "Tipo", "Estado", "Fecha de registro", "Acciones"].map(titulo => <th key={titulo} className="whitespace-nowrap px-5 py-4 font-bold">{titulo}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {sugerencias.map(s => {
                                    const Icono = s.tipo === "planta" ? Sprout : Bug;
                                    return (
                                        <tr key={s.id} className="transition hover:bg-soft">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`rounded-xl p-3 ${s.tipo === "planta" ? "bg-pale text-forest" : "bg-danger-light text-danger"}`}><Icono size={23} /></div>
                                                    <div>
                                                        <p className="font-bold text-forest-dark">{s.nombre_comun}</p>
                                                        <p className="text-xs italic text-secondary">{s.nombre_cientifico || "Sin identificar"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 capitalize text-secondary">{s.tipo}</td>
                                            <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${estados[s.estado]?.estilo || "bg-soft text-secondary"}`}>{estados[s.estado]?.nombre || s.estado}</span></td>
                                            <td className="whitespace-nowrap px-5 py-4 text-secondary">{formatoFecha(s.created_at)}</td>
                                            <td className="px-5 py-4">
                                                <Link to={`/admin/sugerencias/${s.id}`} title="Ver detalle" aria-label={`Ver detalle de ${s.nombre_comun}`} className="inline-flex rounded-xl bg-pale p-2.5 text-forest transition hover:bg-primary hover:text-white"><Eye size={19} /></Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Paginación */}
                {!cargando && !error && ultimaPagina > 1 && (
                    <div className="flex items-center justify-between border-t border-border p-5">
                        <p className="text-sm text-secondary">Página {pagina} de {ultimaPagina}</p>
                        <div className="flex items-center gap-2">
                            <button aria-label="Página anterior" disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)} className="rounded-xl border border-border p-2 text-forest disabled:opacity-40"><ChevronLeft size={20} /></button>
                            <span className="rounded-xl bg-pale px-4 py-2 text-sm font-bold text-forest">{pagina}</span>
                            <button aria-label="Página siguiente" disabled={pagina >= ultimaPagina} onClick={() => setPagina(p => p + 1)} className="rounded-xl border border-border p-2 text-forest disabled:opacity-40"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}