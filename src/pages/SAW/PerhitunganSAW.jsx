import { useState, useMemo } from 'react';
import { Calculator, Save, Download } from 'lucide-react';
import { calculateSAW } from '../../utils/saw';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Dummy data for simulation
const dummyKriteria = [
  { kode_kriteria: 'C1', nama: 'Absensi', jenis: 'benefit', bobot: 20 },
  { kode_kriteria: 'C2', nama: 'Kinerja', jenis: 'benefit', bobot: 30 },
  { kode_kriteria: 'C3', nama: 'Masa Kerja', jenis: 'benefit', bobot: 15 },
  { kode_kriteria: 'C4', nama: 'Pendidikan', jenis: 'benefit', bobot: 15 },
  { kode_kriteria: 'C5', nama: 'Kedisiplinan', jenis: 'benefit', bobot: 20 },
];

const dummyPenilaian = [
  { id_karyawan: 'K001', nama_karyawan: 'Budi Santoso', jabatan: 'Staff Operasional', periode: 'Q3 2024', nilai_absensi: 90, nilai_kinerja: 85, nilai_masa_kerja: 75, nilai_pendidikan: 80, nilai_kedisiplinan: 90 },
  { id_karyawan: 'K002', nama_karyawan: 'Siti Aminah', jabatan: 'Staff Keuangan', periode: 'Q3 2024', nilai_absensi: 85, nilai_kinerja: 80, nilai_masa_kerja: 90, nilai_pendidikan: 95, nilai_kedisiplinan: 85 },
  { id_karyawan: 'K003', nama_karyawan: 'Ahmad Faisal', jabatan: 'Supervisor Lapangan', periode: 'Q3 2024', nilai_absensi: 95, nilai_kinerja: 75, nilai_masa_kerja: 85, nilai_pendidikan: 70, nilai_kedisiplinan: 80 },
  { id_karyawan: 'K004', nama_karyawan: 'Rina Wijaya', jabatan: 'Staff HRD', periode: 'Q3 2024', nilai_absensi: 80, nilai_kinerja: 80, nilai_masa_kerja: 80, nilai_pendidikan: 85, nilai_kedisiplinan: 80 },
];

export default function PerhitunganSAW() {
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Gunakan useMemo agar tidak menghitung ulang pada setiap render jika data sama
  const hasilSAW = useMemo(() => calculateSAW(dummyPenilaian, dummyKriteria), []);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setHasCalculated(true);
      setIsCalculating(false);
    }, 1000);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(hasilSAW.hasil_akhir.map(row => ({
      Ranking: row.ranking,
      'ID Karyawan': row.id_karyawan,
      'Nama Karyawan': row.nama_karyawan,
      Jabatan: row.jabatan,
      'Nilai Akhir': Number(row.nilai_akhir.toFixed(3)),
      Status: row.status_rekomendasi
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil SAW");
    XLSX.writeFile(wb, "Hasil_Perhitungan_SAW.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Hasil Perhitungan SAW - Rekomendasi Promosi", 14, 15);
    
    const tableColumn = ["Ranking", "Nama Karyawan", "Jabatan", "Nilai Akhir", "Status"];
    const tableRows = [];

    hasilSAW.hasil_akhir.forEach(row => {
      const rowData = [
        row.ranking,
        row.nama_karyawan,
        row.jabatan,
        row.nilai_akhir.toFixed(3),
        row.status_rekomendasi
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [27, 67, 50] } // #1B4332
    });

    doc.save("Hasil_Perhitungan_SAW.pdf");
  };

  const renderTable = (data, title, columns) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 uppercase tracking-wide text-xs">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3">Nama Karyawan</th>
              {columns.map(col => <th key={col} className="px-6 py-3 text-center">{col}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-900">{row.nama_karyawan}</td>
                {columns.map(col => (
                  <td key={col} className="px-6 py-3 text-center font-mono text-gray-600">
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Perhitungan Metode SAW</h1>
          <p className="text-slate-500 text-sm mt-1">Proses perhitungan otomatis untuk rekomendasi promosi</p>
        </div>
        
        {!hasCalculated ? (
          <button 
            onClick={handleCalculate}
            disabled={isCalculating}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-sm font-medium disabled:opacity-70"
          >
            <Calculator size={18} />
            {isCalculating ? 'Memproses...' : 'Mulai Perhitungan'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleExportExcel} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              <Download size={16} /> Export Excel
            </button>
            <button onClick={handleExportPDF} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-emerald-950 rounded-lg hover:bg-amber-600 transition-colors text-sm font-semibold">
              <Save size={16} /> Simpan Hasil (PDF)
            </button>
          </div>
        )}
      </div>

      {!hasCalculated ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <Calculator size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Sistem Siap Menghitung</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Klik tombol "Mulai Perhitungan" di pojok kanan atas untuk memproses data penilaian menjadi rekomendasi promosi menggunakan metode Simple Additive Weighting.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Matriks Keputusan */}
          {renderTable(hasilSAW.tabel_awal, '1. Matriks Keputusan (X)', ['C1', 'C2', 'C3', 'C4', 'C5'])}

          {/* Tabel Normalisasi */}
          {renderTable(hasilSAW.tabel_normalisasi, '2. Tabel Normalisasi (R)', ['C1', 'C2', 'C3', 'C4', 'C5'])}

          {/* Tabel Terbobot */}
          {renderTable(hasilSAW.tabel_terbobot, '3. Tabel Terbobot (Y)', ['C1', 'C2', 'C3', 'C4', 'C5'])}

          {/* Hasil Akhir */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6 border-l-4 border-l-[#40916C]">
            <div className="px-6 py-4 border-b border-gray-100 bg-green-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 uppercase tracking-wide text-xs">4. Hasil Akhir (V) & Perangkingan</h3>
              <span className="text-[10px] bg-green-100 text-green-800 px-2 py-1 rounded font-bold uppercase">Diurutkan berdasarkan nilai tertinggi</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Ranking</th>
                    <th className="px-6 py-3">Nama Karyawan</th>
                    <th className="px-6 py-3 text-center">Nilai SAW</th>
                    <th className="px-6 py-3 text-right">Status Rekomendasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hasilSAW.hasil_akhir.map((row) => (
                    <tr key={row.id_karyawan} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-bold text-[#1B4332]">{row.ranking.toString().padStart(2, '0')}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {row.nama_karyawan}
                        <div className="text-xs text-gray-500 font-normal">{row.jabatan}</div>
                      </td>
                      <td className="px-6 py-3 text-center font-mono text-blue-600 font-bold">
                        {row.nilai_akhir.toFixed(3)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase
                          ${row.nilai_akhir >= 0.85 ? 'bg-green-100 text-green-700' : 
                            row.nilai_akhir >= 0.70 ? 'bg-blue-100 text-blue-700' : 
                            row.nilai_akhir >= 0.55 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'}`
                        }>
                          {row.status_rekomendasi}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
