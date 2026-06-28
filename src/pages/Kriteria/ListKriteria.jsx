import { useEffect, useRef, useState } from 'react';
import { Edit } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import ModalForm from '../../components/ModalForm';
import {
  createDocument,
  listenCollection,
  updateDocument,
} from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';

const defaultKriteria = [
  { kode: 'C1', kode_kriteria: 'C1', nama: 'Absensi', jenis: 'Benefit', bobot: 20 },
  { kode: 'C2', kode_kriteria: 'C2', nama: 'Kinerja', jenis: 'Benefit', bobot: 30 },
  { kode: 'C3', kode_kriteria: 'C3', nama: 'Masa Kerja', jenis: 'Benefit', bobot: 15 },
  { kode: 'C4', kode_kriteria: 'C4', nama: 'Pendidikan', jenis: 'Benefit', bobot: 15 },
  { kode: 'C5', kode_kriteria: 'C5', nama: 'Kedisiplinan', jenis: 'Benefit', bobot: 20 },
];

export default function ListKriteria() {
  const { user } = useAuth();
  const hasSeeded = useRef(false);
  const [data, setData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({ bobot: '' });

  const totalBobot = data.reduce((acc, curr) => acc + curr.bobot, 0);

  useEffect(() => {
    const unsubscribe = listenCollection(
      'kriteria',
      async (items) => {
        if (items.length === 0 && user?.role === 'Admin' && !hasSeeded.current) {
          hasSeeded.current = true;
          try {
            await Promise.all(defaultKriteria.map((item) => createDocument('kriteria', item)));
            toast.success('Kriteria default berhasil dibuat di Firestore');
          } catch (error) {
            console.error(error);
            toast.error('Gagal membuat kriteria default');
          }
          return;
        }

        setData(
          items
            .map((item) => ({
              ...item,
              kode: item.kode || item.kode_kriteria,
              kode_kriteria: item.kode_kriteria || item.kode,
              bobot: Number(item.bobot || 0),
            }))
            .sort((a, b) => String(a.kode).localeCompare(String(b.kode)))
        );
        setLoadingData(false);
      },
      (error) => {
        console.error(error);
        toast.error('Gagal memuat data kriteria');
        setLoadingData(false);
      }
    );

    return unsubscribe;
  }, [user?.role]);

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({ bobot: item.bobot });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleChange = (e) => {
    setFormData({ bobot: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newBobot = parseInt(formData.bobot, 10);
    
    if (isNaN(newBobot) || newBobot < 0) {
      toast.error('Bobot harus berupa angka positif');
      return;
    }

    try {
      await updateDocument('kriteria', selectedItem.docId, {
        ...selectedItem,
        bobot: newBobot,
      });

      toast.success('Bobot kriteria berhasil diperbarui');
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error('Gagal memperbarui bobot kriteria');
    }
  };

  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#40916C]/20 focus:border-[#40916C] outline-none transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kriteria Penilaian</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola bobot dan jenis kriteria metode SAW</p>
        </div>
        <div className={clsx("px-4 py-2 rounded-lg text-sm flex items-center gap-2", totalBobot !== 100 ? "bg-red-50 border border-red-200 text-red-800" : "bg-green-50 border border-green-200 text-green-800")}>
          <span className="font-medium">Total Bobot:</span>
          <span className="font-bold text-lg">{totalBobot}%</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Kode</th>
                <th className="px-6 py-3">Nama Kriteria</th>
                <th className="px-6 py-3">Jenis Atribut</th>
                <th className="px-6 py-3 text-right">Bobot (%)</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingData ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Memuat data kriteria...
                  </td>
                </tr>
              ) : data.length > 0 ? data.map((row) => (
                <tr key={row.docId} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-[#1B4332]">{row.kode}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.nama}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {row.jenis}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-700">{row.bobot}%</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenEdit(row)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200 flex items-center gap-1 text-xs font-medium"
                      >
                        <Edit size={14} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Belum ada data kriteria di Firestore.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-sm text-slate-600">
          <p><strong>Catatan:</strong> Pastikan total bobot dari seluruh kriteria adalah 100%. Kriteria dengan jenis "Benefit" berarti semakin tinggi nilainya semakin baik, sedangkan "Cost" berarti sebaliknya.</p>
        </div>
      </div>

      <ModalForm 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title="Edit Bobot Kriteria"
      >
        <form id="kriteriaForm" onSubmit={handleSubmit} className="p-6 space-y-4">
          {selectedItem && (
            <>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 border border-blue-100">
                <p>Mengubah bobot untuk kriteria <strong>{selectedItem.kode} - {selectedItem.nama}</strong></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bobot (%) <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  name="bobot" 
                  value={formData.bobot} 
                  onChange={handleChange} 
                  required 
                  min="0"
                  max="100"
                  placeholder="Contoh: 20"
                  className={inputClassName} 
                />
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
            form="kriteriaForm"
            className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm font-medium hover:bg-[#2D6A4F] transition-colors shadow-sm"
          >
            Simpan Perubahan
          </button>
        </div>
      </ModalForm>
    </div>
  );
}
