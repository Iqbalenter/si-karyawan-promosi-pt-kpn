import { useEffect, useMemo, useState } from 'react';
import { Calculator, Save, Download } from 'lucide-react';
import { calculateSAW } from '../../utils/saw';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import {
  createSafeDocId,
  listenCollection,
  replaceCollectionDocuments,
} from '../../services/firestoreService';

export default function PerhitunganSAW() {
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dataKriteria, setDataKriteria] = useState([]);
  const [dataPenilaian, setDataPenilaian] = useState([]);

  useEffect(() => {
    const unsubscribes = [
      listenCollection(
        'kriteria',
        (items) =>
          setDataKriteria(
            items
              .map((item) => ({
                ...item,
                kode_kriteria: item.kode_kriteria || item.kode,
                jenis: String(item.jenis || 'Benefit').toLowerCase(),
                bobot: Number(item.bobot || 0),
              }))
              .sort((a, b) => String(a.kode_kriteria).localeCompare(String(b.kode_kriteria)))
          ),
        (error) => {
          console.error(error);
          toast.error('Gagal memuat data kriteria');
        }
      ),
      listenCollection(
        'penilaian',
        (items) =>
          setDataPenilaian(
            items
              .map((item) => ({
                ...item,
                nilai_absensi: Number(item.nilai_absensi || 0),
                nilai_kinerja: Number(item.nilai_kinerja || 0),
                nilai_masa_kerja: Number(item.nilai_masa_kerja || 0),
                nilai_pendidikan: Number(item.nilai_pendidikan || 0),
                nilai_kedisiplinan: Number(item.nilai_kedisiplinan || 0),
              }))
          ),
        (error) => {
          console.error(error);
          toast.error('Gagal memuat data penilaian');
        }
      ),
    ];

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, []);

  const hasilSAW = useMemo(() => calculateSAW(dataPenilaian, dataKriteria), [dataPenilaian, dataKriteria]);

  const handleCalculate = () => {
    if (dataKriteria.length === 0) {
      toast.error('Data kriteria belum tersedia di Firestore');
      return;
    }

    if (dataPenilaian.length === 0) {
      toast.error('Data penilaian belum tersedia di Firestore');
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      setHasCalculated(true);
      setIsCalculating(false);
    }, 1000);
  };

  const handleSaveResults = async () => {
    if (hasilSAW.hasil_akhir.length === 0) {
      toast.error('Belum ada hasil SAW untuk disimpan');
      return;
    }

    try {
      setIsSaving(true);
      await replaceCollectionDocuments(
        'hasil_saw',
        hasilSAW.hasil_akhir,
        (item) => createSafeDocId(item.id_karyawan)
      );
      toast.success('Hasil SAW berhasil disimpan ke Firestore');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan hasil SAW');
    } finally {
      setIsSaving(false);
    }
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
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExportExcel} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              <Download size={16} /> Export Excel
            </button>
            <button onClick={handleExportPDF} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              <Download size={16} /> Export PDF
            </button>
            <button onClick={handleSaveResults} disabled={isSaving} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-emerald-950 rounded-lg hover:bg-amber-600 transition-colors text-sm font-semibold disabled:opacity-70">
              <Save size={16} /> {isSaving ? 'Menyimpan...' : 'Simpan ke Firestore'}
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
