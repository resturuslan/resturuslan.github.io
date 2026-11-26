# Restu & Ruslan — V2.3 Pure Static · Direct GitHub Save
Website HTML/CSS/JavaScript untuk GitHub Pages tanpa backend atau database. Data V2.1 dipertahankan (2 Januari 2027, Gedung Gilang Wiguna, profil dan rekening). Lokasi resepsi diasumsikan sama dengan akad; konfirmasi sebelum publikasi.

## Jalankan lokal
Ekstrak ZIP. Buka terminal di folder yang memuat index.html, jalankan `python -m http.server 8000` (Windows: `py -m http.server 8000`). Buka http://localhost:8000/ dan http://localhost:8000/admin.html. Gunakan localhost, bukan file://.

## Login dan pengaturan
Username `restu`, password `ruslan` (case-sensitive). Ini hanya pembatas tampilan JavaScript: siapa saja dapat membaca kredensial atau melewati login dengan developer tools. Login tidak memberi akses ke GitHub maupun hak tulis server. Jangan gunakan sebagai keamanan sungguhan. Jangan simpan token GitHub atau rahasia dalam project. Semua data config.js bersifat publik.

Admin memiliki menu cover, mempelai, acara, cerita, galeri/video, hadiah, musik dan RSVP. Upload foto JPG/PNG/WebP maksimal 20 MB sebelum kompresi. Foto dikompresi menjadi JPEG data URL untuk preview. Save & Publish mengubah foto baru menjadi file JPG terpisah di assets/uploads; simpan lokal menyimpan data URL dalam config.js (maks 12 foto galeri; total konfigurasi 3,3 juta karakter). Foto asli tidak diubah. Preview perubahan hanya terlihat di iframe admin. Backup JSON bisa diunduh dan diimpor, termasuk V2.1; endpoint lama diabaikan.

| Jenis foto | Rekomendasi |
|---|---|
| Cover | 1200 × 1500 px (4:5) |
| Mempelai | 1000 × 1250 px (4:5) |
| Galeri | 1200 × 1500 px (4:5) |
| Video | 1920 × 1080 px (16:9) |

## Simpan dan publikasi
1. Edit data, upload gambar, klik Preview perubahan.
2. Klik **Simpan ke folder project** di Chrome/Edge desktop. Pilih folder berisi index.html, admin.html, config.js; izinkan penulisan dan konfirmasi penimpaan. Hanya config.js yang ditulis. Memerlukan File System Access API dan konteks aman (HTTPS/localhost); browser atau kebijakan perangkat bisa memblokirnya.
3. Alternatif: klik **Unduh config.js**, lalu ganti config.js lama secara manual (nama harus tepat, bukan config (1).js). Backup file sebelumnya. Unduhan saja tidak menimpa file project.
4. Refresh halaman lokal untuk melihat konfigurasi tersimpan. Draft tidak otomatis tersimpan jika tab ditutup; simpan/unduh atau ekspor backup sebelum keluar.
5. GitHub Pages: buat repository publik, upload isi ZIP ke root, Settings > Pages > Deploy from a branch > main > /(root). Untuk perubahan berikutnya, commit/upload config.js terbaru. Setelah deployment sukses, refresh halaman tamu. Untuk publikasi langsung, ikuti SETUP-ADMIN.md. Jika konfigurasi merujuk file media GitHub baru, unduh seluruh repository agar preview lokal juga mempunyai file media tersebut.

## RSVP tanpa backend
Di admin menu Musik & RSVP, isi nomor WhatsApp penyelenggara format internasional (628...). Form membuka pesan RSVP di WhatsApp; tamu masih harus menekan Kirim. Website tidak menyimpan atau mengonfirmasi pengiriman, dan tidak ada buku tamu bersama. Default nomor kosong: RSVP disembunyikan untuk tamu; preview admin dapat menampilkan form tanpa mengirim.

## Privasi
Jangan publikasikan foto, alamat, rekening atau nomor WhatsApp tanpa persetujuan pemilik. Riwayat GitHub publik dapat menyimpan data/foto lama. Periksa sebelum commit.

## Save & Publish langsung
Buka SETUP-ADMIN.md untuk membuat token GitHub, menghubungkan repository dan memublikasikan perubahan dengan satu commit. Tidak ada database maupun server aplikasi. Token tidak tersimpan dalam file atau localStorage. Foto yang dihapus dari galeri tidak lagi direferensikan oleh konfigurasi, tetapi file lama tetap ada di repository dan histori.
