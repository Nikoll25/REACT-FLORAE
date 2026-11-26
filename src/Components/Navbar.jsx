import { NavLink, useLocation } from "react-router-dom";
import { Flower2, Search, CalendarDays } from "lucide-react";

const enlaces = [
    { nombre: "Mi jardín", ruta: "/jardin", icono: Flower2 },
    { nombre: "Explorar", ruta: "/explorar", icono: Search },
    { nombre: "Calendario", ruta: "/calendario", icono: CalendarDays },
];

function Navbar() {
    const { pathname } = useLocation();

    // Identificar la sección activa
    const rutaActiva = (ruta) => {
        if (ruta === "/explorar") {
            return ["/explorar", "/planta/", "/cuidados/", "/plaga/"].some((inicio) => pathname.startsWith(inicio));
        }
        return pathname === ruta || pathname.startsWith(`${ruta}/`);
    };

    return (
        <nav aria-label="Navegación principal" className="flex items-center justify-center gap-3 sm:gap-6 xl:gap-8">
            {enlaces.map(({ nombre, ruta, icono: Icono }) => {
                const activo = rutaActiva(ruta);
                return (
                    <NavLink key={ruta} to={ruta} aria-current={activo ? "page" : undefined} className={`group relative flex items-center gap-2 whitespace-nowrap py-3 text-sm font-semibold transition-colors duration-300 sm:text-base ${activo ? "text-[#709261]" : "text-[#303B30] hover:text-[#709261]"}`}>
                        <Icono size={21} strokeWidth={1.7} className={`shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 ${activo ? "text-[#709261]" : "text-[#3F5D3F]"}`} />
                        <span>{nombre}</span>
                        <span className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-[#89AB78] transition-all duration-300 ${activo ? "w-full" : "w-0 group-hover:w-full"}`} />
                    </NavLink>
                );
            })}
        </nav>
    );
}

export default Navbar;