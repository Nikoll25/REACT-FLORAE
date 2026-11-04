import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, RefreshCw, Search } from "lucide-react";

import logo from "../../assets/logo.png";
import perfil from "../../assets/perfil.png";
import { obtenerPlantas } from "../../services/api";

function Jardin() {
	const [plantas, setPlantas] = useState([]);
	const [busqueda, setBusqueda] = useState("");
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState("");

	async function cargarPlantas() {
		try {
			setCargando(true);
			setError("");
			const datos = await obtenerPlantas();
			const lista = Array.isArray(datos)
				? datos
				: Array.isArray(datos?.data)
					? datos.data
					: [];
			setPlantas(lista);
		} catch (errorCarga) {
			setError(errorCarga.message || "No se pudieron cargar las plantas.");
		} finally {
			setCargando(false);
		}
	}

	useEffect(() => {
		cargarPlantas();
	}, []);

	function obtenerUrlImagen(planta) {
		const imagen = planta.image_plant?.image || planta.image_url || planta.image || planta.imagen;
		if (!imagen) return null;
		if (imagen.startsWith("http")) return imagen;

		const ruta = imagen.replace(/^\/+/, "");
		const base = (import.meta.env.VITE_API_BASE_URL || "http://api.florae.test").replace(/\/+$/, "");
		return `${base}/${ruta.startsWith("storage/") ? ruta : `storage/${ruta}`}`;
	}

	const plantasVisibles = plantas.filter((planta) => {
		const texto = busqueda.trim().toLowerCase();
		return (
			(planta.common_name || "").toLowerCase().includes(texto) ||
			(planta.scientific_name || "").toLowerCase().includes(texto)
		);
	});

	return (
		<div className="flex min-h-screen flex-col bg-[#f8f6f1] text-[#20251f]">
			<header className="flex min-h-20 flex-wrap items-center justify-between gap-3 bg-[#faf3f3] px-5 shadow-[0_3px_6px_rgba(0,0,0,0.2)] md:px-10">
				<Link to="/jardin" aria-label="Florae, inicio" className="flex items-center">
					<img className="h-12 w-36 object-contain" src={logo} alt="Florae" />
				</Link>
				<nav aria-label="Navegación principal" className="flex items-center gap-2 sm:gap-6">
					<Link to="/explorar" className="px-2 py-2 text-sm transition hover:-translate-y-0.5 hover:text-florae sm:text-base">Explorar</Link>
					<Link to="/jardin" aria-current="page" className="px-2 py-2 text-sm font-semibold text-florae sm:text-base">Mi jardín</Link>
				</nav>
				<img className="h-10 w-10 rounded-full object-cover" src={perfil} alt="Perfil" />
			</header>

			<main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-10">
				<div className="flex flex-col gap-4 border-b border-[#a1a1a1] pb-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-[#283326]">Mi jardín</h1>
						<p className="mt-1 text-sm text-[#687064]">Plantas disponibles en el catálogo conectado</p>
					</div>
					<div className="flex gap-2">
						<form onSubmit={(evento) => evento.preventDefault()} className="flex min-w-0 items-center rounded-xl border border-[#d8ded3] bg-white focus-within:ring-2 focus-within:ring-[#89ab78]">
							<input
								type="search"
								value={busqueda}
								onChange={(evento) => setBusqueda(evento.target.value)}
								placeholder="Buscar planta"
								aria-label="Buscar plantas"
								className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm outline-none sm:w-56"
							/>
							<Search size={19} aria-hidden="true" className="mr-3 shrink-0 text-[#709261]" />
						</form>
						<button type="button" onClick={cargarPlantas} disabled={cargando} aria-label="Actualizar plantas" title="Actualizar plantas" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#89ab78] text-white transition hover:bg-[#709261] disabled:opacity-60">
							<RefreshCw size={18} className={cargando ? "animate-spin" : ""} />
						</button>
					</div>
				</div>

				{cargando && (
					<div className="flex flex-col items-center py-16" role="status">
						<div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e4e9df] border-t-[#709261]" />
						<p className="mt-4 text-sm text-gray-500">Cargando plantas...</p>
					</div>
				)}

				{!cargando && error && (
					<div role="alert" className="mt-7 rounded-xl border border-red-200 bg-white p-6 text-center">
						<p className="text-red-700">{error}</p>
						<button type="button" onClick={cargarPlantas} className="mt-4 rounded-lg bg-[#709261] px-4 py-2 text-sm font-medium text-white hover:bg-[#5e7d51]">Intentar de nuevo</button>
					</div>
				)}

				{!cargando && !error && plantasVisibles.length > 0 && (
					<section aria-label="Plantas del catálogo" className="grid grid-cols-1 gap-6 pt-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{plantasVisibles.map((planta, indice) => {
							const imagen = obtenerUrlImagen(planta);
							const nombreComun = planta.common_name || planta.nombre_comun || "Planta";
							const nombreCientifico = planta.scientific_name || planta.nombre_cientifico;

							return (
								<article key={planta.id ?? `${nombreComun}-${indice}`} className="min-w-0 overflow-hidden rounded-xl bg-white p-3 shadow-[0_3px_6px_rgba(0,0,0,0.15)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.18)]">
									{imagen ? (
										<img src={imagen} alt={nombreComun} loading="lazy" className="h-48 w-full rounded-lg object-cover" />
									) : (
										<div className="flex h-48 w-full items-center justify-center rounded-lg bg-[#eef3e7]"><Leaf size={42} aria-hidden="true" className="text-[#88a675]" /></div>
									)}
									<div className="px-2 pb-2 pt-4 text-center">
										<h2 className="wrap-break-word font-semibold text-[#4b6d46]">{nombreComun}</h2>
										{nombreCientifico && <p className="mt-1 wrap-break-word text-sm italic text-[#777]">{nombreCientifico}</p>}
										{planta.plant_description && <p className="mt-3 line-clamp-3 text-left text-sm leading-6 text-gray-500">{planta.plant_description}</p>}
									</div>
								</article>
							);
						})}
					</section>
				)}

				{!cargando && !error && plantasVisibles.length === 0 && (
					<div className="py-16 text-center text-gray-500">
						<Leaf size={42} aria-hidden="true" className="mx-auto mb-4 text-[#88a675]" />
						<p>{plantas.length === 0 ? "No hay plantas registradas en la API." : "No se encontraron plantas con ese nombre."}</p>
					</div>
				)}
			</main>

			<footer className="flex flex-col items-start justify-between gap-5 bg-[#1f2d1f] px-6 py-7 text-[#e8f5e9] sm:flex-row sm:items-center md:px-12">
				<div>
					<h2 className="font-semibold text-[#a5d6a7]">Florae</h2>
					<p className="mt-1 text-sm text-[#c8e6c9]">Tu espacio para cuidar cada planta.</p>
				</div>
				<div className="flex gap-4 text-sm">
					<Link to="/explorar" className="transition hover:text-[#81c784]">Explorar</Link>
					<Link to="/jardin" className="transition hover:text-[#81c784]">Mi jardín</Link>
				</div>
				<p className="max-w-62.5 text-sm italic">Cultiva tu jardín, un día a la vez.</p>
			</footer>
		</div>
	);
}

export default Jardin;
