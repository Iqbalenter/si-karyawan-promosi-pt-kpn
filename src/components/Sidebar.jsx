import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Target,
  ClipboardList,
  Calculator,
  Award,
  Settings,
  LogOut,
  X,
  User
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/karyawan', label: 'Data Karyawan', icon: Users },
  { path: '/jabatan', label: 'Data Jabatan', icon: Briefcase },
  { path: '/kriteria', label: 'Kriteria Penilaian', icon: Target },
  { path: '/penilaian', label: 'Penilaian', icon: ClipboardList },
  { path: '/saw/perhitungan', label: 'Perhitungan SAW', icon: Calculator },
  { path: '/saw/hasil', label: 'Hasil Ranking', icon: Award },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside
      className={twMerge(
        "fixed inset-y-0 left-0 z-30 w-64 bg-[#1B4332] text-white transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shadow-xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 text-2xl font-bold text-[#1B4332]">
          <img src="/images/logo.png"/>
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-bold uppercase tracking-wider">PT Kencana</h1>
          <p className="text-[10px] opacity-70">Pertama Nusantara</p>
        </div>
        <button
          className="lg:hidden ml-auto text-white/70 hover:text-white"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2 px-3 mt-4">
            Menu Utama
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all mb-1",
                  isActive
                    ? "bg-[#40916C] text-white font-medium"
                    : "opacity-70 hover:bg-[#2D6A4F] hover:opacity-100"
                )}
              >
                <Icon size={20} className={isActive ? "text-white" : "currentColor"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[#40916C] p-6">
        <div className="flex items-center justify-between mb-4 text-xs opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#FFB703] p-1.5 text-[#1B4332] flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <p className="font-bold">{user?.nama || user?.name || user?.email || 'Pengguna'}</p>
              <p className="text-[10px]">{user?.role || 'User'}</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg opacity-70 hover:bg-red-500/20 hover:text-red-300 hover:opacity-100 transition-all text-sm font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
