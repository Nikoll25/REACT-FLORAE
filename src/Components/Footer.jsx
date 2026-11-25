
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="w-full shrink-0 border-t-[4px] border-[#A5B98D] bg-[#647D59] text-white">

      <div className="mx-auto max-w-[1400px] px-8 py-9">

        <div className="grid grid-cols-1 gap-9 md:grid-cols-3">

          {/* identidad de florae */}
          <div className="flex flex-col items-center md:items-start">

            <img
              src={logo}
              alt="Florae"
              className="mb-3 w-[130px] object-contain"
            />

            <p className="max-w-xs text-center text-sm leading-6 text-[#F0F2E9] md:text-left">
              Un espacio para descubrir, cuidar y disfrutar
              el mundo de las plantas.
            </p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[2px] text-[#D4E2C5]">
              Cultiva, aprende y florece.
            </p>

          </div>

          {/* navegación */}
          <div className="flex flex-col items-center">

            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Explora Florae
            </h3>

            <div className="flex flex-col items-center gap-3 text-sm text-[#F0F2E9]">

              <Link to="/jardin" className="transition hover:translate-x-1 hover:text-[#D4E2C5]">
                Mi jardín
              </Link>

              <Link to="/explorar" className="transition hover:translate-x-1 hover:text-[#D4E2C5]">
                Explorar plantas
              </Link>

              <Link to="/explorarplaga" className="transition hover:translate-x-1 hover:text-[#D4E2C5]">
                Identificar plagas
              </Link>

              <Link to="/calendario" className="transition hover:translate-x-1 hover:text-[#D4E2C5]">
                Calendario de cuidados
              </Link>

            </div>

          </div>

          {/* mensaje */}
          <div className="flex flex-col items-center text-center md:items-end md:text-right">

            <h3 className="mb-3 text-base font-semibold text-white">
              Un jardín más saludable
            </h3>

            <p className="max-w-xs text-sm leading-6 text-[#F0F2E9]">
              Cada planta necesita atención y dedicación.
              Florae te acompaña en cada etapa de su crecimiento.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xl text-[#D4E2C5]">
              <span>🌱</span>
              <span>🌿</span>
              <span>🍃</span>
            </div>

          </div>

        </div>

        {/* separador */}
        <div className="my-8 h-px w-full bg-[#8DA17E]"></div>

        {/* derechos de autor */}
        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row">

          <p className="text-xs text-[#E5EBDD]">
            © {new Date().getFullYear()} Florae. Todos los derechos reservados.
          </p>

          <p className="text-xs font-medium text-[#D4E2C5]">
            Hecho con amor por la naturaleza.
          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;
