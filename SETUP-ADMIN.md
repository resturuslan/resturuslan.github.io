# V2.3 — Direct GitHub Save (tanpa backend/database)

## Setup sekali
1. Buat repository GitHub public khusus undangan, misalnya `restu-ruslan`. Upload semua isi ZIP V2.3 ke root branch `main`, termasuk `.nojekyll`. Jangan upload ZIP sebagai pengganti isi folder.
2. Settings > Pages > Source: Deploy from a branch > main > /(root) > Save. Pastikan deployment awal berhasil. Repository harus mengizinkan commit langsung ke branch yang dipilih. Jangan melemahkan proteksi repository penting; gunakan repository khusus undangan.
3. Buat fine-grained personal access token: https://github.com/settings/personal-access-tokens/new . Pilih resource owner yang sesuai, expiration sesingkat yang praktis, Only select repositories > repository undangan, Repository permissions > Contents: Read and write. Metadata Read otomatis. Simpan token secara privat. Jangan kirim token lewat chat, commit atau simpan di konfigurasi.

## Penggunaan harian
1. Buka `https://USERNAME.github.io/restu-ruslan/admin.html`.
2. Login `restu` / `ruslan` (hanya pembatas UI, bukan keamanan server).
3. Di GitHub Integration, isi owner, repository, branch dan token. Hubungkan sebelum edit; konfigurasi terbaru di branch dimuat, sehingga draft sebelumnya dapat terganti. Koneksi membaca repo; izin tulis baru teruji saat publish.
4. Edit data atau upload foto; rekomendasi cover/galeri 1200 × 1500 px, mempelai 1000 × 1250 px; JPG/PNG/WebP maks 20 MB sebelum kompresi. Preview sebelum menyimpan.
5. Klik **Save & Publish**, konfirmasi repository tujuan. Admin membuat blob foto baru (nama berbasis hash isi), tree, dan satu commit untuk konfigurasi dan media. Branch diperbarui tanpa force. Jika branch berubah selama sesi, backup draft, putuskan koneksi, hubungkan ulang dan gabungkan perubahan secara sadar. Jangan menimpa perubahan orang lain.
6. Setelah status commit berhasil, periksa tab Actions / Settings > Pages di GitHub. Refresh website setelah deployment sukses. Commit berhasil tidak menjamin deployment sukses. Foto lama tidak dihapus secara fisik, hanya dilepas dari galeri saat tidak lagi direferensikan.
7. Keluar atau putuskan koneksi untuk membuang token dari memori sesi. Masukkan ulang saat sesi baru. Token tidak disimpan di localStorage/sessionStorage maupun config.js.

## Simpan offline
Tombol Simpan ke folder project (Chrome/Edge di localhost/HTTPS) atau Unduh config.js tetap tersedia. Foto upload lokal tertanam di config.js; mode GitHub menyimpan foto baru sebagai file terpisah. Jangan menganggap perubahan lokal terpublikasi. Setelah publikasi online, sinkronkan salinan lokal dengan repository jika ingin bekerja offline. Backup JSON yang memiliki referensi file media tidak membawa file tersebut; backup seluruh repository untuk menyertakan media.

## Batasan
- Login JavaScript dapat dilewati/dibaca publik. Hanya token GitHub yang memberikan hak tulis. Jangan gunakan admin pada browser/perangkat yang tidak dipercaya, atau token untuk repo lain. Pencabutan token dilakukan di pengaturan GitHub.
- GitHub Pages tetap statis. Tidak ada RSVP tersimpan bersama; RSVP opsional via WhatsApp.
- Musik dapat diatur dengan URL atau path file MP3; upload langsung melalui admin saat ini khusus foto.
- File lama masih dapat diakses di repo publik dan riwayat commit; peroleh persetujuan pemilik data dan foto sebelum publikasi.
- Pengujian otomatis menggunakan API simulasi, belum memakai token/repository nyata. Lakukan UAT sebelum membagikan undangan.
