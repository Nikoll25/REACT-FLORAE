
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, UserRound, Mail, MailCheck, CalendarDays, ShieldCheck, ShieldAlert, Crown, Leaf, Ban, RotateCcw, X, AlertCircle, CheckCircle2, Clock, Info } from "lucide-react";
import { obtenerUsuarioAdmin, suspenderUsuario, activarUsuario } from "../../../services/adminApi";
import { peticionAutenticada } from "../../../services/api";

const estados = {
    activa: { texto: "Activa", estilo: "bg-success-light text-success" },
    suspendida: { texto: "Suspendida", estilo: "bg-danger-light text-danger" },
    susp_voluntaria: { texto: "Suspensión voluntaria", estilo: "bg-warning-light text-warning" },
};

const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "Sin registro";

function DetalleUsuario() {
    const { id } = useParams();
    const [usuario, setUsuario] = useState(null);
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");
    const [errorAccion, setErrorAccion] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [modal, setModal] = useState(false);

    // Consultar la información del usuario
    const cargarUsuario = async () => {
        setCargando(true);
        setError("");

        try {
            const [datos, perfil] = await Promise.all([obtenerUsuarioAdmin(id), peticionAutenticada("/user")]);
            setUsuario(datos);
            setUsuarioActual(perfil);
        } catch (error) {
            setError(error.message || "No se pudo consultar el usuario.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarUsuario();
    }, [id]);

    useEffect(() => {
        if (!mensaje) return;
        const tiempo = setTimeout(() => setMensaje(""), 4000);
        return () => clearTimeout(tiempo);
    }, [mensaje]);

    // Suspender o reactivar la cuenta
    const cambiarEstado = async () => {
        if (procesando || !usuario) return;

        setProcesando(true);
        setErrorAccion("");

        try {
            const respuesta = usuario.estado === "activa" ? await suspenderUsuario(id) : await activarUsuario(id);
            setUsuario((anterior) => ({ ...anterior, ...respuesta.usuario }));
            setMensaje(respuesta.mensaje || "Estado actualizado correctamente.");
            setModal(false);
        } catch (error) {
            setErrorAccion(error.message || "No se pudo actualizar la cuenta.");
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-5 w-40 rounded bg-pale" />
                <div className="h-9 w-64 rounded bg-pale" />
                <div className="flex items-center gap-6 rounded-2xl border border-border bg-white p-7">
                    <div className="h-28 w-28 shrink-0 rounded-full bg-pale" />
                    <div className="flex-1 space-y-4">
                        <div className="h-7 w-56 max-w-full rounded bg-pale" />
                        <div className="h-4 w-48 max-w-full rounded bg-soft" />
                        <div className="h-6 w-32 rounded-full bg-pale" />
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="h-72 rounded-2xl border border-border bg-white p-6"><div className="h-full rounded-xl bg-soft" /></div>
                    <div className="h-72 rounded-2xl border border-border bg-white p-6"><div className="h-full rounded-xl bg-soft" /></div>
                </div>
                <div className="h-36 rounded-2xl bg-pale" />
            </div>
        );
    }

    if (error || !usuario) {
        return (
            <div className="space-y-6 font-nunito">
                <Link to="/admin/usuarios" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline"><ArrowLeft size={18} /> Volver a usuarios</Link>
                <div className="flex flex-col items-center rounded-2xl border border-border bg-white p-12 text-center">
                    <AlertCircle size={42} className="text-danger" />
                    <h2 className="mt-4 font-lora text-xl font-semibold text-forest-dark">No se pudo consultar el usuario</h2>
                    <p className="mt-2 text-sm text-secondary">{error || "El usuario no existe."}</p>
                    <button onClick={cargarUsuario} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover">Reintentar</button>
                </div>
            </div>
        );
    }

    const estadoUsuario = estados[usuario.estado] || { texto: usuario.estado, estilo: "bg-soft text-secondary" };
    const esAdmin = usuario.role?.nombre?.toLowerCase() === "administrador";
    const esCuentaPropia = String(usuario.id) === String(usuarioActual?.id);
    const esPremium = usuario.plan_actual?.toLowerCase() === "premium";
    const puedeGestionar = !esCuentaPropia && ["activa", "suspendida"].includes(usuario.estado);

    const informacion = [
        { titulo: "Nombre completo", valor: usuario.nombre, icono: UserRound },
        { titulo: "Correo electrónico", valor: usuario.email, icono: Mail },
        { titulo: "Rol de la cuenta", valor: esAdmin ? "Administrador" : usuario.role?.nombre || "Sin rol", icono: ShieldCheck },
        { titulo: "Fecha de registro", valor: formatearFecha(usuario.fecha_registro), icono: CalendarDays },
        { titulo: "Verificación del correo", valor: usuario.email_verificado_en ? "Correo verificado" : "Correo no verificado", icono: MailCheck },
    ];

    return (
        <div className="space-y-7 font-nunito animate-fade-in">
            <Link to="/admin/usuarios" className="inline-flex items-center gap-2 text-sm font-semibold text-forest transition hover:text-primary">
                <ArrowLeft size={19} /> Volver a usuarios
            </Link>

            <div>
                <h1 className="font-lora text-3xl font-bold text-forest-dark">Detalle del usuario</h1>
                <p className="mt-2 text-sm text-secondary">Consulta la información y el estado de la cuenta seleccionada.</p>
            </div>

            {mensaje && (
                <div className="fixed right-6 top-6 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-border bg-white p-4 text-success shadow-lg">
                    <CheckCircle2 size={21} className="shrink-0" />
                    <p className="text-sm font-semibold">{mensaje}</p>
                    <button onClick={() => setMensaje("")} aria-label="Cerrar mensaje" className="ml-auto"><X size={17} /></button>
                </div>
            )}

            <section className="rounded-2xl border border-border bg-white p-6 shadow-florae sm:p-8">
                <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-pale bg-soft text-forest">
                        {usuario.imagen_url ? <img src={usuario.imagen_url} alt={usuario.nombre} className="h-full w-full object-cover" /> : <UserRound size={48} strokeWidth={1.5} />}
                    </div>

                    <div className="flex-1">
                        <h2 className="font-lora text-2xl font-bold text-forest-dark">{usuario.nombre}</h2>
                        <p className="mt-2 break-all text-sm text-secondary">{usuario.email}</p>

                        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${esAdmin ? "bg-info-light text-info" : "bg-pale text-forest"}`}>
                                {esAdmin ? <ShieldCheck size={15} /> : <UserRound size={15} />}
                                {esAdmin ? "Administrador" : usuario.role?.nombre || "Sin rol"}
                            </span>
                            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${estadoUsuario.estilo}`}>{estadoUsuario.texto}</span>
                            {esCuentaPropia && <span className="rounded-full bg-soft px-3 py-1.5 text-xs font-semibold text-secondary">Tu cuenta</span>}
                        </div>
                    </div>

                    <div className="rounded-xl bg-soft px-5 py-4 text-center">
                        <p className="text-xs text-secondary">ID del usuario</p>
                        <p className="mt-1 text-xl font-bold text-forest-dark">#{usuario.id}</p>
                    </div>
                </div>
            </section>

            <div className="grid items-start gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-border bg-white p-6 shadow-florae">
                    <h2 className="font-lora text-xl font-semibold text-forest-dark">Información personal</h2>
                    <p className="mt-1 text-sm text-secondary">Datos básicos de la cuenta registrada.</p>

                    <div className="mt-5 divide-y divide-border">
                        {informacion.map(({ titulo, valor, icono: Icono }) => (
                            <div key={titulo} className="flex items-center gap-4 py-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pale text-forest"><Icono size={21} /></div>
                                <div className="min-w-0">
                                    <p className="text-xs text-secondary">{titulo}</p>
                                    <p className="mt-1 break-words text-sm font-semibold text-text">{valor}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="space-y-6">
                    <section className="rounded-2xl border border-border bg-white p-6 shadow-florae">
                        <h2 className="font-lora text-xl font-semibold text-forest-dark">Plan de suscripción</h2>
                        <p className="mt-1 text-sm text-secondary">Información del plan actual del usuario.</p>

                        <div className={`mt-5 flex items-center gap-4 rounded-2xl border p-5 ${esPremium ? "border-warning/20 bg-warning-light" : "border-border bg-soft"}`}>
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white ${esPremium ? "text-warning" : "text-forest"}`}>
                                {esPremium ? <Crown size={29} /> : <Leaf size={29} />}
                            </div>
                            <div>
                                <p className="text-xs text-secondary">Plan actual</p>
                                <h3 className="mt-1 font-lora text-xl font-bold text-forest-dark">{usuario.plan_actual ? `Plan ${usuario.plan_actual}` : "No disponible"}</h3>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pale text-forest"><Clock size={20} /></div>
                            <div>
                                <p className="text-xs text-secondary">Fecha de vencimiento</p>
                                <p className="mt-1 text-sm font-semibold text-text">{usuario.fecha_vencimiento_plan ? formatearFecha(usuario.fecha_vencimiento_plan) : usuario.plan_actual ? "No aplica" : "Sin información"}</p>
                            </div>
                        </div>

                        <div className="mt-5 flex items-start gap-2 rounded-xl bg-info-light p-3 text-info">
                            <Info size={17} className="mt-0.5 shrink-0" />
                            <p className="text-xs leading-relaxed">La información del plan es únicamente de consulta. No se puede modificar la suscripción desde este módulo.</p>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-white p-6 shadow-florae">
                        <h2 className="font-lora text-xl font-semibold text-forest-dark">Estado de la cuenta</h2>

                        <div className="mt-4 flex items-center gap-4">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${estadoUsuario.estilo}`}>
                                {usuario.estado === "activa" ? <CheckCircle2 size={25} /> : <ShieldAlert size={25} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text">{estadoUsuario.texto}</p>
                                <p className="mt-1 text-xs leading-relaxed text-secondary">
                                    {usuario.estado === "activa" ? "El usuario puede acceder normalmente a Florae." : usuario.estado === "suspendida" ? "La cuenta fue suspendida administrativamente." : usuario.estado === "susp_voluntaria" ? "El propietario suspendió voluntariamente su cuenta." : "Estado de cuenta no reconocido."}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <section className="rounded-2xl border border-border bg-white p-6 shadow-florae">
                <h2 className="font-lora text-xl font-semibold text-forest-dark">Gestión de la cuenta</h2>
                <p className="mt-2 text-sm text-secondary">Administra el acceso del usuario sin modificar ni eliminar su información personal.</p>

                {esCuentaPropia ? (
                    <div className="mt-5 flex items-start gap-3 rounded-xl bg-info-light p-4 text-info">
                        <Info size={20} className="shrink-0" />
                        <p className="text-sm">Esta es tu propia cuenta. Puedes gestionar tu información personal desde Mi Perfil.</p>
                    </div>
                ) : usuario.estado === "susp_voluntaria" ? (
                    <div className="mt-5 flex items-start gap-3 rounded-xl bg-warning-light p-4 text-warning">
                        <ShieldAlert size={21} className="shrink-0" />
                        <div>
                            <p className="text-sm font-bold">Suspensión voluntaria</p>
                            <p className="mt-1 text-sm">Solo el propietario de la cuenta puede solicitar su reactivación.</p>
                        </div>
                    </div>
                ) : puedeGestionar ? (
                    <div className={`mt-5 flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between ${usuario.estado === "activa" ? "border-danger/20 bg-danger-light/50" : "border-border bg-soft"}`}>
                        <div className="flex items-start gap-3">
                            {usuario.estado === "activa" ? <Ban size={24} className="shrink-0 text-danger" /> : <RotateCcw size={24} className="shrink-0 text-success" />}
                            <div>
                                <h3 className={`text-sm font-bold ${usuario.estado === "activa" ? "text-danger" : "text-success"}`}>{usuario.estado === "activa" ? "Suspender cuenta" : "Reactivar cuenta"}</h3>
                                <p className="mt-1 max-w-lg text-xs leading-relaxed text-secondary">{usuario.estado === "activa" ? "Restringe el acceso a Florae y cierra las sesiones activas. Los datos del usuario se conservarán." : "Restablece el acceso a Florae y permite al usuario iniciar sesión nuevamente."}</p>
                            </div>
                        </div>

                        <button onClick={() => { setErrorAccion(""); setModal(true); }} className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${usuario.estado === "activa" ? "bg-danger hover:bg-danger/90" : "bg-primary hover:bg-primary-hover"}`}>
                            {usuario.estado === "activa" ? "Suspender cuenta" : "Reactivar cuenta"}
                        </button>
                    </div>
                ) : (
                    <p className="mt-4 rounded-xl bg-soft p-4 text-sm text-secondary">No hay acciones disponibles para el estado actual de la cuenta.</p>
                )}
            </section>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal" className="w-full max-w-md animate-scale-in rounded-3xl bg-white p-6 shadow-xl">
                        <div className="flex justify-end">
                            <button disabled={procesando} onClick={() => setModal(false)} aria-label="Cerrar" className="text-secondary hover:text-text disabled:opacity-50"><X size={21} /></button>
                        </div>

                        <div className="text-center">
                            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${usuario.estado === "activa" ? "bg-danger-light text-danger" : "bg-success-light text-success"}`}>
                                {usuario.estado === "activa" ? <Ban size={30} /> : <RotateCcw size={30} />}
                            </div>
                            <h3 id="titulo-modal" className="mt-4 font-lora text-xl font-bold text-forest-dark">{usuario.estado === "activa" ? "Suspender cuenta" : "Reactivar cuenta"}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-secondary">
                                {usuario.estado === "activa" ? <>¿Estás seguro de suspender la cuenta de <strong>{usuario.nombre}</strong>? No podrá iniciar sesión hasta que su cuenta sea reactivada.</> : <>¿Deseas reactivar la cuenta de <strong>{usuario.nombre}</strong>? Podrá volver a acceder a Florae.</>}
                            </p>
                        </div>

                        {errorAccion && <p className="mt-4 rounded-xl bg-danger-light p-3 text-sm text-danger">{errorAccion}</p>}

                        <div className="mt-6 flex gap-3">
                            <button disabled={procesando} onClick={() => setModal(false)} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-secondary hover:bg-soft disabled:opacity-50">Cancelar</button>
                            <button disabled={procesando} onClick={cambiarEstado} className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 ${usuario.estado === "activa" ? "bg-danger hover:bg-danger/90" : "bg-primary hover:bg-primary-hover"}`}>
                                {procesando ? "Procesando..." : usuario.estado === "activa" ? "Suspender" : "Reactivar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DetalleUsuario;
