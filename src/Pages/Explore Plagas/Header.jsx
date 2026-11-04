import React, { useState } from 'react';

export default function Header() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Izquierda: Logo y Menú */}
        <div className="flex items-center gap-8">
          <img src="imagenes/logo.png" alt="logo" className="h-8 w-auto" />
          <nav className="hidden md:flex gap-6 font-medium text-slate-600">
            <a href="/jardin.html" className="hover:text-emerald-600 transition-colors">Jardín</a>
            <a href="/explorar.html" className="text-emerald-600 font-semibold">Explorar</a>
            <a href="/calendario.html" className="hover:text-emerald-600 transition-colors">Calendario</a>
          </nav>
        </div>

        {/* Derecha: Notificaciones y Perfil */}
        <div className="flex items-center gap-4 relative">
          {/* Botón Campana */}
          <button 
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="p-2 hover:bg-slate-100 rounded-full relative transition-colors"
            aria-label="Notificaciones"
          >
            <img src="imagenes/campana.png" alt="Notificaciones" className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Panel Desplegable de Notificaciones */}
          {isPanelOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-800">Notificaciones</span>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  ✕ Cerrar
                </button>
              </div>

              {/* Nuevas */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4 mb-2">Nuevas</p>
              
              <div className="flex gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <img src="imagenes/riego.png" alt="" className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800">Riego — Cattleya Trianae</h4>
                  <p className="text-xs text-slate-500">Han pasado 7 días. Es hora de regar tu planta.</p>
                  <small className="text-[10px] text-slate-400">Hace 10 minutos</small>
                </div>
                <span className="w-2 h-2 bg-emerald-500 rounded-full self-center"></span>
              </div>

              <div className="flex gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors relative">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <img src="imagenes/fertilizacionverde.png" alt="" className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800">Fertilización — Masdevallia</h4>
                  <p className="text-xs text-slate-500">Recuerda fertilizar hoy según tu calendario.</p>
                  <small className="text-[10px] text-slate-400">Hace 1 hora</small>
                </div>
                <span className="w-2 h-2 bg-emerald-500 rounded-full self-center"></span>
              </div>

              {/* Anteriores */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4 mb-2">Anteriores</p>
              
              <div className="space-y-2 opacity-75">
                <div className="flex gap-3 p-2 hover:bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <img src="imagenes/check.png" alt="" className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 line-through">Riego completado — Odontoglossum</h4>
                    <p className="text-xs text-slate-400">Riego registrado. Próximo en 7 días.</p>
                    <small className="text-[10px] text-slate-400">Ayer, 3:00 PM</small>
                  </div>
                </div>

                <div className="flex gap-3 p-2 hover:bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <img src="imagenes/riego.png" alt="" className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-600">Próximo riego — Cattleya Trianae</h4>
                    <p className="text-xs text-slate-400">Programado para mañana a las 8:00 AM.</p>
                    <small className="text-[10px] text-slate-400">Ayer, 10:00 AM</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Imagen de Perfil */}
          <img src="imagenes/perfil.png" alt="perfil" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
        </div>
      </div>
    </header>
  );
}