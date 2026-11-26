import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sprout, Sparkles, Save, LoaderCircle, AlertCircle } from "lucide-react";
import { crearPlanta, actualizarPlanta, agregarImagenPlanta, establecerImagenPrincipalPlanta, eliminarImagenPlanta, crearCuidado, actualizarCuidado, eliminarCuidado } from "../../../../services/adminApi";
import GaleriaImagenes from "./GaleriaImagenes";
import FormularioCuidados from "./FormularioCuidados";

const campos = [["nombre_comun", "Nombre común", 100], ["nombre_cientifico", "Nombre científico", 150], ["origen", "Origen", 255], ["tipo", "Categoría", 100], ["clima", "Clima", 100]];
const tamanos = ["Pequeño", "Mediano", "Grande"];
const input = "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";
const conClave = registros => (registros || []).map(r => ({ ...r, clave: String(r.id) }));
const datosCuidado = c => ({ tipo: c.tipo, descripcion: c.descripcion.trim(), frecuencia_dias: c.frecuencia_dias == null || c.frecuencia_dias === "" ? null : Number(c.frecuencia_dias) });

export default function FormularioPlanta({ planta, sugerencia }) {
    const navigate = useNavigate();
    const editar = Boolean(planta);
    const [id, setId] = useState(planta?.id || null);
    const [formulario, setFormulario] = useState(() => Object.fromEntries([...campos.map(c => c[0]), "size", "descripcion"].map(c => [c, planta?.[c] ?? sugerencia?.[c] ?? ""])));
    const [imagenes, setImagenes] = useState(() => conClave(planta?.imagenes));
    const [cuidados, setCuidados] = useState(() => planta ? conClave(planta.cuidados) : (sugerencia?.cuidados || []).map((c, i) => ({ ...c, clave: `sugerido-${i}` })));
    const [principal, setPrincipal] = useState(() => imagenes.find(i => i.es_principal)?.clave || imagenes[0]?.clave || null);
    const [progreso, setProgreso] = useState("");
    const [error, setError] = useState("");
    const [modal, setModal] = useState(null);
    const guardando = Boolean(progreso);
    const volver = () => navigate(editar ? `/admin/plantas/${id}` : "/admin/plantas");
    const cambiar = e => setFormulario(actual => ({ ...actual, [e.target.name]: e.target.value }));
    const reemplazar = (setter, clave, datos) => setter(actual => actual.map(r => r.clave === clave ? { ...r, ...datos } : r));

    // Guardar la planta y sus relaciones sin repetir registros confirmados
    const guardar = async e => {
        e.preventDefault();
        if (guardando || modal) return;
        setError("");
        const datos = Object.fromEntries(Object.entries(formulario).map(([k, v]) => [k, v.trim()]));
        if (Object.values(datos).some(v => !v) || !tamanos.includes(datos.size) || cuidados.some(c => !c.descripcion.trim())) { setError("Completa los campos obligatorios y selecciona un tamaño válido."); return; }
        let plantaId = id;
        try {
            setProgreso("Guardando información general...");
            if (!plantaId) {
                const respuesta = await crearPlanta({ ...datos, ...(sugerencia?.id ? { sugerencia_ia_id: sugerencia.id } : {}) });
                if (!respuesta?.id) throw new Error("No se confirmó el registro. Verifica el catálogo antes de reintentar.");
                plantaId = respuesta.id;
                setId(plantaId);
            } else if (editar) await actualizarPlanta(plantaId, datos);
            let principalId = imagenes.find(i => i.clave === principal)?.id;
            for (const imagen of [...imagenes].sort((a, b) => Number(b.clave === principal) - Number(a.clave === principal))) {
                if (imagen.id) continue;
                setProgreso(`Subiendo ${imagen.nombre_archivo}...`);
                const archivo = new FormData();
                archivo.append("imagen", imagen.archivo);
                const respuesta = await agregarImagenPlanta(plantaId, archivo);
                if (!respuesta?.imagen?.id) throw new Error("No se confirmó la imagen. Verifica el catálogo antes de reintentar.");
                reemplazar(setImagenes, imagen.clave, { ...respuesta.imagen, archivo: null });
                if (imagen.clave === principal) principalId = respuesta.imagen.id;
            }
            if (principalId) {
                setProgreso("Estableciendo imagen principal...");
                await establecerImagenPrincipalPlanta(plantaId, principalId);
                setImagenes(actual => actual.map(i => ({ ...i, es_principal: i.id === principalId })));
            }
            for (const cuidado of cuidados) {
                if (cuidado.id && !editar) continue;
                setProgreso(`Guardando ${cuidado.tipo}...`);
                const datos = datosCuidado(cuidado);
                if (cuidado.id) await actualizarCuidado(cuidado.id, datos);
                else {
                    const respuesta = await crearCuidado({ ...datos, plant_id: Number(plantaId) });
                    if (!respuesta?.cuidado?.id) throw new Error("No se confirmó el cuidado. Verifica el catálogo antes de reintentar.");
                    reemplazar(setCuidados, cuidado.clave, respuesta.cuidado);
                }
            }
            navigate("/admin/plantas", { replace: true, state: { mensaje: editar ? "Planta actualizada correctamente." : "Planta registrada correctamente." } });
        } catch (e) { setError(`${e.message || "No se pudo guardar."}${plantaId ? " Algunos cambios pueden estar guardados." : ""}`); }
        finally { setProgreso(""); }
    };

    // Confirmar la eliminación de registros existentes
    const quitar = (tipo, registro) => { setError(""); setModal({ tipo, registro }); };
    const confirmar = async () => {
        if (modal.tipo === "salir") { volver(); return; }
        const { tipo, registro } = modal;
        setProgreso("Eliminando..."); setError("");
        try {
            if (tipo === "imagen") {
                if (registro.id) await eliminarImagenPlanta(id, registro.id);
                const restantes = imagenes.filter(i => i.clave !== registro.clave);
                if (registro.es_principal) {
                    const siguiente = restantes.filter(i => i.id).sort((a, b) => a.id - b.id)[0];
                    restantes.forEach(i => { i.es_principal = i.clave === siguiente?.clave; });
                }
                setImagenes(restantes);
                if (principal === registro.clave) setPrincipal(restantes.find(i => i.es_principal)?.clave || restantes[0]?.clave || null);
            } else {
                if (registro.id) await eliminarCuidado(registro.id);
                setCuidados(actual => actual.filter(c => c.clave !== registro.clave));
            }
            setModal(null);
        } catch (e) { setError(e.message || "No se pudo eliminar."); }
        finally { setProgreso(""); }
    };
    const salir = () => { setError(""); setModal({ tipo: "salir" }); };
    return <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
        <button type="button" disabled={guardando} onClick={salir} className="flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={19} /> {editar ? "Volver al detalle" : "Volver al catálogo"}</button>
        <header><h1 className="font-lora text-3xl font-bold text-forest-dark">{editar ? "Editar planta" : "Registrar nueva planta"}</h1><p className="mt-2 text-sm text-secondary">{editar ? `Actualiza la información de ${planta.nombre_comun}.` : "Una nueva semilla para nuestro catálogo natural."}</p></header>
        {sugerencia && <p className="flex gap-3 rounded-xl bg-pale p-4 text-sm text-forest"><Sparkles size={22} /> Sugerencia del asistente IA. Revisa los datos precargados.</p>}
        {!editar && id && <p className="rounded-xl bg-warning-light p-4 text-sm text-warning">La planta ya está registrada. Puedes completar las imágenes y cuidados pendientes.</p>}
        <form onSubmit={guardar} className="space-y-6">
            <section className="rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7">
                <h2 className="mb-6 flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><Sprout className="text-primary" /> Información general</h2>
                <fieldset disabled={guardando || (!editar && !!id)} className="grid gap-5 sm:grid-cols-2 text-sm font-bold text-forest-dark">
                    {campos.map(([nombre, label, max]) => <label key={nombre}>{label} *<input name={nombre} value={formulario[nombre]} onChange={cambiar} maxLength={max} required className={input} /></label>)}
                    <label>Tamaño *<select name="size" value={formulario.size} onChange={cambiar} required className={input}><option value="">Selecciona un tamaño</option>{tamanos.map(t => <option key={t}>{t}</option>)}</select></label>
                    <label className="sm:col-span-2">Descripción *<textarea name="descripcion" value={formulario.descripcion} onChange={cambiar} required rows={5} className={input} /></label>
                </fieldset>
            </section>
            <GaleriaImagenes {...{ imagenes, setImagenes, principal, setPrincipal, quitar, guardando, editar }} />
            <FormularioCuidados {...{ cuidados, setCuidados, quitar, guardando, editar }} />
            {error && !modal && <p role="alert" className="flex gap-2 rounded-xl bg-danger-light p-4 text-sm text-danger"><AlertCircle size={20} className="shrink-0" />{error}</p>}
            {progreso && <p role="status" className="flex gap-2 rounded-xl bg-pale p-4 text-sm text-forest"><LoaderCircle className="animate-spin" size={20} />{progreso}</p>}
            <div className="flex justify-end gap-3"><button type="button" disabled={guardando} onClick={salir} className="rounded-xl border border-border px-5 py-3 text-sm font-bold">Cancelar</button><button type="submit" disabled={guardando} className="flex items-center gap-2 rounded-xl bg-forest px-6 py-3 text-sm font-bold text-white disabled:opacity-50"><Save size={18} />{guardando ? "Guardando..." : editar ? "Guardar cambios" : id ? "Completar registro" : "Registrar planta"}</button></div>
        </form>
        {modal && <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="titulo-modal" className="w-full max-w-md space-y-5 rounded-florae bg-surface p-7 shadow-xl">
            <h2 id="titulo-modal" className="font-lora text-2xl font-bold text-forest-dark">{modal.tipo === "salir" ? "¿Salir del formulario?" : `Eliminar ${modal.tipo}`}</h2>
            <p className="text-sm text-secondary">{modal.tipo === "salir" ? "Perderás los cambios pendientes. Los registros ya guardados se conservarán." : "¿Deseas eliminar este registro? Si ya está guardado, se eliminará inmediatamente."}</p>
            {error && <p role="alert" className="rounded-xl bg-danger-light p-3 text-sm text-danger">{error}</p>}
            <div className="flex justify-end gap-3"><button disabled={guardando} onClick={() => { setModal(null); setError(""); }} className="rounded-xl border border-border px-4 py-3 text-sm font-bold">Cancelar</button><button disabled={guardando} onClick={confirmar} className="rounded-xl bg-danger px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{guardando ? "Eliminando..." : modal.tipo === "salir" ? "Salir" : "Eliminar"}</button></div>
        </div></div>}
    </div>;
}
