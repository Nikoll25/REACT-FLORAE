import { Link } from "react-router-dom";
import { ArrowRight, Sprout, Leaf, Sun, BookOpen, HeartHandshake, Sparkles, Users, CalendarDays, Search, Flower2 } from "lucide-react";
import logo from "../../assets/logo.png";

const valores = [
    { icono: Leaf, titulo: "Amor por la naturaleza", descripcion: "Valoramos la vida y promovemos una conexión más cercana y respetuosa con nuestro entorno." },
    { icono: BookOpen, titulo: "Aprendizaje continuo", descripcion: "Creemos que cada planta es una oportunidad para descubrir, aprender y crecer." },
    { icono: HeartHandshake, titulo: "Cuidado consciente", descripcion: "Fomentamos hábitos responsables que contribuyan al bienestar de las plantas." },
    { icono: Sparkles, titulo: "Innovación con propósito", descripcion: "Utilizamos la tecnología para hacer del cuidado de las plantas una experiencia más sencilla y cercana." },
];

const funcionalidades = [
    { icono: Search, titulo: "Descubre", descripcion: "Conoce diferentes especies, sus características y necesidades." },
    { icono: Flower2, titulo: "Cultiva", descripcion: "Organiza tu jardín y conoce el estado de salud de tus plantas." },
    { icono: CalendarDays, titulo: "Cuida", descripcion: "Realiza un seguimiento de los cuidados que necesita cada planta." },
    { icono: Sparkles, titulo: "Aprende", descripcion: "Resuelve tus dudas con el acompañamiento de nuestro asistente inteligente." },
];

function SobreNosotros() {
    return (
        <main className="overflow-hidden bg-[#F8F7F3] font-nunito text-[#626B60]">

            {/* Presentación */}
            <section className="relative mx-auto grid max-w-[1250px] items-center gap-10 px-6 py-16 md:grid-cols-2 md:px-12 lg:py-24">
                <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#E9EEE5] px-4 py-2 text-xs font-bold uppercase tracking-[2px] text-[#71866B]">
                        <Sprout size={17} /> Nuestra esencia
                    </span>
                    <h1 className="mt-6 font-lora text-4xl font-semibold leading-tight text-[#3F5D3F] sm:text-5xl lg:text-[58px]">
                        Cuidamos lo que te hace <span className="italic text-[#82977C]">florecer.</span>
                    </h1>
                    <p className="mt-6 max-w-lg text-base leading-8 sm:text-lg">
                        Florae es un espacio donde la naturaleza y la tecnología se encuentran para ayudarte a descubrir, comprender y cuidar tus plantas.
                    </p>
                    <p className="mt-3 max-w-lg leading-7">
                        Porque cada pequeño cuidado es una oportunidad para crecer.
                    </p>
                    <Link to="/explorar" className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#71866B] px-6 py-3.5 font-semibold text-white transition hover:bg-[#60755B]">
                        Descubre Florae <ArrowRight size={19} />
                    </Link>
                </div>

                <div className="relative flex min-h-[300px] items-center justify-center sm:min-h-[400px]">
                    <div className="absolute h-[280px] w-[280px] rounded-full bg-[#E9EEE5] sm:h-[360px] sm:w-[360px]" />
                    <Leaf size={100} strokeWidth={0.7} className="absolute right-[5%] top-[5%] rotate-45 text-[#A3B18A]/50" />
                    <Sprout size={120} strokeWidth={0.7} className="absolute bottom-[3%] left-[5%] -rotate-12 text-[#A3B18A]/60" />
                    <div className="relative flex flex-col items-center">
                        <img src={logo} alt="Logo de Florae" className="w-[220px] object-contain sm:w-[280px]" />
                        <p className="mt-5 font-lora text-lg italic text-[#71866B]">Tu jardín, tu bienestar.</p>
                    </div>
                </div>
            </section>

            {/* Nuestra historia */}
            <section className="border-y border-[#E0E6DA] bg-white/60">
                <div className="mx-auto max-w-[850px] px-6 py-16 text-center md:py-20">
                    <Sprout size={38} strokeWidth={1.3} className="mx-auto mb-5 text-[#82977C]" />
                    <span className="text-xs font-bold uppercase tracking-[3px] text-[#82977C]">De una semilla a una idea</span>
                    <h2 className="mt-4 font-lora text-3xl font-semibold text-[#3F5D3F] sm:text-4xl">Así nace Florae</h2>
                    <p className="mt-6 text-base leading-8">
                        Cuidar una planta puede ser una experiencia maravillosa, pero también puede generar dudas. ¿Cuándo debo regarla? ¿Cuánta luz necesita? ¿Por qué sus hojas están cambiando de color?
                    </p>
                    <p className="mt-4 text-base leading-8">
                        Florae nace como una respuesta a estas necesidades, con el propósito de acercar el conocimiento sobre las plantas a todas las personas, independientemente de su experiencia en jardinería.
                    </p>
                    <p className="mt-4 text-base leading-8">
                        A través de herramientas digitales y asistencia inteligente, buscamos que el cuidado de las plantas sea una actividad más accesible, organizada y gratificante.
                    </p>
                </div>
            </section>

            {/* Misión y visión */}
            <section className="mx-auto max-w-[1150px] px-6 py-16 md:px-10 md:py-20">
                <div className="mb-10 text-center">
                    <span className="text-xs font-bold uppercase tracking-[3px] text-[#82977C]">Nuestro propósito</span>
                    <h2 className="mt-3 font-lora text-3xl font-semibold text-[#3F5D3F]">Crecer con sentido</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <article className="rounded-[24px] border border-[#DDE5D6] bg-white p-7 shadow-sm sm:p-10">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9EEE5] text-[#71866B]">
                            <Sprout size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="font-lora text-2xl font-semibold text-[#3F5D3F]">Nuestra misión</h3>
                        <p className="mt-4 leading-8">
                            Facilitar el cuidado de las plantas mediante herramientas tecnológicas accesibles, información organizada y asistencia inteligente, promoviendo el aprendizaje, la responsabilidad y una conexión más cercana con la naturaleza.
                        </p>
                    </article>

                    <article className="rounded-[24px] border border-[#DDE5D6] bg-white p-7 shadow-sm sm:p-10">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9EEE5] text-[#71866B]">
                            <Sun size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="font-lora text-2xl font-semibold text-[#3F5D3F]">Nuestra visión</h3>
                        <p className="mt-4 leading-8">
                            Consolidar a Florae como una plataforma de referencia para el cuidado de las plantas, impulsando una comunidad que valore la naturaleza y encuentre en la tecnología una aliada para construir un futuro más verde y consciente.
                        </p>
                    </article>
                </div>
            </section>

            {/* Funcionalidades */}
            <section className="border-y border-[#DFE6D9] bg-[#EDF1E9]">
                <div className="mx-auto max-w-[1250px] px-6 py-16 md:px-12">
                    <div className="mb-12 text-center">
                        <span className="text-xs font-bold uppercase tracking-[3px] text-[#71866B]">Una experiencia que crece contigo</span>
                        <h2 className="mt-3 font-lora text-3xl font-semibold text-[#3F5D3F]">Mucho más que un jardín</h2>
                        <p className="mx-auto mt-4 max-w-xl leading-7">
                            Te acompañamos desde el momento en que descubres una planta hasta cada etapa de su crecimiento.
                        </p>
                    </div>

                    <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
                        {funcionalidades.map(({ icono: Icono, titulo, descripcion }) => (
                            <article key={titulo} className="flex flex-col items-center text-center">
                                <div className="mb-5 flex h-[70px] w-[70px] items-center justify-center rounded-full border border-[#D5DFCE] bg-[#F8F7F3] text-[#71866B]">
                                    <Icono size={29} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-lora text-xl font-semibold text-[#3F5D3F]">{titulo}</h3>
                                <p className="mt-3 max-w-[240px] text-sm leading-7">{descripcion}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nuestros valores */}
            <section className="mx-auto max-w-[1150px] px-6 py-16 md:px-10 md:py-20">
                <div className="mb-10 text-center">
                    <span className="text-xs font-bold uppercase tracking-[3px] text-[#82977C]">Nuestras raíces</span>
                    <h2 className="mt-3 font-lora text-3xl font-semibold text-[#3F5D3F]">Lo que nos mueve</h2>
                    <p className="mt-4 leading-7">Los principios que nos inspiran a seguir creciendo.</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    {valores.map(({ icono: Icono, titulo, descripcion }) => (
                        <article key={titulo} className="flex items-start gap-5 rounded-[20px] border border-[#DFE6D9] bg-white p-6 transition hover:border-[#A3B18A]">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E9EEE5] text-[#71866B]">
                                <Icono size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="font-lora text-lg font-semibold text-[#3F5D3F]">{titulo}</h3>
                                <p className="mt-2 text-sm leading-7">{descripcion}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Equipo de desarrollo */}
            <section className="border-t border-[#E0E6DA] bg-white/60">
                <div className="mx-auto max-w-[850px] px-6 py-16 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E9EEE5] text-[#71866B]">
                        <Users size={29} strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[3px] text-[#82977C]">Las personas detrás del proyecto</span>
                    <h2 className="mt-3 font-lora text-3xl font-semibold text-[#3F5D3F]">Detrás de Florae</h2>
                    <p className="mt-6 leading-8">
                        Florae es un proyecto que combina el desarrollo de software, la creatividad y el interés por la naturaleza. Buscamos transformar nuestros conocimientos en una herramienta que genere un impacto positivo en la vida cotidiana de las personas.
                    </p>
                    <p className="mt-4 leading-8">
                        Seguimos aprendiendo, innovando y cultivando nuevas ideas para ofrecer una experiencia cada vez más cercana a quienes disfrutan del mundo de las plantas.
                    </p>
                </div>
            </section>

            {/* Invitación final */}
            <section className="px-6 py-14">
                <div className="relative mx-auto max-w-[1150px] overflow-hidden rounded-[28px] border border-[#DDE5D6] bg-[#E9EEE5] px-6 py-12 text-center sm:px-12">
                    <Leaf size={150} strokeWidth={0.6} className="pointer-events-none absolute -bottom-8 -left-8 -rotate-12 text-[#A3B18A]/40" />
                    <Sprout size={150} strokeWidth={0.6} className="pointer-events-none absolute -right-6 -top-8 rotate-12 text-[#A3B18A]/40" />
                    <div className="relative">
                        <h2 className="font-lora text-3xl font-semibold italic text-[#3F5D3F]">Sigamos creciendo juntos.</h2>
                        <p className="mx-auto mt-4 max-w-lg leading-7">
                            Cada planta tiene su propio ritmo, y cada pequeño cuidado cuenta. Florae está aquí para acompañarte.
                        </p>
                        <Link to="/jardin" className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#71866B] px-6 py-3 font-semibold text-white transition hover:bg-[#60755B]">
                            Ir a mi jardín <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

        </main>
    );
}

export default SobreNosotros;