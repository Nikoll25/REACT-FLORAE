
import { useEffect, useState } from "react";
import {
    Bell,
    Droplets,
    FlaskConical,
    LoaderCircle,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

import {
    obtenerPreferenciasNotificaciones,
    actualizarPreferenciasNotificaciones,
} from "../../services/api";

const opciones = [
    {
        campo: "notificaciones_cuidados",
        titulo: "Recordatorios de cuidados",
        descripcion:
            "Recibe avisos de riego, fertilización y otros cuidados pendientes de tus plantas.",
        icono: Droplets,
    },
    {
        campo: "notificaciones_tratamientos",
        titulo: "Recordatorios de tratamientos",
        descripcion:
            "Configura los avisos de tratamientos de tus plantas para cuando esta función esté disponible.",
        icono: FlaskConical,
    },
];

function Notificaciones() {
    const [preferencias, setPreferencias] = useState({
        notificaciones_cuidados: false,
        notificaciones_tratamientos: false,
    });

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarPreferencias = async () => {
            try {
                const respuesta = await obtenerPreferenciasNotificaciones();

                setPreferencias({
                    notificaciones_cuidados:
                        Boolean(respuesta.notificaciones_cuidados),
                    notificaciones_tratamientos:
                        Boolean(respuesta.notificaciones_tratamientos),
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };

        cargarPreferencias();
    }, []);

    const cambiarPreferencia = (campo) => {
        setMensaje("");
        setError("");

        setPreferencias((actuales) => ({
            ...actuales,
            [campo]: !actuales[campo],
        }));
    };

    const guardarPreferencias = async () => {
        try {
            setGuardando(true);
            setError("");
            setMensaje("");

            const respuesta = await actualizarPreferenciasNotificaciones(
                preferencias
            );

            setPreferencias(respuesta.preferencias);
            setMensaje(respuesta.mensaje);

            window.dispatchEvent(
                new Event("florae:notificaciones")
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <section className="rounded-[30px] border border-[#DFE9D7] bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF3E7] text-[#3F5D3F]">
                    <Bell size={27} />
                </div>

                <div>
                    <h1 className="text-2xl font-extrabold text-[#303B30]">
                        Notificaciones
                    </h1>

                    <p className="mt-1 text-sm text-[#6B7280]">
                        Configura los recordatorios de tu jardín.
                    </p>
                </div>
            </div>

            {cargando ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className="h-24 rounded-2xl bg-[#EEF3E7]"
                        />
                    ))}
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {opciones.map((opcion) => {
                            const Icono = opcion.icono;
                            const activo = preferencias[opcion.campo];

                            return (
                                <div
                                    key={opcion.campo}
                                    className="flex items-center justify-between gap-4 rounded-2xl border border-[#E2EADB] bg-[#FCFDFB] p-5"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-xl bg-[#EEF3E7] p-3 text-[#3F5D3F]">
                                            <Icono size={23} />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-[#303B30]">
                                                {opcion.titulo}
                                            </h2>

                                            <p className="mt-1 max-w-md text-sm leading-6 text-[#6B7280]">
                                                {opcion.descripcion}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={activo}
                                        aria-label={opcion.titulo}
                                        onClick={() => cambiarPreferencia(opcion.campo)}
                                        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${activo
                                                ? "bg-[#89AB78]"
                                                : "bg-[#D1D5DB]"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${activo
                                                    ? "left-6"
                                                    : "left-1"
                                                }`}
                                        />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {mensaje && (
                        <div
                            role="status"
                            className="mt-5 flex items-center gap-2 text-sm text-[#3F5D3F]"
                        >
                            <CheckCircle2 size={18} />
                            {mensaje}
                        </div>
                    )}

                    {error && (
                        <div
                            role="alert"
                            className="mt-5 flex items-center gap-2 text-sm text-red-600"
                        >
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={guardarPreferencias}
                        disabled={guardando}
                        className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-[#89AB78] px-7 py-3 font-semibold text-white transition hover:bg-[#709261] disabled:opacity-60"
                    >
                        {guardando && (
                            <LoaderCircle
                                size={19}
                                className="animate-spin"
                            />
                        )}

                        {guardando
                            ? "Guardando..."
                            : "Guardar preferencias"}
                    </button>
                </>
            )}
        </section>
    );
}

export default Notificaciones;