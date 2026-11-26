import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserCheck, UserX, UserRoundMinus, UserRound, Search, Eye, Ban, RotateCcw, X, AlertCircle, CheckCircle2, ShieldCheck, Plus } from "lucide-react";
import { obtenerUsuariosAdmin, suspenderUsuario, activarUsuario, crearAdministrador } from "../../../services/adminApi";
import { peticionAutenticada } from "../../../services/api";
const estados = {
    activa: { texto: "Activa", estilo: "bg-success-light text-success" },
    suspendida: { texto: "Suspendida", estilo: "bg-danger-light text-danger" },
    susp_voluntaria: { texto: "Suspensión voluntaria", estilo: "bg-warning-light text-warning" },
};
const esAdmin = (usuario) => usuario.role?.nombre?.toLowerCase() === "administrador";
const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "Sin registro";
function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [rol, setRol] = useState("");
    const [estado, setEstado] = useState("");
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");
    const [errorAccion, setErrorAccion] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [seleccionado, setSeleccionado] = useState(null);
    const [modalCrear, setModalCrear] = useState(false);
    const [formulario, setFormulario] = useState({ nombre: "", email: "", password: "", password_confirmation: "" });
    const [creando, setCreando] = useState(false);
    const [errorCrear, setErrorCrear] = useState("");
    // Consultar los usuarios y la cuenta autenticada
    const cargarUsuarios = async () => {
        setCargando(true);
        setError("");
        try {
            const [datos, perfil] = await Promise.all([obtenerUsuariosAdmin(), peticionAutenticada("/user")]);
            setUsuarios(Array.isArray(datos) ? datos : []);
            setUsuarioActual(perfil);
        } catch (error) {
            setError(error.message || "No se pudieron consultar los usuarios.");
        } finally {
            setCargando(false);
        }
    };
    useEffect(() => {
        cargarUsuarios();
    }, []);
    useEffect(() => {
        if (!mensaje) return;
        const tiempo = setTimeout(() => setMensaje(""), 4000);
        return () => clearTimeout(tiempo);
    }, [mensaje]);
    // Filtrar los usuarios
    const usuariosFiltrados = usuarios.filter((usuario) => {
        const texto = busqueda.trim().toLowerCase();
        const coincideBusqueda = `${usuario.nombre} ${usuario.email}`.toLowerCase().includes(texto);
        const coincideRol = !rol || usuario.role?.nombre?.toLowerCase() === rol;
        const coincideEstado = !estado || usuario.estado === estado;
        return coincideBusqueda && coincideRol && coincideEstado;
    });
    const estadisticas = [
        { titulo: "Total de usuarios", cantidad: usuarios.length, icono: Users, estilo: "bg-pale text-forest" },
        { titulo: "Cuentas activas", cantidad: usuarios.filter((u) => u.estado === "activa").length, icono: UserCheck, estilo: "bg-success-light text-success" },
        { titulo: "Suspendidas", cantidad: usuarios.filter((u) => u.estado === "suspendida").length, icono: UserX, estilo: "bg-danger-light text-danger" },
        { titulo: "Suspensión voluntaria", cantidad: usuarios.filter((u) => u.estado === "susp_voluntaria").length, icono: UserRoundMinus, estilo: "bg-warning-light text-warning" },
    ];
    const esCuentaPropia = (usuario) => String(usuario.id) === String(usuarioActual?.id);
    const abrirModal = (usuario) => {
        setErrorAccion("");
        setSeleccionado(usuario);
    };
    const abrirCrear = () => {
        setFormulario({ nombre: "", email: "", password: "", password_confirmation: "" });
        setErrorCrear("");
        setModalCrear(true);
    };
    // Registrar un administrador
    const registrarAdministrador = async (e) => {
        e.preventDefault();
        if (creando) return;
        setErrorCrear("");
        const datos = { ...formulario, nombre: formulario.nombre.trim(), email: formulario.email.trim() };
        if (!datos.nombre || !datos.email) return setErrorCrear("Completa todos los campos.");
        if (datos.password.length < 8) return setErrorCrear("La contraseña debe tener mínimo 8 caracteres.");
        if (datos.password !== datos.password_confirmation) return setErrorCrear("Las contraseñas no coinciden.");
        setCreando(true);
        try {
            const respuesta = await crearAdministrador(datos);
            setModalCrear(false);
            setFormulario({ nombre: "", email: "", password: "", password_confirmation: "" });
            setBusqueda("");
            setRol("");
            setEstado("");
            setMensaje(respuesta.mensaje || "Administrador creado correctamente.");
            await cargarUsuarios();
        } catch (error) {
            setErrorCrear(error.message || "No se pudo crear el administrador.");
        } finally {
            setCreando(false);
        }
    };
    // Suspender o reactivar la cuenta seleccionada
    const cambiarEstado = async () => {
        if (!seleccionado || procesando) return;
        setProcesando(true);
        setErrorAccion("");
        try {
            const respuesta = seleccionado.estado === "activa" ? await suspenderUsuario(seleccionado.id) : await activarUsuario(seleccionado.id);
            setUsuarios((anteriores) => anteriores.map((u) => u.id === seleccionado.id ? { ...u, ...respuesta.usuario } : u));
            setMensaje(respuesta.mensaje || "Estado actualizado correctamente.");
            setSeleccionado(null);
        } catch (error) {
            setErrorAccion(error.message || "No se pudo actualizar la cuenta.");
        } finally {
            setProcesando(false);
        }
    };
    return (
        <div className="space-y-7 font-nunito animate-fade-in">
            <section className="relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#C5D9E9] bg-linear-to-br from-[#D5E3EE] to-white p-5 shadow-florae sm:px-6 sm:py-6">
                <div className="relative z-10 min-w-0 flex-1 basis-64">
                    <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#4C7593]"><Users size={17} /> Comunidad Florae</p>
                    <h1 className="font-lora text-2xl font-bold text-forest-dark sm:text-3xl">Gestión de usuarios</h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#465447]">Consulta y administra las cuentas registradas en Florae.</p>
                </div>
                <div aria-hidden="true" className="pointer-events-none relative hidden h-24 w-28 shrink-0 items-center justify-center md:flex">
                    <span className="absolute h-24 w-24 rounded-full border border-[#C5D9E9] bg-[#C5D9E9]/50" />
                    <Users size={57} strokeWidth={1.35} className="relative -rotate-12 text-[#4C7593]" />
                    <UserCheck size={25} strokeWidth={1.5} className="absolute bottom-0 right-0 rotate-12 rounded-full bg-white p-1 text-[#4C7593]" />
                </div>
                <button type="button" onClick={abrirCrear} disabled={creando || cargando || !!error} className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-linear-to-br from-[#36583E] to-[#58765A] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"><Plus size={19} /> Nuevo administrador</button>
            </section>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {estadisticas.map(({ titulo, cantidad, icono: Icono, estilo }) => (
                    <div key={titulo} className="rounded-2xl border border-border bg-white p-5 shadow-florae">
                        <div className="flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${estilo}`}>
                                <Icono size={23} />
                            </div>
                            {cargando ? <div className="h-8 w-12 animate-pulse rounded-lg bg-pale" /> : <span className="text-3xl font-bold text-forest-dark">{cantidad}</span>}
                        </div>
                        <p className="mt-4 text-sm font-semibold text-secondary">{titulo}</p>
                    </div>
                ))}
            </div>
            {mensaje && (
                <div className="fixed right-6 top-6 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-border bg-white p-4 text-success shadow-lg">
                    <CheckCircle2 size={21} className="shrink-0" />
                    <p className="text-sm font-semibold">{mensaje}</p>
                    <button onClick={() => setMensaje("")} className="ml-auto" aria-label="Cerrar mensaje"><X size={17} /></button>
                </div>
            )}
            <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-florae">
                <div className="space-y-4 border-b border-border p-5">
                    <div>
                        <h2 className="font-lora text-xl font-semibold text-forest-dark">Usuarios registrados</h2>
                        <p className="mt-1 text-sm text-secondary">Gestiona usuarios y administradores desde un mismo lugar.</p>
                    </div>
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative flex-1">
                            <Search size={19} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o correo..." className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary" />
                        </div>
                        <select value={rol} onChange={(e) => setRol(e.target.value)} aria-label="Filtrar por rol" className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text outline-none focus:border-primary">
                            <option value="">Todos los roles</option>
                            <option value="usuario">Usuario</option>
                            <option value="administrador">Administrador</option>
                        </select>
                        <select value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado" className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text outline-none focus:border-primary">
                            <option value="">Todos los estados</option>
                            <option value="activa">Activa</option>
                            <option value="suspendida">Suspendida</option>
                            <option value="susp_voluntaria">Suspensión voluntaria</option>
                        </select>
                        {(busqueda || rol || estado) && (
                            <button onClick={() => { setBusqueda(""); setRol(""); setEstado(""); }} className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-secondary hover:bg-soft">
                                <X size={16} /> Limpiar
                            </button>
                        )}
                    </div>
                </div>
                {cargando ? (
                    <div className="space-y-5 p-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex animate-pulse items-center gap-4">
                                <div className="h-12 w-12 shrink-0 rounded-full bg-pale" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-40 rounded bg-pale" />
                                    <div className="h-3 w-52 max-w-full rounded bg-soft" />
                                </div>
                                <div className="hidden h-7 w-24 rounded-full bg-pale sm:block" />
                                <div className="h-8 w-16 rounded-lg bg-soft" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center px-6 py-16 text-center">
                        <AlertCircle size={38} className="text-danger" />
                        <p className="mt-4 font-semibold text-danger">{error}</p>
                        <button onClick={cargarUsuarios} className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">Reintentar</button>
                    </div>
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center px-6 py-16 text-center">
                        <div className="rounded-full bg-pale p-5"><Users size={35} className="text-forest" /></div>
                        <h3 className="mt-4 font-lora text-lg font-semibold text-forest-dark">No se encontraron usuarios</h3>
                        <p className="mt-2 text-sm text-secondary">No hay cuentas que coincidan con los filtros seleccionados.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="bg-soft text-secondary">
                                <tr>
                                    {["Usuario", "Rol", "Estado", "Fecha de registro", "Acciones"].map((titulo) => (
                                        <th key={titulo} className="px-5 py-4 font-semibold">{titulo}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {usuariosFiltrados.map((usuario) => {
                                    const estadoUsuario = estados[usuario.estado] || { texto: usuario.estado, estilo: "bg-soft text-secondary" };
                                    return (
                                        <tr key={usuario.id} className="transition hover:bg-soft/50">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pale text-forest">
                                                        {usuario.imagen_url ? <img src={usuario.imagen_url} alt={usuario.nombre} className="h-full w-full object-cover" /> : <UserRound size={23} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-text">{usuario.nombre} {esCuentaPropia(usuario) && <span className="text-xs font-normal text-muted">(Tú)</span>}</p>
                                                        <p className="mt-1 text-xs text-secondary">{usuario.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${esAdmin(usuario) ? "bg-info-light text-info" : "bg-pale text-forest"}`}>
                                                    {esAdmin(usuario) ? <ShieldCheck size={14} /> : <UserRound size={14} />}
                                                    {usuario.role?.nombre || "Sin rol"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${estadoUsuario.estilo}`}>{estadoUsuario.texto}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-secondary">{formatearFecha(usuario.fecha_registro)}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link to={`/admin/usuarios/${usuario.id}`} title="Ver detalle" aria-label="Ver detalle" className="rounded-lg bg-pale p-2.5 text-forest transition hover:bg-border">
                                                        <Eye size={18} />
                                                    </Link>
                                                    {!esCuentaPropia(usuario) && usuario.estado === "activa" && (
                                                        <button onClick={() => abrirModal(usuario)} title="Suspender cuenta" aria-label="Suspender cuenta" className="rounded-lg bg-danger-light p-2.5 text-danger transition hover:bg-danger hover:text-white">
                                                            <Ban size={18} />
                                                        </button>
                                                    )}
                                                    {!esCuentaPropia(usuario) && usuario.estado === "suspendida" && (
                                                        <button onClick={() => abrirModal(usuario)} title="Reactivar cuenta" aria-label="Reactivar cuenta" className="rounded-lg bg-success-light p-2.5 text-success transition hover:bg-success hover:text-white">
                                                            <RotateCcw size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {!cargando && !error && (
                    <div className="border-t border-border px-5 py-4 text-xs text-secondary">
                        Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios registrados.
                    </div>
                )}
            </section>
            {modalCrear && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <form onSubmit={registrarAdministrador} role="dialog" aria-modal="true" aria-labelledby="titulo-crear" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl animate-scale-in">
                        <div className="flex justify-end"><button type="button" disabled={creando} onClick={() => setModalCrear(false)} aria-label="Cerrar" className="text-secondary disabled:opacity-50"><X size={21} /></button></div>
                        <div className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pale text-forest"><ShieldCheck size={30} /></div>
                            <h3 id="titulo-crear" className="mt-4 font-lora text-xl font-bold text-forest-dark">Nuevo administrador</h3>
                            <p className="mt-2 text-sm text-secondary">Registra una cuenta con permisos administrativos.</p>
                        </div>
                        <div className="mt-5 space-y-4">
                            {[
                                { campo: "nombre", titulo: "Nombre completo", tipo: "text", max: 100, auto: "name" },
                                { campo: "email", titulo: "Correo electrónico", tipo: "email", max: 150, auto: "email" },
                                { campo: "password", titulo: "Contraseña", tipo: "password", auto: "new-password" },
                                { campo: "password_confirmation", titulo: "Confirmar contraseña", tipo: "password", auto: "new-password" },
                            ].map(({ campo, titulo, tipo, max, auto }) => (
                                <label key={campo} className="block text-sm font-semibold text-text">{titulo} *
                                    <input required type={tipo} maxLength={max} minLength={tipo === "password" ? 8 : undefined} autoComplete={auto} disabled={creando} value={formulario[campo]} onChange={(e) => setFormulario((anterior) => ({ ...anterior, [campo]: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                                </label>
                            ))}
                            <p className="rounded-xl bg-pale p-3 text-sm text-forest">Rol asignado: Administrador. Tendrá acceso al panel administrativo.</p>
                            {errorCrear && <p role="alert" className="rounded-xl bg-danger-light p-3 text-sm text-danger">{errorCrear}</p>}
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button type="button" disabled={creando} onClick={() => setModalCrear(false)} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-secondary hover:bg-soft disabled:opacity-50">Cancelar</button>
                            <button type="submit" disabled={creando} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">{creando ? "Creando..." : "Crear administrador"}</button>
                        </div>
                    </form>
                </div>
            )}
            {seleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal" className="w-full max-w-md animate-scale-in rounded-3xl bg-white p-6 shadow-xl">
                        <div className="flex justify-end">
                            <button disabled={procesando} onClick={() => setSeleccionado(null)} aria-label="Cerrar" className="text-secondary hover:text-text disabled:opacity-50"><X size={21} /></button>
                        </div>
                        <div className="text-center">
                            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${seleccionado.estado === "activa" ? "bg-danger-light text-danger" : "bg-success-light text-success"}`}>
                                {seleccionado.estado === "activa" ? <Ban size={30} /> : <RotateCcw size={30} />}
                            </div>
                            <h3 id="titulo-modal" className="mt-4 font-lora text-xl font-bold text-forest-dark">{seleccionado.estado === "activa" ? "Suspender cuenta" : "Reactivar cuenta"}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-secondary">
                                {seleccionado.estado === "activa" ? <>¿Deseas suspender la cuenta de <strong>{seleccionado.nombre}</strong>? Se cerrarán sus sesiones activas y no podrá acceder a Florae hasta que su cuenta sea reactivada. Sus datos se conservarán.</> : <>¿Deseas reactivar la cuenta de <strong>{seleccionado.nombre}</strong>? Podrá iniciar sesión nuevamente y acceder a su información.</>}
                            </p>
                        </div>
                        {errorAccion && <p className="mt-4 rounded-xl bg-danger-light p-3 text-sm text-danger">{errorAccion}</p>}
                        <div className="mt-6 flex gap-3">
                            <button disabled={procesando} onClick={() => setSeleccionado(null)} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-secondary hover:bg-soft disabled:opacity-50">Cancelar</button>
                            <button disabled={procesando} onClick={cambiarEstado} className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 ${seleccionado.estado === "activa" ? "bg-danger hover:bg-danger/90" : "bg-primary hover:bg-primary-hover"}`}>
                                {procesando ? "Procesando..." : seleccionado.estado === "activa" ? "Suspender" : "Reactivar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Usuarios;