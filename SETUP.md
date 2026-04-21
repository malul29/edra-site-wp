# Panduan Lengkap Setup Proyek Edra Arsitek

Proyek ini menggunakan arsitektur **Headless CMS**.
- **Backend (Dapur)**: WordPress (`http://foyer.edraarsitek.co.id`). Digunakan HANYA untuk mengetik data, manajemen arsip, dan upload foto proyek. Tampilan/tema website bawaan yang muncul dari domain WordPress HANYA ditujukan untuk admin dan boleh Anda abaikan bentuk visualnya.
- **Frontend (Pameran Utama)**: Aplikasi Next.js (`http://localhost:3000` di tahap lokal). Ini adalah wujud asli, presentasi visual super ringan dengan desain arsitektur premium sesungguhnya yang akan diinteraksi oleh para pengguna.

---

## 🛠 Tahap 1: Persiapan Plugin WordPress (Backend)

Silakan masuk ke _Dashboard Admin_ WordPress Anda lalu instal (menu **Plugins > Add New**) dan aktifkan *semua* _plugin_ penting ini:
1. **WPGraphQL** – Membuat konektor API (GraphQL) utama.
2. **WPGraphQL CORS** – Mengizinkan koneksi penyedotan data dari Next.js.
3. **Advanced Custom Fields (ACF)** – Untuk menambah properti pengetikan tambahan (lokasi, tahun).
4. **WPGraphQL for Advanced Custom Fields** – Jembatan yang menyambungkan ACF ke dalam saluran konektor GraphQL. *(Tanpa ini, ACF tidak muncul di web depan)*.
5. **Custom Post Type UI (CPT UI)** – Membuat struktur modul menu baru yang disebut "Portfolios".

---

## 🔗 Tahap 2: Konfigurasi Keamanan Jaringan (CORS) di WordPress

Jika tahap ini dilewati, website frontend akan mendeteksi `Error Fetches Failed / Blocked by CORS`.
1. Masuk ke **GraphQL > Settings**.
2. Masuk / pilih tab **CORS Settings**.
3. Temukan kotak isian kosong di bawah panel **Extend "Access-Control-Allow-Origin" header**.
4. Masukkan target URL untuk frontend Anda (awalan saat ini adalah lokal): `http://localhost:3000` lalu klik **Save**.
   *(Jika domain lokal berhenti bekerja, server live/produksi seperti `https://namadomainresmi.com` wajib ikut didaftarkan ke sini kedepannya).*

---

## 📁 Tahap 3: Pembuatan Menu Modular "Portfolio" (CPT)

Kodingan _Frontend_ Anda (`lib/wordpress.js`) memprogram aplikasi untuk memanggil kumpulan properti berlabel "Portfolio". Kita harus membuat modul panggilannya persis seragam.
1. Di sidebar kiri WP, buka menu **CPT UI > Add/Edit Post Types**.
2. Masukkan rincian baku ini:
   - **Post Type Slug:** `portfolio`
   - **Plural Label:** Portfolios
   - **Singular Label:** Portfolio
3. Tarik kursor (_scroll_) mentok lurus ke bawah menu (*Settings*):
   - Ubah pilihan **Show in GraphQL** menjadi **True**.
   - Isi kolom **GraphQL Single Name** dengan tulisan: `portfolio`
   - Isi kolom **GraphQL Plural Name** dengan tulisan: `portfolios`
4. Di bagian panel bernama **Supports** (paling ujung dari semua halaman), pastikan `Title`, `Editor`, dan `Featured Image` semua telah tercentang.
5. Klik tombol kuning panjang di paling bawah: **Add Post Type** / _Save_.

---

## 📝 Tahap 4: Mengonfigurasi Kolom Ekstra (Advanced Custom Fields)

Agar Anda bisa mengisi variabel "Location", "Category", "Year" tambahan ke dalam profil/detail layout suatu bangunan.
1. Masuk ke menu **ACF > Field Groups** lalu klik **Add New**.
2. Beri sembarang judul grupnya (misal: "Info Tambahan Project").
3. Bikin dan tambah _Fields_ satu-persatu berikut dengan jenis pengetikan (Type) yang cocok:
   - `location` (Type Text)
   - `category` (Type Text)
   - `year` (Type Text)
   - `description` (Type Text Area)
   - `youtube_url` (Type URL)
4. _Scroll_ ke bawah ke bagian **Location Rules**, buat kriteria pemunculan menunya menjadi persis begini: 
   _Show this field group if `Post Type` is equal to `Portfolio`_.
5. **Konfigurasi Pemanggilan Nama Sistem (Krusial):**
   - Lanjut lagi geser (_scroll_) ke pengaturan kotak terakhir paling bawah (tepatnya pada *Group Settings*).
   - Masuk ke tab **Advanced** atau tab **GraphQL*.
   - Aktifkan tuas klik pada tulisan **Show in GraphQL**.
   - Akan muncul kolom kecil bertuliskan antara *GraphQL Field Name* atau *GraphQL Type Name* (bergantung versi Plugin-nya). Isikan tuas kotak tersebut DENGAN TEPAT SECARA HARFIAH memakai:
     👉 **`portofolioFields`**
6. Geser ke bagian atas layar, lalu tekan **Save Changes** (Simpan).

---

## 🎨 Tahap 5: Cara Admin Unggah / Mengelola Konten Portfolio Proyek

Sering kali para pengguna memasukkan *Gambar Sampul Web* dan struktur grid masonry secara tercampur. Inilah format pemisahan kerjanya:

1. **Memuat Info Data Tertulis**: Buka menu **Portfolios > Add New**. Tulis satu nama Judul, kemudian isi semua form di dalam kolom ACF bawah yang baru (Lokasi, dan Deskripsi). 
2. **Memuat Kover Halaman (Gambar Foto Proyek Skala Besar Utama)**:
   - Fokus ke *Setting Options Panel* (Sederet menu Sidebar Sebelah Kanan WP Editor). 
   - Pilih tab **Post** dan cari tulisan *Featured Image* (Gambar Unggulan). 
   - Tekan panah Set Featured Image dan masukkan **hanya 1 foto jagoan terbaik** sebagai kovernya.
3. **Memuat Variasi Galeri (Ragam Foto Eksterior/Interior Sekunder)**: 
   - Klik tab area putih lebar (area pengetikkan paragraf/Artikel/blok Editor WP). 
   - Tekan tuts tombol `/` dan ketik kata `gallery`  *(sebagai blok gallery bawaan)*. 
   - Terbuka kotak Gallery, _Upload_ **semua foto pelengkap** dari proyek ini secara massal/bersamaan (_Drag & Drop_). Web *Frontend* mutakhir ini kelak akan merapikannya secara pintar ke layout mosaik bergrid rapi tanpa diotak-atik kembali di WP.
4. Klik tombol biru di kanan atas: **Publish** (Terbitkan). 
   *(Ingat: Apabila status file masih draf simpanan atau belum secara jelas "Published", Next.js sama sekali tidak akan mau memuatnya).*

---

## 🚀 Tahap 6: Eksekusi Server Frontend Next.js (Tampilan Visual Muka)

Untuk mematangkan website koding di sisi server dan agar Anda melihat hasil sinkronisasinya:

1. **Identifikasi Variabel Lingkungan URL wp (Backend Target):**
   - Pergi masuk ke VS Code proyek sistem folder Next.js pada jalur `d:\Edra-site\client`.
   - Cari _file_ tersembunyi bernama `.env.local` (Anda dapat menyalin teks isi dari `.env.example` ke file `.env.local` kosong jika aslinya terhapus).
   - Masukkan alamat situs target Backend WP murni yang bersih tanpa garis akhiran `/` (bahkan tanpa susupan kata `/graphql`):
     ```env
     NEXT_PUBLIC_WORDPRESS_URL=http://foyer.edraarsitek.co.id
     ```

2. **Memerintah Node Mengoperasikan Terminal Lokal:**
   - Luncurkan terminal Anda dan masuk paksa terminal itu menuju lokasi web frontend tepatnya: `cd client`.
   - Lakukan instalasi serba otomatis _(Cukup kali pertama ketika kode baru diunduh)_: `npm install`.
   - Hidupkan koneksinya: **`npm run dev`**

3. **Reload / Restart Ketika Update Gagal Sinkron (Mem-Paten-Ganda Server Eror):**
   Satu jebakan terbesar adalah, ketika Anda mengupdate tulisan _URL_ di .env.local atau nama variabel krusial ACF *"Di Tengah Pertengahan Jalan"*, sistem lokal Next.js akan membandel dan *tidak menyadarinya*.
   - **SOLUSINYA**: Masuk ke layar terminal yang di jalankan tulisan `npm run dev` tersebut, **TEKAN "CTRL + C"** dan klik 'Y' pada keyboard.
   - Ketikkan lagi perintah suci **`npm run dev`** kemudian Enter.

4. **Amati Hasil Keajaibannya:**
   Panggil **`http://localhost:3000`** atau URL penguji Portfolio spesifik Anda (`http://localhost:3000/project/bekasi-town-square`) memalui alat *Browser*/Chrome/Safari. Anda akan melihat secara langsung wujud website Arsitek bergaya modern super ngebut!

```
