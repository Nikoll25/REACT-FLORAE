import { useRef, useState } from "react";

import {
    Crown,
    X,
    CheckCircle2,
    CreditCard,
    Landmark,
    Smartphone,
    Wallet,
    AlertCircle,
    LoaderCircle,
    Info,
} from "lucide-react";

import {
    contratarSuscripcion,
    renovarSuscripcion,
} from "../../services/api";

import { useAuthStore } from "../../store/useAuthStore";

const metodosPago = [
    { id: "pse", nombre: "PSE", icono: Landmark },
    { id: "tarjeta", nombre: "Tarjeta débito o crédito", icono: CreditCard },
    { id: "nequi", nombre: "Nequi", icono: Smartphone },
    { id: "daviplata", nombre: "Daviplata", icono: Wallet },
];

const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(Number(precio));
};

function ModalContratarPlan({
    plan,
    esRenovacion = false,
    onCerrar,
    onExito,
}) {
    const [metodoPago, setMetodoPago] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");

    const solicitudEnCurso = useRef(false);

    // Procesar la compra simulada
    const confirmarCompra = async (evento) => {
        evento.preventDefault();

        if (solicitudEnCurso.current) return;

        if (!metodoPago) {
            setError("Selecciona un método de pago.");
            return;
        }

        const token = useAuthStore.getState().token;

        if (!token) {
            setError("Debes iniciar sesión nuevamente.");
            return;
        }

        solicitudEnCurso.current = true;
        setProcesando(true);
        setError("");

        let resultado;

        try {
            resultado = esRenovacion
                ? await renovarSuscripcion(plan.id, metodoPago)
                : await contratarSuscripcion(plan.id, metodoPago);

            if (
                !resultado.suscripcion ||
                !resultado.pago ||
                resultado.pago_simulado !== true
            ) {
                throw new Error(
                    "No se pudo confirmar la compra. Revisa tu historial antes de volver a intentarlo."
                );
            }

        } catch (err) {
            setError(
                err.message ||
                "No se pudo procesar la suscripción."
            );

            return;

        } finally {
            solicitudEnCurso.current = false;
            setProcesando(false);
        }

        if (token !== useAuthStore.getState().token) return;

        onExito(resultado);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D3322]/55 p-4 backdrop-blur-sm"
            onMouseDown={(evento) => {
                if (
                    evento.target === evento.currentTarget &&
                    !procesando
                ) {
                    onCerrar();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-contratacion"
                className="max-h-[90vh] w-full max-w-[540px] overflow-y-auto rounded-[28px] bg-[#FFFEFB] p-6 shadow-2xl sm:p-8"
            >
                <div className="mb-6 flex items-start gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F4EEDF] text-[#96763C]">
                        <Crown size={30} />
                    </div>

                    <div className="flex-1">
                        <h2
                            id="titulo-contratacion"
                            className="font-lora text-2xl font-bold text-[#3F5D3F]"
                        >
                            {esRenovacion ? "Renovar" : "Contratar"}{" "}
                            {plan.nombre}
                        </h2>

                        <p className="mt-1 text-sm text-[#626B60]">
                            Potencia el cuidado de tu jardín.
                        </p>
                    </div>

                    <button
                        type="button"
                        aria-label="Cerrar modal"
                        disabled={procesando}
                        onClick={onCerrar}
                        className="rounded-full p-2 text-[#626B60] hover:bg-[#EDF1E9] disabled:opacity-50"
                    >
                        <X size={23} />
                    </button>

                </div>

                <div className="mb-6 rounded-2xl border border-[#E5DDCB] bg-[#FAF8F2] p-5">

                    <div className="mb-4">
                        <span className="text-3xl font-bold text-[#3F5D3F]">
                            {formatearPrecio(plan.precio)}
                        </span>

                        <span className="ml-2 text-sm text-[#626B60]">
                            COP / mes
                        </span>
                    </div>

                    <div className="space-y-3">

                        {[
                            `${plan.creditos_mensuales} créditos de IA mensuales`,
                            "Consultas sobre plantas y plagas",
                            "Orientación sobre cuidados y tratamientos",
                        ].map((beneficio) => (
                            <div
                                key={beneficio}
                                className="flex items-center gap-3 text-sm text-[#3F5D3F]"
                            >
                                <CheckCircle2
                                    size={19}
                                    className="shrink-0 text-[#82977C]"
                                />

                                {beneficio}
                            </div>
                        ))}

                    </div>
                </div>

                <form onSubmit={confirmarCompra}>

                    <fieldset disabled={procesando}>

                        <legend className="mb-4 font-bold text-[#3F5D3F]">
                            Selecciona tu método de pago
                        </legend>

                        <div className="space-y-3">

                            {metodosPago.map(({ id, nombre, icono: Icono }) => (
                                <label
                                    key={id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                                        metodoPago === id
                                            ? "border-[#82977C] bg-[#EDF1E9]"
                                            : "border-[#DDE4D8] bg-white hover:bg-[#F5F7F2]"
                                    }`}
                                >
                                    <Icono
                                        size={23}
                                        className="text-[#3F5D3F]"
                                    />

                                    <span className="flex-1 font-semibold text-[#3F5D3F]">
                                        {nombre}
                                    </span>

                                    <input
                                        type="radio"
                                        name="metodo_pago"
                                        value={id}
                                        checked={metodoPago === id}
                                        onChange={() => {
                                            setMetodoPago(id);
                                            setError("");
                                        }}
                                        className="h-5 w-5 accent-[#82977C]"
                                    />
                                </label>
                            ))}

                        </div>

                    </fieldset>

                    <div className="my-6 border-t border-[#DDE4D8]" />

                    <div className="mb-5 flex items-center justify-between gap-3">

                        <span className="text-[#626B60]">
                            Total a pagar
                        </span>

                        <strong className="text-xl text-[#3F5D3F]">
                            {formatearPrecio(plan.precio)} COP
                        </strong>

                    </div>

                    <div className="mb-5 flex items-start gap-3 rounded-xl bg-[#F2EDE0] p-4 text-sm text-[#96763C]">

                        <Info size={20} className="shrink-0" />

                        <p>
                            Este es un pago simulado.
                            No se realizará ningún cobro real.
                        </p>

                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="mb-5 flex items-start gap-3 rounded-xl bg-[#F8ECEA] p-4 text-sm text-[#A34C4C]"
                        >
                            <AlertCircle
                                size={20}
                                className="shrink-0"
                            />

                            {error}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row">

                        <button
                            type="button"
                            disabled={procesando}
                            onClick={onCerrar}
                            className="rounded-xl border border-[#DDE5D6] px-5 py-3 font-bold text-[#3F5D3F] hover:bg-[#EDF1E9] disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={procesando || !metodoPago}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#62795C] px-5 py-3 font-bold text-white transition hover:bg-[#52684D] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {procesando ? (
                                <>
                                    <LoaderCircle
                                        size={20}
                                        className="animate-spin"
                                    />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    Confirmar pago simulado
                                </>
                            )}
                        </button>

                    </div>

                </form>
            </section>
        </div>
    );
}

export default ModalContratarPlan;