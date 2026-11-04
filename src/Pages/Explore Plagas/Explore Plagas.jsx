import { useEffect, useState } from 'react';
import Header from './Header';
import SidebarNavigation from './Sidebar';
import Footer from './Footer';
import { obtenerPlagas } from '../../services/api';

export default function ExplorarPlagas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function cargarPlagas() {
    try {
      setLoading(true);
      setError('');

      const datos = await obtenerPlagas();
      const lista = Array.isArray(datos)
        ? datos
        : Array.isArray(datos?.data)
          ? datos.data
          : [];

      setPests(lista);
    } catch (error) {
      console.error('Error al cargar las plagas:', error);
      setError(error.message || 'No se pudieron cargar las plagas. Verifica la conexión con la API.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarPlagas();
  }, []);

  function obtenerUrlImagen(plaga) {
    const imagen = plaga.image_pest?.image || plaga.image_url || plaga.image || plaga.imagen;

    if (!imagen) return null;
    if (imagen.startsWith('http')) return imagen;

    const ruta = imagen.replace(/^\/+/, '');
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://api.florae.test').replace(/\/+$/, '');
    const rutaPublica = ruta.startsWith('storage/') ? ruta : `storage/${ruta}`;

    return `${base}/${rutaPublica}`;
  }

  const textoBusqueda = searchTerm.toLowerCase().trim();
  const filteredPests = pests.filter((pest) => {
    const campos = [
      pest.common_name,
      pest.scientific_name,
      pest.nombre_comun,
      pest.nombre_cientifico,
      pest.name,
      pest.symptom,
      pest.symptoms,
      pest.description,
    ];

    return campos.some((campo) =>
      typeof campo === 'string' && campo.toLowerCase().includes(textoBusqueda)
    );
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Acción personalizada al enviar formulario si se requiere
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Encabezado */}
      <Header />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 text-center">
          ¿Qué plaga está afectando tu planta?
        </h1>

        {/* Buscador */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Busca por nombre común, científico o síntoma..."
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <img src="imagenes/lupa.png" alt="Buscar" className="w-5 h-5 opacity-60" />
            </button>
          </div>
        </form>

        {/* Navegación lateral / Iconos flotantes */}
        <SidebarNavigation />

        {loading && (
          <p className="py-12 text-center text-slate-500">Cargando plagas...</p>
        )}

        {!loading && error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-white p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              type="button"
              onClick={cargarPlagas}
              className="mt-4 rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {!loading && !error && filteredPests.length === 0 && (
          <p className="py-12 text-center text-slate-500">
            {pests.length === 0
              ? 'No hay plagas registradas en la API.'
              : 'No se encontraron plagas con ese nombre.'}
          </p>
        )}

        {!loading && !error && filteredPests.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredPests.map((pest) => {
              const nombreComun = pest.common_name || pest.nombre_comun || pest.name || 'Plaga';
              const nombreCientifico = pest.scientific_name || pest.nombre_cientifico;
              const imagen = obtenerUrlImagen(pest);

              return (
                <article key={pest.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="aspect-4/3 bg-slate-100">
                    {imagen && (
                      <img
                        src={imagen}
                        alt={nombreComun}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-slate-800">{nombreComun}</h2>
                    {nombreCientifico && (
                      <p className="mt-1 text-sm italic text-slate-500">{nombreCientifico}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Pie de página */}
      <Footer />
    </div>
  );
}