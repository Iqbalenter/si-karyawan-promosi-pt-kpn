# Sistem Informasi Promosi Jabatan PT KPN

Aplikasi React + Vite untuk mengelola data karyawan, jabatan, kriteria, penilaian, dan hasil ranking promosi dengan Firebase Authentication dan Cloud Firestore.

## Setup Firebase

1. Buat project di Firebase Console.
2. Aktifkan Authentication dengan provider Email/Password.
3. Aktifkan Cloud Firestore.
4. Salin konfigurasi Web App Firebase ke `.env.local` mengikuti format `.env.example`.
5. Deploy rules dari `firestore.rules` ke Firestore.

## Akun Login

Login memakai Firebase Authentication. Setelah membuat user di Firebase Authentication, buat dokumen profile di collection `users` dengan document ID yang sama dengan UID user.

Contoh dokumen:

```json
{
  "nama": "Admin Utama",
  "email": "admin@kpn.co.id",
  "role": "Admin"
}
```

Role yang dipakai rules:

- `Admin`: mengelola semua data master dan kriteria.
- `HRD`: mengelola karyawan, penilaian, dan hasil SAW.
- `Pimpinan`: membaca data dan hasil.

## Collections

- `users`
- `karyawan`
- `jabatan`
- `kriteria`
- `penilaian`
- `hasil_saw`
- `audit_logs`

## Menjalankan Lokal

```bash
npm install
npm run dev
```
