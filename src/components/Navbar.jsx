import { Menu, User } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  return (
    <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm border-b border-gray-100 z-10 sticky top-0">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none mr-4"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-800 hidden sm:block">Sistem Informasi Promosi Jabatan</h2>
      </div>

      <div className="flex items-center gap-4">
        <p className="hidden sm:block text-sm font-medium text-gray-600">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </header>
  );
}
