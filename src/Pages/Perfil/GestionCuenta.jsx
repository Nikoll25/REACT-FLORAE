
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

import {
    ArrowLeft,
    LockKeyhole,
    PauseCircle,
    Trash2,
    X,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function GestionCuenta() {
    const navigate = useNavigate();

    // Limpiamos la sesión desde Zustand
    const limpiarSesion = useAuthStore((state) => state.limpiarSesion);

    const [modal, setModal] = useState(null);
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const [passwordActual, setPasswordActual] = useState("");
    const [passwordNueva, setPasswordNueva] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");

    // Obtener el token del usuario
    const obtenerToken = () => {
        return localStorage.getItem("token");
    };

    // Cerrar el modal y limpiar sus campos
    const cerrarModal = () => {
        if (cargando) return;

        setModal(null);
        setPassword("");
        setPasswordActual("");
        setPasswordNueva("");
        setConfirmarPassword("");
        setMostrarPassword(false);
        setError("");
    };

    // Abrir el modal seleccionado
    const abrirModal = (tipo) => {
        if (cargando) return;

        setError("");
        setPassword("");
        setPasswordActual("");
        setPasswordNueva("");
        setConfirmarPassword("");
        setMostrarPassword(false);
        setModal(tipo);
    };

    // Limpiar la sesión y regresar al inicio de sesión
    const cerrarSesionLocal = () => {
        limpiarSesion();
        navigate("/login", { replace: true });
    };

    // Enviar solicitudes autenticadas a Laravel
    const realizarPeticion = async (ruta, metodo, datos) => {
        const token = obtenerToken();

        if (!token) {
            throw new Error(
                "Tu sesión ha expirado. Inicia sesión nuevamente."
            );
        }

        try {
            const respuesta = await fetch(`${API_URL}${ruta}`, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(datos),
            });

            const resultado = await respuesta.json().catch(() => ({}));

            if (!respuesta.ok) {
                const mensaje =
                    resultado.mensaje ||
                    resultado.message ||
                    Object.values(resultado.errors || {}).flat()[0] ||
                    "No se pudo completar la solicitud.";

                const errorPeticion = new Error(mensaje);
                errorPeticion.status = respuesta.status;

                throw errorPeticion;
            }

            return resultado;
        } catch (err) {
            if (err instanceof TypeError) {
                throw new Error(
                    "No se pudo conectar con el servidor. Verifica tu conexión."
                );
            }

            throw err;
        }
    };

    // Suspender voluntariamente la cuenta
    const suspenderCuenta = async () => {
        if (cargando) return;

        if (!password.trim()) {
            setError("Debes ingresar tu contraseña.");
            return;
        }

        try {
            setCargando(true);
            setError("");

            await realizarPeticion(
                "/cuenta/suspender",
                "POST",
                { password }
            );

            cerrarSesionLocal();
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // Cambiar la contraseña del usuario
    const cambiarPassword = async () => {
        if (cargando) return;

        if (!passwordActual || !passwordNueva || !confirmarPassword) {
            setError("Completa todos los campos.");
            return;
        }

        if (passwordNueva !== confirmarPassword) {
            setError("Las contraseñas nuevas no coinciden.");
            return;
        }

        if (passwordNueva.length < 8) {
            setError(
                "La nueva contraseña debe tener al menos 8 caracteres."
            );
            return;
        }

        try {
            setCargando(true);
            setError("");

            await realizarPeticion(
                "/profile/password",
                "PUT",
                {
                    password_actual: passwordActual,
                    password: passwordNueva,
                    password_confirmation: confirmarPassword,
                }
            );

            setModal("password-exito");
            setPasswordActual("");
            setPasswordNueva("");
            setConfirmarPassword("");
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // Eliminar definitivamente la cuenta
    const eliminarCuenta = async () => {
        if (cargando) return;

        if (!password.trim()) {
            setError("Debes ingresar tu contraseña.");
            return;
        }

        try {
            setCargando(true);
            setError("");

            await realizarPeticion(
                "/profile",
                "DELETE",
                { password }
            );

            cerrarSesionLocal();
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8F7F3] px-4 py-10">
            <div className="mx-auto max-w-3xl">

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-7 flex items-center gap-2 text-[#3F5D3F] transition hover:text-[#8BAF72]"
                >
                    <ArrowLeft size={20} />
                    Volver
                </button>

                <div className="mb-8">
                    <h1 className="font-serif text-3xl font-semibold text-[#303B30]">
                        Gestión de cuenta
                    </h1>

                    <p className="mt-2 text-sm text-[#6B7280]">
                        Administra la seguridad y el estado de tu cuenta de Florae.
                    </p>
                </div>

                <div className="space-y-4">

                    <section className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-[#EEF3E7] p-3 text-[#3F5D3F]">
                                <LockKeyhole size={24} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-[#303B30]">
                                    Cambiar contraseña
                                </h2>

                                <p className="mt-1 text-sm text-[#6B7280]">
                                    Actualiza tu contraseña para mantener tu cuenta segura.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => abrirModal("password")}
                            className="shrink-0 rounded-xl border border-[#8BAF72] px-5 py-2.5 text-sm font-semibold text-[#3F5D3F] transition hover:bg-[#EEF3E7]"
                        >
                            Cambiar
                        </button>
                    </section>

                    <section className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-[#FFF3E5] p-3 text-[#B7791F]">
                                <PauseCircle size={24} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-[#303B30]">
                                    Suspender mi cuenta
                                </h2>

                                <p className="mt-1 text-sm text-[#6B7280]">
                                    Desactiva temporalmente tu cuenta sin perder tus plantas,
                                    actividades ni historial.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => abrirModal("suspender")}
                            className="shrink-0 rounded-xl border border-[#D6A15C] px-5 py-2.5 text-sm font-semibold text-[#A66B20] transition hover:bg-[#FFF3E5]"
                        >
                            Suspender
                        </button>
                    </section>

                    <section className="flex flex-col gap-4 rounded-2xl border border-[#F1D5D5] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-[#F8ECEA] p-3 text-[#C65D55]">
                                <Trash2 size={24} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-[#303B30]">
                                    Eliminar mi cuenta
                                </h2>

                                <p className="mt-1 text-sm text-[#6B7280]">
                                    Elimina permanentemente tu cuenta y los datos asociados.
                                    Esta acción no se puede deshacer.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => abrirModal("eliminar")}
                            className="shrink-0 rounded-xl border border-[#C65D55] px-5 py-2.5 text-sm font-semibold text-[#C65D55] transition hover:bg-[#F8ECEA]"
                        >
                            Eliminar
                        </button>
                    </section>

                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-modal-cuenta"
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
                    >
                        <div className="mb-5 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`rounded-full p-3 ${
                                        modal === "eliminar"
                                            ? "bg-[#F8ECEA] text-[#C65D55]"
                                            : "bg-[#EEF3E7] text-[#3F5D3F]"
                                    }`}
                                >
                                    {modal === "suspender" && (
                                        <PauseCircle size={24} />
                                    )}

                                    {modal === "eliminar" && (
                                        <AlertTriangle size={24} />
                                    )}

                                    {modal === "password" && (
                                        <LockKeyhole size={24} />
                                    )}

                                    {modal === "password-exito" && (
                                        <CheckCircle2 size={24} />
                                    )}
                                </div>

                                <h2
                                    id="titulo-modal-cuenta"
                                    className="text-lg font-bold text-[#303B30]"
                                >
                                    {modal === "suspender" && "Suspender cuenta"}
                                    {modal === "eliminar" && "Eliminar cuenta"}
                                    {modal === "password" && "Cambiar contraseña"}
                                    {modal === "password-exito" && "Contraseña actualizada"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={cerrarModal}
                                disabled={cargando}
                                className="text-[#6B7280] hover:text-[#303B30] disabled:opacity-50"
                                aria-label="Cerrar"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        {modal === "suspender" && (
                            <>
                                <p className="mb-4 text-sm leading-6 text-[#6B7280]">
                                    Tu cuenta quedará suspendida temporalmente.
                                    Conservaremos tus plantas, calendario y demás
                                    información. Podrás reactivarla cuando vuelvas
                                    a iniciar sesión.
                                </p>

                                <label
                                    htmlFor="password-suspender"
                                    className="mb-2 block text-sm font-semibold text-[#303B30]"
                                >
                                    Confirma tu contraseña
                                </label>

                                <div className="relative">
                                    <input
                                        id="password-suspender"
                                        type={mostrarPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={cargando}
                                        className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 pr-12 outline-none focus:border-[#8BAF72]"
                                        placeholder="Tu contraseña"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setMostrarPassword(!mostrarPassword)}
                                        disabled={cargando}
                                        className="absolute right-4 top-3.5 text-[#6B7280]"
                                        aria-label="Mostrar u ocultar contraseña"
                                    >
                                        {mostrarPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>
                                </div>

                                {error && (
                                    <p role="alert" className="mt-3 text-sm text-red-600">
                                        {error}
                                    </p>
                                )}

                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={cerrarModal}
                                        disabled={cargando}
                                        className="flex-1 rounded-xl border border-[#E5E7EB] py-3 font-semibold text-[#303B30] disabled:opacity-60"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={suspenderCuenta}
                                        disabled={cargando}
                                        className="flex-1 rounded-xl bg-[#8BAF72] py-3 font-semibold text-white disabled:opacity-60"
                                    >
                                        {cargando ? "Suspendiendo..." : "Confirmar"}
                                    </button>
                                </div>
                            </>
                        )}

                        {modal === "eliminar" && (
                            <>
                                <p className="mb-4 text-sm leading-6 text-[#6B7280]">
                                    Esta acción eliminará tu cuenta de forma permanente.
                                    No podrás recuperar tus plantas ni tu historial.
                                </p>

                                <label
                                    htmlFor="password-eliminar"
                                    className="mb-2 block text-sm font-semibold text-[#303B30]"
                                >
                                    Confirma tu contraseña
                                </label>

                                <input
                                    id="password-eliminar"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={cargando}
                                    className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:border-[#C65D55]"
                                    placeholder="Tu contraseña"
                                />

                                {error && (
                                    <p role="alert" className="mt-3 text-sm text-red-600">
                                        {error}
                                    </p>
                                )}

                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={cerrarModal}
                                        disabled={cargando}
                                        className="flex-1 rounded-xl border border-[#E5E7EB] py-3 font-semibold text-[#303B30] disabled:opacity-60"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={eliminarCuenta}
                                        disabled={cargando}
                                        className="flex-1 rounded-xl bg-[#C65D55] py-3 font-semibold text-white disabled:opacity-60"
                                    >
                                        {cargando ? "Eliminando..." : "Eliminar cuenta"}
                                    </button>
                                </div>
                            </>
                        )}

                        {modal === "password" && (
                            <>
                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor="password-actual"
                                            className="mb-2 block text-sm font-semibold text-[#303B30]"
                                        >
                                            Contraseña actual
                                        </label>

                                        <input
                                            id="password-actual"
                                            type="password"
                                            value={passwordActual}
                                            onChange={(e) => setPasswordActual(e.target.value)}
                                            disabled={cargando}
                                            className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:border-[#8BAF72]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="password-nueva"
                                            className="mb-2 block text-sm font-semibold text-[#303B30]"
                                        >
                                            Nueva contraseña
                                        </label>

                                        <input
                                            id="password-nueva"
                                            type="password"
                                            value={passwordNueva}
                                            onChange={(e) => setPasswordNueva(e.target.value)}
                                            disabled={cargando}
                                            className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:border-[#8BAF72]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="confirmar-password"
                                            className="mb-2 block text-sm font-semibold text-[#303B30]"
                                        >
                                            Confirmar nueva contraseña
                                        </label>

                                        <input
                                            id="confirmar-password"
                                            type="password"
                                            value={confirmarPassword}
                                            onChange={(e) => setConfirmarPassword(e.target.value)}
                                            disabled={cargando}
                                            className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:border-[#8BAF72]"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p role="alert" className="mt-3 text-sm text-red-600">
                                        {error}
                                    </p>
                                )}

                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={cerrarModal}
                                        disabled={cargando}
                                        className="flex-1 rounded-xl border border-[#E5E7EB] py-3 font-semibold text-[#303B30] disabled:opacity-60"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={cambiarPassword}
                                        disabled={cargando}
                                        className="flex-1 rounded-xl bg-[#8BAF72] py-3 font-semibold text-white disabled:opacity-60"
                                    >
                                        {cargando ? "Guardando..." : "Guardar"}
                                    </button>
                                </div>
                            </>
                        )}

                        {modal === "password-exito" && (
                            <>
                                <p className="mb-6 text-sm leading-6 text-[#6B7280]">
                                    Tu contraseña se actualizó correctamente.
                                </p>

                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="w-full rounded-xl bg-[#8BAF72] py-3 font-semibold text-white"
                                >
                                    Entendido
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

export default GestionCuenta;