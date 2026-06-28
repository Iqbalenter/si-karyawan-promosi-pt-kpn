import { Users, Briefcase, Target, Award } from 'lucide-react';
import CardStat from '../components/CardStat';

// Dummy data from other pages
const dataKaryawan = [
  { id_karyawan: 'K001', nik: '1001', nama_lengkap: 'Budi Santoso' },
  { id_karyawan: 'K002', nik: '1002', nama_lengkap: 'Siti Aminah' },
  { id_karyawan: 'K003', nik: '1003', nama_lengkap: 'Ahmad Faisal' },
  { id_karyawan: 'K004', nik: '1004', nama_lengkap: 'Rina Wijaya' },
  { id_karyawan: 'K005', nik: '1005', nama_lengkap: 'Doni Pratama' },
  { id_karyawan: 'K006', nik: '1006', nama_lengkap: 'Dewi Lestari' },
];

const dataJabatan = [
  { id: 'J01', nama: 'Manager Operasional', departemen: 'Operasional', level: 'Managerial' },
  { id: 'J02', nama: 'Supervisor Lapangan', departemen: 'Operasional', level: 'Supervisor' },
  { id: 'J03', nama: 'Staff Keuangan', departemen: 'Keuangan', level: 'Staff' },
  { id: 'J04', nama: 'Staff HRD', departemen: 'HRD', level: 'Staff' },
  { id: 'J05', nama: 'Staff Administrasi', departemen: 'HRD', level: 'Staff' },
  { id: 'J06', nama: 'Teknisi', departemen: 'Teknik', level: 'Staff' },
];

const dataKriteria = [
  { kode: 'C1', nama: 'Absensi', jenis: 'Benefit', bobot: 20 },
  { kode: 'C2', nama: 'Kinerja', jenis: 'Benefit', bobot: 30 },
  { kode: 'C3', nama: 'Masa Kerja', jenis: 'Benefit', bobot: 15 },
  { kode: 'C4', nama: 'Pendidikan', jenis: 'Benefit', bobot: 15 },
  { kode: 'C5', nama: 'Kedisiplinan', jenis: 'Benefit', bobot: 20 },
];

const dataRanking = [
  { ranking: 1, id_karyawan: 'K001', nama_karyawan: 'Budi Santoso', jabatan: 'Staff Operasional', nilai_akhir: 0.932, status_rekomendasi: 'Sangat Direkomendasikan' },
  { ranking: 2, id_karyawan: 'K002', nama_karyawan: 'Siti Aminah', jabatan: 'Staff Keuangan', nilai_akhir: 0.885, status_rekomendasi: 'Sangat Direkomendasikan' },
  { ranking: 3, id_karyawan: 'K003', nama_karyawan: 'Ahmad Faisal', jabatan: 'Supervisor Lapangan', nilai_akhir: 0.841, status_rekomendasi: 'Direkomendasikan' },
  { ranking: 4, id_karyawan: 'K004', nama_karyawan: 'Rina Wijaya', jabatan: 'Staff HRD', nilai_akhir: 0.792, status_rekomendasi: 'Direkomendasikan' },
  { ranking: 5, id_karyawan: 'K005', nama_karyawan: 'Doni Pratama', jabatan: 'Teknisi', nilai_akhir: 0.715, status_rekomendasi: 'Direkomendasikan' },
];

export default function Dashboard() {
  const topCandidates = [...dataRanking].sort((a, b) => a.ranking - b.ranking).slice(0, 5);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Sangat Direkomendasikan': return 'bg-green-100 text-green-700';
      case 'Direkomendasikan': return 'bg-blue-100 text-blue-700';
      case 'Dipertimbangkan': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  const getKriteriaColor = (index) => {
    const colors = ['bg-[#1B4332]', 'bg-[#40916C]', 'bg-[#52B788]', 'bg-[#FFB703]', 'bg-[#FB8500]'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Ringkasan data HR & Rekomendasi Promosi PT KPN</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <span>Periode Penilaian Aktif:</span>
          <span className="font-semibold text-emerald-700">Q3 2024</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardStat 
          title="Total Karyawan" 
          value={dataKaryawan.length} 
          icon={Users}
          trend={{ value: 2, label: "bulan ini", isPositive: true }}
          iconBgClass="bg-green-50"
          iconTextClass="text-green-700"
        />
        <CardStat 
          title="Total Jabatan" 
          value={dataJabatan.length} 
          icon={Briefcase}
          iconBgClass="bg-yellow-50"
          iconTextClass="text-yellow-700"
        />
        <CardStat 
          title="Kandidat Promosi" 
          value={dataRanking.length} 
          icon={Target}
          trend={{ value: 1, label: "kandidat baru", isPositive: true }}
          iconBgClass="bg-blue-50"
          iconTextClass="text-blue-700"
        />
        <CardStat 
          title="Kriteria Penilaian" 
          value={dataKriteria.length} 
          icon={Award}
          iconBgClass="bg-orange-50"
          iconTextClass="text-orange-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Candidates */}
        <div className="lg:col-span-2 flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 uppercase tracking-wide text-xs">Ranking Promosi Teratas (Metode SAW)</h3>
            <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Update: Q3 2024</span>
          </div>
          <div className="flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Nama Karyawan</th>
                  <th className="px-4 py-3">Jabatan</th>
                  <th className="px-4 py-3">Skor SAW</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topCandidates.map((row) => (
                  <tr key={row.ranking} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-[#1B4332]">
                      {row.ranking.toString().padStart(2, '0')}
                    </td>
                    <td className="px-4 py-3 font-medium">{row.nama_karyawan}</td>
                    <td className="px-4 py-3 text-gray-500">{row.jabatan}</td>
                    <td className="px-4 py-3 font-mono text-blue-600">{row.nilai_akhir.toFixed(3)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(row.status_rekomendasi)}`}>
                        {row.status_rekomendasi}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weight Distribution */}
        <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 font-bold text-gray-800 uppercase tracking-wide text-xs">Bobot Kriteria Penilaian</h3>
          <div className="space-y-5">
            {[...dataKriteria].sort((a, b) => b.bobot - a.bobot).map((kriteria, idx) => (
              <div key={kriteria.kode}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{kriteria.kode} - {kriteria.nama}</span>
                  <span className="font-bold">{kriteria.bobot}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className={`h-2 rounded-full ${getKriteriaColor(idx)}`} style={{width: `${kriteria.bobot}%`}}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto pt-6">
            <div className="rounded-lg bg-orange-50 p-4">
              <p className="text-[10px] italic text-orange-800 leading-relaxed">
                "Metode Simple Additive Weighting (SAW) mencari penjumlahan terbobot dari rating kinerja pada setiap alternatif di semua atribut."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

