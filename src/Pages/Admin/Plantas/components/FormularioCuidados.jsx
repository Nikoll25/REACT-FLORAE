import { HeartHandshake, Plus, Trash2, Leaf, CheckCircle2 } from "lucide-react";
import gota from "../../../../assets/riegoazul.png";
import sol from "../../../../assets/sun (3).png";
import temperatura from "../../../../assets/temperatura2.png";
import fertilizante from "../../../../assets/fertilizacionverde.png";

const tipos = { Riego: [gota, "bg-info-light"], Luz: [sol, "bg-warning-light"], Temperatura: [temperatura, "bg-danger-light"], Fertilización: [fertilizante, "bg-success-light"] };
const normalizar = texto => String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const input = "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-60";

export default function FormularioCuidados({ cuidados, setCuidados, quitar, guardando, editar }) {
    const disponibles = Object.keys(tipos).filter(tipo => !cuidados.some(c => normalizar(c.tipo) === normalizar(tipo)));
    const cambiar = (clave, campo, valor) => setCuidados(actual => actual.map(c => c.clave === clave ? { ...c, [campo]: valor } : c));
    return <section className="rounded-florae border border-border bg-surface p-5 shadow-florae sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h2 className="flex items-center gap-3 font-lora text-xl font-bold text-forest-dark"><HeartHandshake className="text-primary" /> Guía de cuidados</h2><button type="button" disabled={guardando || !disponibles.length} onClick={() => setCuidados(actual => [...actual, { clave: crypto.randomUUID(), tipo: disponibles[0], descripcion: "", frecuencia_dias: "" }])} className="flex items-center gap-2 rounded-xl bg-pale px-4 py-3 text-sm font-bold text-forest disabled:opacity-50"><Plus size={18} /> Agregar cuidado</button></div>
        {!cuidados.length && <p className="rounded-xl bg-soft p-8 text-center text-sm text-secondary">Cada planta necesita amor. Agrega sus cuidados.</p>}
        <div className="grid gap-4 lg:grid-cols-2">{cuidados.map(c => {
            const config = tipos[Object.keys(tipos).find(t => normalizar(t) === normalizar(c.tipo))];
            return <article key={c.clave} className="space-y-4 rounded-2xl border border-border bg-soft p-5">
                <div className="flex items-center gap-3"><div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config?.[1] || "bg-pale"}`}>{config ? <img src={config[0]} alt="" className="h-7 w-7 object-contain" /> : <Leaf size={23} />}</div><h3 className="flex-1 font-lora text-lg font-bold text-forest-dark">{c.tipo}</h3>{editar || !c.id ? <button type="button" disabled={guardando} aria-label="Eliminar cuidado" onClick={() => quitar("cuidado", c)} className="rounded-xl bg-danger-light p-2.5 text-danger"><Trash2 size={18} /></button> : <CheckCircle2 className="text-success" />}</div>
                <fieldset disabled={guardando || (!editar && !!c.id)} className="space-y-4">
                    <label className="block text-sm font-bold text-forest-dark">Tipo de cuidado *<select value={c.tipo} disabled={!!c.id} onChange={e => cambiar(c.clave, "tipo", e.target.value)} className={`${input} mt-2`}>{[c.tipo, ...disponibles].map(t => <option key={t}>{t}</option>)}</select></label>
                    <label className="block text-sm font-bold text-forest-dark">Descripción *<textarea required rows={4} value={c.descripcion} onChange={e => cambiar(c.clave, "descripcion", e.target.value)} className={`${input} mt-2 font-normal`} /></label>
                    <label className="block text-sm font-bold text-forest-dark">Frecuencia en días<input type="number" min="1" step="1" value={c.frecuencia_dias ?? ""} onChange={e => cambiar(c.clave, "frecuencia_dias", e.target.value)} placeholder="Sin frecuencia específica" className={`${input} mt-2 font-normal`} /></label>
                </fieldset>
            </article>;
        })}</div>
    </section>;
}
