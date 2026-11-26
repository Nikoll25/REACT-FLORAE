import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FlaskConical, Pencil, Clock, Bug, Pill, ListChecks, PauseCircle, PlayCircle, AlertCircle, LoaderCircle, CheckCircle2, Sprout } from "lucide-react";
import { obtenerTratamientoAdmin, suspenderTratamiento, reactivarTratamiento } from "../../../services/adminApi";

const seccion = "rounded-florae border border-border bg-surface p-6 shadow-florae";
const boton = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition disabled:opacity-50";

export default function DetalleTratamiento() {
    const { id } = useParams();
    const [tratamiento, setTratamiento] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);
    const [modal, setModal] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [errorAccion, setErrorAccion] = useState("");
    const [mensaje, setMensaje] = useState("");

    // Consultar el tratamiento
    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setError("");
        obtenerTratamientoAdmin(id).then(datos => {
            if (!datos?.tratamiento?.id) throw new Error("No se encontró el tratamiento.");
            if (vigente) setTratamiento(datos.tratamiento);
        }).catch(e => {
            if (vigente) setError(e.message || "No se pudo consultar el tratamiento.");
        }).finally(() => {
            if (vigente) setCargando(false);
        });
        return () => { vigente = false; };
    }, [id, recarga]);

    useEffect(() => {
        if (!mensaje) return;
        const tiempo = setTimeout(() => setMensaje(""), 4500);
        return () => clearTimeout(tiempo);
    }, [mensaje]);

    const activo = tratamiento?.estado === "activo";
    const pasos = [1, 2, 3, 4, 5].map(n => tratamiento?.[`paso_${n}`]).filter(Boolean);
    const medicamentos = tratamiento?.medicamentos || [];

    // Cambiar el estado del tratamiento
    const cambiarEstado = async () => {
        if (procesando) return;
        setProcesando(true);
        setErrorAccion("");
        try {
            const respuesta = await (activo ? suspenderTratamiento(id) : reactivarTratamiento(id));
            setTratamiento(actual => ({ ...actual, ...respuesta.tratamiento, estado: activo ? "suspendido" : "activo" }));
            setMensaje(respuesta.mensaje || "Estado actualizado correctamente.");
            setModal(false);
        } catch (e) {
            setErrorAccion(e.message || "No se pudo actualizar el estado.");
        } finally { setProcesando(false); }
    };

    if (cargando) return <div className="mx-auto max-w-5xl animate-pulse space-y-6">{[1, 2, 3].map(n => <div key={n} className="h-56 rounded-florae bg-pale" />)}</div>;

    if (error || !tratamiento) return <div className={`${seccion} space-y-4 text-danger`}>
        <AlertCircle size={35} />
        <p>{error || "Tratamiento no encontrado."}</p>
        <button onClick={() => setRecarga(n => n + 1)} className="mr-5 font-bold">Reintentar</button>
        <Link to="/admin/tratamientos" className="font-bold text-forest">Volver al catálogo</Link>
    </div>;

    const resumen = [
        { titulo: "Duración", valor: `${tratamiento.duracion_dias} días`, icono: Clock },
        { titulo: "Pasos", valor: pasos.length, icono: ListChecks },
        { titulo: "Medicamentos", valor: medicamentos.length, icono: Pill },
        { titulo: "Aplicaciones registradas", valor: tratamiento.aplicaciones_tratamientos_count ?? "—", icono: Sprout }
    ];

    return <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
        <Link to="/admin/tratamientos" className="inline-flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={19} /> Volver a tratamientos</Link>

        {/* Encabezado */}
        <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="font-lora text-3xl font-bold text-forest-dark">Detalle del tratamiento</h1>
                <p className="mt-2 text-sm text-secondary">Consulta la información y las instrucciones del tratamiento.</p>
            </div>
            <div className="flex flex-wrap gap-3">
                <Link to={`/admin/tratamientos/${id}/editar`} className={`${boton} bg-forest text-white hover:bg-forest-dark`}><Pencil size={18} /> Editar tratamiento</Link>
                <button onClick={() => { setErrorAccion(""); setModal(true); }} className={`${boton} ${activo ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}>
                    {activo ? <PauseCircle size={18} /> : <PlayCircle size={18} />}{activo ? "Suspender" : "Reactivar"}
                </button>
            </div>
        </header>

        {mensaje && <div role="status" className="flex items-center gap-3 rounded-xl bg-success-light p-4 text-sm font-semibold text-success"><CheckCircle2 size={21} />{mensaje}</div>}

        {/* Información general */}
        <section className={seccion}>
            <div className="flex flex-wrap items-start gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-pale text-forest"><FlaskConical size={40} strokeWidth={1.5} /></div>
                <div className="min-w-0 flex-1">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${activo ? "bg-success-light text-success" : "bg-warning-light text-warning"}`}>{activo ? "Activo" : "Suspendido"}</span>
                    <h2 className="mt-3 break-words font-lora text-2xl font-bold text-forest-dark">{tratamiento.nombre}</h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-secondary">{tratamiento.descripcion}</p>
                </div>
            </div>

            <div className="mt-6 rounded-2xl bg-soft p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-forest"><Bug size={20} /> Plaga asociada</p>
                {tratamiento.plaga ? <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="font-lora text-lg font-bold text-forest-dark">{tratamiento.plaga.nombre_comun}</h3>
                        <p className="mt-1 text-sm italic text-secondary">{tratamiento.plaga.nombre_cientifico}</p>
                    </div>
                    <Link to={`/admin/plagas/${tratamiento.plaga.id}`} className="text-sm font-bold text-forest underline">Ver plaga</Link>
                </div> : <p className="text-sm text-secondary">Información de la plaga no disponible.</p>}
            </div>

            {!activo && <p className="mt-4 rounded-xl bg-warning-light p-4 text-sm text-warning">Este tratamiento está suspendido y no se encuentra disponible en el catálogo público.</p>}
            {activo && tratamiento.plaga?.estado === "suspendido" && <p className="mt-4 rounded-xl bg-warning-light p-4 text-sm text-warning">La plaga asociada está suspendida. El tratamiento no estará disponible en el catálogo público.</p>}
        </section>

        {/* Resumen */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {resumen.map(({ titulo, valor, icono: Icono }) => <article key={titulo} className={seccion}>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-pale text-forest"><Icono size={23} /></div>
                <p className="text-sm text-secondary">{titulo}</p>
                <p className="mt-2 font-lora text-2xl font-bold text-forest-dark">{valor}</p>
            </article>)}
        </section>

        {/* Pasos */}
        <section className={seccion}>
            <h2 className="mb-5 flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><ListChecks className="text-primary" /> Pasos del tratamiento</h2>
            <div className="space-y-3">
                {pasos.map((paso, i) => <div key={i} className="flex items-start gap-4 rounded-2xl border border-border bg-soft p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pale font-bold text-forest">{i + 1}</span>
                    <div>
                        <h3 className="text-sm font-bold text-forest-dark">Paso {i + 1}</h3>
                        <p className="mt-1 text-sm leading-6 text-secondary">{paso}</p>
                    </div>
                </div>)}
            </div>
        </section>

        {/* Medicamentos */}
        <section className={seccion}>
            <h2 className="mb-5 flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><Pill className="text-primary" /> Medicamentos asociados</h2>
            {medicamentos.length ? <div className="grid gap-4 sm:grid-cols-2">
                {medicamentos.map(m => <article key={m.id} className="flex items-start gap-4 rounded-2xl border border-border bg-soft p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pale text-forest"><Pill size={24} /></div>
                    <div>
                        <h3 className="font-bold text-forest-dark">{m.nombre}</h3>
                        <p className="mt-2 text-sm leading-6 text-secondary">{m.descripcion}</p>
                    </div>
                </article>)}
            </div> : <div className="rounded-2xl border border-dashed border-border bg-soft p-7 text-center text-sm text-secondary">Este tratamiento no tiene medicamentos asociados.</div>}
        </section>

        {/* Modal de confirmación */}
        {modal && <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal" className="w-full max-w-md space-y-5 rounded-florae bg-surface p-7 shadow-xl">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${activo ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}>{activo ? <PauseCircle size={30} /> : <PlayCircle size={30} />}</div>
                <h2 id="titulo-modal" className="font-lora text-2xl font-bold text-forest-dark">{activo ? "Suspender tratamiento" : "Reactivar tratamiento"}</h2>
                <p className="text-sm leading-6 text-secondary">{activo ? "El tratamiento dejará de estar disponible en el catálogo público, pero conservará sus registros." : "El tratamiento volverá a estar disponible si su plaga asociada está activa."}</p>
                <p className="rounded-xl bg-soft p-4 text-sm font-bold text-forest-dark">{tratamiento.nombre}</p>
                {errorAccion && <p role="alert" className="rounded-xl bg-danger-light p-3 text-sm text-danger">{errorAccion}</p>}
                <div className="flex justify-end gap-3">
                    <button disabled={procesando} onClick={() => setModal(false)} className={`${boton} border border-border text-secondary`}>Cancelar</button>
                    <button disabled={procesando} onClick={cambiarEstado} className={`${boton} text-white ${activo ? "bg-warning" : "bg-forest"}`}>
                        {procesando && <LoaderCircle size={18} className="animate-spin" />}{procesando ? "Procesando..." : activo ? "Suspender" : "Reactivar"}
                    </button>
                </div>
            </div>
        </div>}
    </div>;
}