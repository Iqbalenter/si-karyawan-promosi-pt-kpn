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
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      
      {/* Protected Routes inside DashboardLayout */}
      <Route path="/" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="karyawan" element={<ListKaryawan />} />
        <Route path="jabatan" element={<ListJabatan />} />
        <Route path="kriteria" element={<ListKriteria />} />
        <Route path="penilaian" element={<ListPenilaian />} />
        <Route path="perhitungan-saw" element={<PerhitunganSAW />} />
        <Route path="hasil-ranking" element={<HasilRanking />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
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

