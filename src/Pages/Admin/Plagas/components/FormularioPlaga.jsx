import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bug, Sparkles, Save, LoaderCircle, AlertCircle, ScanSearch } from "lucide-react";
import { crearPlaga, actualizarPlaga, agregarImagenPlaga, establecerImagenPrincipalPlaga, eliminarImagenPlaga } from "../../../../services/adminApi";
import GaleriaImagenes from "./GaleriaImagenes";

const campos = [["nombre_comun", "Nombre común", 100], ["nombre_cientifico", "Nombre científico", 150]];
const sintomas = ["sintoma_1", "sintoma_2", "sintoma_3", "sintoma_4"];
const input = "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";
const conClave = registros => (registros || []).map(r => ({ ...r, clave: String(r.id) }));

export default function FormularioPlaga({ plaga, sugerencia }) {
    const navigate = useNavigate();
    const editar = Boolean(plaga);
    const [id, setId] = useState(plaga?.id || null);
    const [formulario, setFormulario] = useState(() => Object.fromEntries([...campos.map(c => c[0]), "descripcion", ...sintomas].map(c => [c, plaga?.[c] ?? sugerencia?.[c] ?? ""])));
    const [imagenes, setImagenes] = useState(() => conClave(plaga?.imagenes));
    const [principal, setPrincipal] = useState(() => imagenes.find(i => i.es_principal)?.clave || imagenes[0]?.clave || null);
    const [progreso, setProgreso] = useState("");
    const [error, setError] = useState("");
    const [modal, setModal] = useState(null);

    const guardando = Boolean(progreso);
    const volver = () => navigate(editar ? `/admin/plagas/${id}` : "/admin/plagas");
    const cambiar = e => setFormulario(actual => ({ ...actual, [e.target.name]: e.target.value }));

    // Guardar la plaga y sus imágenes
    const guardar = async e => {
        e.preventDefault();
        if (guardando || modal) return;
        setError("");

        const datos = Object.fromEntries(Object.entries(formulario).map(([k, v]) => [k, String(v ?? "").trim()]));

        if (["nombre_comun", "nombre_cientifico", "descripcion", "sintoma_1"].some(c => !datos[c])) {
            setError("Completa todos los campos obligatorios.");
            return;
        }

        sintomas.slice(1).forEach(c => { datos[c] = datos[c] || null; });
        let plagaId = id;

        try {
            setProgreso("Guardando información general...");

            if (!plagaId) {
                const respuesta = await crearPlaga({ ...datos, ...(sugerencia?.id ? { sugerencia_ia_id: sugerencia.id } : {}) });
                if (!respuesta?.plaga?.id) throw new Error("No se confirmó el registro. Verifica el catálogo antes de reintentar.");
                plagaId = respuesta.plaga.id;
                setId(plagaId);
            } else if (editar) await actualizarPlaga(plagaId, datos);

            let principalId = imagenes.find(i => i.clave === principal)?.id;

            for (const imagen of [...imagenes].sort((a, b) => Number(b.clave === principal) - Number(a.clave === principal))) {
                if (imagen.id) continue;
                setProgreso(`Subiendo ${imagen.nombre_archivo}...`);

                const archivo = new FormData();
                archivo.append("imagen", imagen.archivo);
                const respuesta = await agregarImagenPlaga(plagaId, archivo);

                if (!respuesta?.imagen?.id) throw new Error("No se confirmó la imagen. Verifica el catálogo antes de reintentar.");

                setImagenes(actual => actual.map(i => i.clave === imagen.clave ? { ...i, ...respuesta.imagen, archivo: null } : i));
                if (imagen.clave === principal) principalId = respuesta.imagen.id;
            }

            if (principalId) {
                setProgreso("Estableciendo imagen principal...");
                await establecerImagenPrincipalPlaga(plagaId, principalId);
                setImagenes(actual => actual.map(i => ({ ...i, es_principal: i.id === principalId })));
            }

            navigate("/admin/plagas", { replace: true, state: { mensaje: editar ? "Plaga actualizada correctamente." : "Plaga registrada correctamente." } });
        } catch (e) {
            setError(`${e.message || "No se pudo guardar la plaga."}${plagaId ? " Algunos cambios pueden estar guardados." : ""}`);
            console.error("Error al guardar la plaga:", e);
        } finally { setProgreso(""); }
    };

    // Confirmar la eliminación de una imagen
    const quitar = (tipo, registro) => {
        setError("");
        setModal({ tipo, registro });
    };

    const confirmar = async () => {
        if (!modal || guardando) return;
        if (modal.tipo === "salir") { volver(); return; }

        const { registro } = modal;
        setProgreso("Eliminando imagen...");
        setError("");

        try {
            if (registro.id) await eliminarImagenPlaga(id, registro.id);

            let restantes = imagenes.filter(i => i.clave !== registro.clave);

            if (registro.es_principal) {
                const siguiente = restantes.filter(i => i.id).sort((a, b) => a.id - b.id)[0];
                restantes = restantes.map(i => ({ ...i, es_principal: i.clave === siguiente?.clave }));
            }

            setImagenes(restantes);

            if (principal === registro.clave) setPrincipal(restantes.find(i => i.es_principal)?.clave || restantes[0]?.clave || null);

            setModal(null);
        } catch (e) {
            setError(e.message || "No se pudo eliminar la imagen.");
            console.error("Error al eliminar la imagen:", e);
        } finally { setProgreso(""); }
    };

    const salir = () => { setError(""); setModal({ tipo: "salir" }); };

    return <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
        <button type="button" disabled={guardando} onClick={salir} className="flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={19} /> {editar ? "Volver al detalle" : "Volver al catálogo"}</button>

        <header>
            <h1 className="font-lora text-3xl font-bold text-forest-dark">{editar ? "Editar plaga" : "Registrar nueva plaga"}</h1>
            <p className="mt-2 text-sm text-secondary">{editar ? `Actualiza la información de ${plaga.nombre_comun}.` : "Amplía nuestro catálogo para proteger las plantas de nuestra comunidad."}</p>
        </header>

        {sugerencia && <p className="flex gap-3 rounded-xl bg-pale p-4 text-sm text-forest"><Sparkles size={22} /> Sugerencia del asistente IA. Revisa los datos precargados.</p>}

        {!editar && id && <p className="rounded-xl bg-warning-light p-4 text-sm text-warning">La plaga ya está registrada. Puedes completar las imágenes pendientes.</p>}

        <form onSubmit={guardar} className="space-y-6">
            {/* Información general */}
            <section className="rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7">
                <h2 className="mb-6 flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><Bug className="text-primary" /> Información general</h2>

                <fieldset disabled={guardando || (!editar && !!id)} className="grid gap-5 text-sm font-bold text-forest-dark sm:grid-cols-2">
                    {campos.map(([nombre, label, max]) => <label key={nombre}>{label} *<input name={nombre} value={formulario[nombre]} onChange={cambiar} maxLength={max} required className={input} /></label>)}

                    <label className="sm:col-span-2">Descripción *<textarea name="descripcion" value={formulario.descripcion} onChange={cambiar} required rows={5} className={input} /></label>
                </fieldset>
            </section>

            {/* Galería de imágenes */}
            <GaleriaImagenes {...{ imagenes, setImagenes, principal, setPrincipal, quitar, guardando, editar }} />

            {/* Síntomas de la plaga */}
            <section className="rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7">
                <h2 className="flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><ScanSearch className="text-primary" /> Síntomas principales</h2>
                <p className="mb-6 mt-2 text-sm text-secondary">Describe las señales que permiten identificar esta plaga.</p>

                <fieldset disabled={guardando || (!editar && !!id)} className="grid gap-5 sm:grid-cols-2">
                    {sintomas.map((nombre, indice) => <label key={nombre} className="rounded-2xl border border-border bg-soft p-4 text-sm font-bold text-forest-dark">
                        <span className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pale text-forest">{indice + 1}</span>Síntoma {indice + 1} {indice === 0 ? "*" : "(Opcional)"}</span>
                        <textarea name={nombre} value={formulario[nombre]} onChange={cambiar} maxLength={255} required={indice === 0} rows={3} placeholder="Describe el síntoma..." className={input} />
                        <span className="mt-1 block text-right text-xs font-normal text-muted">{String(formulario[nombre]).length}/255</span>
                    </label>)}
                </fieldset>
            </section>

            {error && !modal && <p role="alert" className="flex gap-2 rounded-xl bg-danger-light p-4 text-sm text-danger"><AlertCircle size={20} className="shrink-0" />{error}</p>}

            {progreso && <p role="status" className="flex gap-2 rounded-xl bg-pale p-4 text-sm text-forest"><LoaderCircle className="animate-spin" size={20} />{progreso}</p>}

            <div className="flex flex-wrap justify-end gap-3">
                <button type="button" disabled={guardando} onClick={salir} className="rounded-xl border border-border px-5 py-3 text-sm font-bold">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex items-center gap-2 rounded-xl bg-forest px-6 py-3 text-sm font-bold text-white transition hover:bg-forest-dark disabled:opacity-50"><Save size={18} />{guardando ? "Guardando..." : editar ? "Guardar cambios" : id ? "Completar registro" : "Registrar plaga"}</button>
            </div>
        </form>

        {/* Modal de confirmación */}
        {modal && <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal" className="w-full max-w-md space-y-5 rounded-florae bg-surface p-7 shadow-xl">
                <h2 id="titulo-modal" className="font-lora text-2xl font-bold text-forest-dark">{modal.tipo === "salir" ? "¿Salir del formulario?" : "Eliminar imagen"}</h2>
                <p className="text-sm leading-6 text-secondary">{modal.tipo === "salir" ? "Perderás los cambios pendientes. Los registros ya guardados se conservarán." : "¿Deseas eliminar esta imagen? Si ya está registrada, se eliminará inmediatamente."}</p>

                {error && <p role="alert" className="rounded-xl bg-danger-light p-3 text-sm text-danger">{error}</p>}

                <div className="flex justify-end gap-3">
                    <button type="button" disabled={guardando} onClick={() => { setModal(null); setError(""); }} className="rounded-xl border border-border px-4 py-3 text-sm font-bold">Cancelar</button>
                    <button type="button" disabled={guardando} onClick={confirmar} className="flex items-center gap-2 rounded-xl bg-danger px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{guardando && <LoaderCircle size={17} className="animate-spin" />}{guardando ? "Eliminando..." : modal.tipo === "salir" ? "Salir" : "Eliminar"}</button>
                </div>
            </div>
        </div>}
    </div>;
}