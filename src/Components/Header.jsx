
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import PanelNotificaciones from "./PanelNotificaciones";

import logo from "../assets/logo.png";
import perfil from "../assets/perfil.png";
import campana from "../assets/campana.png";

import { obtenerNotificacionesSinLeer } from "../services/api";

const Header = () => {
    const [panelAbierto, setPanelAbierto] = useState(false);
    const [sinLeer, setSinLeer] = useState(0);

    const location = useLocation();

    const consultarNotificaciones = useCallback(async () => {
        if (!localStorage.getItem("token")) {
            setSinLeer(0);
            return;
        }

        try {
            const respuesta = await obtenerNotificacionesSinLeer();
            setSinLeer(respuesta.sin_leer || 0);
        } catch (error) {
            console.error("Error al consultar notificaciones:", error);
        }
    }, []);

    useEffect(() => {
        consultarNotificaciones();

        const intervalo = setInterval(
            consultarNotificaciones,
            30000
        );

        const actualizarAlVolver = () => {
            if (document.visibilityState === "visible") {
                consultarNotificaciones();
            }
        };

        document.addEventListener(
            "visibilitychange",
            actualizarAlVolver
        );

        window.addEventListener(
            "florae:notificaciones",
            consultarNotificaciones
        );

        return () => {
            clearInterval(intervalo);

            document.removeEventListener(
                "visibilitychange",
                actualizarAlVolver
            );

            window.removeEventListener(
                "florae:notificaciones",
                consultarNotificaciones
            );
        };
    }, [consultarNotificaciones, location.pathname]);

    useEffect(() => {
        setPanelAbierto(false);
    }, [location.pathname]);

    return (
        <>
            <header className="relative z-50 flex h-[80px] w-full items-center justify-between border-b border-[#E8DED8] bg-[#FAF3F3] px-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <div className="flex items-center gap-[30px]">
                    <img
                        className="w-[170px] object-contain"
                        src={logo}
                        alt="Florae"
                    />

                    <Navbar />
                </div>

                <div className="flex items-center gap-[25px]">
                    <button
                        type="button"
                        onClick={() => setPanelAbierto((actual) => !actual)}
                        title="Notificaciones"
                        aria-label={`Notificaciones, ${sinLeer} sin leer`}
                        aria-expanded={panelAbierto}
                        className="relative flex items-center justify-center transition-transform duration-300 hover:scale-110"
                    >
                        <img
                            className="h-[28px] w-[28px] object-contain"
                            src={campana}
                            alt=""
                        />

                        {sinLeer > 0 && (
                            <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D96565] px-1 text-[10px] font-bold text-white">
                                {sinLeer > 99 ? "99+" : sinLeer}
                            </span>
                        )}
                    </button>

                    <Link
                        to="/perfil"
                        title="Mi perfil"
                        className="rounded-full transition-transform duration-300 hover:scale-105"
                    >
                        <img
                            className="h-[45px] w-[45px] rounded-full border-2 border-[#A5D6A7] object-cover"
                            src={perfil}
                            alt="Mi perfil"
                        />
                    </Link>
                </div>
            </header>

            <PanelNotificaciones
                abierto={panelAbierto}
                cerrar={() => setPanelAbierto(false)}
                alActualizar={consultarNotificaciones}
            />
        </>
    );
};

export default Header;
