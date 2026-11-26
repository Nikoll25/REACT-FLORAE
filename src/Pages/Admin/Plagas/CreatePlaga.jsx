import { useLocation } from "react-router-dom";
import FormularioPlaga from "./components/FormularioPlaga";

export default function CreatePlaga() {
    const { state } = useLocation();
    return <FormularioPlaga sugerencia={state?.sugerencia} />;
}