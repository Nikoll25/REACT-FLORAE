import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

function AdminLayout() {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [menuContraido, setMenuContraido] = useState(false);

    // Controlar el menú lateral
    const abrirMenu = () => setMenuAbierto(true);
    const cerrarMenu = () => setMenuAbierto(false);
    const alternarMenu = () => setMenuContraido((actual) => !actual);

    return (
        <div className="flex min-h-dvh w-full bg-background font-nunito text-text">

            {/* Menú lateral */}
            <AdminSidebar abierto={menuAbierto} contraido={menuContraido} cerrar={cerrarMenu} />

            <div className="flex min-w-0 flex-1 flex-col">

                {/* Encabezado administrativo */}
                <AdminHeader contraido={menuContraido} alternarMenu={alternarMenu} abrirMenu={abrirMenu} />

                {/* Contenido de cada sección */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto w-full max-w-[1600px]">
                        <Outlet />
                    </div>
                </main>

                {/* Pie de página administrativo */}
                <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-4 text-xs text-secondary lg:px-8">
                    <p>© {new Date().getFullYear()} Florae. Todos los derechos reservados.</p>
                    <p className="font-lora italic text-forest">Cuida lo que te hace crecer.</p>
                </footer>

            </div>
        </div>
    );
}

export default AdminLayout;