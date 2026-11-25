import { useEffect, useMemo, useRef, useState } from "react";
import { useJardinStore } from "../../store/useJardinStore";
import { obtenerActividadesPlanta, completarActividad } from "../../services/api";

const ZONA_HORARIA = "America/Bogota";
export const normalizar = (texto) =>
    String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

export const fechaLocal = (valor) => {
    if (!valor) return "";

    if (
        typeof valor === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {
        return valor;
    }

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
        return "";
    }

    const partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: ZONA_HORARIA,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(fecha);

    const obtener = (tipo) =>
        partes.find((parte) => parte.type === tipo)?.value;

    return [
        obtener("year"),
        obtener("month"),
        obtener("day"),
    ].join("-");
};

const hoyLocal = () => fechaLocal(new Date());

export const formatearFecha = (valor) => {
    if (!valor) return "";

    const [anio, mes, dia] = valor.split("-").map(Number);

    return new Intl.DateTimeFormat("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(anio, mes - 1, dia));
};

export const nombreCuidado = (actividad) =>
    actividad?.plant_care?.tipo || "Cuidado";
export const obtenerEstado = (actividad) => {
    if (
        actividad.estado === "completada" ||
        actividad.estado_visual === "completada"
    ) {
        return "completada";
    }

    if (actividad.estado_visual === "vencida") {
        return "vencida";
    }

    const fecha = fechaLocal(
        actividad.fecha_programada
    );

    if (fecha && fecha < hoyLocal()) {
        return "vencida";
    }

    return "pendiente";
};
export default function useCalendario() {
    const calendarioRef = useRef(null);
    const plantaActualRef = useRef(null);
    const plantasStore = useJardinStore(
        (state) => state.plantas
    );

    const cargarPlantas = useJardinStore(
        (state) => state.cargarPlantas
    );

    const plantas = Array.isArray(plantasStore)
        ? plantasStore
        : [];
    const [plantaSeleccionada, setPlantaSeleccionada] =
        useState(null);

    const [fechaSeleccionada, setFechaSeleccionada] =
        useState(hoyLocal());

    const [actividades, setActividades] =
        useState([]);

    const [seleccionadas, setSeleccionadas] =
        useState([]);

    const [cargandoPlantas, setCargandoPlantas] =
        useState(true);

    const [cargandoActividades, setCargandoActividades] =
        useState(false);

    const [enviando, setEnviando] =
        useState(false);

    const [mostrarPlantas, setMostrarPlantas] =
        useState(true);

    const [resultado, setResultado] =
        useState(null);

    const [error, setError] =
        useState("");
    useEffect(() => {
        let activo = true;

        const cargar = async () => {
            try {
                setCargandoPlantas(true);
                setError("");

                await cargarPlantas();

            } catch (error) {
                if (activo) {
                    setError(error.message);
                }
            } finally {
                if (activo) {
                    setCargandoPlantas(false);
                }
            }
        };

        cargar();

        return () => {
            activo = false;
        };
    }, [cargarPlantas]);
    useEffect(() => {
        if (!plantas.length) {
            setPlantaSeleccionada(null);
            return;
        }

        setPlantaSeleccionada((actual) => {
            const existe = plantas.some(
                (registro) =>
                    String(registro.id) === String(actual)
            );

            return existe
                ? actual
                : plantas[0].id;
        });

    }, [plantas]);
    useEffect(() => {
        plantaActualRef.current = plantaSeleccionada;

        setSeleccionadas([]);

        if (plantaSeleccionada == null) {
            setActividades([]);
            return;
        }

        let activo = true;

        const cargar = async () => {
            try {
                setCargandoActividades(true);
                setError("");
                setActividades([]);

                const respuesta =
                    await obtenerActividadesPlanta(
                        plantaSeleccionada
                    );

                if (!activo) return;

                setActividades(
                    Array.isArray(respuesta.actividades)
                        ? respuesta.actividades
                        : []
                );

            } catch (error) {
                if (!activo) return;

                setError(error.message);
                setActividades([]);

            } finally {
                if (activo) {
                    setCargandoActividades(false);
                }
            }
        };

        cargar();

        return () => {
            activo = false;
        };

    }, [plantaSeleccionada]);
    const eventos = useMemo(() => {
        return actividades
            .filter(
                (actividad) =>
                    actividad.fecha_programada
            )
            .map((actividad) => ({
                id: String(actividad.id),

                title: nombreCuidado(actividad),

                start: fechaLocal(
                    actividad.fecha_programada
                ),

                allDay: true,

                extendedProps: {
                    actividad,
                },
            }));

    }, [actividades]);
    const tareasDelDia = useMemo(() => {
        return actividades
            .filter(
                (actividad) =>
                    fechaLocal(
                        actividad.fecha_programada
                    ) === fechaSeleccionada
            )
            .sort((a, b) => {
                const orden = {
                    vencida: 0,
                    pendiente: 1,
                    completada: 2,
                };

                return (
                    orden[obtenerEstado(a)] -
                    orden[obtenerEstado(b)]
                );
            });

    }, [actividades, fechaSeleccionada]);

    const tareasDisponibles = tareasDelDia.filter(
        (actividad) =>
            obtenerEstado(actividad) !== "completada"
    );

    const todasSeleccionadas =
        tareasDisponibles.length > 0 &&
        tareasDisponibles.every(
            (actividad) =>
                seleccionadas.includes(actividad.id)
        );
    const alternarTarea = (id) => {
        if (enviando) return;

        setSeleccionadas((anteriores) =>
            anteriores.includes(id)
                ? anteriores.filter(
                    (actual) => actual !== id
                )
                : [...anteriores, id]
        );
    };
    const alternarTodas = () => {
        if (enviando) return;

        const ids = tareasDisponibles.map(
            (actividad) => actividad.id
        );

        setSeleccionadas((anteriores) =>
            todasSeleccionadas
                ? anteriores.filter(
                    (id) => !ids.includes(id)
                )
                : [...new Set([...anteriores, ...ids])]
        );
    };
    const enviarActividades = async () => {
        if (!seleccionadas.length || enviando) {
            return;
        }

        const ids = [...seleccionadas];
        const idPlanta = plantaSeleccionada;

        setEnviando(true);
        setError("");

        const respuestas = await Promise.allSettled(
            ids.map((id) =>
                completarActividad(id)
            )
        );

        const correctas = ids.filter(
            (_, indice) =>
                respuestas[indice].status === "fulfilled"
        );

        const fallidas = ids.filter(
            (_, indice) =>
                respuestas[indice].status === "rejected"
        );

        // Quitamos únicamente las completadas.
        setSeleccionadas((anteriores) =>
            anteriores.filter(
                (id) => !correctas.includes(id)
            )
        );

        // Actualizamos las actividades desde Laravel.
        try {
            const respuesta =
                await obtenerActividadesPlanta(idPlanta);

            if (
                String(plantaActualRef.current) ===
                String(idPlanta)
            ) {
                setActividades(
                    Array.isArray(respuesta.actividades)
                        ? respuesta.actividades
                        : []
                );
            }

        } catch (error) {
            setError(
                "Las actividades se enviaron, pero no se pudo actualizar el calendario: " +
                error.message
            );
        }

        setEnviando(false);

        if (
            correctas.length > 0 &&
            fallidas.length === 0
        ) {
            setResultado({
                tipo: "exito",
                mensaje:
                    correctas.length === 1
                        ? "La actividad se completó correctamente. ¡Tu planta agradece tus cuidados!"
                        : `Se completaron correctamente ${correctas.length} actividades. ¡Tu jardín está en buenas manos!`,
            });
        } else {
            setResultado({
                tipo: "parcial",
                mensaje:
                    `${correctas.length} actividades completadas y ` +
                    `${fallidas.length} sin completar. ` +
                    "Las actividades que fallaron siguen seleccionadas para volver a intentarlo.",
            });
        }
    };
    const cambiarMes = (direccion) => {
        const api = calendarioRef.current?.getApi();

        if (!api) return;

        if (direccion === "anterior") {
            api.prev();
        } else {
            api.next();
        }
    };

    const irHoy = () => {
        calendarioRef.current?.getApi()?.today();

        setFechaSeleccionada(hoyLocal());
        setSeleccionadas([]);
    };

    const seleccionarFecha = (fecha) => {
        if (enviando) return;

        setFechaSeleccionada(fecha);
        setSeleccionadas([]);
    };
    return {
        calendarioRef, plantas, plantaSeleccionada, setPlantaSeleccionada,
        fechaSeleccionada, actividades, seleccionadas, setSeleccionadas,
        cargandoPlantas, cargandoActividades, enviando,
        mostrarPlantas, setMostrarPlantas, resultado, setResultado, error,
        eventos, tareasDelDia, tareasDisponibles, todasSeleccionadas,
        alternarTarea, alternarTodas, enviarActividades, cambiarMes, irHoy,
        seleccionarFecha,
    };
}
