import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left text-xs text-slate-500">
        
        {/* Info del Sistema */}
        <div>
          <h3 className="font-bold text-slate-700 text-sm mb-1">Florae © 2026</h3>
          <p>Plataforma de gestión y cuidado de plantas</p>
          <p className="text-slate-400">Versión del sistema 1.1</p>
        </div>

        {/* Enlaces */}
        <div className="flex gap-4 font-medium">
          <a href="#" className="hover:text-emerald-600 transition-colors">Ayuda / Soporte</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Información legal</a>
        </div>

        {/* Mensaje */}
        <div className="italic text-slate-400">
          <p>“Florae te ayuda a cuidar y entender tus plantas”</p>
        </div>
      </div>
    </footer>
  );
}