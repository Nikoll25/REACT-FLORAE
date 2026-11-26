import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Pill, Plus, Search, Eye, Pencil, Trash2, PauseCircle, PlayCircle, CheckCircle2, RefreshCw, AlertCircle, LoaderCircle, LayoutGrid, List, FlaskConical, Clock, X } from "lucide-react";
import { obtenerMedicamentosAdmin, suspenderMedicamento, activarMedicamento, eliminarMedicamento } from "../../../services/adminApi";

const acciones = {
    suspender: { titulo: "Suspender medicamento", descripcion: "El medicamento dejará de estar disponible en el catálogo público, pero conservará sus registros.", texto: "Suspender", estilo: "bg-warning hover:opacity-90", ejecutar: suspenderMedicamento },
    activar: { titulo: "Reactivar medicamento", descripcion: "El medicamento volverá a estar disponible en el catálogo público.", texto: "Reactivar", estilo: "bg-forest hover:bg-forest-dark", ejecutar: activarMedicamento },
    eliminar: { titulo: "Eliminar medicamento", descripcion: "Se eliminará definitivamente el medicamento, sus asociaciones con tratamientos y sus registros de aplicación. Los tratamientos del catálogo se conservarán. Esta acción no se puede deshacer.", texto: "Eliminar definitivamente", estilo: "bg-danger hover:opacity-90", ejecutar: id => eliminarMedicamento(id, true) }
};

const normalizar = texto => (texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const campo = "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary";
const botonIcono = "flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-75";

function Estado({ estado }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${estado === "activo" ? "bg-success-light text-success" : "bg-warning-light text-warning"}`}>
            <span className="h-2 w-2 rounded-full bg-current" />
            {estado === "activo" ? "Activo" : "Suspendido"}
        </span>
    );
}

function Acciones({ medicamento, abrirModal }) {
    const activo = medicamento.estado === "activo";

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Link to={`/admin/medicamentos/${medicamento.id}`} title="Ver detalle" className={`${botonIcono} bg-pale text-forest`}>
                <Eye size={17} />
            </Link>
            <Link to={`/admin/medicamentos/${medicamento.id}/editar`} title="Editar" className={`${botonIcono} bg-info-light text-info`}>
                <Pencil size={17} />
            </Link>
            <button type="button" title={activo ? "Suspender" : "Reactivar"} onClick={() => abrirModal(medicamento, activo ? "suspender" : "activar")} className={`${botonIcono} ${activo ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}>
                {activo ? <PauseCircle size={17} /> : <PlayCircle size={17} />}
            </button>
            <button type="button" title="Eliminar" onClick={() => abrirModal(medicamento, "eliminar")} className={`${botonIcono} bg-danger-light text-danger`}>
                <Trash2 size={17} />
            </button>
        </div>
    );
}

function TarjetaMedicamento({ medicamento, abrirModal }) {
    return (
        <article className="flex flex-col rounded-florae border border-border bg-surface p-5 shadow-florae transition hover:-translate-y-1">
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pale text-forest">
                    <Pill size={30} strokeWidth={1.7} />
                </div>
                <Estado estado={medicamento.estado} />
            </div>

            <h3 className="mt-4 font-lora text-xl font-semibold text-forest-dark">{medicamento.nombre}</h3>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-secondary">{medicamento.descripcion}</p>

            <div className="my-4 space-y-3 rounded-xl bg-soft p-3 text-sm">
                <div className="flex items-start gap-2">
                    <Pill size={16} className="mt-0.5 shrink-0 text-primary" />
                    <p><span className="font-bold text-forest">Dosis: </span>{medicamento.dosis}</p>
                </div>
                <div className="flex items-start gap-2">
                    <Clock size={16} className="mt-0.5 shrink-0 text-primary" />
                    <p><span className="font-bold text-forest">Frecuencia: </span>{medicamento.frecuencia}</p>
                </div>
                <div className="flex items-center gap-2">
                    <FlaskConical size={16} className="shrink-0 text-primary" />
                    <span>{medicamento.tratamientos?.length || 0} tratamientos asociados</span>
                </div>
            </div>

            <div className="mt-auto border-t border-border pt-4">
                <Acciones medicamento={medicamento} abrirModal={abrirModal} />
            </div>
        </article>
    );
}

export default function Medicamentos() {
    const location = useLocation();
    const [medicamentos, setMedicamentos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [buscar, setBuscar] = useState("");
    const [estado, setEstado] = useState("");
    const [tratamiento, setTratamiento] = useState("");
    const [vista, setVista] = useState("tarjetas");
    const [recarga, setRecarga] = useState(0);
    const [modal, setModal] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [errorAccion, setErrorAccion] = useState("");
    const [mensaje, setMensaje] = useState(location.state?.mensaje || "");

    // Consultamos los medicamentos del catálogo
    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setError("");

        obtenerMedicamentosAdmin()
            .then(datos => {
                if (!Array.isArray(datos?.medicamentos)) throw new Error("La respuesta de medicamentos no es válida.");
                if (vigente) setMedicamentos(datos.medicamentos);
            })
            .catch(e => {
                if (vigente) setError(e.message || "No se pudieron consultar los medicamentos.");
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });

        return () => { vigente = false; };
    }, [recarga]);

    // Ocultamos el mensaje después de unos segundos
    useEffect(() => {
        if (!mensaje) return;
        const tiempo = setTimeout(() => setMensaje(""), 4500);
        return () => clearTimeout(tiempo);
    }, [mensaje]);

    // Obtenemos los tratamientos disponibles para el filtro
    const tratamientos = [...new Map(medicamentos.flatMap(m => m.tratamientos || []).map(t => [t.id, t])).values()];

    const activos = medicamentos.filter(m => m.estado === "activo").length;
    const suspendidos = medicamentos.filter(m => m.estado === "suspendido").length;

    // Aplicamos los filtros seleccionados
    const filtrados = medicamentos.filter(m =>
        normalizar(m.nombre).includes(normalizar(buscar.trim())) &&
        (!estado || m.estado === estado) &&
        (!tratamiento || m.tratamientos?.some(t => String(t.id) === tratamiento))
    );

    const abrirModal = (medicamento, accion) => {
        setErrorAccion("");
        setModal({ medicamento, accion });
    };

    const cerrarModal = () => {
        if (!procesando) {
            setModal(null);
            setErrorAccion("");
        }
    };

    // Ejecutamos la acción seleccionada
    const confirmarAccion = async () => {
        if (!modal || procesando) return;
        setProcesando(true);
        setErrorAccion("");

        const { medicamento, accion } = modal;

        try {
            const respuesta = await acciones[accion].ejecutar(medicamento.id);

            if (accion === "eliminar") {
                setMedicamentos(actual => actual.filter(m => m.id !== medicamento.id));
            } else {
                setMedicamentos(actual => actual.map(m => m.id === medicamento.id ? { ...m, ...respuesta.medicamento, estado: accion === "suspender" ? "suspendido" : "activo" } : m));
            }

            setMensaje(respuesta.mensaje || "Acción realizada correctamente.");
            setModal(null);
        } catch (e) {
            setErrorAccion(e.message || "No se pudo realizar la acción.");
        } finally {
            setProcesando(false);
        }
    };

    const estadisticas = [
        { titulo: "Total de medicamentos", cantidad: medicamentos.length, Icono: Pill, color: "bg-pale text-forest" },
        { titulo: "Medicamentos activos", cantidad: activos, Icono: CheckCircle2, color: "bg-success-light text-success" },
        { titulo: "Medicamentos suspendidos", cantidad: suspendidos, Icono: PauseCircle, color: "bg-warning-light text-warning" }
    ];

    return (
        <div className="space-y-6 font-nunito text-text animate-fade-in">
            <section className="relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#DCD0E7] bg-linear-to-br from-[#E5DDED] to-white p-5 shadow-florae sm:px-6 sm:py-6">
                <div className="relative z-10 min-w-0 flex-1 basis-64">
                    <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#79628E]"><Pill size={17} /> Soluciones para tus plantas</p>
                    <h1 className="font-lora text-2xl font-bold text-forest-dark sm:text-3xl">Gestión de medicamentos</h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#465447]">Administra los medicamentos utilizados para el cuidado y tratamiento de las plantas.</p>
                </div>
                <div aria-hidden="true" className="pointer-events-none relative hidden h-24 w-28 shrink-0 items-center justify-center md:flex">
                    <span className="absolute h-24 w-24 rounded-full border border-[#DCD0E7] bg-[#DCD0E7]/50" />
                    <Pill size={57} strokeWidth={1.35} className="relative -rotate-12 text-[#79628E]" />
                    <FlaskConical size={25} strokeWidth={1.5} className="absolute bottom-0 right-0 rotate-12 rounded-full bg-white p-1 text-[#79628E]" />
                </div>
                <Link to="/admin/medicamentos/crear" className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-linear-to-br from-[#36583E] to-[#58765A] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50">
                    <Plus size={19} /> Nuevo medicamento
                </Link>
            </section>

            {mensaje && (
                <div role="status" className="flex items-center gap-3 rounded-xl border border-border bg-success-light p-4 text-sm text-success">
                    <CheckCircle2 size={20} />
                    <span className="flex-1">{mensaje}</span>
                    <button type="button" onClick={() => setMensaje("")} aria-label="Cerrar mensaje"><X size={18} /></button>
                </div>
            )}

            {/* Resumen de medicamentos */}
            <div className="grid gap-4 sm:grid-cols-3">
                {estadisticas.map(({ titulo, cantidad, Icono, color }) => (
                    <div key={titulo} className="flex items-center gap-4 rounded-florae border border-border bg-surface p-5 shadow-florae">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
                            <Icono size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-secondary">{titulo}</p>
                            {cargando ? <div className="mt-2 h-7 w-12 animate-pulse rounded bg-pale" /> : <p className="font-lora text-2xl font-bold text-forest-dark">{error ? "—" : cantidad}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Buscador y filtros */}
            <div className="rounded-florae border border-border bg-surface p-5 shadow-florae">
                <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-3.5 text-muted" />
                        <input type="search" aria-label="Buscar medicamentos" placeholder="Buscar por nombre..." value={buscar} onChange={e => setBuscar(e.target.value)} className={`${campo} pl-11`} />
                    </div>
                    <select aria-label="Filtrar por estado" value={estado} onChange={e => setEstado(e.target.value)} className={campo}>
                        <option value="">Todos los estados</option>
                        <option value="activo">Activos</option>
                        <option value="suspendido">Suspendidos</option>
                    </select>
                    <select aria-label="Filtrar por tratamiento" value={tratamiento} onChange={e => setTratamiento(e.target.value)} className={campo}>
                        <option value="">Todos los tratamientos</option>
                        {tratamientos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                </div>
            </div>

            {/* Controles de visualización */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-secondary">
                    {!cargando && !error && <>Mostrando <strong className="text-forest">{filtrados.length}</strong> de {medicamentos.length} medicamentos</>}
                </p>
                <div className="flex items-center gap-2">
                    <button type="button" title="Actualizar listado" disabled={cargando} onClick={() => setRecarga(n => n + 1)} className="rounded-xl border border-border bg-surface p-2.5 text-forest transition hover:bg-pale disabled:opacity-50">
                        <RefreshCw size={18} className={cargando ? "animate-spin" : ""} />
                    </button>
                    <div className="flex rounded-xl border border-border bg-surface p-1">
                        <button type="button" title="Vista de tarjetas" aria-pressed={vista === "tarjetas"} onClick={() => setVista("tarjetas")} className={`rounded-lg p-2 ${vista === "tarjetas" ? "bg-pale text-forest" : "text-secondary"}`}>
                            <LayoutGrid size={18} />
                        </button>
                        <button type="button" title="Vista de tabla" aria-pressed={vista === "tabla"} onClick={() => setVista("tabla")} className={`rounded-lg p-2 ${vista === "tabla" ? "bg-pale text-forest" : "text-secondary"}`}>
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {cargando ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="animate-pulse space-y-4 rounded-florae border border-border bg-surface p-5">
                            <div className="flex justify-between">
                                <div className="h-16 w-16 rounded-2xl bg-pale" />
                                <div className="h-6 w-20 rounded-full bg-pale" />
                            </div>
                            <div className="h-6 w-3/4 rounded bg-pale" />
                            <div className="h-10 rounded bg-soft" />
                            <div className="h-28 rounded-xl bg-soft" />
                            <div className="h-9 w-2/3 rounded bg-pale" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-florae border border-border bg-surface p-10 text-center">
                    <AlertCircle size={42} className="mx-auto mb-4 text-danger" />
                    <h3 className="font-lora text-xl font-bold text-forest-dark">No se pudieron cargar los medicamentos</h3>
                    <p className="mt-2 text-sm text-secondary">{error}</p>
                    <button type="button" onClick={() => setRecarga(n => n + 1)} className="mt-5 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white">Reintentar</button>
                </div>
            ) : filtrados.length === 0 ? (
                <div className="rounded-florae border border-border bg-surface p-12 text-center">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-pale text-primary">
                        <Pill size={38} />
                    </div>
                    <h3 className="font-lora text-xl font-bold text-forest-dark">{medicamentos.length ? "No se encontraron resultados" : "Aún no hay medicamentos registrados"}</h3>
                    <p className="mt-2 text-sm text-secondary">{medicamentos.length ? "Intenta cambiar los filtros de búsqueda." : "Registra el primer medicamento del catálogo de Florae."}</p>
                    {medicamentos.length ? (
                        <button type="button" onClick={() => { setBuscar(""); setEstado(""); setTratamiento(""); }} className="mt-5 rounded-xl bg-pale px-5 py-3 text-sm font-bold text-forest">Limpiar filtros</button>
                    ) : (
                        <Link to="/admin/medicamentos/crear" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white">
                            <Plus size={18} /> Registrar medicamento
                        </Link>
                    )}
                </div>
            ) : vista === "tarjetas" ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filtrados.map(m => <TarjetaMedicamento key={m.id} medicamento={m} abrirModal={abrirModal} />)}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-florae border border-border bg-surface shadow-florae">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-soft text-forest">
                            <tr>
                                {["Medicamento", "Dosis", "Frecuencia", "Tratamientos", "Estado", "Acciones"].map(t => <th key={t} className="px-5 py-4 font-bold">{t}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map(m => (
                                <tr key={m.id} className="border-t border-border transition hover:bg-soft">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pale text-forest"><Pill size={22} /></div>
                                            <div>
                                                <p className="font-bold text-forest-dark">{m.nombre}</p>
                                                <p className="mt-1 max-w-52 truncate text-xs text-secondary">{m.descripcion}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">{m.dosis}</td>
                                    <td className="px-5 py-4">{m.frecuencia}</td>
                                    <td className="px-5 py-4">{m.tratamientos?.length || 0}</td>
                                    <td className="px-5 py-4"><Estado estado={m.estado} /></td>
                                    <td className="px-5 py-4"><Acciones medicamento={m} abrirModal={abrirModal} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de confirmación */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={cerrarModal}>
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal" className="w-full max-w-md rounded-florae bg-surface p-6 shadow-xl animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${modal.accion === "eliminar" ? "bg-danger-light text-danger" : modal.accion === "suspender" ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}>
                            {modal.accion === "eliminar" ? <Trash2 size={30} /> : modal.accion === "suspender" ? <PauseCircle size={30} /> : <PlayCircle size={30} />}
                        </div>
                        <h2 id="titulo-modal" className="text-center font-lora text-xl font-bold text-forest-dark">{acciones[modal.accion].titulo}</h2>
                        <p className="mt-3 text-center text-sm leading-relaxed text-secondary">{acciones[modal.accion].descripcion}</p>

                        <div className="my-5 flex items-center gap-3 rounded-xl border border-border bg-soft p-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pale text-forest"><Pill size={24} /></div>
                            <div>
                                <p className="font-bold text-forest-dark">{modal.medicamento.nombre}</p>
                                <p className="text-xs text-secondary">{modal.medicamento.tratamientos?.length || 0} tratamientos asociados</p>
                            </div>
                        </div>

                        {modal.accion === "eliminar" && (
                            <div className="mb-4 rounded-xl bg-danger-light p-3 text-sm text-danger">
                                <p>Registros de aplicación que se eliminarán: <strong>{modal.medicamento.aplicaciones_count ?? "No disponible"}</strong></p>
                                <p className="mt-2">Puedes suspender el medicamento si deseas conservar su historial.</p>
                            </div>
                        )}

                        {errorAccion && (
                            <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-danger-light p-3 text-sm text-danger">
                                <AlertCircle size={18} className="shrink-0" /> {errorAccion}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button type="button" disabled={procesando} onClick={cerrarModal} className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-secondary disabled:opacity-50">Cancelar</button>
                            <button type="button" disabled={procesando} onClick={confirmarAccion} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-50 ${acciones[modal.accion].estilo}`}>
                                {procesando && <LoaderCircle size={17} className="animate-spin" />}
                                {procesando ? "Procesando..." : acciones[modal.accion].texto}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}