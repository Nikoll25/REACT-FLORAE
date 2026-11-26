import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pill, ClipboardList, FlaskConical, Search, Save, LoaderCircle, AlertCircle } from "lucide-react";
import { obtenerMedicamentoAdmin, obtenerTratamientosAdmin, crearMedicamento, actualizarMedicamento } from "../../../services/adminApi";

const inicial = {
    nombre: "",
    descripcion: "",
    instrucciones: "",
    dosis: "",
    frecuencia: "",
    tratamientos: []
};

const campo = "mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary";
const seccion = "rounded-florae border border-border bg-surface p-6 shadow-florae";

export default function FormularioMedicamento() {
    const { id } = useParams();
    const navigate = useNavigate();
    const editar = Boolean(id);
    const [formulario, setFormulario] = useState(inicial);
    const [tratamientos, setTratamientos] = useState([]);
    const [buscar, setBuscar] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [errorCarga, setErrorCarga] = useState("");
    const [recarga, setRecarga] = useState(0);
    const [modal, setModal] = useState(false);

    // Consultamos los tratamientos y el medicamento si estamos editando
    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setErrorCarga("");

        Promise.all([
            obtenerTratamientosAdmin(),
            editar ? obtenerMedicamentoAdmin(id) : Promise.resolve(null)
        ]).then(([datosTratamientos, datosMedicamento]) => {
            if (!Array.isArray(datosTratamientos?.tratamientos)) throw new Error("No se pudieron consultar los tratamientos.");
            if (!vigente) return;

            setTratamientos(datosTratamientos.tratamientos);

            if (editar) {
                const medicamento = datosMedicamento?.medicamento;
                if (!medicamento?.id) throw new Error("No se encontró el medicamento.");

                setFormulario({
                    nombre: medicamento.nombre || "",
                    descripcion: medicamento.descripcion || "",
                    instrucciones: medicamento.instrucciones || "",
                    dosis: medicamento.dosis || "",
                    frecuencia: medicamento.frecuencia || "",
                    tratamientos: (medicamento.tratamientos || []).map(t => Number(t.id))
                });
            } else {
                setFormulario(inicial);
            }
        }).catch(e => {
            if (vigente) setErrorCarga(e.message || "No se pudo cargar la información.");
        }).finally(() => {
            if (vigente) setCargando(false);
        });

        return () => { vigente = false; };
    }, [id, editar, recarga]);

    // Actualizamos los campos del formulario
    const cambiarCampo = e => {
        const { name, value } = e.target;
        setFormulario(actual => ({ ...actual, [name]: value }));
        setError("");
    };

    // Agregamos o quitamos tratamientos
    const seleccionarTratamiento = id => {
        const tratamientoId = Number(id);

        setFormulario(actual => ({
            ...actual,
            tratamientos: actual.tratamientos.includes(tratamientoId)
                ? actual.tratamientos.filter(t => t !== tratamientoId)
                : [...actual.tratamientos, tratamientoId]
        }));
    };

    const tratamientosFiltrados = tratamientos.filter(t =>
        t.nombre.toLowerCase().includes(buscar.trim().toLowerCase())
    );

    // Guardamos el medicamento
    const guardar = async e => {
        e.preventDefault();
        if (guardando) return;
        setError("");

        const datos = {
            nombre: formulario.nombre.trim(),
            descripcion: formulario.descripcion.trim(),
            instrucciones: formulario.instrucciones.trim(),
            dosis: formulario.dosis.trim(),
            frecuencia: formulario.frecuencia.trim(),
            tratamientos: formulario.tratamientos
        };

        if (!datos.nombre || !datos.descripcion || !datos.instrucciones || !datos.dosis || !datos.frecuencia) {
            setError("Completa todos los campos obligatorios.");
            return;
        }

        setGuardando(true);

        try {
            const respuesta = editar
                ? await actualizarMedicamento(id, datos)
                : await crearMedicamento(datos);

            navigate("/admin/medicamentos", {
                state: { mensaje: respuesta.mensaje || "Medicamento guardado correctamente." }
            });
        } catch (e) {
            setError(e.message || "No se pudo guardar el medicamento.");
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) return (
        <div className="animate-pulse space-y-6">
            <div className="h-5 w-32 rounded bg-pale" />
            <div className="h-9 w-72 rounded bg-pale" />
            {[1, 2, 3].map(n => (
                <div key={n} className={`${seccion} space-y-5`}>
                    <div className="h-7 w-48 rounded bg-pale" />
                    <div className="h-12 rounded-xl bg-soft" />
                    <div className="h-24 rounded-xl bg-soft" />
                </div>
            ))}
        </div>
    );

    if (errorCarga) return (
        <div className={`${seccion} text-center`}>
            <AlertCircle size={40} className="mx-auto mb-4 text-danger" />
            <h2 className="font-lora text-xl font-bold text-forest-dark">No se pudo cargar el formulario</h2>
            <p className="mt-2 text-sm text-secondary">{errorCarga}</p>
            <div className="mt-5 flex justify-center gap-3">
                <button onClick={() => navigate("/admin/medicamentos")} className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-secondary">Regresar</button>
                <button onClick={() => setRecarga(n => n + 1)} className="rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white">Reintentar</button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 font-nunito text-text animate-fade-in">
            <button type="button" disabled={guardando} onClick={() => setModal(true)} className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:text-primary">
                <ArrowLeft size={18} /> Volver a medicamentos
            </button>

            <div>
                <h1 className="font-lora text-3xl font-bold text-forest-dark">{editar ? "Editar medicamento" : "Registrar medicamento"}</h1>
                <p className="mt-2 text-sm text-secondary">{editar ? "Actualiza la información del medicamento." : "Agrega un nuevo medicamento al catálogo de Florae."}</p>
            </div>

            <form onSubmit={guardar} className="space-y-6">
                <fieldset disabled={guardando} className="space-y-6">

                    {/* Información general */}
                    <section className={seccion}>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pale text-forest"><Pill size={25} /></div>
                            <div>
                                <h2 className="font-lora text-xl font-bold text-forest-dark">Información general</h2>
                                <p className="text-sm text-secondary">Datos principales del medicamento.</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <label className="block text-sm font-bold text-forest">
                                Nombre del medicamento *
                                <input name="nombre" value={formulario.nombre} onChange={cambiarCampo} maxLength={100} required placeholder="Ej. Jabón potásico" className={campo} />
                            </label>
                            <label className="block text-sm font-bold text-forest">
                                Descripción *
                                <textarea name="descripcion" value={formulario.descripcion} onChange={cambiarCampo} rows={4} required placeholder="Describe el medicamento y su finalidad..." className={`${campo} resize-y`} />
                            </label>
                        </div>
                    </section>

                    {/* Modo de aplicación */}
                    <section className={seccion}>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pale text-forest"><ClipboardList size={25} /></div>
                            <div>
                                <h2 className="font-lora text-xl font-bold text-forest-dark">Modo de aplicación</h2>
                                <p className="text-sm text-secondary">Indica cómo debe utilizarse el medicamento.</p>
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="block text-sm font-bold text-forest">
                                Dosis *
                                <input name="dosis" value={formulario.dosis} onChange={cambiarCampo} maxLength={100} required placeholder="Indica la dosis recomendada" className={campo} />
                            </label>
                            <label className="block text-sm font-bold text-forest">
                                Frecuencia *
                                <input name="frecuencia" value={formulario.frecuencia} onChange={cambiarCampo} maxLength={100} required placeholder="Indica la frecuencia de aplicación" className={campo} />
                            </label>
                            <label className="block text-sm font-bold text-forest md:col-span-2">
                                Instrucciones *
                                <textarea name="instrucciones" value={formulario.instrucciones} onChange={cambiarCampo} rows={5} required placeholder="Describe las instrucciones de aplicación..." className={`${campo} resize-y`} />
                            </label>
                        </div>
                    </section>

                    {/* Tratamientos asociados */}
                    <section className={seccion}>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pale text-forest"><FlaskConical size={25} /></div>
                            <div>
                                <h2 className="font-lora text-xl font-bold text-forest-dark">Tratamientos asociados</h2>
                                <p className="text-sm text-secondary">Selecciona los tratamientos que utilizan este medicamento. Es opcional.</p>
                            </div>
                        </div>

                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-3.5 text-muted" />
                            <input type="search" value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar tratamientos..." aria-label="Buscar tratamientos" className={`${campo} mt-0 pl-11`} />
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm font-bold text-forest">{formulario.tratamientos.length} tratamientos seleccionados</p>
                            {formulario.tratamientos.length > 0 && (
                                <button type="button" onClick={() => setFormulario(actual => ({ ...actual, tratamientos: [] }))} className="text-xs font-bold text-danger hover:underline">Quitar selección</button>
                            )}
                        </div>

                        <div className="mt-4 grid max-h-80 gap-3 overflow-y-auto md:grid-cols-2">
                            {tratamientosFiltrados.map(t => {
                                const seleccionado = formulario.tratamientos.includes(Number(t.id));

                                return (
                                    <label key={t.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${seleccionado ? "border-primary bg-pale" : "border-border bg-soft hover:border-primary"}`}>
                                        <input type="checkbox" checked={seleccionado} onChange={() => seleccionarTratamiento(t.id)} className="mt-1 h-4 w-4 accent-[#3F5D3F]" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-forest-dark">{t.nombre}</p>
                                            <p className="mt-1 text-xs text-secondary">{t.plaga?.nombre_comun || "Tratamiento del catálogo"}</p>
                                            {t.estado === "suspendido" && <span className="mt-2 inline-block rounded-full bg-warning-light px-2 py-1 text-xs text-warning">Suspendido</span>}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {tratamientosFiltrados.length === 0 && (
                            <div className="mt-4 rounded-xl bg-soft p-6 text-center">
                                <FlaskConical size={30} className="mx-auto mb-2 text-primary" />
                                <p className="text-sm text-secondary">{tratamientos.length ? "No se encontraron tratamientos." : "Aún no hay tratamientos registrados."}</p>
                                <p className="mt-1 text-xs text-muted">Puedes guardar el medicamento sin asociar tratamientos.</p>
                            </div>
                        )}
                    </section>
                </fieldset>

                {error && (
                    <div role="alert" className="flex items-start gap-3 rounded-xl bg-danger-light p-4 text-sm text-danger">
                        <AlertCircle size={20} className="shrink-0" /> {error}
                    </div>
                )}

                <div className="flex flex-wrap justify-end gap-3">
                    <button type="button" disabled={guardando} onClick={() => setModal(true)} className="rounded-xl border border-border bg-surface px-6 py-3 text-sm font-bold text-secondary disabled:opacity-50">Cancelar</button>
                    <button type="submit" disabled={guardando} className="inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 text-sm font-bold text-white transition hover:bg-forest-dark disabled:opacity-50">
                        {guardando ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
                        {guardando ? "Guardando..." : editar ? "Guardar cambios" : "Registrar medicamento"}
                    </button>
                </div>
            </form>

            {/* Confirmación para salir */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setModal(false)}>
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-salir" className="w-full max-w-md rounded-florae bg-surface p-6 shadow-xl animate-scale-in" onClick={e => e.stopPropagation()}>
                        <AlertCircle size={40} className="mx-auto mb-4 text-warning" />
                        <h2 id="titulo-salir" className="text-center font-lora text-xl font-bold text-forest-dark">¿Salir del formulario?</h2>
                        <p className="mt-3 text-center text-sm text-secondary">Los cambios que no hayas guardado se perderán.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setModal(false)} className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-secondary">Continuar editando</button>
                            <button onClick={() => navigate("/admin/medicamentos")} className="rounded-xl bg-forest px-4 py-3 text-sm font-bold text-white">Salir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}