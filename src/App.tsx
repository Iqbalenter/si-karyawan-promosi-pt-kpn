import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ListKaryawan from './pages/Karyawan/ListKaryawan';
import ListJabatan from './pages/Jabatan/ListJabatan';
import ListKriteria from './pages/Kriteria/ListKriteria';
import ListPenilaian from './pages/Penilaian/ListPenilaian';
import PerhitunganSAW from './pages/SAW/PerhitunganSAW';
import HasilRanking from './pages/SAW/HasilRanking';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat sesi pengguna...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="karyawan" element={<ListKaryawan />} />
        <Route path="jabatan" element={<ListJabatan />} />
        <Route path="kriteria" element={<ListKriteria />} />
        <Route path="penilaian" element={<ListPenilaian />} />
        <Route path="saw/perhitungan" element={<PerhitunganSAW />} />
        <Route path="saw/hasil" element={<HasilRanking />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
