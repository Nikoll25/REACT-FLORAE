import { useEffect, useState, useRef } from "react";
import { Images, CloudUpload, Star, Trash2, CheckCircle2 } from "lucide-react";
import { obtenerImagen } from "../../../../services/api";

function VistaImagen({ imagen }) {
    const [url, setUrl] = useState("");
    useEffect(() => {
        if (!imagen.archivo) { setUrl(imagen.ruta ? obtenerImagen(imagen.ruta) : ""); return; }
        const preview = URL.createObjectURL(imagen.archivo);
        setUrl(preview);
        return () => URL.revokeObjectURL(preview);
    }, [imagen.archivo, imagen.ruta]);
    return url ? <img src={url} alt={imagen.nombre_archivo} onError={() => setUrl("")} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-pale text-primary"><Images size={35} /></div>;
}

export default function GaleriaImagenes({ imagenes, setImagenes, principal, setPrincipal, quitar, guardando, editar }) {
    const input = useRef(null);
    const [error, setError] = useState("");
    const seleccionar = e => {
        const nuevas = [], errores = [];
        for (const archivo of Array.from(e.target.files || [])) {
            if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type) || archivo.size > 5 * 1024 * 1024) { errores.push(`${archivo.name}: formato inválido o supera 5 MB.`); continue; }
            if ([...imagenes, ...nuevas].some(i => i.archivo?.name === archivo.name && i.archivo?.size === archivo.size && i.archivo?.lastModified === archivo.lastModified)) { errores.push(`${archivo.name}: imagen repetida.`); continue; }
            nuevas.push({ clave: crypto.randomUUID(), archivo, nombre_archivo: archivo.name });
        }
        setImagenes(actual => [...actual, ...nuevas]);
        if (!principal && nuevas.length) setPrincipal(nuevas[0].clave);
        setError(errores.join(" "));
        e.target.value = "";
    };
    return <section className="rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7">
        <h2 className="mb-6 flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><Images className="text-primary" /> Galería de imágenes</h2>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={seleccionar} disabled={guardando} className="hidden" />
        <button type="button" disabled={guardando} onClick={() => input.current?.click()} className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-soft p-8 hover:bg-pale"><CloudUpload size={38} className="text-primary" /><span className="font-bold text-forest">Agregar imágenes</span><span className="text-xs text-secondary">JPG, PNG o WEBP · Máximo 5 MB</span></button>
        {error && <p role="alert" className="mt-4 rounded-xl bg-danger-light p-3 text-sm text-danger">{error}</p>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {imagenes.map(imagen => <article key={imagen.clave} className={`overflow-hidden rounded-2xl border-2 ${principal === imagen.clave ? "border-primary" : "border-border"}`}>
                <div className="relative"><VistaImagen imagen={imagen} />
                    {(editar || !imagen.id) && <button type="button" disabled={guardando} aria-label="Eliminar imagen" onClick={() => quitar("imagen", imagen)} className="absolute right-3 top-3 rounded-full bg-white p-2 text-danger"><Trash2 size={17} /></button>}
                </div>
                <div className="space-y-3 p-3"><p className="truncate text-xs text-secondary">{imagen.nombre_archivo}</p>
                    {imagen.id && <p className="flex items-center gap-1 text-xs text-success"><CheckCircle2 size={15} /> Imagen registrada</p>}
                    <button type="button" disabled={guardando || principal === imagen.clave} onClick={() => setPrincipal(imagen.clave)} className={`flex w-full items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold ${principal === imagen.clave ? "bg-pale text-forest" : "bg-soft text-secondary"}`}><Star size={15} fill={principal === imagen.clave ? "currentColor" : "none"} />{principal === imagen.clave ? "Imagen principal" : "Establecer como principal"}</button>
                </div>
            </article>)}
        </div>
    </section>;
}
