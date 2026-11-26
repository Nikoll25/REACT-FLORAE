import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { obtenerPlagaAdmin } from "../../../services/adminApi";
import FormularioPlaga from "./components/FormularioPlaga";

export default function EditarPlaga() {
    const { id } = useParams();
    const [resultado, setResultado] = useState(null);
    const [recarga, setRecarga] = useState(0);

    useEffect(() => {
        let vigente = true;
        obtenerPlagaAdmin(id).then(({ plaga }) => {
            if (!plaga?.id) throw new Error("No se encontró la plaga.");
            if (vigente) setResultado({ id, plaga });
        }).catch(error => { if (vigente) setResultado({ id, error: error.message }); });
        return () => { vigente = false; };
    }, [id, recarga]);

    if (!resultado || resultado.id !== id) return <div className="mx-auto max-w-5xl animate-pulse space-y-6">{[1, 2, 3].map(n => <div key={n} className="h-64 rounded-florae bg-pale" />)}</div>;

    if (resultado.error) return <div role="alert" className="space-y-4 rounded-florae bg-surface p-7 text-danger"><p>{resultado.error}</p><button onClick={() => { setResultado(null); setRecarga(n => n + 1); }} className="mr-5 font-bold">Reintentar</button><Link to="/admin/plagas">Volver al catálogo</Link></div>;

    return <FormularioPlaga key={id} plaga={resultado.plaga} />;
}