import { useState } from "react";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    LoaderCircle,
} from "lucide-react";
import { cambiarPassword } from "../../services/api";

const campos = [
    {
        name: "password_actual",
        label: "Contraseña actual",
        placeholder: "Ingresa tu contraseña actual",
        autoComplete: "current-password",
    },
    {
        name: "password",
        label: "Nueva contraseña",
        placeholder: "Mínimo 8 caracteres",
        autoComplete: "new-password",
    },
    {
        name: "password_confirmation",
        label: "Confirmar nueva contraseña",
        placeholder: "Repite tu nueva contraseña",
        autoComplete: "new-password",
    },
];

function Seguridad() {
    const [formulario, setFormulario] = useState({
        password_actual: "",
        password: "",
        password_confirmation: "",
    });
    const [mostrar, setMostrar] = useState({
        password_actual: false,
        password: false,
        password_confirmation: false,
    });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const actualizarCampo = (evento) => {
        const { name, value } = evento.target;
        setFormulario((anterior) => ({ ...anterior, [name]: value }));
        setError("");
        setMensaje("");
    };

    const alternarVisibilidad = (campo) => {
        setMostrar((anterior) => ({
            ...anterior,
            [campo]: !anterior[campo],
        }));
    };

    const guardarPassword = async (evento) => {
        evento.preventDefault();
        setError("");
        setMensaje("");

        if (formulario.password.length < 8) {
            setError("La contraseña nueva debe tener al menos 8 caracteres.");
            return;
        }
        if (formulario.password !== formulario.password_confirmation) {
            setError("Las contraseñas nuevas no coinciden.");
            return;
        }
        if (formulario.password_actual === formulario.password) {
            setError("La nueva contraseña debe ser diferente a la actual.");
            return;
        }

        setGuardando(true);
        try {
            const respuesta = await cambiarPassword(formulario);
            setMensaje(respuesta.mensaje || "Tu contraseña se actualizó correctamente.");
            setFormulario({
                password_actual: "",
                password: "",
                password_confirmation: "",
            });
            setMostrar({
                password_actual: false,
                password: false,
                password_confirmation: false,
            });
        } catch (err) {
            setError(err.message || "No se pudo actualizar la contraseña.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="space-y-7">
            <div>
                <div className="mb-3 flex items-center gap-2 text-[#89AB78]">
                    <ShieldCheck size={19} />
                    <span className="text-xs font-bold uppercase tracking-[0.16em]">
                        Protege tu cuenta
                    </span>
                </div>
                <h1 className="font-['Lora'] text-3xl font-bold text-[#254D2D]">
                    Seguridad
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#626B60]">
                    Mantén tu cuenta protegida actualizando tu contraseña cuando lo necesites.
                </p>
            </div>

            <section className="rounded-[28px] border border-[#DFE9D7] bg-white/90 p-6 shadow-sm sm:p-8">
                <div className="mb-7 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EFE3] text-[#3F5D3F]">
                        <LockKeyhole size={26} />
                    </div>
                    <div>
                        <h2 className="font-['Lora'] text-xl font-bold text-[#254D2D]">
                            Cambiar contraseña
                        </h2>
                        <p className="mt-1 text-sm text-[#626B60]">
                            Elige una contraseña segura para tu cuenta.
                        </p>
                    </div>
                </div>

                <form onSubmit={guardarPassword} className="space-y-5">
                    {campos.map((campo) => (
                        <div key={campo.name}>
                            <label htmlFor={campo.name} className="mb-2 block text-sm font-bold text-[#3F5D3F]">
                                {campo.label}
                            </label>
                            <div className="relative">
                                <input
                                    id={campo.name}
                                    name={campo.name}
                                    type={mostrar[campo.name] ? "text" : "password"}
                                    value={formulario[campo.name]}
                                    onChange={actualizarCampo}
                                    autoComplete={campo.autoComplete}
                                    placeholder={campo.placeholder}
                                    required
                                    disabled={guardando}
                                    minLength={campo.name === "password" ? 8 : undefined}
                                    className="h-14 w-full rounded-2xl border border-[#DDE5D6] bg-[#FAFCF8] px-4 pr-12 text-sm text-[#303B30] outline-none transition focus:border-[#89AB78] focus:ring-2 focus:ring-[#89AB78]/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => alternarVisibilidad(campo.name)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#879782] hover:text-[#3F5D3F]"
                                    aria-label={mostrar[campo.name] ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {mostrar[campo.name] ? <EyeOff size={19} /> : <Eye size={19} />}
                                </button>
                            </div>
                        </div>
                    ))}

                    {error && (
                        <div role="alert" className="flex items-start gap-2 rounded-xl bg-[#FFF0E9] p-4 text-sm text-[#A65D42]">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {mensaje && (
                        <div role="status" className="flex items-start gap-2 rounded-xl bg-[#E8EFE3] p-4 text-sm text-[#3F5D3F]">
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                            <span>{mensaje}</span>
                        </div>
                    )}

                    <div className="flex justify-end pt-3">
                        <button
                            type="submit"
                            disabled={guardando}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-[#89AB78] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#709261] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {guardando ? (
                                <><LoaderCircle size={18} className="animate-spin" />Guardando...</>
                            ) : (
                                <><ShieldCheck size={18} />Actualizar contraseña</>
                            )}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default Seguridad;
