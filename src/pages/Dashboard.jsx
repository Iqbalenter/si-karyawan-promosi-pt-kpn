import { useEffect, useMemo, useState } from 'react';
import { Users, Briefcase, Target, Award } from 'lucide-react';
import CardStat from '../components/CardStat';
import { listenCollection } from '../services/firestoreService';
import { calculateSAW } from '../utils/saw';

export default function Dashboard() {
  const [dataKaryawan, setDataKaryawan] = useState([]);
  const [dataJabatan, setDataJabatan] = useState([]);
  const [dataKriteria, setDataKriteria] = useState([]);
  const [dataPenilaian, setDataPenilaian] = useState([]);
  const [dataRanking, setDataRanking] = useState([]);

  useEffect(() => {
    const unsubscribes = [
      listenCollection('karyawan', setDataKaryawan, console.error),
      listenCollection('jabatan', setDataJabatan, console.error),
      listenCollection(
        'kriteria',
        (items) =>
          setDataKriteria(
            items.map((item) => ({
              ...item,
              kode: item.kode || item.kode_kriteria,
              kode_kriteria: item.kode_kriteria || item.kode,
              jenis: String(item.jenis || 'Benefit').toLowerCase(),
              bobot: Number(item.bobot || 0),
            }))
          ),
        console.error
      ),
      listenCollection(
        'hasil_saw',
        (items) =>
          setDataRanking(
            items.map((item) => ({
              ...item,
              nilai_akhir: Number(item.nilai_akhir || 0),
              ranking: Number(item.ranking || 0),
            }))
          ),
        console.error
      ),
      listenCollection(
        'penilaian',
        (items) =>
          setDataPenilaian(
            items.map((item) => ({
              ...item,
              nilai_absensi: Number(item.nilai_absensi || 0),
              nilai_kinerja: Number(item.nilai_kinerja || 0),
              nilai_masa_kerja: Number(item.nilai_masa_kerja || 0),
              nilai_pendidikan: Number(item.nilai_pendidikan || 0),
              nilai_kedisiplinan: Number(item.nilai_kedisiplinan || 0),
            }))
          ),
        console.error
      ),
    ];

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, []);

  const computedRanking = useMemo(() => {
    if (dataRanking.length > 0) {
      return dataRanking;
    }

    const scoredPenilaian = dataPenilaian.filter((item) => {
      return [
        item.nilai_absensi,
        item.nilai_kinerja,
        item.nilai_masa_kerja,
        item.nilai_pendidikan,
        item.nilai_kedisiplinan,
      ].some((value) => Number(value) > 0);
    });

    return calculateSAW(scoredPenilaian, dataKriteria).hasil_akhir;
  }, [dataKriteria, dataPenilaian, dataRanking]);

  const candidateCount = useMemo(() => {
    return computedRanking.length;
  }, [computedRanking]);

  const topCandidates = useMemo(() => {
    return [...computedRanking]
      .sort((a, b) => a.ranking - b.ranking)
      .slice(0, 5);
  }, [computedRanking]);

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
          value={candidateCount} 
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
                {topCandidates.length > 0 ? topCandidates.map((row) => (
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
                )) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      Belum ada hasil ranking SAW.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weight Distribution */}
        <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 font-bold text-gray-800 uppercase tracking-wide text-xs">Bobot Kriteria Penilaian</h3>
          <div className="space-y-5">
            {dataKriteria.length > 0 ? [...dataKriteria].sort((a, b) => b.bobot - a.bobot).map((kriteria, idx) => (
              <div key={kriteria.kode}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{kriteria.kode} - {kriteria.nama}</span>
                  <span className="font-bold">{kriteria.bobot}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className={`h-2 rounded-full ${getKriteriaColor(idx)}`} style={{width: `${kriteria.bobot}%`}}></div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500">Belum ada data kriteria.</p>
            )}
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
