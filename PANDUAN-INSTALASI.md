# PANDUAN INSTALASI & MIGRASI KE GITHUB PAGES — e-REGDESA

Arsitektur: **Frontend statis (GitHub Pages)** ⇄ `fetch()` ⇄ **GAS REST API (Kode.gs)** ⇄ Google Sheets + Drive.

## A. Backend (Google Apps Script)
1. Buka https://script.google.com → **Proyek baru** → rename `Code.gs` jadi `Kode`, tempel isi `Kode.gs`.
2. Pilih fungsi `setupAppEnvironment` → ▶ Run → izinkan akses. **Jalankan SEKALI saja.** Cek log ada ✅.
3. **Google Cloud OAuth Client ID** (untuk login petugas):
   - https://console.cloud.google.com → APIs & Services → **OAuth consent screen** (Internal jika Workspace, atau External).
   - **Credentials → Create Credentials → OAuth client ID → Web application**.
   - *Authorized JavaScript origins*: `https://USERNAME.github.io` (ganti USERNAME dengan username GitHub Anda).
   - Salin **Client ID**.
4. Di Apps Script: ⚙️ **Project Settings → Script properties**, ubah:
   - `CLIENT_ID` = Client ID langkah 3
   - `ALLOWED_EMAILS` = email Sekdes & Kaur TU, pisahkan koma
5. **Deploy → New deployment → Web app** → Execute as **Me**, access **Anyone** → Deploy → salin URL `/exec`.
6. Setiap ubah Kode.gs: **Deploy → Manage deployments → ✏️ → Version: New version** (URL tetap).

## B. Frontend
1. Ekstrak ZIP → folder **`eregdesa-frontend`**. Di dalamnya harus langsung terlihat `index.html`, `css/`, `js/`.
2. Edit `js/config.js`: isi `GAS_URL` (URL `/exec`) dan `CLIENT_ID`.

## C. Migrasi ke GitHub Pages (via terminal)
1. Pasang Git: Windows https://git-scm.com/download/win (default) · Mac: `git --version` · Linux: `sudo apt install git`. Buka **PowerShell**.
2. Identitas (sekali saja):
   ```
   git config --global user.name "Nama Anda"
   git config --global user.email "email@akun-github.com"
   ```
3. Buat akun https://github.com → **+ → New repository** → nama `eregdesa` → **Public** → **JANGAN** centang README/.gitignore/license.
4. Masuk ke folder **`eregdesa-frontend`** (folder inilah yang di-`git init`) lalu **verifikasi** `dir` (Windows) / `ls` menampilkan `index.html` di daftar:
   ```
   cd $HOME\Downloads\eregdesa-frontend
   dir
   ```
5. Kirim:
   ```
   git init
   git add .
   git commit -m "Upload pertama"
   git branch -M main
   git remote add origin https://github.com/USERNAME/eregdesa.git
   git push -u origin main
   ```
   Saat diminta password: tempel **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → centang **repo**). Layar tidak menampilkan karakter saat mengetik — itu normal.
6. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)` → Save. Tunggu 1–2 menit; situs di `https://USERNAME.github.io/eregdesa/`.
7. **Redeploy** setelah ubah file: `git add .` → `git commit -m "update"` → `git push`, lalu Ctrl+Shift+R.

## D. Uji
Buka situs → data tampil (publik) → Masuk dengan Google → Tambah dokumen → cek baris di Sheet `Register` → unggah PDF → cek folder Drive `Uploads/<Jenis>/<Tahun>`.

## Troubleshooting
| Gejala | Solusi |
|---|---|
| 404 GitHub Pages | `index.html` tidak di root repo → `git init` salah folder. Ulangi dari folder `eregdesa-frontend` |
| Tanpa styling | Folder `css/` `js/` tidak ikut → jangan pakai "Upload files" di web GitHub |
| Data kosong / error CORS | `GAS_URL` salah, atau deployment belum "Anyone" / belum New version |
| Tombol Google tidak muncul | `CLIENT_ID` salah atau origin `https://USERNAME.github.io` belum didaftarkan |
| "Akun tidak terdaftar" | Email belum ada di `ALLOWED_EMAILS` |
| `Password authentication is not supported` | Pakai Personal Access Token |
| Sesi berakhir | Token Google berlaku ±1 jam; klik Masuk lagi |
