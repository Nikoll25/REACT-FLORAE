import React from 'react';

export default function SidebarNavigation() {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-white p-2 rounded-2xl shadow-lg border border-slate-100 z-40">
      <a href="explorar.html" title="Plantas">
        <div className="p-3 rounded-xl hover:bg-slate-100 transition-colors">
          <img src="imagenes/planta.png" alt="Plantas" className="w-6 h-6" />
        </div>
      </a>
      <a href="explorarplaga.html" title="Plagas">
        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 transition-colors">
          <img src="imagenes/plagaicono.png" alt="Plagas" className="w-6 h-6" />
        </div>
      </a>
    </div>
  );
}