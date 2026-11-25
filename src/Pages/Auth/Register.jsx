import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Mail, LockKeyhole, Eye, EyeOff, LoaderCircle, AlertCircle, SearchCheck, Bell, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import fondoPlantas from "../../assets/imageninicio.png";
import regadera from "../../assets/regadera (3).png";
import { API_URL } from "../../services/api";

function Register() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [datos, setDatos] = useState({ nombre: "", email: "", password: "", password_confirmation: "" });
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const cambiarCampo = (e) => setDatos((anterior) => ({ ...anterior, [e.target.name]: e.target.value }));

    const registrar = async (e) => {
        e.preventDefault();
        setError("");

        if (datos.password !== datos.password_confirmation) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setCargando(true);
        try {
            const respuesta = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ ...datos, nombre: datos.nombre.trim(), email: datos.email.trim() }),
            });
            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                const mensaje = resultado.errors ? Object.values(resultado.errors).flat().join(" ") : resultado.mensaje || resultado.message;
                throw new Error(mensaje || "No se pudo crear la cuenta.");
            }

            // Reutilizamos el flujo de autenticación actual de Zustand.
            await login(datos.email.trim(), datos.password);
            navigate("/jardin", { replace: true });
        } catch (err) {
            setError(err.message || "Ocurrió un error al registrarte.");
        } finally {
            setCargando(false);
        }
    };

    const iniciarConGoogle = () => {
        window.alert("El acceso con Google estará disponible cuando se configure en Laravel.");
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#F8F7F3] font-['Nunito']">
            <main className="grid flex-1 lg:grid-cols-[55%_45%]">
                <section className="hidden flex-col lg:flex">
                    <div
                        className="relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden bg-[#B7C9AC] bg-cover bg-center"
                        style={{ backgroundImage: `linear-gradient(rgba(54,85,47,.20),rgba(54,85,47,.30)),url(${fondoPlantas})` }}
                    >
                        <div className="relative z-10 px-8 text-center">
                            <img src={regadera} alt="Logo de Florae" className="mx-auto mb-5 h-24 w-24 object-contain" />
                            <h1 className="font-['Lora'] text-7xl font-bold italic tracking-tight text-[#18351E] xl:text-8xl">Florae</h1>
                            <p className="mt-4 text-xl font-extrabold italic text-white drop-shadow-md">Cuida lo que te hace crecer</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 bg-white px-7 py-9">
                        {[[SearchCheck, "Encuentra", "tus plantas"], [Bell, "Recibe", "recordatorios"], [ShieldCheck, "Mantén", "tus plantas sanas"]].map(([Icono, titulo, descripcion]) => (
                            <div key={titulo} className="flex items-center gap-3">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E7F5DB] text-[#3F5D3F]"><Icono size={29} strokeWidth={1.5} /></div>
                                <div><p className="font-extrabold text-[#3F5D3F]">{titulo}</p><p className="text-sm font-medium text-[#777777]">{descripcion}</p></div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex items-center justify-center rounded-t-[30px] bg-white px-6 py-6 shadow-[-8px_0_35px_rgba(0,0,0,0.04)] sm:px-10 lg:rounded-l-[30px] lg:rounded-tr-none">
                    <div className="w-full max-w-[470px]">
                        <div className="mb-5 text-center">
                            <img src={regadera} alt="Logo de Florae" className="mx-auto mb-3 h-16 w-16 object-contain" />
                            <h2 className="text-3xl font-extrabold tracking-tight text-[#254D2D] sm:text-4xl">¡Crea tu cuenta!</h2>
                            <p className="mt-2 text-base font-medium text-[#777777]">Comienza a cuidar tus plantas con Florae</p>
                        </div>

                        <form onSubmit={registrar} className="space-y-3">
                            {[
                                { name: "nombre", placeholder: "Nombre completo", type: "text", autoComplete: "name", Icono: UserRound },
                                { name: "email", placeholder: "Correo electrónico", type: "email", autoComplete: "email", Icono: Mail },
                                { name: "password", placeholder: "Contraseña (mínimo 8 caracteres)", type: mostrarPassword ? "text" : "password", autoComplete: "new-password", Icono: LockKeyhole },
                                { name: "password_confirmation", placeholder: "Confirmar contraseña", type: mostrarConfirmacion ? "text" : "password", autoComplete: "new-password", Icono: LockKeyhole },
                            ].map(({ name, placeholder, type, autoComplete, Icono }) => (
                                <div className="relative" key={name}>
                                    <Icono size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3F5D3F]" />
                                    <input
                                        name={name}
                                        type={type}
                                        value={datos[name]}
                                        onChange={cambiarCampo}
                                        placeholder={placeholder}
                                        aria-label={placeholder}
                                        autoComplete={autoComplete}
                                        minLength={name.includes("password") ? 8 : undefined}
                                        maxLength={name === "nombre" ? 100 : name === "email" ? 150 : undefined}
                                        required
                                        className="h-14 w-full rounded-2xl border border-[#D7E2D1] bg-white py-3 pr-12 text-base font-medium text-[#303B30] outline-none transition-all duration-200 placeholder:text-[#9A9A9A] focus:border-[#89AB78] focus:ring-2 focus:ring-[#89AB78]/20"
                                        style={{ paddingLeft: "3.25rem" }}
                                    />
                                    {name.includes("password") && (
                                        <button
                                            type="button"
                                            onClick={() => name === "password" ? setMostrarPassword(!mostrarPassword) : setMostrarConfirmacion(!mostrarConfirmacion)}
                                            aria-label={type === "password" ? "Mostrar contraseña" : "Ocultar contraseña"}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#3F5D3F]"
                                        >
                                            {type === "password" ? <Eye size={21} /> : <EyeOff size={21} />}
                                        </button>
                                    )}
                                </div>
                            ))}
                            {error && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"><AlertCircle size={19} className="shrink-0" /><span>{error}</span></div>}
                            <button type="submit" disabled={cargando} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#5C9848] px-5 py-3 text-base font-extrabold text-white shadow-sm transition hover:bg-[#4B813B] disabled:opacity-60">
                                {cargando ? <><LoaderCircle size={20} className="animate-spin" /> Creando cuenta...</> : "Crear cuenta"}
                            </button>
                        </form>

                        <div className="my-4 flex items-center gap-4"><div className="h-px flex-1 bg-[#E5E7EB]" /><span className="text-sm font-semibold text-[#777777]">o</span><div className="h-px flex-1 bg-[#E5E7EB]" /></div>
                        <button type="button" onClick={iniciarConGoogle} className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[#B7D0A9] bg-white px-4 text-base font-extrabold text-[#3F5D3F] transition hover:bg-[#F0F5EC]">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-6 w-6" />Continuar con Google
                        </button>
                        <p className="mt-4 text-center text-sm font-medium text-[#666666]">¿Ya tienes cuenta? <Link to="/login" className="font-extrabold text-[#5B9348] transition-colors hover:text-[#3F5D3F] hover:underline">Inicia sesión</Link></p>
                    </div>
                </section>
            </main>
            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#E7EDE1] bg-[#F1F5EC] px-7 py-5 text-sm font-medium text-[#777777] sm:px-12">
                <span>Florae v2.0</span>
                <div className="flex gap-7"><Link to="/privacidad" className="hover:text-[#3F5D3F]">Privacidad</Link><Link to="/terminos" className="hover:text-[#3F5D3F]">Términos</Link></div>
            </footer>
        </div>
    );
}

export default Register;
