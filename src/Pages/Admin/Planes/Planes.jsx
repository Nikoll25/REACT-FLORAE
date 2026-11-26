import { useEffect, useState } from "react";
import { Layers, Sprout, Crown, Sparkles, Users, Pencil, X, AlertCircle, CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react";
import { obtenerPlanesAdmin, actualizarPlan } from "../../../services/adminApi";

const formatearPrecio = (precio) => Number(precio).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 2, minimumFractionDigits: 0 });

function TarjetaPlan({ plan, editar }) {
    const premium = plan.nombre === "Premium";
    const Icono = premium ? Crown : Sprout;
    const estilo = premium ? "bg-[#EADBB5] text-[#927238]" : "bg-[#DCE8D2] text-[#42663C]";

    return (
        <article className="flex min-w-0 flex-col overflow-hidden rounded-florae border border-border bg-surface shadow-florae transition hover:shadow-florae-hover">
            <div className={`h-1.5 ${premium ? "bg-[#C5AA6B]" : "bg-[#89AB78]"}`} />
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${estilo}`}><Icono size={25} strokeWidth={1.6} /></div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${plan.estado === "activo" ? "bg-success-light text-success" : "bg-warning-light text-warning"}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {plan.estado === "activo" ? "Activo" : "Inactivo"}
                    </span>
                </div>
                <h2 className="mt-4 font-lora text-2xl font-bold text-forest-dark">{plan.nombre}</h2>
                <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
                    <span className="font-lora text-3xl font-bold text-forest-dark">{formatearPrecio(plan.precio)}</span>
                    <span className="text-xs text-secondary">COP / mes</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-secondary">{plan.descripcion || "Sin descripción registrada."}</p>
                <div className="my-4 space-y-3 border-y border-border py-4">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${estilo}`}><Sparkles size={18} strokeWidth={1.7} /></div>
                        <div>
                            <p className="text-sm font-bold text-forest-dark">{plan.creditos_mensuales} créditos mensuales</p>
                            <p className="text-xs text-secondary">Consultas al asistente de IA</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${estilo}`}><Users size={18} strokeWidth={1.7} /></div>
                        <div>
                            <p className="text-sm font-bold text-forest-dark">{plan.suscripciones_activas_count ?? 0} suscripciones vigentes</p>
                            <p className="text-xs text-secondary">{premium ? `${plan.suscripciones_count ?? 0} suscripciones históricas` : "No requiere contratación"}</p>
                        </div>
                    </div>
                </div>
                <button type="button" onClick={() => editar(plan)} className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#36583E] to-[#58765A] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110">
                    <Pencil size={17} /> Editar plan
                </button>
            </div>
        </article>
    );
}

function SkeletonPlan() {
    return (
        <div className="animate-pulse space-y-4 rounded-florae border border-border bg-surface p-5">
            <div className="flex justify-between">
                <div className="h-12 w-12 rounded-xl bg-pale" />
                <div className="h-6 w-16 rounded-full bg-pale" />
            </div>
            <div className="h-7 w-28 rounded-lg bg-pale" />
            <div className="h-9 w-36 rounded-lg bg-pale" />
            <div className="h-4 w-full rounded-lg bg-pale" />
            <div className="h-4 w-3/4 rounded-lg bg-pale" />
            <div className="space-y-3 border-y border-border py-4">
                <div className="h-9 rounded-lg bg-pale" />
                <div className="h-9 rounded-lg bg-pale" />
            </div>
            <div className="h-10 rounded-xl bg-pale" />
        </div>
    );
}

function Planes() {
    const [planes, setPlanes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [seleccionado, setSeleccionado] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState("");
    const [formulario, setFormulario] = useState({ descripcion: "", precio: "", creditos_mensuales: "" });

    // Consultar los planes registrados
    const cargarPlanes = async () => {
        setCargando(true);
        setError("");
        try {
            const respuesta = await obtenerPlanesAdmin();
            if (!Array.isArray(respuesta.planes)) throw new Error("La API devolvió un listado de planes inválido.");
            setPlanes(respuesta.planes);
        } catch (error) {
            setError(error.message || "No se pudieron consultar los planes.");
            console.error("Error al consultar los planes:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarPlanes(); }, []);

    useEffect(() => {
        if (!mensaje) return;
        const tiempo = setTimeout(() => setMensaje(""), 4500);
        return () => clearTimeout(tiempo);
    }, [mensaje]);

    // Cerrar el modal con Escape
    useEffect(() => {
        if (!seleccionado || guardando) return;
        const manejarTecla = (evento) => {
            if (evento.key === "Escape") {
                setSeleccionado(null);
                setErrorFormulario("");
            }
        };
        window.addEventListener("keydown", manejarTecla);
        return () => window.removeEventListener("keydown", manejarTecla);
    }, [seleccionado, guardando]);

    const abrirModal = (plan) => {
        setSeleccionado(plan);
        setErrorFormulario("");
        setFormulario({ descripcion: plan.descripcion || "", precio: plan.precio, creditos_mensuales: plan.creditos_mensuales });
    };

    const cerrarModal = () => {
        if (guardando) return;
        setSeleccionado(null);
        setErrorFormulario("");
    };

    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        setFormulario((actual) => ({ ...actual, [name]: value }));
    };

    // Validar y actualizar el plan
    const guardarPlan = async (evento) => {
        evento.preventDefault();
        if (!seleccionado || guardando) return;
        setErrorFormulario("");

        const descripcion = formulario.descripcion.trim();
        const creditos = Number(formulario.creditos_mensuales);
        const precio = seleccionado.nombre === "Gratuito" ? 0 : Number(formulario.precio);

        if (!descripcion || descripcion.length > 2000) return setErrorFormulario("Ingresa una descripción válida de máximo 2000 caracteres.");
        if (!Number.isInteger(creditos) || creditos < 1 || creditos > 2147483647) return setErrorFormulario("Ingresa una cantidad válida de créditos mensuales.");
        if (seleccionado.nombre === "Premium" && (!Number.isFinite(precio) || precio < 0.01 || precio > 99999999.99)) return setErrorFormulario("Ingresa un precio válido para el plan Premium.");

        setGuardando(true);
        try {
            const respuesta = await actualizarPlan(seleccionado.id, { descripcion, precio, creditos_mensuales: creditos });
            setPlanes((actuales) => actuales.map((plan) => plan.id === seleccionado.id ? { ...plan, ...respuesta.plan } : plan));
            setMensaje(respuesta.mensaje || "Plan actualizado correctamente.");
            setSeleccionado(null);
        } catch (error) {
            setErrorFormulario(error.message || "No se pudo actualizar el plan.");
            console.error("Error al actualizar el plan:", error);
        } finally {
            setGuardando(false);
        }
    };

    const totalSuscripciones = planes.reduce((total, plan) => total + Number(plan.suscripciones_activas_count || 0), 0);
    const estadisticas = [
        { nombre: "Planes disponibles", valor: planes.filter((plan) => plan.estado === "activo").length, icono: Layers, estilo: "bg-[#DCE8D2] text-[#42663C]" },
        { nombre: "Suscripciones vigentes", valor: totalSuscripciones, icono: Crown, estilo: "bg-[#EADBB5] text-[#927238]" },
    ];

    return (
        <div className="min-w-0 animate-fade-in space-y-6 font-nunito">
            {/* Encabezado */}
            <section className="relative isolate flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#D9B7CA] bg-linear-to-r from-[#F7EDF2] to-[#EBD5DF] px-6 py-5">
                <div className="relative z-10 min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#965C79]"><Layers size={16} /> Membresías Florae</div>
                    <h1 className="font-lora text-3xl font-bold text-forest-dark">Gestión de planes</h1>
                    <p className="mt-2 max-w-xl text-sm text-secondary">Administra los beneficios, precios y créditos de las membresías de Florae.</p>
                </div>
                <div aria-hidden="true" className="relative hidden h-24 w-32 shrink-0 items-center justify-center sm:flex">
                    <div className="absolute h-24 w-24 rounded-full border border-[#D9B7CA] bg-white/35" />
                    <Crown size={65} strokeWidth={1.2} className="relative text-[#965C79]" />
                    <Sparkles size={23} strokeWidth={1.5} className="absolute right-0 top-0 text-[#965C79]" />
                    <Sprout size={29} strokeWidth={1.4} className="absolute bottom-0 left-0 text-[#78965F]" />
                </div>
            </section>

            {/* Estadísticas */}
            <section className="grid max-w-3xl gap-4 sm:grid-cols-2">
                {estadisticas.map(({ nombre, valor, icono: Icono, estilo }) => (
                    <article key={nombre} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-florae">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${estilo}`}><Icono size={24} strokeWidth={1.7} /></div>
                        <div className="min-w-0">
                            {cargando ? <div className="h-7 w-12 animate-pulse rounded-lg bg-pale" /> : <p className="font-lora text-2xl font-bold text-forest-dark">{error ? "—" : valor}</p>}
                            <p className="mt-1 text-sm font-semibold text-secondary">{nombre}</p>
                        </div>
                    </article>
                ))}
            </section>

            {mensaje && (
                <div role="status" className="flex items-center gap-3 rounded-xl border border-success/20 bg-success-light p-3 text-sm text-success">
                    <CheckCircle2 size={21} className="shrink-0" />
                    <p className="flex-1 font-semibold">{mensaje}</p>
                    <button type="button" onClick={() => setMensaje("")} aria-label="Cerrar mensaje"><X size={18} /></button>
                </div>
            )}

            {/* Planes registrados */}
            <section aria-busy={cargando}>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="font-lora text-2xl font-bold text-forest-dark">Nuestros planes</h2>
                        <p className="mt-1 text-sm text-secondary">Configura los beneficios de cada membresía.</p>
                    </div>
                    <button type="button" onClick={cargarPlanes} disabled={cargando || guardando} title="Actualizar planes" aria-label="Actualizar planes" className="rounded-xl border border-border bg-surface p-3 text-forest transition hover:bg-pale disabled:opacity-50">
                        <RefreshCw size={19} className={cargando ? "animate-spin" : ""} />
                    </button>
                </div>
                {cargando ? (
                    <div className="grid max-w-3xl gap-5 sm:grid-cols-2"><SkeletonPlan /><SkeletonPlan /></div>
                ) : error ? (
                    <div role="alert" className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-florae border border-border bg-surface p-6 text-center">
                        <AlertCircle size={40} strokeWidth={1.5} className="text-danger" />
                        <h3 className="font-lora text-xl font-bold text-forest-dark">No pudimos consultar los planes</h3>
                        <p className="text-sm text-secondary">{error}</p>
                        <button type="button" onClick={cargarPlanes} className="rounded-xl bg-forest px-5 py-2.5 text-sm font-bold text-white">Reintentar</button>
                    </div>
                ) : planes.length === 0 ? (
                    <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-florae border border-dashed border-sage bg-surface p-6 text-center">
                        <Layers size={42} strokeWidth={1.4} className="text-primary" />
                        <h3 className="font-lora text-xl font-bold text-forest-dark">No hay planes registrados</h3>
                        <p className="text-sm text-secondary">No se encontraron membresías en el catálogo.</p>
                    </div>
                ) : (
                    <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
                        {planes.map((plan) => <TarjetaPlan key={plan.id} plan={plan} editar={abrirModal} />)}
                    </div>
                )}
            </section>

            {/* Información sobre los planes */}
            {!cargando && !error && planes.length > 0 && (
                <div className="flex max-w-3xl items-start gap-3 rounded-xl border border-[#DED4B8] bg-[#F4F0E3] p-4">
                    <AlertCircle size={21} className="shrink-0 text-[#927238]" />
                    <div>
                        <p className="text-sm font-bold text-[#806733]">Actualización de beneficios</p>
                        <p className="mt-1 text-xs leading-5 text-secondary">Los cambios en los créditos se aplican inmediatamente. Los cambios de precio se aplican a nuevas contrataciones y renovaciones, sin modificar los pagos anteriores.</p>
                    </div>
                </div>
            )}

            {/* Modal de edición */}
            {seleccionado && (
                <div onClick={cerrarModal} className="fixed inset-0 z-100 flex items-center justify-center bg-forest-dark/40 p-4 backdrop-blur-sm">
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-plan" onClick={(evento) => evento.stopPropagation()} className="relative max-h-[90dvh] w-full max-w-lg animate-scale-in overflow-y-auto rounded-florae bg-surface p-6 shadow-xl">
                        <button type="button" onClick={cerrarModal} disabled={guardando} aria-label="Cerrar modal" className="absolute right-4 top-4 rounded-lg p-2 text-muted hover:bg-pale disabled:opacity-50"><X size={21} /></button>
                        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${seleccionado.nombre === "Premium" ? "bg-[#EADBB5] text-[#927238]" : "bg-pale text-forest"}`}>
                            {seleccionado.nombre === "Premium" ? <Crown size={29} strokeWidth={1.6} /> : <Sprout size={29} strokeWidth={1.6} />}
                        </div>
                        <h2 id="titulo-plan" className="font-lora text-2xl font-bold text-forest-dark">Editar plan {seleccionado.nombre}</h2>
                        <p className="mt-2 text-sm text-secondary">Actualiza la información y los beneficios del plan.</p>

                        <form onSubmit={guardarPlan} className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="nombre-plan" className="mb-1.5 block text-sm font-bold text-forest-dark">Nombre del plan</label>
                                <input id="nombre-plan" value={seleccionado.nombre} disabled className="w-full cursor-not-allowed rounded-xl border border-border bg-soft px-4 py-2.5 text-sm text-secondary" />
                            </div>
                            <div>
                                <label htmlFor="descripcion-plan" className="mb-1.5 block text-sm font-bold text-forest-dark">Descripción</label>
                                <textarea id="descripcion-plan" name="descripcion" value={formulario.descripcion} onChange={manejarCambio} required maxLength={2000} rows={4} disabled={guardando} className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="precio-plan" className="mb-1.5 block text-sm font-bold text-forest-dark">Precio mensual (COP)</label>
                                    <input id="precio-plan" type="number" name="precio" value={formulario.precio} onChange={manejarCambio} min={seleccionado.nombre === "Gratuito" ? 0 : 0.01} max={99999999.99} step="0.01" required disabled={guardando || seleccionado.nombre === "Gratuito"} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-soft disabled:text-secondary" />
                                    {seleccionado.nombre === "Gratuito" && <p className="mt-1 text-xs text-muted">Este plan siempre será gratuito.</p>}
                                </div>
                                <div>
                                    <label htmlFor="creditos-plan" className="mb-1.5 block text-sm font-bold text-forest-dark">Créditos mensuales</label>
                                    <input id="creditos-plan" type="number" name="creditos_mensuales" value={formulario.creditos_mensuales} onChange={manejarCambio} min={1} max={2147483647} step={1} required disabled={guardando} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                                </div>
                            </div>

                            <div className="flex items-start gap-2 rounded-xl bg-warning-light p-3 text-xs leading-5 text-warning">
                                <AlertCircle size={18} className="shrink-0" />
                                <p>Modificar los créditos mensuales afectará inmediatamente el límite disponible de los usuarios asociados a este plan.</p>
                            </div>

                            {errorFormulario && (
                                <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-light p-3 text-sm text-danger">
                                    <AlertCircle size={19} className="shrink-0" /><p>{errorFormulario}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 border-t border-border pt-4">
                                <button type="button" onClick={cerrarModal} disabled={guardando} className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-forest hover:bg-pale disabled:opacity-50">Cancelar</button>
                                <button type="submit" disabled={guardando} className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#36583E] to-[#58765A] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50">
                                    {guardando ? <LoaderCircle size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    {guardando ? "Guardando..." : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Planes;