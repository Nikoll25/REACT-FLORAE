import { X, CheckCircle2, Leaf } from "lucide-react";

function ModalResultado({ resultado, cerrar }) {
    if (!resultado) return null;

    const exito = resultado.tipo === "exito";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#263A28]/50 px-4 backdrop-blur-[3px]">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal"
                className="relative w-full max-w-sm rounded-[30px] bg-[#FFFDF8] px-7 py-9 text-center shadow-2xl"
            >
                <button
                    type="button"
                    onClick={cerrar}
                    className="absolute right-5 top-5 text-[#8A9483] hover:text-[#3F5D3F]"
                    aria-label="Cerrar"
                >
                    <X size={21} />
                </button>

                <div
                    className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${exito
                            ? "bg-[#E8F1E2] text-[#638B55]"
                            : "bg-[#FFF0E5] text-[#B77943]"
                        }`}
                >
                    {exito ? (
                        <CheckCircle2
                            size={43}
                            strokeWidth={1.6}
                        />
                    ) : (
                        <Leaf
                            size={40}
                            strokeWidth={1.6}
                        />
                    )}
                </div>

                <h2
                    id="titulo-modal"
                    className="font-serif text-2xl font-bold text-[#3F5D3F]"
                >
                    {exito
                        ? "¡Actividades completadas!"
                        : "Algunas tareas quedaron pendientes"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#778071]">
                    {resultado.mensaje}
                </p>

                <button
                    type="button"
                    onClick={cerrar}
                    className="mt-7 w-full rounded-2xl bg-[#89AB78] py-3.5 font-semibold text-white transition hover:bg-[#719662]"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
}
export default ModalResultado;