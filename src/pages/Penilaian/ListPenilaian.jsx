import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, Edit } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import ModalForm from '../../components/ModalForm';

const initialData = [
  { id: 'P01', nik: '1001', nama: 'Budi Santoso', jabatan: 'Staff Operasional', c1: 90, c2: 85, c3: 75, c4: 80, c5: 90, status: 'Sudah Dinilai' },
  { id: 'P02', nik: '1002', nama: 'Siti Aminah', jabatan: 'Staff Keuangan', c1: 85, c2: 80, c3: 90, c4: 95, c5: 85, status: 'Sudah Dinilai' },
  { id: 'P03', nik: '1003', nama: 'Ahmad Faisal', jabatan: 'Supervisor Lapangan', c1: 95, c2: 75, c3: 85, c4: 70, c5: 80, status: 'Sudah Dinilai' },
  { id: 'P04', nik: '1004', nama: 'Rina Wijaya', jabatan: 'Staff HRD', c1: 80, c2: 80, c3: 80, c4: 85, c5: 80, status: 'Sudah Dinilai' },
  { id: 'P05', nik: '1005', nama: 'Doni Pratama', jabatan: 'Teknisi', c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, status: 'Belum Dinilai' },
];

export default function ListPenilaian() {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    c1: 0, c2: 0, c3: 0, c4: 0, c5: 0
  });

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = 
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = filterStatus ? item.status === filterStatus : true;

      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, filterStatus]);

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedData = data.map(item => {
      if (item.id === selectedItem.id) {
        return { 
          ...item, 
          c1: Number(formData.c1),
          c2: Number(formData.c2),
          c3: Number(formData.c3),
          c4: Number(formData.c4),
          c5: Number(formData.c5),
          status: 'Sudah Dinilai'
        };
      }
      return item;
    });
    
    setData(updatedData);
    toast.success('Nilai penilaian berhasil diperbarui');
    handleCloseModal();
  };

  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#40916C]/20 focus:border-[#40916C] outline-none transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Input Penilaian</h1>
          <p className="text-slate-500 text-sm mt-1">Input nilai atribut kriteria karyawan</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari karyawan..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#40916C] focus:border-[#40916C] outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative w-full sm:w-auto" ref={filterRef}>
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm font-medium w-full sm:w-auto",
                showFilter || filterStatus 
                  ? "bg-[#40916C] border-[#40916C] text-white" 
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              <Filter size={16} />
              Filter
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
                    <label className="block text-gray-600 mb-1">Status Penilaian</label>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full border-gray-300 rounded-md py-1.5 focus:ring-[#40916C] focus:border-[#40916C] outline-none"
                    >
                      <option value="">Semua Status</option>
                      <option value="Sudah Dinilai">Sudah Dinilai</option>
                      <option value="Belum Dinilai">Belum Dinilai</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Nama Karyawan</th>
                <th className="px-6 py-3 text-center">C1<br/><span className="text-[10px] font-normal text-gray-400">Absensi</span></th>
                <th className="px-6 py-3 text-center">C2<br/><span className="text-[10px] font-normal text-gray-400">Kinerja</span></th>
                <th className="px-6 py-3 text-center">C3<br/><span className="text-[10px] font-normal text-gray-400">Masa Kerja</span></th>
                <th className="px-6 py-3 text-center">C4<br/><span className="text-[10px] font-normal text-gray-400">Pendidikan</span></th>
                <th className="px-6 py-3 text-center">C5<br/><span className="text-[10px] font-normal text-gray-400">Kedisiplinan</span></th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{row.nama}</p>
                      <p className="text-xs text-gray-500">{row.jabatan}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-gray-600 font-bold">{row.c1 || '-'}</td>
                    <td className="px-6 py-4 text-center font-mono text-gray-600 font-bold">{row.c2 || '-'}</td>
                    <td className="px-6 py-4 text-center font-mono text-gray-600 font-bold">{row.c3 || '-'}</td>
                    <td className="px-6 py-4 text-center font-mono text-gray-600 font-bold">{row.c4 || '-'}</td>
                    <td className="px-6 py-4 text-center font-mono text-gray-600 font-bold">{row.c5 || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${row.status === 'Sudah Dinilai' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleOpenEdit(row)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded transition-colors text-xs font-medium border border-emerald-200"
                      >
                        <Edit size={14} /> Input Nilai
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data karyawan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalForm 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title="Input Nilai Penilaian"
      >
        <form id="penilaianForm" onSubmit={handleSubmit} className="p-6 space-y-4">
          {selectedItem && (
            <>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 border border-blue-100">
                <p>Menginput nilai untuk <strong>{selectedItem.nama}</strong> ({selectedItem.jabatan})</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">C1 - Absensi <span className="text-red-500">*</span></label>
                  <input type="number" name="c1" value={formData.c1} onChange={handleChange} required min="0" max="100"
                    className={inputClassName} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">C2 - Kinerja <span className="text-red-500">*</span></label>
                  <input type="number" name="c2" value={formData.c2} onChange={handleChange} required min="0" max="100"
                    className={inputClassName} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">C3 - Masa Kerja <span className="text-red-500">*</span></label>
                  <input type="number" name="c3" value={formData.c3} onChange={handleChange} required min="0" max="100"
                    className={inputClassName} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">C4 - Pendidikan <span className="text-red-500">*</span></label>
                  <input type="number" name="c4" value={formData.c4} onChange={handleChange} required min="0" max="100"
                    className={inputClassName} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">C5 - Kedisiplinan <span className="text-red-500">*</span></label>
                  <input type="number" name="c5" value={formData.c5} onChange={handleChange} required min="0" max="100"
                    className={inputClassName} />
                </div>
              </div>
            </>
          )}
        </form>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={handleCloseModal}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit" 
            form="penilaianForm"
            className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm font-medium hover:bg-[#2D6A4F] transition-colors shadow-sm"
          >
            Simpan Nilai
          </button>
        </div>
      </ModalForm>
    </div>
  );
}

