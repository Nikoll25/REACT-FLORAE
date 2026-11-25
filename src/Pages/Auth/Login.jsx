
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    UserRound,
    LockKeyhole,
    Eye,
    EyeOff,
    SearchCheck,
    Bell,
    ShieldCheck,
    LoaderCircle,
    AlertCircle,
    X,
    CheckCircle2,
    Sprout,
} from "lucide-react";

import { useAuthStore } from "../../store/useAuthStore";
import fondoPlantas from "../../assets/imageninicio.png";
import semilla from "../../assets/semilla.png";

function Login() {
    const navigate = useNavigate();

    // Funciones y estados de autenticación
    const login = useAuthStore((state) => state.login);
    const reactivarCuenta = useAuthStore(
        (state) => state.reactivarCuenta
    );
    const cargando = useAuthStore((state) => state.cargando);
    const error = useAuthStore((state) => state.error);

    // Datos del formulario
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);

    // Mensajes y reactivación
    const [errorLocal, setErrorLocal] = useState("");
    const [errorReactivacion, setErrorReactivacion] = useState("");
    const [modalReactivacion, setModalReactivacion] = useState(false);

    // Acceso con Google
    const iniciarConGoogle = () => {
        window.alert(
            "El acceso con Google estará disponible cuando se configure en Laravel."
        );
    };

    // Iniciar sesión
    const manejarLogin = async (evento) => {
        evento.preventDefault();

        if (cargando) return;

        const correo = email.trim();

        if (!correo || !password) {
            setErrorLocal("Ingresa tu correo y contraseña.");
            return;
        }

        setErrorLocal("");
        setErrorReactivacion("");

        try {
            await login(correo, password);

            navigate("/jardin", {
                replace: true,
            });
        } catch (err) {
            if (err.codigo === "CUENTA_REACTIVABLE") {
                setModalReactivacion(true);
                return;
            }

            setErrorLocal(
                err.message || "No se pudo iniciar sesión."
            );

            console.error("Error al iniciar sesión:", err);
        }
    };

    // Reactivar una cuenta suspendida voluntariamente
    const manejarReactivacion = async () => {
        if (cargando) return;

        setErrorReactivacion("");

        try {
            if (typeof reactivarCuenta !== "function") {
                throw new Error(
                    "No se encontró la función reactivarCuenta en useAuthStore."
                );
            }

            await reactivarCuenta(email.trim(), password);

            setModalReactivacion(false);

            navigate("/jardin", {
                replace: true,
            });
        } catch (err) {
            setErrorReactivacion(
                err.message || "No se pudo reactivar la cuenta."
            );

            console.error("Error al reactivar la cuenta:", err);
        }
    };

    // Cerrar el modal de reactivación
    const cerrarModalReactivacion = () => {
        if (cargando) return;

        setModalReactivacion(false);
        setErrorReactivacion("");
        setErrorLocal("");
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#F8F7F3] font-['Nunito']">

            {/* Contenido principal */}
            <main className="grid flex-1 lg:grid-cols-[55%_45%]">

                {/* Panel izquierdo */}
                <section className="hidden flex-col lg:flex">

                    <div
                        className="relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden bg-[#B7C9AC] bg-cover bg-center"
                        style={{
                            backgroundImage: `
                                linear-gradient(
                                    rgba(54, 85, 47, 0.20),
                                    rgba(54, 85, 47, 0.30)
                                ),
                                url(${fondoPlantas})
                            `,
                        }}
                    >
                        <div className="relative z-10 px-8 text-center">

                            <img
                                src={semilla}
                                alt="Logo de Florae"
                                className="mx-auto mb-5 h-20 w-20 object-contain"
                            />

                            <h1 className="font-['Lora'] text-7xl font-bold italic tracking-tight text-[#18351E] xl:text-8xl">
                                Florae
                            </h1>

                            <p className="mt-4 font-['Nunito'] text-xl font-extrabold italic text-white drop-shadow-md">
                                Cuida lo que te hace crecer
                            </p>

                        </div>
                    </div>

                    {/* Beneficios */}
                    <div className="grid grid-cols-3 gap-4 bg-white px-7 py-9">

                        <Beneficio
                            icono={SearchCheck}
                            titulo="Encuentra"
                            descripcion="tus plantas"
                        />

                        <Beneficio
                            icono={Bell}
                            titulo="Recibe"
                            descripcion="recordatorios"
                        />

                        <Beneficio
                            icono={ShieldCheck}
                            titulo="Mantén"
                            descripcion="tus plantas sanas"
                        />

                    </div>
                </section>

                {/* Panel derecho */}
                <section className="flex items-center justify-center rounded-t-[30px] bg-white px-6 py-12 shadow-[-8px_0_35px_rgba(0,0,0,0.04)] sm:px-10 lg:rounded-l-[30px] lg:rounded-tr-none">

                    <div className="w-full max-w-[470px]">

                        {/* Encabezado */}
                        <div className="mb-10 text-center">

                            <img
                                src={semilla}
                                alt="Logo de Florae"
                                className="mx-auto mb-5 h-24 w-24 object-contain"
                            />

                            <h2 className="font-['Nunito'] text-3xl font-extrabold tracking-tight text-[#254D2D] sm:text-4xl">
                                ¡Bienvenido de nuevo!
                            </h2>

                            <p className="mt-4 text-base font-medium text-[#777777]">
                                Inicia sesión para continuar en Florae
                            </p>

                        </div>

                        {/* Formulario */}
                        <form
                            onSubmit={manejarLogin}
                            className="space-y-5"
                        >

                            {/* Correo electrónico */}
                            <div className="relative">

                                <UserRound
                                    size={23}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3F5D3F]"
                                />

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrorLocal("");
                                    }}
                                    placeholder="Correo electrónico"
                                    autoComplete="email"
                                    aria-label="Correo electrónico"
                                    required
                                    className="h-14 w-full rounded-2xl border border-[#D7E2D1] bg-white py-3 pr-4 pl-[3.25rem] text-base font-medium text-[#303B30] outline-none transition-all duration-200 placeholder:text-[#9A9A9A] focus:border-[#89AB78] focus:ring-2 focus:ring-[#89AB78]/20"
                                />

                            </div>

                            {/* Contraseña */}
                            <div className="relative">

                                <LockKeyhole
                                    size={23}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3F5D3F]"
                                />

                                <input
                                    type={mostrarPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrorLocal("");
                                    }}
                                    placeholder="Contraseña"
                                    autoComplete="current-password"
                                    aria-label="Contraseña"
                                    required
                                    className="h-14 w-full rounded-2xl border border-[#D7E2D1] bg-white py-3 pr-12 pl-[3.25rem] text-base font-medium text-[#303B30] outline-none transition-all duration-200 placeholder:text-[#9A9A9A] focus:border-[#89AB78] focus:ring-2 focus:ring-[#89AB78]/20"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMostrarPassword(!mostrarPassword)
                                    }
                                    aria-label={
                                        mostrarPassword
                                            ? "Ocultar contraseña"
                                            : "Mostrar contraseña"
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#929292] transition-colors hover:text-[#3F5D3F]"
                                >
                                    {mostrarPassword ? (
                                        <EyeOff size={22} />
                                    ) : (
                                        <Eye size={22} />
                                    )}
                                </button>

                            </div>

                            {/* Recuperar contraseña */}
                            <div className="text-right">

                                <Link
                                    to="/recuperar-contrasena"
                                    className="text-sm font-bold text-[#5B9348] transition-colors hover:text-[#3F5D3F] hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>

                            </div>

                            {/* Mensajes de error */}
                            {(errorLocal || (error && !modalReactivacion)) && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                                >
                                    <AlertCircle
                                        size={19}
                                        className="shrink-0"
                                    />

                                    <span>{errorLocal || error}</span>
                                </div>
                            )}

                            {/* Botón para iniciar sesión */}
                            <button
                                type="submit"
                                disabled={cargando}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5C9848] px-5 py-3 text-base font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4B813B] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {cargando ? (
                                    <>
                                        <LoaderCircle
                                            size={20}
                                            className="animate-spin"
                                        />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    "Iniciar sesión"
                                )}
                            </button>

                        </form>

                        {/* Separador */}
                        <div className="my-7 flex items-center gap-4">

                            <div className="h-px flex-1 bg-[#E5E7EB]" />

                            <span className="text-sm font-semibold text-[#777777]">
                                o
                            </span>

                            <div className="h-px flex-1 bg-[#E5E7EB]" />

                        </div>

                        {/* Acceso con Google */}
                        <button
                            type="button"
                            onClick={iniciarConGoogle}
                            className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[#B7D0A9] bg-white px-4 text-base font-extrabold text-[#3F5D3F] transition-all duration-200 hover:bg-[#F0F5EC]"
                        >
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt=""
                                className="h-6 w-6"
                            />

                            Continuar con Google
                        </button>

                        {/* Registro */}
                        <p className="mt-6 text-center text-sm font-medium text-[#666666]">

                            ¿No tienes cuenta?{" "}

                            <Link
                                to="/registro"
                                className="font-extrabold text-[#5B9348] transition-colors hover:text-[#3F5D3F] hover:underline"
                            >
                                Regístrate
                            </Link>

                        </p>

                    </div>
                </section>

            </main>

            {/* Modal de reactivación */}
            {modalReactivacion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D3322]/60 px-4">

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-reactivacion"
                        className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
                    >

                        {/* Cerrar modal */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={cerrarModalReactivacion}
                                disabled={cargando}
                                aria-label="Cerrar"
                                className="text-[#6B7280] hover:text-[#303B30] disabled:opacity-50"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Información de reactivación */}
                        <div className="text-center">

                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3E7] text-[#3F5D3F]">
                                <Sprout size={32} />
                            </div>

                            <h2
                                id="titulo-reactivacion"
                                className="text-2xl font-extrabold text-[#254D2D]"
                            >
                                ¿Deseas reactivar tu cuenta?
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                                Suspendiste tu cuenta de Florae temporalmente.
                                Puedes reactivarla ahora y recuperar el acceso
                                a tu jardín, calendario y demás funcionalidades.
                            </p>

                        </div>

                        {/* Datos conservados */}
                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#EEF3E7] p-3 text-sm text-[#3F5D3F]">

                            <CheckCircle2
                                size={20}
                                className="shrink-0"
                            />

                            Tus plantas y tu información se han conservado.

                        </div>

                        {/* Error al reactivar */}
                        {(errorReactivacion || error) && (
                            <p
                                role="alert"
                                className="mt-4 flex items-center gap-2 text-sm text-red-700"
                            >
                                <AlertCircle
                                    size={18}
                                    className="shrink-0"
                                />

                                {errorReactivacion || error}
                            </p>
                        )}

                        {/* Confirmar reactivación */}
                        <button
                            type="button"
                            onClick={manejarReactivacion}
                            disabled={cargando}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C9848] px-5 py-3 font-bold text-white transition hover:bg-[#4B813B] disabled:opacity-60"
                        >
                            {cargando && (
                                <LoaderCircle
                                    size={19}
                                    className="animate-spin"
                                />
                            )}

                            {cargando
                                ? "Reactivando cuenta..."
                                : "Reactivar mi cuenta"}
                        </button>

                        {/* Cancelar */}
                        <button
                            type="button"
                            onClick={cerrarModalReactivacion}
                            disabled={cargando}
                            className="mt-3 w-full rounded-xl border border-[#D7E2D1] px-5 py-3 font-bold text-[#3F5D3F] hover:bg-[#F0F5EC] disabled:opacity-60"
                        >
                            Ahora no
                        </button>

                    </div>
                </div>
            )}

            {/* Pie de página */}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E7EDE1] bg-[#F1F5EC] px-7 py-5 text-sm font-medium text-[#777777] sm:px-12">

                <span>Florae v2.0</span>

                <div className="flex gap-7">

                    <Link
                        to="/privacidad"
                        className="transition-colors hover:text-[#3F5D3F]"
                    >
                        Privacidad
                    </Link>

                    <Link
                        to="/terminos"
                        className="transition-colors hover:text-[#3F5D3F]"
                    >
                        Términos
                    </Link>

                </div>

            </footer>

        </div>
    );
}

// Tarjetas de beneficios
function Beneficio({ icono: Icono, titulo, descripcion }) {
    return (
        <div className="flex items-center gap-3">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E7F5DB] text-[#3F5D3F]">

                <Icono
                    size={29}
                    strokeWidth={1.5}
                />

            </div>

            <div>
                <p className="font-['Nunito'] font-extrabold text-[#3F5D3F]">
                    {titulo}
                </p>

                <p className="text-sm font-medium text-[#777777]">
                    {descripcion}
                </p>
            </div>

        </div>
    );
}

export default Login;
