import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, X } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import ModalForm from '../../components/ModalForm';
import ConfirmDialog from '../../components/ConfirmDialog';

// Dummy data sesuai permintaan awal
const initialData = [
  { id_karyawan: 'K001', nik: '1001', nama_lengkap: 'Budi Santoso', jabatan: 'Staff Operasional', departemen: 'Operasional', status_karyawan: 'Tetap', tempat_lahir: 'Jakarta', tanggal_lahir: '1990-01-01', jenis_kelamin: 'Laki-laki', alamat: 'Jl. Merdeka No. 1', no_hp: '081234567890', email: 'budi@example.com', pendidikan_terakhir: 'S1', jurusan: 'Teknik Industri', tanggal_masuk: '2015-05-10', masa_kerja: 9 },
  { id_karyawan: 'K002', nik: '1002', nama_lengkap: 'Siti Aminah', jabatan: 'Staff Keuangan', departemen: 'Keuangan', status_karyawan: 'Tetap', tempat_lahir: 'Bandung', tanggal_lahir: '1992-02-15', jenis_kelamin: 'Perempuan', alamat: 'Jl. Asia Afrika', no_hp: '081234567891', email: 'siti@example.com', pendidikan_terakhir: 'S1', jurusan: 'Akuntansi', tanggal_masuk: '2016-08-20', masa_kerja: 8 },
  { id_karyawan: 'K003', nik: '1003', nama_lengkap: 'Ahmad Faisal', jabatan: 'Supervisor Lapangan', departemen: 'Operasional', status_karyawan: 'Tetap', tempat_lahir: 'Surabaya', tanggal_lahir: '1988-11-20', jenis_kelamin: 'Laki-laki', alamat: 'Jl. Pahlawan', no_hp: '081234567892', email: 'ahmad@example.com', pendidikan_terakhir: 'S1', jurusan: 'Manajemen', tanggal_masuk: '2014-03-01', masa_kerja: 10 },
  { id_karyawan: 'K004', nik: '1004', nama_lengkap: 'Rina Wijaya', jabatan: 'Staff HRD', departemen: 'HRD', status_karyawan: 'Kontrak', tempat_lahir: 'Yogyakarta', tanggal_lahir: '1995-07-05', jenis_kelamin: 'Perempuan', alamat: 'Jl. Malioboro', no_hp: '081234567893', email: 'rina@example.com', pendidikan_terakhir: 'S1', jurusan: 'Psikologi', tanggal_masuk: '2021-01-15', masa_kerja: 3 },
  { id_karyawan: 'K005', nik: '1005', nama_lengkap: 'Doni Pratama', jabatan: 'Teknisi', departemen: 'Teknik', status_karyawan: 'Kontrak', tempat_lahir: 'Semarang', tanggal_lahir: '1994-09-10', jenis_kelamin: 'Laki-laki', alamat: 'Jl. Pemuda', no_hp: '081234567894', email: 'doni@example.com', pendidikan_terakhir: 'SMK', jurusan: 'Mesin', tanggal_masuk: '2022-06-01', masa_kerja: 2 },
  { id_karyawan: 'K006', nik: '1006', nama_lengkap: 'Dewi Lestari', jabatan: 'Staff Administrasi', departemen: 'HRD', status_karyawan: 'Kontrak', tempat_lahir: 'Malang', tanggal_lahir: '1997-12-12', jenis_kelamin: 'Perempuan', alamat: 'Jl. Ijen', no_hp: '081234567895', email: 'dewi@example.com', pendidikan_terakhir: 'D3', jurusan: 'Administrasi Perkantoran', tanggal_masuk: '2023-02-01', masa_kerja: 1 },
];

const departemenOptions = ['Operasional', 'Keuangan', 'HRD', 'Teknik'];
const jabatanOptions = ['Manager', 'Supervisor Lapangan', 'Staff Operasional', 'Staff Keuangan', 'Staff HRD', 'Staff Administrasi', 'Teknisi'];
const statusOptions = ['Tetap', 'Kontrak'];

export default function ListKaryawan() {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [filterDepartemen, setFilterDepartemen] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'detail'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    nik: '', nama_lengkap: '', jabatan: '', departemen: '', status_karyawan: 'Tetap',
    tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki', alamat: '',
    no_hp: '', email: '', pendidikan_terakhir: 'S1', jurusan: '', tanggal_masuk: ''
  });

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

  // Filter and Search Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = 
        item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.departemen.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDepartemen = filterDepartemen ? item.departemen === filterDepartemen : true;
      const matchStatus = filterStatus ? item.status_karyawan === filterStatus : true;

      return matchSearch && matchDepartemen && matchStatus;
    });
  }, [data, searchTerm, filterDepartemen, filterStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      nik: '', nama_lengkap: '', jabatan: '', departemen: '', status_karyawan: 'Tetap',
      tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki', alamat: '',
      no_hp: '', email: '', pendidikan_terakhir: 'SMA', jurusan: '', tanggal_masuk: ''
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({ ...item });
    setSelectedItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setModalMode('detail');
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
    
    // Validasi NIK unik
    if (modalMode === 'add') {
      const isDuplicate = data.some(item => item.nik === formData.nik);
      if (isDuplicate) {
        toast.error('NIK sudah terdaftar!');
        return;
      }
      
      const newItem = {
        ...formData,
        id_karyawan: `K00${data.length + 1}`, // simple ID generation
        masa_kerja: new Date().getFullYear() - new Date(formData.tanggal_masuk).getFullYear()
      };
      setData([...data, newItem]);
      toast.success('Data karyawan berhasil ditambahkan');
    } else if (modalMode === 'edit') {
      const isDuplicate = data.some(item => item.nik === formData.nik && item.id_karyawan !== selectedItem.id_karyawan);
      if (isDuplicate) {
        toast.error('NIK sudah terdaftar pada karyawan lain!');
        return;
      }

      const updatedData = data.map(item => 
        item.id_karyawan === selectedItem.id_karyawan 
          ? { ...formData, masa_kerja: new Date().getFullYear() - new Date(formData.tanggal_masuk).getFullYear() }
          : item
      );
      setData(updatedData);
      toast.success('Data karyawan berhasil diperbarui');
    }
    
    handleCloseModal();
  };

  const handleDelete = () => {
    const updatedData = data.filter(item => item.id_karyawan !== selectedItem.id_karyawan);
    setData(updatedData);
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
    toast.success('Data karyawan berhasil dihapus');
    
    // Adjust pagination if needed
    if (currentData.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#40916C]/20 focus:border-[#40916C] outline-none transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Karyawan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola informasi karyawan PT Kencana Pertama Nusantara</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F] transition-colors shadow-sm font-medium text-sm"
        >
          <Plus size={18} />
          Tambah Karyawan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama, NIK, atau jabatan..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#40916C] focus:border-[#40916C]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="relative w-full sm:w-auto" ref={filterRef}>
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm font-medium w-full sm:w-auto",
                showFilter || filterDepartemen || filterStatus 
                  ? "bg-[#40916C] border-[#40916C] text-white" 
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              <Filter size={16} />
              Filter Data
            </button>

            {/* Filter Dropdown */}
            {showFilter && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-10 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-800">Filter</h3>
                  <button 
                    onClick={() => { setFilterDepartemen(''); setFilterStatus(''); }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Reset
                  </button>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-gray-600 mb-1">Departemen</label>
                    <select 
                      value={filterDepartemen}
                      onChange={(e) => { setFilterDepartemen(e.target.value); setCurrentPage(1); }}
                      className="w-full border-gray-300 rounded-md py-1.5 focus:ring-[#40916C] focus:border-[#40916C]"
                    >
                      <option value="">Semua Departemen</option>
                      {departemenOptions.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Status Karyawan</label>
                    <select 
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                      className="w-full border-gray-300 rounded-md py-1.5 focus:ring-[#40916C] focus:border-[#40916C]"
                    >
                      <option value="">Semua Status</option>
                      {statusOptions.map(stat => <option key={stat} value={stat}>{stat}</option>)}
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
                <th className="px-6 py-3">NIK</th>
                <th className="px-6 py-3">Nama Lengkap</th>
                <th className="px-6 py-3">Jabatan</th>
                <th className="px-6 py-3">Departemen</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.length > 0 ? (
                currentData.map((row) => (
                  <tr key={row.id_karyawan} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-3 font-medium text-gray-900">{row.nik}</td>
                    <td className="px-6 py-3 font-medium">{row.nama_lengkap}</td>
                    <td className="px-6 py-3 text-gray-500">{row.jabatan}</td>
                    <td className="px-6 py-3 text-gray-500">{row.departemen}</td>
                    <td className="px-6 py-3">
                      <span className={clsx(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        row.status_karyawan === 'Tetap' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {row.status_karyawan}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenDetail(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Detail">
                          <Eye size={16} />
                        </button>
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
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data karyawan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-500">
            Menampilkan {currentData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} sampai {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || filteredData.length === 0}
              className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={clsx(
                  "px-3 py-1 border rounded-md text-sm font-medium transition-colors",
                  currentPage === i + 1 
                    ? "bg-[#1B4332] text-white border-[#1B4332]" 
                    : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                )}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || filteredData.length === 0}
              className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form (Add/Edit) */}
      <ModalForm 
        isOpen={isModalOpen && modalMode !== 'detail'} 
        onClose={handleCloseModal}
        title={modalMode === 'add' ? 'Tambah Data Karyawan' : 'Edit Data Karyawan'}
      >
        <form id="karyawanForm" onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK <span className="text-red-500">*</span></label>
                <input type="text" name="nik" value={formData.nik} onChange={handleChange} required placeholder="Masukkan NIK"
                  className={inputClassName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required placeholder="Masukkan nama lengkap"
                  className={inputClassName} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                  <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} required placeholder="Kota kelahiran"
                    className={inputClassName} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} required
                    className={inputClassName} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} required
                  className={inputClassName}>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea name="alamat" value={formData.alamat} onChange={handleChange} required rows={3} placeholder="Alamat lengkap"
                  className={inputClassName}></textarea>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                  <input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange} required placeholder="08xxx"
                    className={inputClassName} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@example.com"
                    className={inputClassName} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan</label>
                  <select name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleChange} required
                    className={inputClassName}>
                    {['SMA', 'SMK', 'D3', 'S1', 'S2'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
                  <input type="text" name="jurusan" value={formData.jurusan} onChange={handleChange} required placeholder="Contoh: Teknik Informatika"
                    className={inputClassName} />
                </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan <span className="text-red-500">*</span></label>
                <select name="jabatan" value={formData.jabatan} onChange={handleChange} required
                  className={inputClassName}>
                  <option value="" disabled>Pilih Jabatan</option>
                  {jabatanOptions.map(jab => <option key={jab} value={jab}>{jab}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Masuk <span className="text-red-500">*</span></label>
                  <input type="date" name="tanggal_masuk" value={formData.tanggal_masuk} onChange={handleChange} required
                    className={inputClassName} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Karyawan <span className="text-red-500">*</span></label>
                  <select name="status_karyawan" value={formData.status_karyawan} onChange={handleChange} required
                    className={inputClassName}>
                    {statusOptions.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-4">
          <button 
            type="button" 
            onClick={handleCloseModal}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit" 
            form="karyawanForm"
            className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm font-medium hover:bg-[#2D6A4F] transition-colors shadow-sm"
          >
            Simpan Data
          </button>
        </div>
      </ModalForm>

      {/* Modal Detail */}
      <ModalForm 
        isOpen={isModalOpen && modalMode === 'detail'} 
        onClose={handleCloseModal}
        title="Detail Data Karyawan"
      >
        {selectedItem && (
          <div className="p-6">
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
              <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                {selectedItem.nama_lengkap.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedItem.nama_lengkap}</h3>
                <p className="text-gray-500">{selectedItem.nik} &bull; {selectedItem.jabatan}</p>
                <div className="mt-2 flex gap-2">
                  <span className={clsx(
                    "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                    selectedItem.status_karyawan === 'Tetap' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  )}>
                    {selectedItem.status_karyawan}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                    Masa Kerja: {selectedItem.masa_kerja} Tahun
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Informasi Pribadi</h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-3"><span className="text-gray-500">Tempat Lahir</span><span className="col-span-2 font-medium text-gray-900">{selectedItem.tempat_lahir}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500">Tanggal Lahir</span><span className="col-span-2 font-medium text-gray-900">{selectedItem.tanggal_lahir}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500">Jenis Kelamin</span><span className="col-span-2 font-medium text-gray-900">{selectedItem.jenis_kelamin}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500">Alamat</span><span className="col-span-2 font-medium text-gray-900">{selectedItem.alamat}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Kontak & Pendidikan</h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-3"><span className="text-gray-500">No. HP</span><span className="col-span-2 font-medium text-gray-900">{selectedItem.no_hp}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500">Email</span><span className="col-span-2 font-medium text-gray-900">{selectedItem.email}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500">Pendidikan</span><span className="col-span-2 font-medium text-gray-900">{selectedItem.pendidikan_terakhir} - {selectedItem.jurusan}</span></div>
                </div>
              </div>
              <div className="md:col-span-2 mt-4 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Informasi Pekerjaan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div className="grid grid-cols-3"><span className="text-gray-500">Departemen</span><span className="col-span-2 font-medium text-gray-900">{selectedItem.departemen}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500">Tanggal Masuk</span><span className="col-span-2 font-medium text-gray-900">{selectedItem.tanggal_masuk}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalForm>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Karyawan"
        message={`Apakah Anda yakin ingin menghapus data karyawan ${selectedItem?.nama_lengkap}? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}

