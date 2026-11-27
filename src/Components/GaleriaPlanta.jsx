import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { obtenerImagen } from "../services/api";

function GaleriaPlanta({ planta }) {
    const [indice, setIndice] = useState(0);
    const [fallidas, setFallidas] = useState([]);

    // Obtenemos todas las imágenes sin repetirlas
    const imagenes = [...new Set([
        planta?.image_plant,
        ...(Array.isArray(planta?.imagenes) ? planta.imagenes : []),
        planta?.image_url, planta?.image, planta?.imagen
    ].map(item => typeof item === "string" ? item : item?.image || item?.imagen || item?.ruta || item?.image_url)
        .filter(Boolean).map(obtenerImagen).filter(Boolean))].filter(imagen => !fallidas.includes(imagen));
    const actual = indice % (imagenes.length || 1);
    const foto = imagenes[actual];

    if (!foto) return (
        <div className="flex h-[350px] items-center justify-center rounded-[25px] bg-[#E9EDE4] text-[#718568] sm:h-[480px] lg:h-[555px]">
            Sin imagen disponible
        </div>
    );

    return (
        <div className="relative w-full">
            <img key={foto} src={foto} alt={planta.nombre_comun || planta.common_name} onError={() => setFallidas(prev => [...prev, foto])} className="h-[350px] w-full rounded-[25px] object-cover shadow-[1px_3px_6px_#555] sm:h-[480px] lg:h-[555px] lg:rounded-[30px]" />
            {imagenes.length > 1 && (
                <>
                    <button type="button" onClick={() => setIndice((actual - 1 + imagenes.length) % imagenes.length)} aria-label="Fotografía anterior" className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#F8F7F3]/85 text-[#3F5D3F] shadow-md transition hover:bg-[#E8EFE3]">
                        <ChevronLeft size={26} />
                    </button>
                    <button type="button" onClick={() => setIndice((actual + 1) % imagenes.length)} aria-label="Fotografía siguiente" className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#F8F7F3]/85 text-[#3F5D3F] shadow-md transition hover:bg-[#E8EFE3]">
                        <ChevronRight size={26} />
                    </button>
                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 font-sans text-sm text-white">{actual + 1} / {imagenes.length}</span>
                </>
            )}
        </div>
    );
}

export default GaleriaPlanta;
