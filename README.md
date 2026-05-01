# Surya Motor Group Inventory System (SMG-IS)
**Sistem Manajemen Inventaris Digital Terintegrasi**

---

## BAB 1: Pendahuluan & Penjelasan Sistem

**Surya Motor Group Inventory System (SMG-IS)** adalah sebuah aplikasi *Web (Web App)* mutakhir berskala produksi yang dirancang secara khusus untuk mendigitalisasi, mencatat, dan mengotomatisasi seluruh alur keluar-masuk barang pada bengkel Surya Motor Group. 

Aplikasi ini dibangun menggunakan arsitektur modern (Next.js 15, React 19, Prisma ORM, dan SQLite/PostgreSQL) yang memastikan performa tinggi, keamanan data tingkat lanjut, serta antarmuka (UI/UX) yang sangat premium, dinamis, dan responsif baik diakses melalui komputer desktop maupun perangkat mobile.

### Keunggulan Utama Sistem:
1. **Real-time Event Synchronization**: Sistem ini dibangun dengan kapabilitas pembaruan instan. Apabila terjadi transaksi barang keluar atau masuk, angka notifikasi barang kritis pada menu utama akan diperbarui pada detik itu juga tanpa mengharuskan pengguna memuat ulang (refresh) halaman.
2. **Automated Notification (WhatsApp)**: Sistem dilengkapi dengan integrasi ke API pihak ketiga (Fonnte) yang secara cerdas akan langsung mengirimkan pesan peringatan ke WhatsApp pemilik/admin bengkel apabila mendeteksi ada suku cadang yang menipis (menyentuh batas minimum).
3. **Atomic Transactions**: Setiap transaksi yang terjadi (Barang Masuk, Barang Keluar, Koreksi) dicatat dalam sistem basis data menggunakan prinsip *Atomic Transaction*. Artinya, kalkulasi penambahan dan pengurangan stok dijamin 100% akurat dan terhindar dari malfungsi pencatatan meskipun terjadi banyak input di waktu yang bersamaan.
4. **Keamanan Berbasis Peran (RBAC)**: Sistem memisahkan wewenang antara `Admin` (Pemilik/Manajer) dan `Staff` (Mekanik/Admin Gudang). Fitur-fitur sensitif seperti penghapusan barang, penambahan pegawai baru, dan koreksi stok secara otomatis dikunci (disembunyikan) dari staf biasa.

---

## BAB 2: Detail Fitur Sistem

Berikut adalah rincian fungsionalitas yang ada di dalam aplikasi SMG-IS:

### 1. Autentikasi Keamanan (Login System)
Sistem *login* diamankan menggunakan JWT (*JSON Web Tokens*) *Stateless* dan *password hashing* (`bcryptjs`). Sesi pengguna dilindungi secara kuat, dan jika sesi habis, pengguna akan diminta untuk *login* kembali. Terdapat batasan akses yang tegas antara pengguna berstatus Admin dan Staff.

### 2. Dashboard Analytics
Halaman depan yang menyajikan rangkuman cepat:
- **Total Barang Terdaftar**: Jumlah keseluruhan jenis barang di gudang.
- **Transaksi Hari Ini**: Total pergerakan barang (masuk/keluar) khusus pada hari ini.
- **Barang Kritis**: Jumlah barang yang stoknya sudah menyentuh batas minimum.
- **Aktivitas Terakhir**: *Log* transaksi terbaru secara *real-time*.

### 3. Transaksi Barang Masuk (Restock)
Fitur untuk mencatat setiap barang yang dibeli atau disuplai masuk ke gudang. Fitur ini memungkinkan pengguna untuk memperbarui "Harga Beli" (*Price at Time*) terbaru dan sistem akan mengalkulasi total biaya pengeluaran (kulakan) bengkel.

### 4. Transaksi Barang Keluar (Pemakaian)
Fitur sentral yang digunakan mekanik/admin ketika mengambil suku cadang untuk pelanggan. Fitur ini dibekali dengan kolom pencarian instan cerdas (berbasis nama, SKU, atau alias barang). Pengguna bisa mengambil banyak barang sekaligus dalam satu kali transaksi seperti layaknya mesin kasir (POS).

### 5. Master Barang
Pusat kontrol data suku cadang. Di sini Admin bisa:
- **Menambah Barang Baru**: Menginput nama, SKU, Kategori, Harga Beli, Harga Jual, dan Stok Minimum secara manual.
- **Import Excel (Massal)**: Mengunggah puluhan hingga ratusan data barang sekaligus menggunakan template Excel (`.xlsx`). Sistem akan otomatis membuat kategori baru jika kategori yang di-*upload* belum pernah ada sebelumnya.
- **Update/Edit**: Mengubah harga atau spesifikasi barang.
- **Nonaktifkan Barang (Soft Delete)**: Menghilangkan barang dari pencarian tanpa merusak data riwayat transaksi lama.

### 6. Barang Kritis (Low Stock Alerts)
Halaman khusus yang hanya menampilkan barang-barang yang stoknya mendekati habis atau sudah di bawah standar minimum. Halaman ini digunakan sebagai acuan utama bagi pemilik bengkel untuk melakukan re-order (kulakan kembali).

### 7. Koreksi Stok (Stock Opname)
Fitur eksklusif Admin untuk mencocokkan jumlah stok fisik di gudang dengan jumlah stok di sistem. Admin bisa menyesuaikan angka secara manual dengan memberikan alasan yang terekam (contoh: "Barang Rusak", "Hilang", atau "Salah Hitung").

### 8. Laporan & Grafik (Reporting)
Pusat analisa finansial dan pergerakan bengkel. Fitur ini meliputi:
- **Filter Tanggal**: Kemampuan menyaring transaksi dari tanggal A ke tanggal B.
- **Summary Finansial**: Menampilkan Total Nilai Kulakan (Masuk), Total Nilai Pemakaian (Keluar), dan Estimasi Total Aset Stok di gudang saat ini.
- **Grafik Batang (Bar Chart) Animasi**: Visualisasi 5 barang paling laris / paling banyak dipakai.
- **Export File**: Tombol "Export PDF" dan "Export Excel" untuk mengunduh laporan berwujud dokumen profesional dengan satu klik.

### 9. Manajemen User
Fitur eksklusif Admin untuk menambah, mengedit *password*, mengubah *role* (Admin/Staff), dan menonaktifkan akun pegawai yang bekerja di bengkel.

---

## BAB 3: Buku Manual (Panduan Penggunaan Terperinci)

Untuk memastikan kelancaran operasional, ikuti panduan detail berikut—mulai dari hal besar hingga detail sekecil apa pun:

### A. Memulai Aplikasi (Login & Akses)
1. Buka aplikasi melalui *browser* yang disediakan.
2. Anda akan melihat halaman "Login".
3. Masukkan `Username` dan `Password` Anda.
4. Klik tombol **Masuk ke Sistem**.
5. Jika Anda adalah pemilik, gunakan akun berstatus `Admin` agar seluruh fitur (Koreksi Stok, Manajemen User, Laporan) terbuka. Jika Anda adalah karyawan, gunakan akun `Staff`.

### B. Menyesuaikan Tampilan (Tema Gelap/Terang)
Sistem memiliki fitur mode gelap untuk menjaga mata Anda tidak cepat lelah saat bekerja di malam hari atau di area minim cahaya:
1. Perhatikan pada bagian **Sidebar** (Menu kiri layar), di sudut paling bawah tepat di bawah nama Anda.
2. Terdapat tombol berlogo "Bulan" atau "Matahari" dengan tulisan **Gelap / Terang**.
3. Klik tombol tersebut kapan pun Anda ingin mengganti tema warna aplikasi. Warna sistem akan berubah secara instan.

### C. Cara Menambah Barang Baru Secara Manual
Jika Anda baru saja membeli suku cadang yang belum pernah ada di bengkel:
1. Klik menu **Master Barang**.
2. Klik tombol warna hitam **+ Tambah Barang** di pojok kanan atas.
3. Muncul *form* isian. Isi kolom berikut:
   - **Nama Barang**: Wajib diisi spesifik (contoh: Oli Yamalube Matic 10W-40).
   - **Alias**: Nama panggilan sehari-hari (contoh: Yamalube Matic).
   - **Kategori & Satuan**: Pilih dari *dropdown*.
   - **Harga Beli & Jual**: Masukkan angkanya (hanya angka tanpa titik).
   - **Stok Minimum**: Batas peringatan. Jika Anda isi "5", sistem akan protes/merah bila stok tersisa 5 buah.
   - **Stok Awal**: Isi jumlah yang ada saat ini.
4. Klik **Simpan**.

### D. Cara Import Barang Massal via Excel
Sangat berguna saat Anda baru pertama kali memakai sistem ini dan ingin memasukkan 500 barang sekaligus:
1. Pergi ke menu **Master Barang**.
2. Klik tombol putih **Import Excel**.
3. Pada *pop-up* yang muncul, klik dulu **Download Template Excel**.
4. Buka file hasil *download* di Microsoft Excel. Isi baris-baris kosong sesuai kolom yang disediakan. Jangan ubah nama *Header* (judul kolom) nya.
5. Jika sudah diisi semua, *Save* file Excel tersebut.
6. Kembali ke aplikasi, klik tombol **Upload File Excel (.xlsx)**, pilih file yang baru saja Anda ubah.
7. Aplikasi akan mendeteksi (contoh: "Ditemukan 150 barang siap import").
8. Klik tombol hitam **Import Data**. Tunggu sebentar hingga notifikasi hijau muncul. Seluruh barang Anda sudah masuk ke sistem!

### E. Tatacara Menginput Barang Keluar (Sangat Penting)
Lakukan langkah ini **setiap kali** mekanik mengambil barang untuk diservis ke motor pelanggan:
1. Klik menu **Barang Keluar**.
2. Di bagian kotak pencarian "Pilih Barang", ketik minimal 2 huruf nama barang (misal: "Oli" atau "Busi").
3. Aplikasi akan menampilkan daftar yang cocok di bawah kotak ketikan. **Klik** pada nama barang yang dimaksud.
4. Barang akan masuk ke dalam tabel "Daftar Barang Keluar".
5. Di tabel tersebut, pada kolom **Qty**, masukkan jumlah yang diambil (contoh: jika ambil 2 botol oli, ketik "2").
6. *(Opsional)* Di kolom **Keterangan**, Anda bisa mengetik plat nomor pelanggan (contoh: "Ganti oli Supra X AG 1234 CD"). Ini penting agar pelacakan jelas.
7. Jika ada part lain yang diambil, ulangi langkah 2-6. (Bisa menumpuk banyak barang di satu tabel).
8. Jika Anda salah memasukkan barang, klik tombol kotak bergambar "Tempat Sampah" berwarna merah di sebelah kanan baris barang tersebut.
9. Apabila sudah selesai, periksa Total Keseluruhan (Rupiah).
10. Klik tombol **Simpan Transaksi**.
11. Tunggu *pop-up* hijau berbunyi "Transaksi berhasil disimpan".
12. *Notice*: Jika setelah Anda klik simpan, stok barang tersebut ternyata menyentuh batas kritis, angka merah di menu "Barang Kritis" (Sidebar kiri) akan langsung bertambah secara otomatis!

### F. Tatacara Menginput Barang Masuk (Kulakan)
Lakukan ini ketika ada *supplier* yang datang mengirim barang:
1. Masuk ke menu **Barang Masuk**.
2. Cari barang seperti cara E.2 dan klik.
3. Di dalam tabel, isi kuantitas (**Qty**) yang Anda beli.
4. Jika *supplier* menaikkan harga, ubah angka pada kolom **Harga Beli Saat Ini**. (Sistem akan otomatis meng-update harga beli asli barang di "Master Barang" setelah ini disimpan).
5. Pada kolom **Catatan Transaksi** (di bawah tabel), ketik nomor nota supplier atau keterangan (contoh: "Nota dari distributor A").
6. Klik **Simpan Transaksi**. Stok di gudang akan otomatis bertambah!

### G. Melakukan Stock Opname (Koreksi Stok)
Jika suatu saat Anda menghitung secara fisik jumlah baut ada 5, tapi di aplikasi tercatat 7:
1. Masuk menggunakan akun **Admin**.
2. Klik menu **Koreksi Stok**.
3. Ketik "Baut" di kolom pencarian, klik barangnya.
4. Anda akan melihat informasi "Stok Saat Ini: 7".
5. Pada kotak di bawahnya, isi "Jumlah Stok Baru" dengan angka yang **benar menurut fisik** (dalam kasus ini: 5).
6. Sistem akan langsung menampilkan angka merah "Perubahan: -2".
7. Wajib pilih "Alasan Koreksi" (Misal: "Salah Hitung" atau "Hilang").
8. Klik **Simpan Koreksi**. Stok kini telah sinkron kembali dengan dunia nyata, dan riwayat koreksi ini akan abadi tercatat di log bagian bawah halaman.

### H. Membaca Peringatan Stok & Notifikasi WhatsApp
- Di sebelah kiri layar, menu **Barang Kritis** memiliki bulatan merah (*badge*). Jika angka di bulatan merah itu bukan "0", artinya ADA BARANG YANG HARUS SEGERA ANDA BELI!
- Klik menu tersebut untuk melihat daftar barang apa saja yang menipis.
- Jika fitur Fonnte Token telah diaktifkan, setiap kali mekanik menginput Barang Keluar yang membuat stok habis, HP Anda (nomor WhatsApp yang terdaftar) akan otomatis bergetar menerima pesan masuk dari sistem tanpa perlu membuka aplikasi web.

### I. Membuat dan Mengunduh Laporan
Setiap akhir bulan atau saat tutup buku, Anda perlu merangkum penjualan dan pemakaian:
1. Pastikan Anda login sebagai **Admin**.
2. Masuk ke menu **Laporan & Grafik**.
3. Di bagian atas kotak "Filter", ubah **Tanggal Mulai** dan **Tanggal Akhir** (misalnya, 1 Mei s/d 31 Mei).
4. Klik tombol **Terapkan Filter**.
5. Angka pada tiga kotak besar (Total Pembelian, Total Pemakaian, Nilai Stok Saat Ini) akan otomatis berubah.
6. Grafik batang di sebelah kiri akan memunculkan secara visual 5 barang apa saja yang paling cepat habis. Analisa grafik ini untuk memutuskan kulakan apa yang perlu diperbanyak bulan depan.
7. Di pojok kanan atas halaman, terdapat dua tombol: **Export PDF** (Teks Merah) dan **Export Excel** (Teks Hijau).
8. Klik salah satu tombol tersebut untuk mengunduh laporan. File yang diunduh sudah diformat rapi dan siap dikirim via WhatsApp Desktop atau langsung diprint ke mesin cetak (printer) Anda.

### J. Menambahkan Mekanik/Staf Baru
Jika bengkel memiliki pegawai baru:
1. Sebagai **Admin**, klik **Manajemen User**.
2. Klik **Tambah User**.
3. Masukkan *Nama Lengkap*, *Username* (untuk login, tidak boleh ada spasi), *Password* default, dan *Role*.
4. Pastikan *Role* diisi **staff** untuk mekanik (agar mereka tidak bisa merusak data), dan klik simpan. Pegawai baru kini bisa *login* menggunakan aplikasinya sendiri.
5. Jika pegawai *resign* (berhenti), klik ikon gembok pada nama mereka di tabel untuk mengubah status "Aktif" menjadi "Nonaktif". Mereka tidak akan bisa *login* lagi.

---
**PANDUAN SELESAI**
*Gunakanlah buku manual ini sebagai rujukan utama (SOP) saat Anda mentraining karyawan atau operator baru untuk menjalankan Surya Motor Group Inventory System.*
