import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, Printer, Download, Save } from 'lucide-react';
import { clsx } from 'clsx';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function HasilRanking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Q3 2024');

  // Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Dummy final results that would normally be fetched from Firebase "hasil_saw" collection
  const hasilRanking = [
    { ranking: 1, id_karyawan: 'K001', nama_karyawan: 'Budi Santoso', jabatan: 'Staff Operasional', departemen: 'Operasional', nilai_akhir: 0.932, status_rekomendasi: 'Sangat Direkomendasikan', periode: 'Q3 2024' },
    { ranking: 2, id_karyawan: 'K002', nama_karyawan: 'Siti Aminah', jabatan: 'Staff Keuangan', departemen: 'Keuangan', nilai_akhir: 0.885, status_rekomendasi: 'Sangat Direkomendasikan', periode: 'Q3 2024' },
    { ranking: 3, id_karyawan: 'K003', nama_karyawan: 'Ahmad Faisal', jabatan: 'Supervisor Lapangan', departemen: 'Operasional', nilai_akhir: 0.841, status_rekomendasi: 'Direkomendasikan', periode: 'Q3 2024' },
    { ranking: 4, id_karyawan: 'K004', nama_karyawan: 'Rina Wijaya', jabatan: 'Staff HRD', departemen: 'HRD', nilai_akhir: 0.792, status_rekomendasi: 'Direkomendasikan', periode: 'Q3 2024' },
    { ranking: 5, id_karyawan: 'K005', nama_karyawan: 'Doni Pratama', jabatan: 'Teknisi', departemen: 'Teknik', nilai_akhir: 0.715, status_rekomendasi: 'Direkomendasikan', periode: 'Q2 2024' },
  ];

  const filteredData = useMemo(() => {
    return hasilRanking.filter(item => {
      const matchSearch = 
        item.nama_karyawan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.departemen.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = filterStatus ? item.status_rekomendasi === filterStatus : true;
      const matchPeriod = selectedPeriod ? item.periode === selectedPeriod : true;

      return matchSearch && matchStatus && matchPeriod;
    });
  }, [hasilRanking, searchTerm, filterStatus, selectedPeriod]);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(row => ({
      Ranking: row.ranking,
      'ID Karyawan': row.id_karyawan,
      'Nama Karyawan': row.nama_karyawan,
      Jabatan: row.jabatan,
      Departemen: row.departemen,
      'Nilai Akhir': Number(row.nilai_akhir.toFixed(3)),
      Status: row.status_rekomendasi,
      Periode: row.periode
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Ranking SAW ${selectedPeriod}`);
    XLSX.writeFile(wb, `Hasil_Ranking_SAW_${selectedPeriod.replace(/\s+/g, '_')}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Hasil Ranking SAW - Rekomendasi Promosi (${selectedPeriod})`, 14, 15);
    
    const tableColumn = ["Ranking", "Nama Karyawan", "Jabatan", "Departemen", "Nilai Akhir", "Status"];
    const tableRows = [];

    filteredData.forEach(row => {
      const rowData = [
        row.ranking,
        row.nama_karyawan,
        row.jabatan,
        row.departemen,
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

    doc.save(`Hasil_Ranking_SAW_${selectedPeriod.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hasil Rekomendasi Promosi</h1>
          <p className="text-slate-500 text-sm mt-1">Daftar peringkat karyawan berdasarkan nilai akhir penilaian</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportExcel} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <Download size={16} /> Export Excel
          </button>
          <button onClick={handleExportPDF} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-emerald-950 rounded-lg hover:bg-amber-600 transition-colors shadow-sm font-medium text-sm">
            <Save size={16} />
            Simpan Hasil (PDF)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-slate-500">Periode:</span>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-slate-300 rounded-lg py-1.5 pl-3 pr-8 focus:ring-[#40916C] focus:border-[#40916C] font-medium text-sm w-full sm:w-auto outline-none"
            >
              <option value="Q3 2024">Q3 2024</option>
              <option value="Q2 2024">Q2 2024</option>
              <option value="Q1 2024">Q1 2024</option>
            </select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama karyawan..."
                className="block w-full pl-10 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-[#40916C] focus:border-[#40916C] outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={clsx(
                  "inline-flex items-center justify-center gap-2 p-2 border rounded-lg transition-colors",
                  showFilter || filterStatus
                    ? "bg-[#40916C] border-[#40916C] text-white"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                )}
              >
                <Filter size={16} />
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-10 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-800">Filter</h3>
                    <button 
                      onClick={() => setFilterStatus('')}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-gray-600 mb-1">Status Rekomendasi</label>
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-1.5 focus:ring-[#40916C] focus:border-[#40916C] outline-none px-2"
                      >
                        <option value="">Semua Status</option>
                        <option value="Sangat Direkomendasikan">Sangat Direkomendasikan</option>
                        <option value="Direkomendasikan">Direkomendasikan</option>
                        <option value="Dipertimbangkan">Dipertimbangkan</option>
                        <option value="Tidak Direkomendasikan">Tidak Direkomendasikan</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Peringkat</th>
                <th className="px-6 py-4">Nama Karyawan</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4">Departemen</th>
                <th className="px-6 py-4 text-center">Nilai Akhir</th>
                <th className="px-6 py-4 text-right">Status Rekomendasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.id_karyawan} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#1B4332]">
                      {row.ranking.toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.nama_karyawan}</td>
                    <td className="px-6 py-4 text-gray-500">{row.jabatan}</td>
                    <td className="px-6 py-4 text-gray-500">{row.departemen}</td>
                    <td className="px-6 py-4 text-center font-mono text-blue-600">
                      {row.nilai_akhir.toFixed(3)}
                    </td>
                    <td className="px-6 py-4 text-right">
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data ditemukan untuk filter yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
