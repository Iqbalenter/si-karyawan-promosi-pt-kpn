/**
 * Fungsi untuk melakukan perhitungan Simple Additive Weighting (SAW)
 * 
 * Tahapan SAW:
 * 1. Menerima array data penilaian dan data kriteria.
 * 2. Mencari nilai max (untuk benefit) dan min (untuk cost) dari setiap kriteria.
 * 3. Menghitung nilai normalisasi untuk setiap alternatif (karyawan).
 * 4. Menghitung nilai akhir dengan mengalikan nilai normalisasi dengan bobot kriteria.
 * 5. Mengurutkan berdasarkan nilai akhir tertinggi.
 * 6. Menentukan status rekomendasi promosi.
 * 
 * @param {Array} dataPenilaian - Array of object penilaian karyawan
 * @param {Array} dataKriteria - Array of object kriteria (memiliki property kode_kriteria, jenis, bobot)
 * @returns {Object} Object berisi tabel_awal, tabel_normalisasi, tabel_terbobot, dan hasil_akhir
 */
export const calculateSAW = (dataPenilaian, dataKriteria) => {
  if (!dataPenilaian || !dataKriteria || dataPenilaian.length === 0 || dataKriteria.length === 0) {
    return { tabel_awal: [], tabel_normalisasi: [], tabel_terbobot: [], hasil_akhir: [] };
  }

  // 1. Pembentukan Matriks Keputusan (Tabel Awal)
  // Memformat data penilaian menjadi bentuk matriks yang mudah diolah
  const tabel_awal = dataPenilaian.map(penilaian => {
    return {
      id_karyawan: penilaian.id_karyawan,
      nama_karyawan: penilaian.nama_karyawan,
      jabatan: penilaian.jabatan || '-',
      departemen: penilaian.departemen || '-',
      // Mengambil nilai berdasarkan kode kriteria yang disepakati (misal C1 = Absensi, dll)
      // Dalam kasus ini kita petakan kode kriteria ke field yang sesuai
      C1: penilaian.nilai_absensi || 0,
      C2: penilaian.nilai_kinerja || 0,
      C3: penilaian.nilai_masa_kerja || 0,
      C4: penilaian.nilai_pendidikan || 0,
      C5: penilaian.nilai_kedisiplinan || 0,
    };
  });

  // 2. Mencari Nilai Max dan Min untuk setiap kriteria
  const maxMinValues = {};
  dataKriteria.forEach(kriteria => {
    const kode = kriteria.kode_kriteria; // contoh: "C1", "C2"
    // Ekstrak semua nilai untuk kriteria ini dari seluruh karyawan
    const allValues = tabel_awal.map(item => Number(item[kode] || 0));
    
    if (kriteria.jenis.toLowerCase() === 'benefit') {
      maxMinValues[kode] = Math.max(...allValues);
      // Hindari pembagian dengan 0
      if (maxMinValues[kode] === 0) maxMinValues[kode] = 1; 
    } else {
      maxMinValues[kode] = Math.min(...allValues);
    }
  });

  // 3. Normalisasi Nilai (Tabel Normalisasi)
  // Kriteria Benefit: r = nilai / max
  // Kriteria Cost: r = min / nilai
  const tabel_normalisasi = tabel_awal.map(item => {
    const normalisasi_item = { 
      id_karyawan: item.id_karyawan, 
      nama_karyawan: item.nama_karyawan,
      jabatan: item.jabatan,
      departemen: item.departemen
    };
    
    dataKriteria.forEach(kriteria => {
      const kode = kriteria.kode_kriteria;
      const nilai = Number(item[kode]);
      
      if (kriteria.jenis.toLowerCase() === 'benefit') {
        normalisasi_item[kode] = nilai / maxMinValues[kode];
      } else {
        normalisasi_item[kode] = nilai === 0 ? 0 : maxMinValues[kode] / nilai;
      }
      
      // Bulatkan ke 4 angka desimal untuk presisi yang baik
      normalisasi_item[kode] = Math.round(normalisasi_item[kode] * 10000) / 10000;
    });
    
    return normalisasi_item;
  });

  // 4. Perkalian dengan Bobot (Tabel Terbobot) dan Penjumlahan Nilai Akhir
  const tabel_terbobot = [];
  const hasil_akhir_sementara = [];

  tabel_normalisasi.forEach(item => {
    const terbobot_item = { 
      id_karyawan: item.id_karyawan, 
      nama_karyawan: item.nama_karyawan,
      jabatan: item.jabatan,
      departemen: item.departemen
    };
    
    let total_nilai_akhir = 0;
    
    dataKriteria.forEach(kriteria => {
      const kode = kriteria.kode_kriteria;
      // Konversi bobot ke bentuk desimal (misal 20% menjadi 0.20)
      const bobot_desimal = Number(kriteria.bobot) / 100;
      
      const nilai_terbobot = item[kode] * bobot_desimal;
      terbobot_item[kode] = Math.round(nilai_terbobot * 10000) / 10000;
      
      total_nilai_akhir += nilai_terbobot;
    });

    // Bulatkan nilai akhir
    total_nilai_akhir = Math.round(total_nilai_akhir * 10000) / 10000;
    terbobot_item.nilai_akhir = total_nilai_akhir;
    
    tabel_terbobot.push(terbobot_item);

    // Siapkan object untuk hasil akhir (akan diranking)
    hasil_akhir_sementara.push({
      id_karyawan: item.id_karyawan,
      nama_karyawan: item.nama_karyawan,
      jabatan: item.jabatan,
      departemen: item.departemen,
      nilai_normalisasi: {
        absensi: item.C1,
        kinerja: item.C2,
        masa_kerja: item.C3,
        pendidikan: item.C4,
        kedisiplinan: item.C5
      },
      nilai_akhir: total_nilai_akhir
    });
  });

  // 5. Pengurutan Ranking dari Nilai Tertinggi
  hasil_akhir_sementara.sort((a, b) => b.nilai_akhir - a.nilai_akhir);

  // 6. Penentuan Status Rekomendasi Promosi & Penomoran Ranking
  const hasil_akhir = hasil_akhir_sementara.map((item, index) => {
    let status = "";
    const nilai = item.nilai_akhir;
    
    if (nilai >= 0.85) {
      status = "Sangat Direkomendasikan";
    } else if (nilai >= 0.70 && nilai < 0.85) {
      status = "Direkomendasikan";
    } else if (nilai >= 0.55 && nilai < 0.70) {
      status = "Dipertimbangkan";
    } else {
      status = "Belum Direkomendasikan";
    }

    return {
      ranking: index + 1,
      ...item,
      status_rekomendasi: status
    };
  });

  return {
    tabel_awal,
    tabel_normalisasi,
    tabel_terbobot,
    hasil_akhir
  };
};
