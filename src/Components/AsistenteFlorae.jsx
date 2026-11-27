import { consultarAsistenteIAConCreditos } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { useCreditosStore } from "../store/useCreditosStore";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, X, Sparkles } from "lucide-react";
import feliz from "../assets/mascota-florae-feliz.png";
import preocupada from "../assets/mascota-florae-preocupada.png";
import regando from "../assets/mascota-florae-regando.png";
import celebrando from "../assets/mascota-florae-celebrando.png";

const imagenes = {
  disponible: feliz,
  pensando: preocupada,
  consejo: regando,
  preocupada,
  celebrando,
};

const animaciones = {
  disponible: "animate-[bounce_3s_ease-in-out_infinite]",
  pensando: "animate-pulse",
  consejo: "animate-[bounce_1.8s_ease-in-out_infinite]",
  preocupada: "animate-pulse",
  celebrando: "animate-bounce",
};

export default function AsistenteFlorae() {
  const token = useAuthStore((state) => state.token);
  return token ? <ChatFlorae key={token} token={token} /> : null;
}

function ChatFlorae({ token }) {
  const { creditos, cargando, error: errorCreditos, consultar, actualizar } = useCreditosStore();
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState("disponible");
  const [texto, setTexto] = useState("");
  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      autor: "florae",
      texto: "¡Hola! Soy tu asistente Florae 🌱 ¿En qué puedo ayudarte con tus plantas?",
    },
  ]);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const finalRef = useRef(null);
  const timerRef = useRef(null);
  const siguienteId = useRef(2);

  const bloqueado = ocupado || cargando || !creditos?.puede_consultar || !!errorCreditos;

  useEffect(() => {
    if (abierto) consultar();
  }, [abierto, consultar]);

  const crearMensaje = (autor, contenido) => ({
    id: siguienteId.current++,
    autor,
    texto: contenido,
  });

  useEffect(() => {
    if (abierto) {
      finalRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [mensajes, ocupado, abierto, error]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!abierto) return;

    const cerrar = (evento) => {
      if (evento.key === "Escape") setAbierto(false);
    };

    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierto]);

  const mostrarEstadoTemporal = (nuevoEstado, duracion = 2200) => {
    clearTimeout(timerRef.current);
    setEstado(nuevoEstado);

    timerRef.current = setTimeout(() => {
      setEstado("disponible");
    }, duracion);
  };

  const enviar = async (evento) => {
    evento.preventDefault();

    const pregunta = texto.trim();
    if (!pregunta || bloqueado) return;

    setTexto("");
    setError("");

    setMensajes((actuales) => [
      ...actuales,
      crearMensaje("usuario", pregunta),
    ]);

    setOcupado(true);
    clearTimeout(timerRef.current);
    setEstado("pensando");

    try {
      const respuesta = await consultarAsistenteIAConCreditos(pregunta);
      if (token !== useAuthStore.getState().token) return;
      if (respuesta.creditos) actualizar(respuesta.creditos, token);
      else await consultar();

      const contenido =
        typeof respuesta === "string"
          ? respuesta
          : respuesta?.respuesta ?? respuesta?.mensaje;

      if (typeof contenido !== "string" || !contenido.trim()) {
        throw new Error("El asistente no devolvió una respuesta válida.");
      }

      setMensajes((actuales) => [
        ...actuales,
        crearMensaje("florae", contenido),
      ]);

      const consultaSobreProblemas =
        /plaga|enferm|amarill|mancha|hongo|marchit/i.test(pregunta);

      mostrarEstadoTemporal(
        consultaSobreProblemas ? "preocupada" : "consejo"
      );
    } catch (err) {
      if (token !== useAuthStore.getState().token) return;
      if (err.creditos) actualizar(err.creditos, token);
      else await consultar();
      setError(
        err?.message ||
          "No se pudo consultar el asistente. Inténtalo nuevamente."
      );

      mostrarEstadoTemporal("preocupada");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[900] font-['Nunito_Sans'] sm:bottom-7 sm:right-7">
      {abierto && (
        <section
          role="dialog"
          aria-label="Asistente Florae"
          className="mb-4 flex h-[min(600px,calc(100dvh-125px))] w-[calc(100vw-40px)] max-w-[390px] flex-col overflow-hidden rounded-[24px] border border-[#DDE4D8] bg-white shadow-[0_15px_50px_rgba(47,75,47,0.13)]"
        >
          <header className="flex shrink-0 items-center gap-3 bg-[#E9EEE5] px-4 py-3">
            <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full bg-white/70">
              <img
                src={imagenes[estado]}
                alt="Mascota de Florae"
                className={`h-[57px] w-[57px] object-contain ${animaciones[estado]}`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-['Lora'] text-[18px] font-bold text-[#3F5D3F]">
                Asistente Florae
              </h2>

              <p className="text-xs text-[#63775E]">
                {ocupado
                  ? "Pensando en tu consulta..."
                  : "Tu compañero de jardín"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar asistente"
              className="rounded-full p-2 text-[#3F5D3F] transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3F5D3F]"
            >
              <X size={21} />
            </button>
          </header>

          <div className="shrink-0 border-b border-[#DDE4D8] px-4 py-3" aria-live="polite">
            {cargando ? (
              <div className="animate-pulse space-y-2" aria-label="Consultando créditos">
                <div className="h-4 w-2/3 rounded bg-[#E9EEE5]" />
                <div className="h-2 rounded bg-[#E9EEE5]" />
              </div>
            ) : errorCreditos ? (
              <div className="text-xs text-red-700">
                {errorCreditos}
                <button type="button" onClick={consultar} className="ml-2 underline">Reintentar</button>
              </div>
            ) : creditos && (
              <>
                <div className="flex justify-between text-xs font-semibold text-[#3F5D3F]">
                  <span>Plan {creditos.plan}</span>
                  <span>{creditos.creditos_disponibles}/{creditos.creditos_totales} créditos</span>
                </div>
                <div className="my-2 h-2 overflow-hidden rounded-full bg-[#E9EEE5]">
                  <div className="h-full rounded-full bg-[#82977C] transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, creditos.creditos_disponibles / (creditos.creditos_totales || 1) * 100))}%` }} />
                </div>
                <p className="text-[11px] text-[#63775E]">
                  Fin del período: {new Date(`${creditos.fecha_vencimiento}T00:00:00`).toLocaleDateString("es-CO")}
                </p>
                {!creditos.puede_consultar && (
                  <p className="mt-2 text-xs text-red-700">Has agotado tus créditos de IA. Puedes seguir leyendo tus mensajes.</p>
                )}
              </>
            )}
          </div>

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-[#F8F7F3] px-4 py-5"
            aria-live="polite"
          >
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`flex items-start gap-2 ${
                  mensaje.autor === "usuario"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {mensaje.autor === "florae" && <img src={feliz} alt="" className="h-7 w-7 shrink-0 rounded-full bg-[#E9EEE5] object-contain" />}
                <div
                  className={`min-w-0 max-w-[85%] whitespace-pre-wrap break-words rounded-[18px] px-4 py-3 text-sm leading-6 shadow-sm ${
                    mensaje.autor === "usuario"
                      ? "rounded-br-[5px] bg-[#E0E9D9] text-[#3F5D3F]"
                      : "rounded-bl-[5px] border border-[#E6EAE1] bg-white text-[#303B30]"
                  }`}
                >
                  {mensaje.autor === "florae" ? (
                    <div className="whitespace-normal [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-bold [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_a]:text-[#3F5D3F] [&_a]:underline">
                      <ReactMarkdown
                        skipHtml
                        disallowedElements={["img"]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                          ),
                        }}
                      >
                        {mensaje.texto}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    mensaje.texto
                  )}
                </div>
              </div>
            ))}

            {ocupado && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1.5 rounded-[18px] bg-white px-4 py-3 shadow-sm"
                  aria-label="Florae está pensando"
                >
                  {[0, 1, 2].map((indice) => (
                    <span
                      key={indice}
                      className="h-2 w-2 animate-bounce rounded-full bg-[#82977C]"
                      style={{
                        animationDelay: `${indice * 160}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <div ref={finalRef} />
          </div>

          <form
            onSubmit={enviar}
            className="flex shrink-0 items-center gap-2 border-t border-[#E5E7EB] bg-white px-3 py-3"
          >
            <input
              type="text"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder={creditos?.puede_consultar === false ? "Sin créditos disponibles" : "Pregunta sobre tus plantas..."}
              aria-label="Escribe tu consulta"
              disabled={bloqueado}
              className="min-w-0 flex-1 rounded-xl border border-[#DDE4D8] bg-[#F8F7F3] px-3 py-3 text-sm text-[#303B30] outline-none transition placeholder:text-[#889187] focus:border-[#82977C] disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!texto.trim() || bloqueado}
              aria-label="Enviar mensaje"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#526B4D] text-white transition hover:bg-[#435A40] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={19} />
            </button>
          </form>

          <p className="shrink-0 bg-white px-4 pb-3 text-center text-[10px] text-[#777777]">
            Las respuestas de IA pueden contener errores. Verifica los
            cuidados importantes.
          </p>
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAbierto((actual) => !actual)}
          aria-label={
            abierto ? "Cerrar chat Florae" : "Abrir asistente Florae"
          }
          aria-expanded={abierto}
          className="group relative flex h-[76px] w-[76px] items-center justify-center rounded-full border-[3px] border-white bg-[#E9EEE5] shadow-[0_7px_22px_rgba(47,75,47,0.18)] transition duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F5D3F]"
        >
          <img
            src={imagenes[estado]}
            alt=""
            className={`h-[67px] w-[67px] object-contain ${animaciones[estado]}`}
          />

          {!abierto && (
            <span className="pointer-events-none absolute bottom-full right-0 mb-3 hidden whitespace-nowrap rounded-xl bg-[#3F5D3F] px-3 py-2 text-xs font-semibold text-white shadow-md sm:block">
              <Sparkles size={13} className="mr-1 inline" />
              ¿Necesitas ayuda?
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
