import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FlaskConical, ListChecks, Pill, Plus, Trash2, Search, Save, LoaderCircle, AlertCircle } from "lucide-react";
import { obtenerTratamientoAdmin, obtenerPlagasAdmin, obtenerMedicamentosAdmin, crearTratamiento, actualizarTratamiento } from "../../../services/adminApi";

const inicial = { nombre: "", descripcion: "", plaga_id: "", duracion_dias: "", paso_1: "", paso_2: "", paso_3: "", paso_4: "", paso_5: "", medicamentos: [] };
const input = "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";
const seccion = "rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7";

export default function FormularioTratamiento() {
    const { id } = useParams();
    const navigate = useNavigate();
    const editar = Boolean(id);
    const [formulario, setFormulario] = useState(inicial);
    const [plagas, setPlagas] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [pasos, setPasos] = useState(1);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [errorCarga, setErrorCarga] = useState("");
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);
    const [modal, setModal] = useState(false);

    // Consultar los catálogos y el tratamiento
    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setErrorCarga("");
        setError("");
        setFormulario(inicial);
        setPasos(1);

        Promise.all([
            obtenerPlagasAdmin(),
            obtenerMedicamentosAdmin(),
            editar ? obtenerTratamientoAdmin(id) : Promise.resolve(null)
        ]).then(([datosPlagas, datosMedicamentos, datosTratamiento]) => {
            if (!vigente) return;

            const listaPlagas = datosPlagas?.plagas;
            const listaMedicamentos = datosMedicamentos?.medicamentos ?? datosMedicamentos;

            if (!Array.isArray(listaPlagas) || !Array.isArray(listaMedicamentos)) throw new Error("No se pudieron cargar los catálogos.");

            const tratamiento = datosTratamiento?.tratamiento;
            if (editar && !tratamiento?.id) throw new Error("No se encontró el tratamiento.");

            setPlagas(listaPlagas);
            setMedicamentos(listaMedicamentos);

            if (tratamiento) {
                setFormulario({
                    ...Object.fromEntries(Object.keys(inicial).filter(c => c !== "medicamentos").map(c => [c, tratamiento[c] ?? ""])),
                    medicamentos: (tratamiento.medicamentos || []).map(m => Number(m.id))
                });
                setPasos(Math.max(1, ...[1, 2, 3, 4, 5].filter(n => tratamiento[`paso_${n}`])));
            }
        }).catch(e => {
            if (vigente) setErrorCarga(e.message || "No se pudo cargar el formulario.");
        }).finally(() => {
            if (vigente) setCargando(false);
        });

        return () => { vigente = false; };
    }, [id, editar, recarga]);

    const cambiar = e => setFormulario(actual => ({ ...actual, [e.target.name]: e.target.value }));
    const volver = () => navigate(editar ? `/admin/tratamientos/${id}` : "/admin/tratamientos");

    const plagasDisponibles = plagas.filter(p => p.estado === "activo" || (editar && Number(p.id) === Number(formulario.plaga_id)));
    const medicamentosFiltrados = medicamentos.filter(m => String(m.nombre ?? "").toLowerCase().includes(busqueda.toLowerCase().trim()));

    // Seleccionar o quitar medicamentos
    const seleccionarMedicamento = id => {
        const medicamentoId = Number(id);
        setFormulario(actual => ({
            ...actual,
            medicamentos: actual.medicamentos.includes(medicamentoId) ? actual.medicamentos.filter(m => m !== medicamentoId) : [...actual.medicamentos, medicamentoId]
        }));
    };

    // Eliminar un paso y reorganizar los restantes
    const quitarPaso = numero => {
        setFormulario(actual => {
            const restantes = Array.from({ length: pasos }, (_, i) => actual[`paso_${i + 1}`]).filter((_, i) => i !== numero - 1);
            return { ...actual, ...Object.fromEntries([1, 2, 3, 4, 5].map((n, i) => [`paso_${n}`, restantes[i] || ""])) };
        });
        setPasos(actual => actual - 1);
    };

    // Guardar el tratamiento
    const guardar = async e => {
        e.preventDefault();
        if (guardando || modal) return;
        setError("");

        const datos = {
            nombre: formulario.nombre.trim(),
            descripcion: formulario.descripcion.trim(),
            plaga_id: Number(formulario.plaga_id),
            duracion_dias: Number(formulario.duracion_dias),
            medicamentos: formulario.medicamentos
        };

        for (let n = 1; n <= 5; n++) datos[`paso_${n}`] = formulario[`paso_${n}`].trim() || null;

        if (!datos.nombre || !datos.descripcion || !datos.plaga_id || !Number.isInteger(datos.duracion_dias) || datos.duracion_dias < 1 || !datos.paso_1) {
            setError("Completa los campos obligatorios y verifica la duración.");
            return;
        }

        if (Array.from({ length: pasos }, (_, i) => datos[`paso_${i + 1}`]).some(p => !p)) {
            setError("Completa los pasos agregados o elimina los que estén vacíos.");
            return;
        }

        setGuardando(true);
        try {
            const respuesta = editar ? await actualizarTratamiento(id, datos) : await crearTratamiento(datos);
            navigate("/admin/tratamientos", { replace: true, state: { mensaje: respuesta?.mensaje || (editar ? "Tratamiento actualizado correctamente." : "Tratamiento registrado correctamente.") } });
        } catch (e) {
            setError(e.message || "No se pudo guardar el tratamiento.");
            console.error("Error al guardar tratamiento:", e);
        } finally { setGuardando(false); }
    };

    if (cargando) return <div className="mx-auto max-w-5xl animate-pulse space-y-6">{[1, 2, 3].map(n => <div key={n} className="h-64 rounded-florae bg-pale" />)}</div>;

    if (errorCarga) return <div role="alert" className={`${seccion} space-y-4 text-danger`}>
        <AlertCircle size={35} />
        <p>{errorCarga}</p>
        <button onClick={() => setRecarga(n => n + 1)} className="mr-5 font-bold">Reintentar</button>
        <button onClick={volver} className="font-bold text-forest">Volver</button>
    </div>;

    return <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
        <button type="button" disabled={guardando} onClick={() => setModal(true)} className="flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={19} /> {editar ? "Volver al detalle" : "Volver al catálogo"}</button>

        <header>
            <h1 className="font-lora text-3xl font-bold text-forest-dark">{editar ? "Editar tratamiento" : "Registrar nuevo tratamiento"}</h1>
            <p className="mt-2 text-sm text-secondary">Gestiona los tratamientos para proteger y recuperar la salud de las plantas.</p>
        </header>

        <form onSubmit={guardar} className="space-y-6">
            {/* Información general */}
            <section className={seccion}>
                <h2 className="mb-6 flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><FlaskConical className="text-primary" /> Información general</h2>
                <fieldset disabled={guardando} className="grid gap-5 text-sm font-bold text-forest-dark sm:grid-cols-2">
                    <label className="sm:col-span-2">Nombre del tratamiento *
                        <input name="nombre" value={formulario.nombre} onChange={cambiar} maxLength={100} required placeholder="Nombre del tratamiento" className={input} />
                    </label>

                    <label>Plaga asociada *
                        <select name="plaga_id" value={formulario.plaga_id} onChange={cambiar} required className={input}>
                            <option value="">Selecciona una plaga</option>
                            {plagasDisponibles.map(p => <option key={p.id} value={p.id}>{p.nombre_comun}{p.estado !== "activo" ? " (Suspendida)" : ""}</option>)}
                        </select>
                    </label>

                    <label>Duración en días *
                        <input type="number" name="duracion_dias" value={formulario.duracion_dias} onChange={cambiar} min={1} step={1} required placeholder="Ej. 7" className={input} />
                    </label>

                    <label className="sm:col-span-2">Descripción *
                        <textarea name="descripcion" value={formulario.descripcion} onChange={cambiar} required rows={5} placeholder="Describe el tratamiento..." className={input} />
                    </label>
                </fieldset>

                {!plagasDisponibles.length && <p className="mt-4 rounded-xl bg-warning-light p-3 text-sm text-warning">No hay plagas activas disponibles. Registra o reactiva una plaga antes de crear el tratamiento.</p>}
            </section>

            {/* Pasos del tratamiento */}
            <section className={seccion}>
                <h2 className="flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><ListChecks className="text-primary" /> Pasos del tratamiento</h2>
                <p className="mb-6 mt-2 text-sm text-secondary">Agrega las instrucciones necesarias para realizar el tratamiento.</p>

                <fieldset disabled={guardando} className="space-y-4">
                    {Array.from({ length: pasos }, (_, i) => i + 1).map(n => <div key={n} className="rounded-2xl border border-border bg-soft p-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor={`paso_${n}`} className="flex items-center gap-3 text-sm font-bold text-forest-dark"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pale text-forest">{n}</span> Paso {n} {n === 1 && "*"}</label>
                            {n > 1 && <button type="button" onClick={() => quitarPaso(n)} aria-label={`Eliminar paso ${n}`} className="rounded-lg bg-danger-light p-2 text-danger"><Trash2 size={18} /></button>}
                        </div>
                        <textarea id={`paso_${n}`} name={`paso_${n}`} value={formulario[`paso_${n}`]} onChange={cambiar} maxLength={255} required rows={3} placeholder={`Describe el paso ${n}...`} className={input} />
                        <p className="mt-1 text-right text-xs text-muted">{formulario[`paso_${n}`].length}/255</p>
                    </div>)}

                    {pasos < 5 && <button type="button" onClick={() => setPasos(n => n + 1)} className="flex items-center gap-2 rounded-xl bg-pale px-4 py-3 text-sm font-bold text-forest hover:bg-primary/25"><Plus size={19} /> Agregar paso</button>}
                </fieldset>
            </section>

            {/* Medicamentos asociados */}
            <section className={seccion}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><Pill className="text-primary" /> Medicamentos asociados</h2>
                    <span className="rounded-full bg-pale px-4 py-2 text-xs font-bold text-forest">{formulario.medicamentos.length} seleccionados</span>
                </div>
                <p className="mb-5 mt-2 text-sm text-secondary">Selecciona los medicamentos necesarios. Esta sección es opcional.</p>

                <div className="relative mb-4">
                    <Search size={19} className="absolute left-4 top-5 text-muted" />
                    <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar medicamentos..." aria-label="Buscar medicamentos" className={`${input} pl-11`} />
                </div>

                <fieldset disabled={guardando} className="grid max-h-80 gap-3 overflow-y-auto sm:grid-cols-2">
                    {medicamentosFiltrados.map(m => {
                        const seleccionado = formulario.medicamentos.includes(Number(m.id));
                        return <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${seleccionado ? "border-primary bg-pale" : "border-border bg-soft hover:bg-pale"}`}>
                            <input type="checkbox" checked={seleccionado} onChange={() => seleccionarMedicamento(m.id)} className="h-4 w-4 accent-[#3F5D3F]" />
                            <div className="min-w-0"><p className="text-sm font-bold text-forest-dark">{m.nombre}</p><p className="mt-1 line-clamp-2 text-xs text-secondary">{m.descripcion}</p></div>
                        </label>;
                    })}
                </fieldset>

                {!medicamentosFiltrados.length && <div className="rounded-xl border border-dashed border-border bg-soft p-6 text-center text-sm text-secondary">{medicamentos.length ? "No encontramos medicamentos con esa búsqueda." : "Todavía no hay medicamentos registrados. Puedes crear el tratamiento sin medicamentos."}</div>}
            </section>

            {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-light p-4 text-sm text-danger"><AlertCircle size={20} className="shrink-0" />{error}</p>}

            <div className="flex flex-wrap justify-end gap-3">
                <button type="button" disabled={guardando} onClick={() => setModal(true)} className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-secondary">Cancelar</button>
                <button type="submit" disabled={guardando || !plagasDisponibles.length} className="flex items-center gap-2 rounded-xl bg-forest px-6 py-3 text-sm font-bold text-white transition hover:bg-forest-dark disabled:opacity-50">
                    {guardando ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
                    {guardando ? "Guardando..." : editar ? "Guardar cambios" : "Registrar tratamiento"}
                </button>
            </div>
        </form>

        {modal && <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal" className="w-full max-w-md space-y-5 rounded-florae bg-surface p-7 shadow-xl">
                <h2 id="titulo-modal" className="font-lora text-2xl font-bold text-forest-dark">¿Salir del formulario?</h2>
                <p className="text-sm leading-6 text-secondary">Los cambios que no hayas guardado se perderán.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setModal(false)} className="rounded-xl border border-border px-4 py-3 text-sm font-bold">Cancelar</button>
                    <button onClick={volver} className="rounded-xl bg-danger px-5 py-3 text-sm font-bold text-white">Salir</button>
                </div>
            </div>
        </div>}
    </div>;
}