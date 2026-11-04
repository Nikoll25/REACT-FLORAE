
import { Route, Routes } from "react-router-dom";
import './App.css'

import Explorar from "./Pages/Explore/Explorar";
import DetallePlanta from "./Pages/Plantas/DetallePlanta";
import CuidadosPlanta from "./pages/plantas/CuidadosPlanta";
//import ExplorarPlagas from "./Pages/Explore Plagas/Explore Plagas";
import Jardin from "./Pages/Jardin/Jardin";
///import Navbar from "./Components/Navbar/Navbar";
//import Footer from "./Components/Footer/Footer";
//import Sidebar from "./Components/Sidebar/Sidebar";


const App = () => {
  return (
    <>

      <Routes>
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/jardin" element={<Jardin />} />
        <Route path="/planta/:id" element={<DetallePlanta />} />
        <Route path="/cuidados/:id" element={<CuidadosPlanta />} />
      </Routes>
    </>
  )
}

export default App
