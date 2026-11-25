
import {
    Route,
    Routes,
    Navigate,
    useLocation,
} from "react-router-dom";

import "./App.css";

// Componentes generales
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ExplorarLayout from "./Components/ExplorarLayout";

// Autenticación
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Explorar
import Explorar from "./pages/Explore/Explorar";
import ExplorePlagas from "./pages/ExplorePlagas/ExplorePlagas";

// Jardín
import Jardin from "./pages/Jardin/Jardin";
import VerMas from "./pages/Jardin/VerMas";

// Plantas
import DetallePlanta from "./pages/plantas/DetallePlanta";
import CuidadosPlanta from "./pages/plantas/CuidadosPlanta";

// Plagas
import FichaPlaga from "./pages/plagas/FichaPlaga";

// Calendario
import Calendario from "./pages/Calendar/Calendario";

// Perfil
import Perfil from "./pages/Perfil/Perfil";
import GestionCuenta from "./pages/Perfil/GestionCuenta";

const App = () => {
    const location = useLocation();

    // Ocultar el encabezado y el pie de página en autenticación
    const esAutenticacion = [
        "/login",
        "/registro",
        "/recuperar-contrasena",
    ].includes(location.pathname);

    return (
        <>
            {!esAutenticacion && <Header />}

            <Routes>
                {/* Ruta principal */}
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                {/* Autenticación */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/registro"
                    element={<Register />}
                />

                {/* Explorar plantas y plagas */}
                <Route
                    path="/explorar"
                    element={<ExplorarLayout />}
                >
                    <Route
                        index
                        element={<Explorar />}
                    />

                    <Route
                        path="plagas"
                        element={<ExplorePlagas />}
                    />
                </Route>

                {/* Detalle de plantas */}
                <Route
                    path="/planta/:id"
                    element={<DetallePlanta />}
                />

                {/* Cuidados de plantas */}
                <Route
                    path="/cuidados/:id"
                    element={<CuidadosPlanta />}
                />

                {/* Detalle de plagas */}
                <Route
                    path="/plaga/:id"
                    element={<FichaPlaga />}
                />

                {/* Jardín */}
                <Route
                    path="/jardin"
                    element={<Jardin />}
                />

                <Route
                    path="/jardin/vermas/:id"
                    element={<VerMas />}
                />

                {/* Calendario */}
                <Route
                    path="/calendario"
                    element={<Calendario />}
                />

                {/* Perfil */}
                <Route
                    path="/perfil"
                    element={<Perfil />}
                />
                <Route path="/gestion-cuenta" element={<GestionCuenta />} />
                {/* Rutas no encontradas */}
                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />
            </Routes>

            {!esAutenticacion && <Footer />}
        </>
    );
};

export default App;
