import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Wallet, Receipt, CalendarDays, CreditCard, UserRound, Crown, CalendarCheck, ChevronRight, AlertCircle, Info, Copy, Check, Sprout } from "lucide-react";
import { obtenerPagoAdmin } from "../../../services/adminApi";

const formatearPrecio = (precio) => Number(precio).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString("es-CO", { timeZone: "America/Bogota" }) : "—";
const formatearHora = (fecha) => fecha ? new Date(fecha).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/Bogota" }) : "—";
const metodos = { pse: "PSE", tarjeta: "Tarjeta", nequi: "Nequi", daviplata: "Daviplata" };

function EncabezadoTarjeta({ icono: Icono, titulo, estilo }) {
    return (
        <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${estilo}`}><Icono size={21} strokeWidth={1.7} /></div>
            <h2 className="font-lora text-lg font-bold text-forest-dark">{titulo}</h2>
        </div>
    );
}

function DetallePago() {
    const { id } = useParams();
    const [pago, setPago] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);
    const [copiado, setCopiado] = useState(false);
    const [errorCopia, setErrorCopia] = useState("");

    // Consultar el detalle del pago
    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setError("");
        setCopiado(false);
        setErrorCopia("");

        const consultar = async () => {
            try {
                const respuesta = await obtenerPagoAdmin(id);
                if (!respuesta.pago) throw new Error("No se encontró la información del pago.");
                if (vigente) setPago(respuesta.pago);
            } catch (error) {
                if (vigente) setError(error.message || "No se pudo consultar el pago.");
            } finally {
                if (vigente) setCargando(false);
            }
        };

        consultar();
        return () => { vigente = false; };
    }, [id, recarga]);

    useEffect(() => {
        if (!copiado) return;
        const tiempo = setTimeout(() => setCopiado(false), 2500);
        return () => clearTimeout(tiempo);
    }, [copiado]);

    // Copiar la referencia del pago
    const copiarReferencia = async () => {
        setErrorCopia("");
        try {
            await navigator.clipboard.writeText(pago.referencia_pago);
            setCopiado(true);
        } catch {
            setErrorCopia("No se pudo copiar la referencia. Puedes seleccionarla y copiarla manualmente.");
        }
    };

    const suscripcion = pago?.suscripcion;
    const usuario = suscripcion?.user;
    const plan = suscripcion?.plan;
    const simulado = pago?.referencia_pago?.startsWith("SIM-");

    return (
        <div className="min-w-0 animate-fade-in space-y-5 font-nunito">
            <Link to="/admin/pagos" className="inline-flex items-center gap-2 text-sm font-bold text-forest transition hover:text-primary"><ArrowLeft size={19} /> Volver a pagos</Link>

            {cargando ? (
                <div className="animate-pulse space-y-5">
                    <div className="h-32 rounded-2xl bg-[#E3E6C7]" />
                    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
                        <div className="h-10 w-44 rounded-lg bg-pale" />
                        <div className="h-12 w-48 rounded-lg bg-pale" />
                        <div className="grid grid-cols-2 gap-4"><div className="h-20 rounded-xl bg-pale" /><div className="h-20 rounded-xl bg-pale" /></div>
                        <div className="h-16 rounded-xl bg-pale" />
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="h-52 rounded-2xl bg-pale" />
                        <div className="h-52 rounded-2xl bg-pale" />
                    </div>
                </div>
            ) : error || !pago ? (
                <div role="alert" className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center">
                    <AlertCircle size={45} strokeWidth={1.5} className="text-danger" />
                    <h2 className="font-lora text-xl font-bold text-forest-dark">No pudimos consultar el pago</h2>
                    <p className="text-sm text-secondary">{error || "El pago no está disponible."}</p>
                    <button type="button" onClick={() => setRecarga((actual) => actual + 1)} className="rounded-xl bg-forest px-5 py-2.5 text-sm font-bold text-white">Reintentar</button>
                </div>
            ) : (
                <>
                    {/* Encabezado */}
                    <section className="relative isolate flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#C8CEA1] bg-linear-to-r from-[#F4F5E9] to-[#E3E6C7] px-6 py-5">
                        <div className="relative z-10">
                            <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#747D40]"><Receipt size={16} /> Detalle de transacción</div>
                            <h1 className="font-lora text-3xl font-bold text-forest-dark">Pago #{pago.id}</h1>
                            <p className="mt-2 text-sm text-secondary">Consulta la información del pago registrado en Florae.</p>
                        </div>
                        <div className="relative hidden h-24 w-28 shrink-0 items-center justify-center sm:flex">
                            <div className="absolute h-24 w-24 rounded-full border border-[#C8CEA1] bg-white/35" />
                            <Receipt size={60} strokeWidth={1.2} className="relative text-[#747D40]" />
                            <div className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-[#C8CEA1] bg-[#F4F5E9]"><Sprout size={20} className="text-[#747D40]" /></div>
                        </div>
                    </section>

                    {/* Información del pago */}
                    <article className="rounded-2xl border border-border bg-surface p-5 shadow-florae">
                        <EncabezadoTarjeta icono={Wallet} titulo="Información del pago" estilo="bg-[#E3E6C7] text-[#747D40]" />

                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#C8CEA1] bg-[#F4F5E9] p-5">
                            <div>
                                <p className="text-sm font-semibold text-[#747D40]">Monto registrado</p>
                                <p className="mt-2 font-lora text-4xl font-bold text-forest-dark">{formatearPrecio(pago.monto)} <span className="font-nunito text-sm font-bold text-secondary">COP</span></p>
                            </div>
                            {simulado && <span className="inline-flex items-center gap-2 rounded-full bg-info-light px-3 py-2 text-xs font-bold text-info"><Info size={15} /> Pago simulado</span>}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-border bg-soft p-4">
                                <CreditCard size={22} className="mb-2 text-[#747D40]" />
                                <p className="text-xs font-semibold text-secondary">Método de pago</p>
                                <p className="mt-1 text-lg font-bold text-forest-dark">{metodos[pago.metodo_pago] || pago.metodo_pago}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-soft p-4">
                                <CalendarDays size={22} className="mb-2 text-[#747D40]" />
                                <p className="text-xs font-semibold text-secondary">Fecha del pago</p>
                                <p className="mt-1 text-lg font-bold text-forest-dark">{formatearFecha(pago.fecha_pago)}</p>
                                <p className="mt-1 text-xs text-secondary">{formatearHora(pago.fecha_pago)}</p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-border bg-soft p-4">
                            <p className="mb-2 text-xs font-semibold text-secondary">Referencia de la transacción</p>
                            <div className="flex items-center justify-between gap-3">
                                <p className="min-w-0 select-all break-all text-sm font-bold text-forest-dark">{pago.referencia_pago || "Sin referencia"}</p>
                                {pago.referencia_pago && <button type="button" onClick={copiarReferencia} title="Copiar referencia" aria-label="Copiar referencia" className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-bold text-forest hover:bg-pale">{copiado ? <Check size={16} /> : <Copy size={16} />}{copiado ? "Copiado" : "Copiar"}</button>}
                            </div>
                            {errorCopia && <p role="alert" className="mt-2 text-xs text-danger">{errorCopia}</p>}
                        </div>
                    </article>

                    <div className="grid gap-5 md:grid-cols-2">
                        {/* Usuario asociado */}
                        <article className="rounded-2xl border border-border bg-surface p-5 shadow-florae">
                            <EncabezadoTarjeta icono={UserRound} titulo="Información del usuario" estilo="bg-[#C5D9E9] text-[#4C7593]" />
                            <div className="flex items-center gap-4 rounded-xl bg-soft p-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#C5D9E9] text-[#4C7593]">
                                    {usuario?.imagen_url ? <img src={usuario.imagen_url} alt="" className="h-full w-full object-cover" /> : <UserRound size={32} strokeWidth={1.5} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-lora text-lg font-bold text-forest-dark">{usuario?.nombre || "Usuario no disponible"}</p>
                                    <p className="mt-1 break-all text-sm text-secondary">{usuario?.email || "—"}</p>
                                    {usuario && <p className="mt-1 text-xs text-muted">Usuario #{usuario.id}</p>}
                                </div>
                            </div>
                            {usuario && <Link to={`/admin/usuarios/${usuario.id}`} className="mt-4 flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-bold text-forest hover:bg-pale">Ver perfil del usuario <ChevronRight size={18} /></Link>}
                        </article>

                        {/* Suscripción asociada */}
                        <article className="rounded-2xl border border-border bg-surface p-5 shadow-florae">
                            <EncabezadoTarjeta icono={CalendarCheck} titulo="Suscripción asociada" estilo="bg-[#D6DAEF] text-[#58658F]" />
                            {suscripcion ? (
                                <>
                                    <div className="rounded-xl bg-soft p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="inline-flex items-center gap-2 rounded-full bg-warning-light px-3 py-1.5 text-sm font-bold text-warning"><Crown size={17} /> {plan?.nombre || "Plan no disponible"}</span>
                                            <span className="text-xs font-bold text-secondary">#{suscripcion.id}</span>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-secondary">Fecha de inicio</p>
                                                <p className="mt-1 text-sm font-bold text-forest-dark">{formatearFecha(suscripcion.fecha_inicio)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-secondary">Vencimiento</p>
                                                <p className="mt-1 text-sm font-bold text-forest-dark">{formatearFecha(suscripcion.fecha_vencimiento)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Link to={`/admin/suscripciones/${suscripcion.id}`} className="mt-4 flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-bold text-forest hover:bg-pale">Ver detalle de la suscripción <ChevronRight size={18} /></Link>
                                </>
                            ) : <p className="rounded-xl bg-soft p-4 text-sm text-secondary">La suscripción asociada no está disponible.</p>}
                        </article>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-[#C8CEA1] bg-[#F4F5E9] p-4 text-sm text-[#747D40]">
                        <Info size={21} className="shrink-0" />
                        <p>El monto registrado corresponde al precio del plan al momento de realizar el pago. Las modificaciones posteriores del precio no afectan esta transacción. Los pagos de Florae son simulados.</p>
                    </div>
                </>
            )}
        </div>
    );
}

export default DetallePago;