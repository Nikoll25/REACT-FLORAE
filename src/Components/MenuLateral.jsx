import { NavLink } from "react-router-dom";
import planta from "../assets/planta.png";
import plaga from "../assets/plaga.png";

const opciones = [
    { ruta: "/explorar", nombre: "Plantas", imagen: planta, activo: "bg-[#88A675] border-[#88A675]", inactivo: "bg-white border-[#DFE9D7] hover:bg-[#EEF3E7]" },
    { ruta: "/explorar/plagas", nombre: "Plagas", imagen: plaga, activo: "bg-[#C18E80] border-[#C18E80]", inactivo: "bg-white border-[#EAD9D0] hover:bg-[#F8ECEA]" },
];

const MenuLateral = () => (
    <aside className="fixed right-3 top-[300px] z-40 flex flex-col gap-2 sm:right-5 sm:top-[100px]">
        {opciones.map((opcion) => (
            <NavLink key={opcion.ruta} to={opcion.ruta} end title={opcion.nombre} aria-label={`Explorar ${opcion.nombre.toLowerCase()}`} className={({ isActive }) => `flex h-[58px] w-[62px] items-center justify-center rounded-[20px] border shadow-[0_3px_8px_rgba(63,93,63,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:h-[61px] sm:w-[72px] ${isActive ? opcion.activo : opcion.inactivo}`}>
                {({ isActive }) => <img src={opcion.imagen} alt={opcion.nombre} className={`h-[29px] w-[29px] object-contain ${isActive ? "brightness-0 invert" : ""}`} />}
            </NavLink>
        ))}
    </aside>
);

export default MenuLateral;
