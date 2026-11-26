import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FlaskConical, Plus, Search, Eye, Pencil, Trash2, PauseCircle, PlayCircle, CheckCircle2, RefreshCw, AlertCircle, X, LoaderCircle, LayoutGrid, List, Clock, Bug, Pill, Sprout } from "lucide-react";
import { obtenerTratamientosAdmin, suspenderTratamiento, reactivarTratamiento, eliminarTratamiento } from "../../../services/adminApi";

const acciones = {
    suspender: { titulo: "Suspender tratamiento", descripcion: "El tratamiento dejará de estar disponible en el catálogo público, pero conservará sus registros.", icono: PauseCircle, boton: "Suspender", estilo: "bg-warning", funcion: suspenderTratamiento },
    reactivar: { titulo: "Reactivar tratamiento", descripcion: "El tratamiento volverá a estar disponible si su plaga asociada está activa.", icono: PlayCircle, boton: "Reactivar", estilo: "bg-forest", funcion: reactivarTratamiento },
    eliminar: { titulo: "Eliminar tratamiento", descripcion: "Esta acción eliminará permanentemente el tratamiento y sus registros relacionados.", icono: Trash2, boton: "Eliminar definitivamente", estilo: "bg-danger", funcion: id => eliminarTratamiento(id, true) }
};

const normalizar = texto => String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function Estado({ estado }) {
    return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${estado === "activo" ? "bg-success-light text-success" : "bg-warning-light text-warning"}`}><span className="h-2 w-2 rounded-full bg-current" />{estado === "activo" ? "Activo" : "Suspendido"}</span>;
}

function Acciones({ tratamiento, abrirModal }) {
    const activo = tratamiento.estado === "activo";
    const Icono = activo ? PauseCircle : PlayCircle;
    const estilo = "rounded-xl p-2.5 transition hover:opacity-70";
    return <div className="flex flex-wrap items-center gap-2">
        <Link to={`/admin/tratamientos/${tratamiento.id}`} title="Ver detalle" aria-label="Ver detalle" className={`${estilo} bg-pale text-forest`}><Eye size={18} /></Link>
        <Link to={`/admin/tratamientos/${tratamiento.id}/editar`} title="Editar" aria-label="Editar" className={`${estilo} bg-info-light text-info`}><Pencil size={18} /></Link>
        <button type="button" title={activo ? "Suspender" : "Reactivar"} aria-label={activo ? "Suspender" : "Reactivar"} onClick={() => abrirModal(activo ? "suspender" : "reactivar", tratamiento)} className={`${estilo} ${activo ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}><Icono size={18} /></button>
        <button type="button" title="Eliminar" aria-label="Eliminar" onClick={() => abrirModal("eliminar", tratamiento)} className={`${estilo} bg-danger-light text-danger`}><Trash2 size={18} /></button>
    </div>;
}

function TarjetaTratamiento({ tratamiento, abrirModal }) {
    return <article className="flex flex-col rounded-florae border border-border bg-surface p-5 shadow-florae transition hover:-translate-y-1">
        <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pale text-forest"><FlaskConical size={28} strokeWidth={1.6} /></div>
            <Estado estado={tratamiento.estado} />
        </div>
        <h3 className="break-words font-lora text-xl font-bold text-forest-dark">{tratamiento.nombre}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary"><Bug size={16} />{tratamiento.plaga?.nombre_comun || "Sin información de la plaga"}</p>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-secondary">{tratamiento.descripcion}</p>
        <div className="mt-auto pt-5">
            <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-soft p-3 text-xs font-semibold text-forest"><Clock size={18} />{tratamiento.duracion_dias} días</div>
                <div className="flex items-center gap-2 rounded-xl bg-soft p-3 text-xs font-semibold text-forest"><Pill size={18} />{tratamiento.medicamentos?.length || 0} medicamentos</div>
            </div>
            <div className="border-t border-border pt-4"><Acciones {...{ tratamiento, abrirModal }} /></div>
        </div>
    </article>;
}

export default function Tratamientos() {
    const location = useLocation();
    const [tratamientos, setTratamientos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("todos");
    const [plaga, setPlaga] = useState("");
    const [vista, setVista] = useState("tarjetas");
    const [recarga, setRecarga] = useState(0);
    const [modal, setModal] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [errorAccion, setErrorAccion] = useState("");
    const [mensaje, setMensaje] = useState(location.state?.mensaje || "");

    // Consultar los tratamientos
    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setError("");
        obtenerTratamientosAdmin().then(datos => {
            if (!Array.isArray(datos?.tratamientos)) throw new Error("La API devolvió información inválida.");
            if (vigente) setTratamientos(datos.tratamientos);
        }).catch(e => {
            if (vigente) setError(e.message || "No se pudieron consultar los tratamientos.");
        }).finally(() => { if (vigente) setCargando(false); });
        return () => { vigente = false; };
    }, [recarga]);

    useEffect(() => {
        if (!mensaje) return;
        const tiempo = setTimeout(() => setMensaje(""), 4500);
        return () => clearTimeout(tiempo);
    }, [mensaje]);

    const plagas = [...new Map(tratamientos.filter(t => t.plaga?.id).map(t => [String(t.plaga.id), t.plaga.nombre_comun])).entries()];
    const activos = tratamientos.filter(t => t.estado === "activo").length;
    const filtrados = tratamientos.filter(t =>
        normalizar(`${t.nombre} ${t.plaga?.nombre_comun || ""}`).includes(normalizar(busqueda)) &&
        (estado === "todos" || t.estado === estado) &&
        (!plaga || String(t.plaga_id) === plaga)
    );

    const abrirModal = (accion, tratamiento) => { setErrorAccion(""); setMensaje(""); setModal({ accion, tratamiento }); };
    const cerrarModal = () => { if (!procesando) { setModal(null); setErrorAccion(""); } };
    const configuracion = modal ? acciones[modal.accion] : null;
    const IconoModal = configuracion?.icono;

    // Confirmar la acción seleccionada
    const confirmarAccion = async () => {
        if (!modal || procesando) return;
        setProcesando(true);
        setErrorAccion("");
        try {
            const respuesta = await configuracion.funcion(modal.tratamiento.id);
            if (modal.accion === "eliminar") setTratamientos(actual => actual.filter(t => t.id !== modal.tratamiento.id));
            else setTratamientos(actual => actual.map(t => t.id === modal.tratamiento.id ? { ...t, ...respuesta.tratamiento, estado: modal.accion === "suspender" ? "suspendido" : "activo" } : t));
            setMensaje(respuesta?.mensaje || "Acción realizada correctamente.");
            setModal(null);
        } catch (e) { setErrorAccion(e.message || "No se pudo realizar la acción."); }
        finally { setProcesando(false); }
    };

    const estadisticas = [
        { titulo: "Total de tratamientos", valor: tratamientos.length, icono: FlaskConical, estilo: "bg-pale text-forest" },
        { titulo: "Tratamientos activos", valor: activos, icono: CheckCircle2, estilo: "bg-success-light text-success" },
        { titulo: "Tratamientos suspendidos", valor: tratamientos.filter(t => t.estado === "suspendido").length, icono: PauseCircle, estilo: "bg-warning-light text-warning" }
    ];

    const input = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

    return <div className="mx-auto max-w-7xl animate-fade-in space-y-7">
        {/* Encabezado */}
        <section className="relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#C2DCD9] bg-linear-to-br from-[#D2E5DF] to-white p-5 shadow-florae sm:px-6 sm:py-6">
                <div className="relative z-10 min-w-0 flex-1 basis-64">
                    <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#427A76]"><FlaskConical size={17} /> Cuidado y recuperación</p>
                    <h1 className="font-lora text-2xl font-bold text-forest-dark sm:text-3xl">Gestión de tratamientos</h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#465447]">Administra los tratamientos para el cuidado y recuperación de las plantas.</p>
                </div>
                <div aria-hidden="true" className="pointer-events-none relative hidden h-24 w-28 shrink-0 items-center justify-center md:flex">
                    <span className="absolute h-24 w-24 rounded-full border border-[#C2DCD9] bg-[#C2DCD9]/50" />
                    <FlaskConical size={57} strokeWidth={1.35} className="relative -rotate-12 text-[#427A76]" />
                    <Sprout size={25} strokeWidth={1.5} className="absolute bottom-0 right-0 rotate-12 rounded-full bg-white p-1 text-[#427A76]" />
                </div>
                <Link to="/admin/tratamientos/crear" className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-linear-to-br from-[#36583E] to-[#58765A] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"><Plus size={20} /> Nuevo tratamiento</Link>
            </section>

        {/* Estadísticas */}
        <section className="grid gap-4 sm:grid-cols-3">
            {estadisticas.map(({ titulo, valor, icono: Icono, estilo }) => <article key={titulo} className="flex items-center gap-4 rounded-florae border border-border bg-surface p-5 shadow-florae">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${estilo}`}><Icono size={26} strokeWidth={1.7} /></div>
                <div><p className="text-sm text-secondary">{titulo}</p>{cargando ? <div className="mt-2 h-8 w-12 animate-pulse rounded-lg bg-pale" /> : <p className="mt-1 font-lora text-3xl font-bold text-forest-dark">{error ? "—" : valor}</p>}</div>
            </article>)}
        </section>

        {mensaje && <div role="status" className="flex items-center gap-3 rounded-2xl bg-success-light p-4 text-sm text-success"><CheckCircle2 size={22} /><p className="flex-1 font-semibold">{mensaje}</p><button type="button" aria-label="Cerrar mensaje" onClick={() => setMensaje("")}><X size={18} /></button></div>}

        {/* Filtros */}
        <section className="grid gap-4 rounded-florae border border-border bg-surface p-5 shadow-florae lg:grid-cols-[2fr_1fr_1fr_auto]">
            <div className="relative"><Search size={19} className="absolute left-4 top-3.5 text-muted" /><input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar tratamiento o plaga..." aria-label="Buscar tratamiento" className={`${input} pl-11`} /></div>
            <select value={plaga} onChange={e => setPlaga(e.target.value)} aria-label="Filtrar por plaga" className={input}><option value="">Todas las plagas</option>{plagas.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}</select>
            <select value={estado} onChange={e => setEstado(e.target.value)} aria-label="Filtrar por estado" className={input}><option value="todos">Todos los estados</option><option value="activo">Activos</option><option value="suspendido">Suspendidos</option></select>
            <button type="button" onClick={() => { setBusqueda(""); setEstado("todos"); setPlaga(""); }} className="rounded-xl bg-pale px-5 py-3 text-sm font-bold text-forest">Limpiar filtros</button>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="font-lora text-2xl font-bold text-forest-dark">Nuestros tratamientos</h2><p className="mt-1 text-sm text-secondary">{cargando ? "Consultando catálogo..." : `${filtrados.length} tratamientos encontrados`}</p></div>
            <div className="flex items-center gap-3">
                <button type="button" title="Actualizar" aria-label="Actualizar" disabled={cargando} onClick={() => setRecarga(n => n + 1)} className="rounded-xl border border-border bg-surface p-3 text-forest disabled:opacity-50"><RefreshCw size={19} className={cargando ? "animate-spin" : ""} /></button>
                <div className="flex rounded-xl border border-border bg-surface p-1">
                    {[["tarjetas", LayoutGrid], ["tabla", List]].map(([tipo, Icono]) => <button key={tipo} type="button" aria-label={`Vista de ${tipo}`} aria-pressed={vista === tipo} onClick={() => setVista(tipo)} className={`rounded-lg p-2.5 ${vista === tipo ? "bg-pale text-forest" : "text-muted"}`}><Icono size={19} /></button>)}
                </div>
            </div>
        </section>

        {/* Listado */}
        {cargando ? <div className="grid animate-pulse gap-5 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="h-72 rounded-florae bg-pale" />)}</div>
            : error ? <div role="alert" className="flex flex-col items-center gap-4 rounded-florae border border-border bg-surface p-12 text-center"><AlertCircle size={42} className="text-danger" /><h3 className="font-lora text-xl font-bold text-forest-dark">No pudimos consultar los tratamientos</h3><p className="text-sm text-secondary">{error}</p><button onClick={() => setRecarga(n => n + 1)} className="rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white">Reintentar</button></div>
            : !filtrados.length ? <div className="flex flex-col items-center gap-4 rounded-florae border border-dashed border-border bg-surface p-12 text-center"><FlaskConical size={45} className="text-primary" /><h3 className="font-lora text-xl font-bold text-forest-dark">No encontramos tratamientos</h3><p className="text-sm text-secondary">Prueba con otros filtros o registra un nuevo tratamiento.</p></div>
            : vista === "tarjetas" ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtrados.map(tratamiento => <TarjetaTratamiento key={tratamiento.id} {...{ tratamiento, abrirModal }} />)}</div>
            : <div className="overflow-x-auto rounded-florae border border-border bg-surface shadow-florae">
                <table className="w-full whitespace-nowrap text-left text-sm">
                    <thead className="bg-soft text-forest-dark"><tr>{["Tratamiento", "Plaga", "Duración", "Medicamentos", "Estado", "Acciones"].map(t => <th key={t} className="px-5 py-4 font-bold">{t}</th>)}</tr></thead>
                    <tbody>{filtrados.map(tratamiento => <tr key={tratamiento.id} className="border-t border-border transition hover:bg-soft">
                        <td className="px-5 py-4 font-bold text-forest-dark">{tratamiento.nombre}</td>
                        <td className="px-5 py-4 text-secondary">{tratamiento.plaga?.nombre_comun || "—"}</td>
                        <td className="px-5 py-4 text-secondary">{tratamiento.duracion_dias} días</td>
                        <td className="px-5 py-4 text-secondary">{tratamiento.medicamentos?.length || 0}</td>
                        <td className="px-5 py-4"><Estado estado={tratamiento.estado} /></td>
                        <td className="px-5 py-4"><Acciones {...{ tratamiento, abrirModal }} /></td>
                    </tr>)}</tbody>
                </table>
            </div>}

        {/* Modal de confirmación */}
        {modal && <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal" className="relative max-h-[90dvh] w-full max-w-md animate-scale-in space-y-5 overflow-y-auto rounded-florae bg-surface p-7 shadow-xl">
                <button type="button" disabled={procesando} onClick={cerrarModal} aria-label="Cerrar modal" className="absolute right-4 top-4 rounded-lg p-2 text-muted"><X size={21} /></button>
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${modal.accion === "eliminar" ? "bg-danger-light text-danger" : modal.accion === "suspender" ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}><IconoModal size={32} strokeWidth={1.6} /></div>
                <h2 id="titulo-modal" className="font-lora text-2xl font-bold text-forest-dark">{configuracion.titulo}</h2>
                <p className="text-sm leading-6 text-secondary">{configuracion.descripcion}</p>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-soft p-4"><FlaskConical size={28} className="shrink-0 text-primary" /><div><p className="font-bold text-forest-dark">{modal.tratamiento.nombre}</p><p className="mt-1 text-xs text-secondary">{modal.tratamiento.plaga?.nombre_comun}</p></div></div>
                {modal.accion === "eliminar" && <div className="space-y-2 rounded-xl bg-warning-light p-4 text-sm leading-6 text-warning">
                    <p className="flex items-center gap-2 font-bold"><AlertCircle size={19} /> Ten en cuenta</p>
                    <p>Se eliminarán las aplicaciones del tratamiento, sus notificaciones dependientes y las asociaciones con medicamentos.</p>
                    <p>Los medicamentos del catálogo y la plaga asociada se conservarán.</p>
                    <p className="font-bold">Si deseas conservar el historial de aplicaciones, puedes suspender el tratamiento.</p>
                </div>}
                {errorAccion && <p role="alert" className="rounded-xl bg-danger-light p-3 text-sm text-danger">{errorAccion}</p>}
                <div className="flex flex-wrap justify-end gap-3">
                    <button type="button" disabled={procesando} onClick={cerrarModal} className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-secondary disabled:opacity-50">Cancelar</button>
                    <button type="button" disabled={procesando} onClick={confirmarAccion} className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 ${configuracion.estilo}`}>{procesando ? <LoaderCircle size={18} className="animate-spin" /> : <IconoModal size={18} />}{procesando ? "Procesando..." : configuracion.boton}</button>
                </div>
            </div>
        </div>}
    </div>;
}