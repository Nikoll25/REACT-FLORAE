import { useLocation } from "react-router-dom";
import FormularioPlanta from "./components/FormularioPlanta";

export default function CrearPlanta() {
    const { state } = useLocation();
    return <FormularioPlanta sugerencia={state?.sugerencia} />;
}
