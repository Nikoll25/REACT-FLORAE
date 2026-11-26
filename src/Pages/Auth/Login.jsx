import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, LockKeyhole, Eye, EyeOff, SearchCheck, Bell, ShieldCheck, LoaderCircle, AlertCircle, X, CheckCircle2, Sprout } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import fondoPlantas from "../../assets/imageninicio.png";
import semilla from "../../assets/semilla.png";

// Estilos reutilizables
const estiloInput = "h-14 w-full rounded-2xl border border-[#D7E2D1] bg-white py-3 pl-[3.25rem] text-base font-medium text-text outline-none transition-all duration-200 placeholder:text-[#9A9A9A] focus:border-primary focus:ring-2 focus:ring-primary/20";
const estiloIcono = "absolute left-4 top-1/2 -translate-y-1/2 text-forest";
const estiloBoton = "flex w-full items-center justify-center gap-2 bg-[#5C9848] px-5 py-3 font-bold text-white transition hover:bg-[#4B813B] disabled:cursor-not-allowed disabled:opacity-60";
const estiloEnlace = "font-bold text-[#5B9348] transition-colors hover:text-forest hover:underline";

function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const reactivarCuenta = useAuthStore((state) => state.reactivarCuenta);
    const cargando = useAuthStore((state) => state.cargando);
    const error = useAuthStore((state) => state.error);
    const limpiarError = useAuthStore((state) => state.limpiarError);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [errorLocal, setErrorLocal] = useState("");
    const [errorReactivacion, setErrorReactivacion] = useState("");
    const [modalReactivacion, setModalReactivacion] = useState(false);

    // Limpiar los mensajes del formulario
    const limpiarMensajes = () => {
        setErrorLocal("");
        setErrorReactivacion("");
        limpiarError();
    };

    // Redireccionar según el rol
    const redireccionarUsuario = (usuario) => {
        const esAdministrador = usuario?.role?.nombre?.toLowerCase() === "administrador";
        navigate(esAdministrador ? "/admin" : "/jardin", { replace: true });
    };

    // Iniciar sesión
    const manejarLogin = async (evento) => {
        evento.preventDefault();
        if (cargando) return;

        limpiarMensajes();
        const correo = email.trim();

        if (!correo || !password) {
            setErrorLocal("Ingresa tu correo y contraseña.");
            return;
        }

        try {
            const datos = await login(correo, password);
            redireccionarUsuario(datos.user);
        } catch (err) {
            if (err.codigo === "CUENTA_REACTIVABLE") {
                setModalReactivacion(true);
                return;
            }
            setErrorLocal(err.message || "No se pudo iniciar sesión.");
            console.error("Error al iniciar sesión:", err);
        }
    };

    // Reactivar una cuenta suspendida voluntariamente
    const manejarReactivacion = async () => {
        if (cargando) return;
        limpiarMensajes();

        try {
            const datos = await reactivarCuenta(email.trim(), password);
            setModalReactivacion(false);
            redireccionarUsuario(datos.user);
        } catch (err) {
            setErrorReactivacion(err.message || "No se pudo reactivar la cuenta.");
            console.error("Error al reactivar la cuenta:", err);
        }
    };

    const cerrarModalReactivacion = () => {
        if (cargando) return;
        setModalReactivacion(false);
        limpiarMensajes();
    };

    const iniciarConGoogle = () => {
        window.alert("El acceso con Google estará disponible cuando se configure en Laravel.");
    };

    return (
        <div className="flex min-h-screen flex-col bg-background font-nunito">
            <main className="grid flex-1 lg:grid-cols-[55%_45%]">

                {/* Panel izquierdo */}
                <section className="hidden flex-col lg:flex">
                    <div className="relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden bg-[#B7C9AC] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(54, 85, 47, 0.20), rgba(54, 85, 47, 0.30)), url(${fondoPlantas})` }}>
                        <div className="relative z-10 px-8 text-center">
                            <img src={semilla} alt="Logo de Florae" className="mx-auto mb-5 h-20 w-20 object-contain" />
                            <h1 className="font-lora text-7xl font-bold italic tracking-tight text-[#18351E] xl:text-8xl">Florae</h1>
                            <p className="mt-4 text-xl font-extrabold italic text-white drop-shadow-md">Cuida lo que te hace crecer</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-surface px-7 py-9">
                        <Beneficio icono={SearchCheck} titulo="Encuentra" descripcion="tus plantas" />
                        <Beneficio icono={Bell} titulo="Recibe" descripcion="recordatorios" />
                        <Beneficio icono={ShieldCheck} titulo="Mantén" descripcion="tus plantas sanas" />
                    </div>
                </section>

                {/* Panel derecho */}
                <section className="flex items-center justify-center rounded-t-[30px] bg-surface px-6 py-12 shadow-[-8px_0_35px_rgba(0,0,0,0.04)] sm:px-10 lg:rounded-l-[30px] lg:rounded-tr-none">
                    <div className="w-full max-w-[470px]">
                        <div className="mb-10 text-center">
                            <img src={semilla} alt="Logo de Florae" className="mx-auto mb-5 h-24 w-24 object-contain" />
                            <h2 className="text-3xl font-extrabold tracking-tight text-forest-dark sm:text-4xl">¡Bienvenido de nuevo!</h2>
                            <p className="mt-4 text-base font-medium text-[#777777]">Inicia sesión para continuar en Florae</p>
                        </div>

                        {/* Formulario de inicio de sesión */}
                        <form onSubmit={manejarLogin} className="space-y-5">
                            <div className="relative">
                                <UserRound size={23} className={estiloIcono} />
                                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); limpiarMensajes(); }} placeholder="Correo electrónico" autoComplete="email" aria-label="Correo electrónico" required className={`${estiloInput} pr-4`} />
                            </div>

                            <div className="relative">
                                <LockKeyhole size={23} className={estiloIcono} />
                                <input type={mostrarPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); limpiarMensajes(); }} placeholder="Contraseña" autoComplete="current-password" aria-label="Contraseña" required className={`${estiloInput} pr-12`} />
                                <button type="button" onClick={() => setMostrarPassword((actual) => !actual)} aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#929292] transition-colors hover:text-forest">
                                    {mostrarPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>

                            <div className="text-right">
                                <Link to="/recuperar-contrasena" className={`text-sm ${estiloEnlace}`}>¿Olvidaste tu contraseña?</Link>
                            </div>

                            {!modalReactivacion && (errorLocal || error) && <MensajeError mensaje={errorLocal || error} />}

                            <button type="submit" disabled={cargando} className={`${estiloBoton} rounded-2xl text-base font-extrabold shadow-sm hover:-translate-y-0.5 hover:shadow-md`}>
                                {cargando && <LoaderCircle size={20} className="animate-spin" />}
                                {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
                            </button>
                        </form>

                        {/* Acceso con Google */}
                        <div className="my-7 flex items-center gap-4">
                            <div className="h-px flex-1 bg-gray-200" />
                            <span className="text-sm font-semibold text-[#777777]">o</span>
                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        <button type="button" onClick={iniciarConGoogle} className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[#B7D0A9] bg-surface px-4 text-base font-extrabold text-forest transition-all duration-200 hover:bg-[#F0F5EC]">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-6 w-6" />
                            Continuar con Google
                        </button>

                        <p className="mt-6 text-center text-sm font-medium text-[#666666]">
                            ¿No tienes cuenta?{" "}
                            <Link to="/registro" className={`${estiloEnlace} font-extrabold`}>Regístrate</Link>
                        </p>
                    </div>
                </section>
            </main>

            {/* Modal de reactivación */}
            {modalReactivacion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D3322]/60 px-4">
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-reactivacion" className="w-full max-w-md animate-scale-in rounded-3xl bg-surface p-7 shadow-2xl">
                        <div className="flex justify-end">
                            <button type="button" onClick={cerrarModalReactivacion} disabled={cargando} aria-label="Cerrar" className="text-secondary hover:text-text disabled:opacity-50">
                                <X size={22} />
                            </button>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3E7] text-forest">
                                <Sprout size={32} />
                            </div>
                            <h2 id="titulo-reactivacion" className="text-2xl font-extrabold text-forest-dark">¿Deseas reactivar tu cuenta?</h2>
                            <p className="mt-3 text-sm leading-6 text-secondary">Suspendiste tu cuenta de Florae temporalmente. Puedes reactivarla ahora y recuperar el acceso a tu jardín, calendario y demás funcionalidades.</p>
                        </div>

                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#EEF3E7] p-3 text-sm text-forest">
                            <CheckCircle2 size={20} className="shrink-0" />
                            Tus plantas y tu información se han conservado.
                        </div>

                        {(errorReactivacion || error) && (
                            <div className="mt-4">
                                <MensajeError mensaje={errorReactivacion || error} />
                            </div>
                        )}

                        <button type="button" onClick={manejarReactivacion} disabled={cargando} className={`${estiloBoton} mt-6 rounded-xl`}>
                            {cargando && <LoaderCircle size={19} className="animate-spin" />}
                            {cargando ? "Reactivando cuenta..." : "Reactivar mi cuenta"}
                        </button>

                        <button type="button" onClick={cerrarModalReactivacion} disabled={cargando} className="mt-3 w-full rounded-xl border border-[#D7E2D1] px-5 py-3 font-bold text-forest transition hover:bg-[#F0F5EC] disabled:opacity-60">
                            Ahora no
                        </button>
                    </div>
                </div>
            )}

            {/* Pie de página */}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E7EDE1] bg-[#F1F5EC] px-7 py-5 text-sm font-medium text-[#777777] sm:px-12">
                <span>Florae v2.0</span>
                <div className="flex gap-7">
                    <Link to="/privacidad" className="transition-colors hover:text-forest">Privacidad</Link>
                    <Link to="/terminos" className="transition-colors hover:text-forest">Términos</Link>
                </div>
            </footer>
        </div>
    );
}

// Tarjetas de beneficios
function Beneficio({ icono: Icono, titulo, descripcion }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E7F5DB] text-forest">
                <Icono size={29} strokeWidth={1.5} />
            </div>
            <div>
                <p className="font-extrabold text-forest">{titulo}</p>
                <p className="text-sm font-medium text-[#777777]">{descripcion}</p>
            </div>
        </div>
    );
}

// Mensajes de error reutilizables
function MensajeError({ mensaje }) {
    return (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertCircle size={19} className="shrink-0" />
            <span>{mensaje}</span>
        </div>
    );
}

export default Login;