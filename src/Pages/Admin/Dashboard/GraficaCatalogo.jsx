import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Sprout } from "lucide-react";

function GraficaCatalogo({ datos = [], cargando = false }) {
    const sinRegistros = datos.length > 0 && datos.every((mes) => mes.plantas === 0 && mes.plagas === 0);

    return (
        <section className="min-w-0 rounded-florae border border-border bg-surface p-6 shadow-florae">
            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pale text-forest">
                    <Sprout size={25} strokeWidth={1.7} />
                </div>
                <div>
                    <h3 className="font-lora text-xl font-bold text-forest-dark">Cultivando conocimiento</h3>
                    <p className="mt-1 text-sm text-secondary">Nuevos registros en el catálogo natural.</p>
                </div>
            </div>

            {cargando ? (
                <div className="h-[300px] animate-pulse rounded-2xl bg-pale" />
            ) : datos.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted">No hay información disponible.</div>
            ) : (
                <div className="relative h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={datos} barGap={5} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#DFE9D7" vertical={false} />
                            <XAxis dataKey="mes" tick={{ fill: "#84917F", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} domain={[0, (maximo) => Math.max(1, maximo)]} tick={{ fill: "#84917F", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: "#F5F7F1" }} contentStyle={{ borderRadius: "14px", border: "1px solid #DFE9D7", fontSize: "13px" }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "15px" }} />

                            <Bar dataKey="plantas" name="Plantas agregadas" fill="#89AB78" radius={[6, 6, 0, 0]} maxBarSize={30} animationDuration={1000} />
                            <Bar dataKey="plagas" name="Plagas agregadas" fill="#D4A19B" radius={[6, 6, 0, 0]} maxBarSize={30} animationDuration={1200} />
                        </BarChart>
                    </ResponsiveContainer>

                    {sinRegistros && (
                        <div className="pointer-events-none absolute inset-x-0 top-[35%] flex flex-col items-center gap-2 text-center">
                            <Sprout size={38} strokeWidth={1.2} className="text-primary" />
                            <p className="text-sm font-bold text-forest">Es momento de sembrar</p>
                            <p className="text-xs text-muted">Aún no hay nuevos registros en este periodo.</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default GraficaCatalogo;