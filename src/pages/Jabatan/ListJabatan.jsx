import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ModalForm from '../../components/ModalForm';
import ConfirmDialog from '../../components/ConfirmDialog';

const initialData = [
  { id: 'J01', nama: 'Manager Operasional', departemen: 'Operasional', level: 'Managerial' },
  { id: 'J02', nama: 'Supervisor Lapangan', departemen: 'Operasional', level: 'Supervisor' },
  { id: 'J03', nama: 'Staff Keuangan', departemen: 'Keuangan', level: 'Staff' },
];

const departemenOptions = ['Operasional', 'Keuangan', 'HRD', 'Teknik'];
const levelOptions = ['Managerial', 'Supervisor', 'Staff', 'Entry Level'];

export default function ListJabatan() {
  const [data, setData] = useState(initialData);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '', nama: '', departemen: '', level: ''
  });

  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#40916C]/20 focus:border-[#40916C] outline-none transition-all";

  // Handlers
  const handleOpenAdd = () => {
    setFormData({ id: '', nama: '', departemen: '', level: '' });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({ ...item });
    setSelectedItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
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
    
    if (modalMode === 'add') {
      const isDuplicate = data.some(item => item.id === formData.id);
      if (isDuplicate) {
        toast.error('ID Jabatan sudah terdaftar!');
        return;
      }
      
      setData([...data, formData]);
      toast.success('Data jabatan berhasil ditambahkan');
    } else if (modalMode === 'edit') {
      const isDuplicate = data.some(item => item.id === formData.id && item.id !== selectedItem.id);
      if (isDuplicate) {
        toast.error('ID Jabatan sudah terdaftar pada jabatan lain!');
        return;
      }

      const updatedData = data.map(item => 
        item.id === selectedItem.id ? formData : item
      );
      setData(updatedData);
      toast.success('Data jabatan berhasil diperbarui');
    }
    
    handleCloseModal();
  };

  const handleDelete = () => {
    const updatedData = data.filter(item => item.id !== selectedItem.id);
    setData(updatedData);
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
    toast.success('Data jabatan berhasil dihapus');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Jabatan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola struktur jabatan perusahaan</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F] transition-colors shadow-sm font-medium text-sm"
        >
          <Plus size={18} />
          Tambah Jabatan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">ID Jabatan</th>
                <th className="px-6 py-3">Nama Jabatan</th>
                <th className="px-6 py-3">Departemen</th>
                <th className="px-6 py-3">Level Jabatan</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.id}</td>
                    <td className="px-6 py-4 text-gray-800">{row.nama}</td>
                    <td className="px-6 py-4 text-gray-500">{row.departemen}</td>
                    <td className="px-6 py-4 text-gray-500">{row.level}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(row)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleOpenDelete(row)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data jabatan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form (Add/Edit) */}
      <ModalForm 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={modalMode === 'add' ? 'Tambah Data Jabatan' : 'Edit Data Jabatan'}
      >
        <form id="jabatanForm" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Jabatan <span className="text-red-500">*</span></label>
            <input type="text" name="id" value={formData.id} onChange={handleChange} required placeholder="Contoh: J01"
              className={inputClassName} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jabatan <span className="text-red-500">*</span></label>
            <input type="text" name="nama" value={formData.nama} onChange={handleChange} required placeholder="Contoh: Manager Operasional"
              className={inputClassName} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departemen <span className="text-red-500">*</span></label>
            <select name="departemen" value={formData.departemen} onChange={handleChange} required
              className={inputClassName}>
              <option value="" disabled>Pilih Departemen</option>
              {departemenOptions.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level Jabatan <span className="text-red-500">*</span></label>
            <select name="level" value={formData.level} onChange={handleChange} required
              className={inputClassName}>
              <option value="" disabled>Pilih Level</option>
              {levelOptions.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
          </div>
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
            form="jabatanForm"
            className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm font-medium hover:bg-[#2D6A4F] transition-colors shadow-sm"
          >
            Simpan Data
          </button>
        </div>
      </ModalForm>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Jabatan"
        message={`Apakah Anda yakin ingin menghapus data jabatan ${selectedItem?.nama}? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
