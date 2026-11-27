import { Link } from "react-router-dom";
import { Leaf, ArrowUpRight } from "lucide-react";
import logo from "../assets/logo.png";

const enlaces = [
    { ruta: "/explorar", nombre: "Explorar plantas" },
    { ruta: "/jardin", nombre: "Mi jardín" },
    { ruta: "/explorar/plagas", nombre: "Explorar plagas" },
    { ruta: "/calendario", nombre: "Calendario" },
    { ruta: "/perfil", nombre: "Mi perfil" },
    { ruta: "/perfil?seccion=pagos", nombre: "Suscripciones" },
];

const Footer = () => {
    return (
        <footer className="w-full shrink-0 border-t-[3px] border-[#A6B49B] bg-[#60755B] font-nunito text-[#DFE7D9]">
            <div className="mx-auto max-w-[1250px] px-6 pb-3 pt-6 sm:px-10">

                <div className="grid items-center gap-6 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.3fr_0.8fr] lg:gap-8">

                    {/* Identidad de Florae */}
                    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                        <Link to="/jardin">
                            <img src={logo} alt="Florae" className="mb-2 w-[115px] object-contain" />
                        </Link>
                        <h2 className="font-lora text-[17px] font-medium italic leading-snug text-[#F8F7F3]">
                            Cuidamos lo que te hace florecer.
                        </h2>
                        <p className="mt-2 max-w-[280px] text-xs leading-5">
                            Naturaleza y tecnología para cultivar una vida más verde.
                        </p>
                    </div>

                    {/* Navegación */}
                    <div className="text-center sm:text-left lg:border-l lg:border-white/15 lg:pl-8">
                        <h3 className="mb-3 font-lora text-base font-semibold text-[#F8F7F3]">
                            Explora y cultiva
                        </h3>
                        <nav aria-label="Navegación del pie de página" className="grid grid-cols-2 gap-x-5 gap-y-2">
                            {enlaces.map(({ ruta, nombre }) => (
                                <Link key={ruta} to={ruta} className="text-[13px] leading-5 transition hover:text-white hover:underline hover:underline-offset-4">
                                    {nombre}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Sobre nosotros */}
                    <div className="flex flex-col items-center text-center sm:col-span-2 lg:col-span-1 lg:items-start lg:border-l lg:border-white/15 lg:pl-8 lg:text-left">
                        <h3 className="mb-3 font-lora text-base font-semibold text-[#F8F7F3]">
                            Conoce Florae
                        </h3>
                        <Link to="/sobre-nosotros" className="flex items-center gap-1.5 text-[13px] transition hover:text-white hover:underline hover:underline-offset-4">
                            Sobre nosotros <ArrowUpRight size={13} />
                        </Link>
                        <p className="mt-2 max-w-[190px] font-lora text-xs italic leading-5 text-[#D1DECA]">
                            Nuestra esencia es crecer contigo.
                        </p>
                    </div>
                </div>

                {/* Derechos de autor */}
                <div className="mt-5 flex flex-col items-center justify-between gap-2 border-t border-white/15 pt-3 text-center sm:flex-row">
                    <p className="text-[11px]">
                        © {new Date().getFullYear()} Florae. Todos los derechos reservados.
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px]">
                        <Leaf size={13} strokeWidth={1.5} />
                        Inspirado en la naturaleza.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;