import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";

import UserRoute from "./Components/UserRoute";
import UserLayout from "./Components/UserLayout";
import ExplorarLayout from "./Components/ExplorarLayout";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Explorar from "./pages/Explore/Explorar";
import ExplorePlagas from "./pages/ExplorePlagas/ExplorePlagas";
import Jardin from "./pages/Jardin/Jardin";
import VerMas from "./pages/Jardin/VerMas";
import DetallePlanta from "./pages/Explore/plantas/DetallePlanta";
import CuidadosPlanta from "./pages/Explore/plantas/CuidadosPlanta";
import FichaPlaga from "./pages/ExplorePlagas/plagas/FichaPlaga";
import Calendario from "./pages/Calendar/Calendario";
import Perfil from "./pages/Perfil/Perfil";
import GestionCuenta from "./pages/Perfil/GestionCuenta";

import AdminRoute from "./Components/Admin/AdminRoute";
import AdminLayout from "./Components/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";

import Plantas from "./pages/Admin/Plantas/Plantas";
import CrearPlanta from "./pages/Admin/Plantas/CrearPlanta";
import DetallePlantaAdmin from "./pages/Admin/Plantas/DetallePlanta";
import EditarPlanta from "./pages/Admin/Plantas/EditarPlanta";

import Plagas from "./pages/Admin/Plagas/Plagas";
import DetallePlagaAdmin from "./pages/Admin/Plagas/DetallePlaga";
import CreatePlaga from "./pages/Admin/Plagas/CreatePlaga";
import EditarPlaga from "./pages/Admin/Plagas/EditarPlaga";

import Tratamientos from "./pages/Admin/Tratamientos/Tratamientos";
import FormularioTratamiento from "./pages/Admin/Tratamientos/FormularioTratamiento";
import DetalleTratamiento from "./pages/Admin/Tratamientos/DetalleTratamiento";

import Medicamentos from "./pages/Admin/Medicamentos/Medicamentos";
import FormularioMedicamento from "./pages/Admin/Medicamentos/FormularioMedicamento";
import DetalleMedicamento from "./pages/Admin/Medicamentos/DetalleMedicamento";

import Usuarios from "./pages/Admin/Usuarios/Usuarios";
import DetalleUsuario from "./pages/Admin/Usuarios/DetalleUsuario";

import SugerenciasIA from "./pages/Admin/SugerenciasIA/SugerenciasIA";
import DetalleSugerencia from "./pages/Admin/SugerenciasIA/DetalleSugerencia";

import Planes from "./pages/Admin/Planes/Planes";
import Suscripciones from "./pages/Admin/Suscripciones/Suscripciones";
import DetalleSuscripcion from "./pages/Admin/Suscripciones/DetalleSuscripcion";
import Pagos from "./pages/Admin/Pagos/Pagos";
import DetallePago from "./pages/Admin/Pagos/DetallePago";
import PerfilAdmin from "./pages/Admin/Perfil/PerfilAdmin";
import SobreNosotros from "./pages/SobreNosotros/SobreNosotros";

const App = () => {
    return (
        <Routes>
            {/* Autenticación */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />

            {/* Rutas protegidas del usuario */}
            <Route element={<UserRoute />}>
                <Route element={<UserLayout />}>
                    <Route path="/explorar" element={<ExplorarLayout />}>
                        <Route index element={<Explorar />} />
                        <Route path="plagas" element={<ExplorePlagas />} />
                    </Route>

                    <Route path="/planta/:id" element={<DetallePlanta />} />
                    <Route path="/cuidados/:id" element={<CuidadosPlanta />} />
                    <Route path="/plaga/:id" element={<FichaPlaga />} />
                    <Route path="/jardin" element={<Jardin />} />
                    <Route path="/jardin/vermas/:id" element={<VerMas />} />
                    <Route path="/calendario" element={<Calendario />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/gestion-cuenta" element={<GestionCuenta />} />

                    <Route path="/sobre-nosotros" element={<SobreNosotros />} />
                </Route>
            </Route>

            {/* Rutas protegidas del administrador */}
            <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />

                    <Route path="plantas" element={<Plantas />} />
                    <Route path="plantas/crear" element={<CrearPlanta />} />
                    <Route path="plantas/:id" element={<DetallePlantaAdmin />} />
                    <Route path="plantas/:id/editar" element={<EditarPlanta />} />

                    <Route path="plagas" element={<Plagas />} />
                    <Route path="plagas/crear" element={<CreatePlaga />} />
                    <Route path="plagas/:id" element={<DetallePlagaAdmin />} />
                    <Route path="plagas/:id/editar" element={<EditarPlaga />} />

                    <Route path="tratamientos" element={<Tratamientos />} />
                    <Route path="tratamientos/crear" element={<FormularioTratamiento />} />
                    <Route path="tratamientos/:id" element={<DetalleTratamiento />} />
                    <Route path="tratamientos/:id/editar" element={<FormularioTratamiento />} />

                    <Route path="medicamentos" element={<Medicamentos />} />
                    <Route path="medicamentos/crear" element={<FormularioMedicamento />} />
                    <Route path="medicamentos/:id" element={<DetalleMedicamento />} />
                    <Route path="medicamentos/:id/editar" element={<FormularioMedicamento />} />

                    <Route path="usuarios" element={<Usuarios />} />
                    <Route path="usuarios/:id" element={<DetalleUsuario />} />

                    <Route path="sugerencias" element={<SugerenciasIA />} />
                    <Route path="sugerencias/:id" element={<DetalleSugerencia />} />

                    <Route path="planes" element={<Planes />} />

                    <Route path="suscripciones" element={<Suscripciones />} />
                    <Route path="suscripciones/:id" element={<DetalleSuscripcion />} />

                    <Route path="pagos" element={<Pagos />} />
                    <Route path="pagos/:id" element={<DetallePago />} />

                    <Route path="perfil" element={<PerfilAdmin />} />

                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default App;