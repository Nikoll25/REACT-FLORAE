import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

function GraficaComunidad({ datos = [], cargando = false }) {
    return (
        <section className="min-w-0 rounded-florae border border-border bg-surface p-6 shadow-florae">
            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pale text-forest">
                    <TrendingUp size={25} strokeWidth={1.7} />
                </div>
                <div>
                    <h3 className="font-lora text-xl font-bold text-forest-dark">Seguimos creciendo</h3>
                    <p className="mt-1 text-sm text-secondary">Evolución de nuestra comunidad Florae.</p>
                </div>
            </div>

            {cargando ? (
                <div className="h-[300px] animate-pulse rounded-2xl bg-pale" />
            ) : datos.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted">No hay información disponible.</div>
            ) : (
                <div className="h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={datos} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#89AB78" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#89AB78" stopOpacity={0.02} />
                                </linearGradient>
                                <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#C1A064" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#C1A064" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="4 4" stroke="#DFE9D7" vertical={false} />
                            <XAxis dataKey="mes" tick={{ fill: "#84917F", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: "#84917F", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: "14px", border: "1px solid #DFE9D7", fontSize: "13px" }} labelStyle={{ color: "#254D2D", fontWeight: "bold" }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "15px" }} />

                            <Area type="monotone" dataKey="usuarios" name="Usuarios registrados" stroke="#709261" strokeWidth={3} fill="url(#colorUsuarios)" dot={{ r: 4, fill: "#709261", strokeWidth: 0 }} activeDot={{ r: 6 }} animationDuration={1000} />
                            <Area type="monotone" dataKey="premium" name="Usuarios que contrataron Premium" stroke="#C1A064" strokeWidth={2.5} strokeDasharray="6 4" fill="url(#colorPremium)" activeDot={{ r: 6 }} animationDuration={1200} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}

export default GraficaComunidad;