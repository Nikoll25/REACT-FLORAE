
import { NavLink } from "react-router-dom"

const Navbar = () => {
  return (
    <nav className="flex items-center gap-[45px]">

      <NavLink
        to="/jardin"
        className={({ isActive }) =>
          `inline-block text-[18px] text-black no-underline transition-all duration-500 hover:-translate-y-[3px] hover:text-green-700 ${
            isActive ? "text-green-700 underline decoration-[1px]" : ""
          }`
        }
      >
        Jardin
      </NavLink>

      <NavLink
        to="/explorar"
        className={({ isActive }) =>
          `inline-block text-[18px] text-black no-underline transition-all duration-500 hover:-translate-y-[3px] hover:text-green-700 ${
            isActive ? "text-green-700 underline decoration-[1px]" : ""
          }`
        }
      >
        Explorar
      </NavLink>

      <NavLink
        to="/calendario"
        className={({ isActive }) =>
          `inline-block text-[18px] text-black no-underline transition-all duration-500 hover:-translate-y-[3px] hover:text-green-700 ${
            isActive ? "text-green-700 underline decoration-[1px]" : ""
          }`
        }
      >
        Calendario
      </NavLink>

    </nav>
  )
}

export default Navbar
