import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarCheck, CalendarDays, Crown, UserRound, Sparkles, Wallet, Receipt, AlertCircle, ChevronRight } from "lucide-react";
import { obtenerSuscripcionAdmin } from "../../../services/adminApi";

const formatearFecha = (fecha) => fecha ? fecha.slice(0, 10).split("-").reverse().join("/") : "—";
const formatearPrecio = (precio) => Number(precio).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const metodosPago = { pse: "PSE", tarjeta: "Tarjeta", nequi: "Nequi", daviplata: "Daviplata" };

function EncabezadoTarjeta({ icono: Icono, titulo, estilo }) {
    return (
        <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${estilo}`}><Icono size={21} strokeWidth={1.7} /></div>
            <h2 className="font-lora text-lg font-bold text-forest-dark">{titulo}</h2>
        </div>
    );
}

function DetalleSuscripcion() {
    const { id } = useParams();
    const [suscripcion, setSuscripcion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);

    // Consultar el detalle de la suscripción
    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setError("");

        const consultar = async () => {
            try {
                const respuesta = await obtenerSuscripcionAdmin(id);
                if (!respuesta.suscripcion) throw new Error("No se encontró la información de la suscripción.");
                if (vigente) setSuscripcion(respuesta.suscripcion);
            } catch (error) {
                if (vigente) setError(error.message || "No se pudo consultar la suscripción.");
            } finally {
                if (vigente) setCargando(false);
            }
        };

        consultar();
        return () => { vigente = false; };
    }, [id, recarga]);

    const usuario = suscripcion?.user;
    const plan = suscripcion?.plan;
    const pagos = Array.isArray(suscripcion?.pagos) ? suscripcion.pagos : [];
    const activa = suscripcion?.estado === "activa";
    const consumidos = Number(suscripcion?.creditos_consumidos ?? 0);
    const limite = Number(plan?.creditos_mensuales ?? 0);
    const disponibles = Math.max(0, limite - consumidos);
    const porcentaje = limite > 0 ? Math.round(consumidos / limite * 100) : 0;
    const totalPagado = pagos.reduce((total, pago) => total + Number(pago.monto), 0);

    return (
        <div className="min-w-0 animate-fade-in space-y-5 font-nunito">
            <Link to="/admin/suscripciones" className="inline-flex items-center gap-2 text-sm font-bold text-forest transition hover:text-primary"><ArrowLeft size={19} /> Volver a suscripciones</Link>

            {cargando ? (
                <div className="animate-pulse space-y-5">
                    <div className="h-32 rounded-2xl bg-[#D6DAEF]/60" />
                    <div className="grid gap-5 md:grid-cols-2">
                        {Array.from({ length: 2 }, (_, indice) => (
                            <div key={indice} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
                                <div className="h-10 w-40 rounded-lg bg-pale" />
                                <div className="h-5 w-3/4 rounded bg-pale" />
                                <div className="h-4 w-1/2 rounded bg-pale" />
                                <div className="h-10 rounded-lg bg-pale" />
                            </div>
                        ))}
                    </div>
                    <div className="h-48 rounded-2xl bg-pale" />
                    <div className="h-48 rounded-2xl bg-pale" />
                </div>
            ) : error || !suscripcion ? (
                <div role="alert" className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center">
                    <AlertCircle size={45} strokeWidth={1.5} className="text-danger" />
                    <h2 className="font-lora text-xl font-bold text-forest-dark">No pudimos consultar la suscripción</h2>
                    <p className="text-sm text-secondary">{error || "La suscripción no está disponible."}</p>
                    <button type="button" onClick={() => setRecarga((actual) => actual + 1)} className="rounded-xl bg-forest px-5 py-2.5 text-sm font-bold text-white">Reintentar</button>
                </div>
            ) : (
                <>
                    {/* Encabezado */}
                    <section className="relative isolate flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#B7BFDD] bg-linear-to-r from-[#EEF0F9] to-[#D6DAEF] px-6 py-5">
                        <div className="relative z-10">
                            <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#58658F]"><CalendarCheck size={16} /> Detalle de membresía</div>
                            <h1 className="font-lora text-3xl font-bold text-forest-dark">Suscripción #{suscripcion.id}</h1>
                            <p className="mt-2 text-sm text-secondary">Información y seguimiento de la membresía {plan?.nombre || ""}.</p>
                        </div>
                        <div className="relative hidden h-24 w-28 shrink-0 items-center justify-center sm:flex">
                            <div className="absolute h-24 w-24 rounded-full border border-[#B7BFDD] bg-white/35" />
                            <CalendarCheck size={60} strokeWidth={1.2} className="relative text-[#58658F]" />
                        </div>
                    </section>

                    <div className="grid gap-5 md:grid-cols-2">
                        {/* Información del usuario */}
                        <article className="rounded-2xl border border-border bg-surface p-5 shadow-florae">
                            <EncabezadoTarjeta icono={UserRound} titulo="Información del usuario" estilo="bg-[#C5D9E9] text-[#4C7593]" />
                            <div className="flex items-center gap-4 rounded-xl bg-soft p-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#C5D9E9] text-[#4C7593]">
                                    {usuario?.imagen_url ? <img src={usuario.imagen_url} alt="" className="h-full w-full object-cover" /> : <UserRound size={32} strokeWidth={1.5} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-lora text-lg font-bold text-forest-dark">{usuario?.nombre || "Usuario no disponible"}</p>
                                    <p className="mt-1 break-all text-sm text-secondary">{usuario?.email || "—"}</p>
                                    <p className="mt-1 text-xs text-muted">Usuario #{suscripcion.usuario_id}</p>
                                </div>
                            </div>
                            {usuario && <Link to={`/admin/usuarios/${usuario.id}`} className="mt-4 flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-bold text-forest transition hover:bg-pale">Ver perfil del usuario <ChevronRight size={18} /></Link>}
                        </article>

                        {/* Información de la membresía */}
                        <article className="rounded-2xl border border-border bg-surface p-5 shadow-florae">
                            <EncabezadoTarjeta icono={Crown} titulo="Información de la membresía" estilo="bg-[#EADBB5] text-[#927238]" />
                            <div className="flex items-center justify-between gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full bg-warning-light px-3 py-1.5 text-sm font-bold text-warning"><Crown size={17} /> {plan?.nombre || "Plan no disponible"}</span>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${activa ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{activa ? "Activa" : "Vencida"}</span>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-border bg-soft p-3">
                                    <CalendarDays size={19} className="mb-2 text-forest" />
                                    <p className="text-xs text-secondary">Fecha de inicio</p>
                                    <p className="mt-1 text-sm font-bold text-forest-dark">{formatearFecha(suscripcion.fecha_inicio)}</p>
                                </div>
                                <div className="rounded-xl border border-border bg-soft p-3">
                                    <CalendarCheck size={19} className="mb-2 text-forest" />
                                    <p className="text-xs text-secondary">Fecha de vencimiento</p>
                                    <p className="mt-1 text-sm font-bold text-forest-dark">{formatearFecha(suscripcion.fecha_vencimiento)}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs leading-5 text-secondary">La renovación de la membresía es realizada manualmente por el usuario.</p>
                        </article>
                    </div>

                    {/* Créditos de inteligencia artificial */}
                    <article className="rounded-2xl border border-border bg-surface p-5 shadow-florae">
                        <EncabezadoTarjeta icono={Sparkles} titulo="Consumo de créditos IA" estilo="bg-[#DCE8D2] text-[#42663C]" />
                        {activa && plan ? (
                            <>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl border border-border bg-soft p-4">
                                        <p className="text-xs font-semibold text-secondary">Límite actual del plan</p>
                                        <p className="mt-2 font-lora text-3xl font-bold text-forest-dark">{limite}</p>
                                    </div>
                                    <div className="rounded-xl border border-[#DED4B8] bg-warning-light p-4">
                                        <p className="text-xs font-semibold text-warning">Créditos consumidos</p>
                                        <p className="mt-2 font-lora text-3xl font-bold text-warning">{consumidos}</p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-success-light p-4">
                                        <p className="text-xs font-semibold text-success">Créditos disponibles</p>
                                        <p className="mt-2 font-lora text-3xl font-bold text-forest">{disponibles}</p>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-secondary"><span>Progreso de consumo</span><span>{porcentaje}% utilizado</span></div>
                                    <div role="progressbar" aria-label="Consumo de créditos" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(porcentaje, 100)} className="h-2.5 overflow-hidden rounded-full bg-pale">
                                        <div style={{ width: `${Math.min(porcentaje, 100)}%` }} className="h-full rounded-full bg-linear-to-r from-[#89AB78] to-[#58765A] transition-all duration-500" />
                                    </div>
                                </div>
                                <p className="mt-3 text-xs text-secondary">Los créditos disponibles se calculan utilizando el límite actual del plan.</p>
                            </>
                        ) : (
                            <div className="rounded-xl border border-border bg-soft p-4">
                                <p className="text-sm font-semibold text-secondary">Créditos consumidos durante la suscripción</p>
                                <p className="mt-2 font-lora text-3xl font-bold text-forest-dark">{consumidos}</p>
                                <p className="mt-2 text-xs text-secondary">{activa ? "No se puede calcular el saldo porque el plan no está disponible." : "Esta membresía ha finalizado y ya no dispone de créditos."}</p>
                            </div>
                        )}
                    </article>

                    {/* Pagos asociados */}
                    <article className="rounded-2xl border border-border bg-surface p-5 shadow-florae">
                        <EncabezadoTarjeta icono={Wallet} titulo="Pagos asociados" estilo="bg-[#D6DAEF] text-[#58658F]" />
                        {pagos.length === 0 ? (
                            <div className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-soft p-5 text-center">
                                <Receipt size={38} strokeWidth={1.4} className="text-muted" />
                                <h3 className="font-lora text-base font-bold text-forest-dark">Sin pagos registrados</h3>
                                <p className="text-sm text-secondary">Esta suscripción no tiene pagos asociados.</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#B7BFDD] bg-[#EEF0F9] p-4">
                                    <div>
                                        <p className="text-xs font-semibold text-[#58658F]">Total pagado</p>
                                        <p className="mt-1 font-lora text-2xl font-bold text-forest-dark">{formatearPrecio(totalPagado)} COP</p>
                                    </div>
                                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#58658F]">{pagos.length} {pagos.length === 1 ? "pago registrado" : "pagos registrados"}</span>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-border">
                                    <table className="w-full min-w-[650px] text-left text-sm">
                                        <thead className="bg-soft text-xs font-extrabold uppercase text-forest">
                                            <tr>
                                                <th className="px-4 py-3">Referencia</th>
                                                <th className="px-4 py-3">Fecha</th>
                                                <th className="px-4 py-3">Método</th>
                                                <th className="px-4 py-3">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {pagos.map((pago) => (
                                                <tr key={pago.id}>
                                                    <td className="px-4 py-4">
                                                        <p className="max-w-60 break-all text-xs font-bold text-forest-dark">{pago.referencia_pago || "—"}</p>
                                                        {pago.referencia_pago?.startsWith("SIM-") && <span className="mt-1 inline-block rounded-full bg-[#EEF0F9] px-2 py-1 text-xs font-semibold text-[#58658F]">Pago simulado</span>}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-4 text-secondary">{formatearFecha(pago.fecha_pago)}</td>
                                                    <td className="px-4 py-4 text-secondary">{metodosPago[pago.metodo_pago] || pago.metodo_pago}</td>
                                                    <td className="whitespace-nowrap px-4 py-4 font-bold text-forest">{formatearPrecio(pago.monto)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </article>
                </>
            )}
        </div>
    );
}

export default DetalleSuscripcion;