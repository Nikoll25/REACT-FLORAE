
import { NavLink } from "react-router-dom";
import planta from "../assets/planta.png";
import plaga from "../assets/plaga.png";

const MenuLateral = () => {
    return (
        <aside className="fixed right-3 top-[100px] z-40 flex flex-col gap-2 sm:right-5 sm:top-[100px]">

            {/* acceso a plantas */}
            <NavLink
                to="/explorar"
                end
                className={({ isActive }) =>
                    `flex h-[58px] w-[62px] items-center justify-center rounded-[20px] shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:h-[61px] sm:w-[72px] ${
                        isActive
                            ? "bg-[#88A675]"
                            : "bg-white hover:bg-[#F0F4EC]"
                    }`
                }
                title="Plantas"
                aria-label="Explorar plantas"
            >
                {({ isActive }) => (
                    <img
                        src={planta}
                        alt="Plantas"
                        className={`h-[29px] w-[29px] object-contain ${
                            isActive ? "brightness-0 invert" : ""
                        }`}
                    />
                )}
            </NavLink>

            {/* acceso a plagas */}
            <NavLink
                to="/explorar/plagas"
                end
                className={({ isActive }) =>
                    `flex h-[58px] w-[62px] items-center justify-center rounded-[20px] shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:h-[61px] sm:w-[72px] ${
                        isActive
                            ? "bg-[#88A675]"
                            : "bg-white hover:bg-[#F0F4EC]"
                    }`
                }
                title="Plagas"
                aria-label="Explorar plagas"
            >
                {({ isActive }) => (
                    <img
                        src={plaga}
                        alt="Plagas"
                        className={`h-[29px] w-[29px] object-contain ${
                            isActive ? "brightness-0 invert" : ""
                        }`}
                    />
                )}
            </NavLink>

        </aside>
    );
};

export default MenuLateral;
