import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, UserRoundCog, ShieldCheck, Camera, Mail, CalendarDays, LockKeyhole, Eye, EyeOff, Save, LogOut, CheckCircle2, AlertCircle, LoaderCircle, X } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { actualizarPerfil, actualizarFotoPerfil, cambiarPassword } from "../../../services/api";
import perfil from "../../../assets/perfil.png";

const campo = "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-soft";
const boton = "inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#36583E] to-[#58765A] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50";
const contrasenasIniciales = { password_actual: "", password: "", password_confirmation: "" };

function Mensaje({ error, mensaje }) {
    if (!error && !mensaje) return null;
    const Icono = error ? AlertCircle : CheckCircle2;
    return (
        <div role={error ? "alert" : "status"} className={`flex items-start gap-2 rounded-xl p-3 text-sm ${error ? "bg-danger-light text-danger" : "bg-success-light text-forest"}`}>
            <Icono size={18} className="mt-0.5 shrink-0" />
            <span>{error || mensaje}</span>
        </div>
    );
}

function CampoPassword({ titulo, nombre, valor, cambiar, autocomplete }) {
    const [visible, setVisible] = useState(false);
    return (
        <label className="block space-y-2">
            <span className="text-sm font-bold text-text">{titulo}</span>
            <div className="relative">
                <input type={visible ? "text" : "password"} name={nombre} value={valor} onChange={cambiar} autoComplete={autocomplete} required className={`${campo} pr-12`} placeholder={titulo} />
                <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute inset-y-0 right-0 flex items-center px-4 text-secondary hover:text-forest">
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </label>
    );
}

function PerfilAdmin() {
    const navigate = useNavigate();
    const usuario = useAuthStore((state) => state.usuario);
    const actualizarUsuario = useAuthStore((state) => state.actualizarUsuario);
    const logout = useAuthStore((state) => state.logout);
    const inputFoto = useRef(null);
    const [datos, setDatos] = useState({ nombre: "", email: "" });
    const [contrasenas, setContrasenas] = useState(contrasenasIniciales);
    const [guardando, setGuardando] = useState(false);
    const [subiendoFoto, setSubiendoFoto] = useState(false);
    const [cambiandoPassword, setCambiandoPassword] = useState(false);
    const [cerrando, setCerrando] = useState(false);
    const [modalSesion, setModalSesion] = useState(false);
    const [errorImagen, setErrorImagen] = useState(false);
    const [avisoPerfil, setAvisoPerfil] = useState({});
    const [avisoFoto, setAvisoFoto] = useState({});
    const [avisoPassword, setAvisoPassword] = useState({});

    useEffect(() => {
        setDatos({ nombre: usuario?.nombre || "", email: usuario?.email || "" });
    }, [usuario?.nombre, usuario?.email]);

    useEffect(() => { setErrorImagen(false); }, [usuario?.imagen_url]);

    const hayCambios = datos.nombre !== usuario?.nombre || datos.email !== usuario?.email;
    const ocupado = guardando || subiendoFoto || cambiandoPassword || cerrando;
    const foto = !errorImagen && usuario?.imagen_url ? usuario.imagen_url : perfil;
    const fechaRegistro = usuario?.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }) : "No disponible";

    const cambiarDatos = (evento) => {
        setDatos((actual) => ({ ...actual, [evento.target.name]: evento.target.value }));
        setAvisoPerfil({});
    };

    const cambiarContrasenas = (evento) => {
        setContrasenas((actual) => ({ ...actual, [evento.target.name]: evento.target.value }));
        setAvisoPassword({});
    };

    // Actualizar la información personal
    const guardarInformacion = async (evento) => {
        evento.preventDefault();
        if (ocupado || !hayCambios) return;
        if (!datos.nombre.trim() || !datos.email.trim()) return setAvisoPerfil({ error: "Completa todos los campos." });
        setGuardando(true);
        setAvisoPerfil({});
        try {
            const respuesta = await actualizarPerfil({ nombre: datos.nombre.trim(), email: datos.email.trim() });
            const actualizado = respuesta.user || respuesta.usuario;
            if (!actualizado) throw new Error("No se recibieron los datos actualizados.");
            actualizarUsuario(actualizado);
            setDatos({ nombre: actualizado.nombre, email: actualizado.email });
            setAvisoPerfil({ mensaje: "Información actualizada correctamente." });
        } catch (error) {
            setAvisoPerfil({ error: error.message || "No se pudo actualizar el perfil." });
        } finally {
            setGuardando(false);
        }
    };

    // Actualizar la fotografía
    const cambiarFoto = async (evento) => {
        const archivo = evento.target.files?.[0];
        evento.target.value = "";
        if (!archivo || ocupado) return;
        setAvisoFoto({});
        if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) return setAvisoFoto({ error: "Selecciona una imagen JPG, PNG o WEBP." });
        if (archivo.size > 5 * 1024 * 1024) return setAvisoFoto({ error: "La imagen no puede superar los 5 MB." });
        setSubiendoFoto(true);
        try {
            const respuesta = await actualizarFotoPerfil(archivo);
            const actualizado = respuesta.usuario || respuesta.user;
            if (!actualizado?.imagen_url) throw new Error("No se recibió la fotografía actualizada.");
            actualizarUsuario(actualizado);
            setAvisoFoto({ mensaje: "Fotografía actualizada correctamente." });
        } catch (error) {
            setAvisoFoto({ error: error.message || "No se pudo actualizar la fotografía." });
        } finally {
            setSubiendoFoto(false);
        }
    };

    // Cambiar la contraseña
    const guardarPassword = async (evento) => {
        evento.preventDefault();
        if (ocupado) return;
        if (!contrasenas.password_actual || !contrasenas.password || !contrasenas.password_confirmation) return setAvisoPassword({ error: "Completa todos los campos." });
        if (contrasenas.password.length < 8) return setAvisoPassword({ error: "La contraseña debe tener al menos 8 caracteres." });
        if (contrasenas.password !== contrasenas.password_confirmation) return setAvisoPassword({ error: "Las contraseñas nuevas no coinciden." });
        if (contrasenas.password === contrasenas.password_actual) return setAvisoPassword({ error: "La nueva contraseña debe ser diferente a la actual." });
        setCambiandoPassword(true);
        setAvisoPassword({});
        try {
            await cambiarPassword(contrasenas);
            setContrasenas(contrasenasIniciales);
            setAvisoPassword({ mensaje: "Contraseña actualizada correctamente." });
        } catch (error) {
            setAvisoPassword({ error: error.message || "No se pudo actualizar la contraseña." });
        } finally {
            setCambiandoPassword(false);
        }
    };

    // Finalizar la sesión administrativa
    const cerrarSesion = async () => {
        if (ocupado) return;
        setCerrando(true);
        try {
            await logout();
        } catch (error) {
            console.error("Error al cerrar la sesión en el servidor:", error);
        } finally {
            setCerrando(false);
            navigate("/login", { replace: true });
        }
    };

    if (!usuario) return (
        <div className="animate-pulse space-y-5">
            <div className="h-36 rounded-2xl bg-pale" />
            <div className="h-40 rounded-florae bg-pale" />
            <div className="grid gap-5 lg:grid-cols-2">
                <div className="h-80 rounded-florae bg-pale" />
                <div className="h-80 rounded-florae bg-pale" />
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-6 font-nunito">
            <section className="relative flex items-center justify-between gap-5 overflow-hidden rounded-2xl border border-[#B9CCC1] bg-linear-to-br from-[#E8F0EB] to-[#CBDDD2] px-6 py-5 shadow-florae">
                <div>
                    <p className="mb-2 flex items-center gap-2 text-xs font-extrabold tracking-widest text-[#496C5B]"><ShieldCheck size={16} /> CUENTA ADMINISTRATIVA</p>
                    <h2 className="font-lora text-3xl font-bold text-forest-dark">Mi perfil</h2>
                    <p className="mt-2 text-sm text-[#536B5C]">Administra tu información personal y la seguridad de tu cuenta.</p>
                </div>
                <div className="relative hidden h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/40 sm:flex">
                    <UserRoundCog size={54} strokeWidth={1.4} className="text-[#496C5B]" />
                    <ShieldCheck size={24} className="absolute bottom-0 right-0 rounded-full bg-[#CBDDD2] p-0.5 text-forest" />
                </div>
            </section>

            <section className="rounded-florae border border-border bg-surface p-6 shadow-florae">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative w-fit shrink-0">
                        <img src={foto} alt="Fotografía del administrador" onError={() => setErrorImagen(true)} className="h-24 w-24 rounded-full border-4 border-pale bg-pale object-cover" />
                        <input ref={inputFoto} type="file" accept="image/jpeg,image/png,image/webp" onChange={cambiarFoto} className="hidden" />
                        <button type="button" disabled={ocupado} onClick={() => inputFoto.current?.click()} title="Cambiar fotografía" aria-label="Cambiar fotografía" className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-forest text-white transition hover:bg-primary-hover disabled:opacity-50">
                            {subiendoFoto ? <LoaderCircle size={17} className="animate-spin" /> : <Camera size={17} />}
                        </button>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="break-words font-lora text-2xl font-bold text-forest-dark">{usuario.nombre}</h3>
                        <p className="mt-1 flex items-center gap-2 break-all text-sm text-secondary"><Mail size={15} className="shrink-0" /> {usuario.email}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCE8D2] px-3 py-1 text-xs font-bold text-forest"><ShieldCheck size={14} /> Administrador</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${usuario.estado === "activa" ? "bg-success-light text-forest" : "bg-warning-light text-warning"}`}>{usuario.estado === "activa" ? "Cuenta activa" : "Cuenta no activa"}</span>
                        </div>
                    </div>
                    <div className="border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                        <p className="flex items-center gap-2 text-xs font-semibold text-secondary"><CalendarDays size={16} /> Fecha de registro</p>
                        <p className="mt-2 text-sm font-bold text-text">{fechaRegistro}</p>
                    </div>
                </div>
                <p className="mt-4 text-xs text-secondary">Fotografía de perfil: JPG, PNG o WEBP. Máximo 5 MB.</p>
                {(avisoFoto.error || avisoFoto.mensaje) && <div className="mt-3"><Mensaje {...avisoFoto} /></div>}
            </section>

            <div className="grid items-start gap-5 xl:grid-cols-2">
                <section className="rounded-florae border border-border bg-surface p-6 shadow-florae">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DCE8D2] text-forest"><UserRound size={23} /></div>
                        <div>
                            <h3 className="font-lora text-lg font-bold text-forest-dark">Información personal</h3>
                            <p className="mt-1 text-xs text-secondary">Actualiza los datos de tu cuenta.</p>
                        </div>
                    </div>
                    <form onSubmit={guardarInformacion} className="space-y-4">
                        <label className="block space-y-2">
                            <span className="text-sm font-bold text-text">Nombre completo</span>
                            <input name="nombre" value={datos.nombre} onChange={cambiarDatos} maxLength={100} required disabled={guardando} autoComplete="name" className={campo} />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-sm font-bold text-text">Correo electrónico</span>
                            <input type="email" name="email" value={datos.email} onChange={cambiarDatos} maxLength={150} required disabled={guardando} autoComplete="email" className={campo} />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-sm font-bold text-text">Rol asignado</span>
                            <input value="Administrador" disabled className={campo} />
                        </label>
                        <p className="text-xs text-secondary">El rol administrativo no puede modificarse desde este apartado.</p>
                        <Mensaje {...avisoPerfil} />
                        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
                            {hayCambios && <button type="button" disabled={ocupado} onClick={() => { setDatos({ nombre: usuario.nombre, email: usuario.email }); setAvisoPerfil({}); }} className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-secondary hover:bg-soft">Cancelar</button>}
                            <button type="submit" disabled={ocupado || !hayCambios} className={boton}>{guardando ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />} Guardar cambios</button>
                        </div>
                    </form>
                </section>

                <section className="rounded-florae border border-border bg-surface p-6 shadow-florae">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D6DAEF] text-[#58658F]"><LockKeyhole size={23} /></div>
                        <div>
                            <h3 className="font-lora text-lg font-bold text-forest-dark">Seguridad</h3>
                            <p className="mt-1 text-xs text-secondary">Protege el acceso al panel administrativo.</p>
                        </div>
                    </div>
                    <form onSubmit={guardarPassword} className="space-y-4">
                        <fieldset disabled={cambiandoPassword} className="space-y-4">
                            <CampoPassword titulo="Contraseña actual" nombre="password_actual" valor={contrasenas.password_actual} cambiar={cambiarContrasenas} autocomplete="current-password" />
                            <CampoPassword titulo="Nueva contraseña" nombre="password" valor={contrasenas.password} cambiar={cambiarContrasenas} autocomplete="new-password" />
                            <CampoPassword titulo="Confirmar contraseña" nombre="password_confirmation" valor={contrasenas.password_confirmation} cambiar={cambiarContrasenas} autocomplete="new-password" />
                        </fieldset>
                        <p className="text-xs text-secondary">Utiliza una contraseña de al menos 8 caracteres.</p>
                        <Mensaje {...avisoPassword} />
                        <div className="flex justify-end border-t border-border pt-4">
                            <button type="submit" disabled={ocupado} className={boton}>{cambiandoPassword ? <LoaderCircle size={17} className="animate-spin" /> : <ShieldCheck size={17} />} Actualizar contraseña</button>
                        </div>
                    </form>
                </section>
            </div>

            <section className="flex flex-col gap-4 rounded-florae border border-border bg-surface p-5 shadow-florae sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-danger-light text-danger"><LogOut size={23} /></div>
                    <div>
                        <h3 className="font-bold text-text">Cerrar sesión</h3>
                        <p className="mt-1 text-sm text-secondary">Finaliza tu sesión en el panel administrativo de Florae.</p>
                    </div>
                </div>
                <button type="button" disabled={ocupado} onClick={() => setModalSesion(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-danger/30 px-5 py-3 text-sm font-bold text-danger transition hover:bg-danger-light disabled:opacity-50"><LogOut size={17} /> Cerrar sesión</button>
            </section>

            {modalSesion && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <section role="dialog" aria-modal="true" aria-labelledby="titulo-sesion" className="relative w-full max-w-md animate-scale-in rounded-florae bg-surface p-6 shadow-xl">
                        <button type="button" disabled={cerrando} onClick={() => setModalSesion(false)} aria-label="Cerrar ventana" className="absolute right-4 top-4 rounded-lg p-2 text-secondary hover:bg-soft"><X size={20} /></button>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-light text-danger"><LogOut size={29} /></div>
                        <h3 id="titulo-sesion" className="mt-4 text-center font-lora text-xl font-bold text-forest-dark">¿Cerrar sesión?</h3>
                        <p className="mt-3 text-center text-sm text-secondary">Deberás iniciar sesión nuevamente para acceder al panel administrativo.</p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button type="button" disabled={cerrando} onClick={() => setModalSesion(false)} className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-secondary hover:bg-soft">Cancelar</button>
                            <button type="button" disabled={cerrando} onClick={cerrarSesion} className="flex items-center justify-center gap-2 rounded-xl bg-danger px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">{cerrando && <LoaderCircle size={16} className="animate-spin" />} Cerrar sesión</button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default PerfilAdmin;