# Q-Shield Pro - QC Dashboard & Analytics App

Aplikasi Dashboard Quality Control (QC) otomatis menggunakan metodologi **Statistical Process Control (SPC)** untuk memantau kualitas produk produksi secara real-time.

Aplikasi ini dibangun menggunakan arsitektur monorepo dengan teknologi:
* **Backend**: Python (FastAPI) + SQLite + SQLAlchemy + Pandas
* **Frontend**: React (Vite) + Recharts + Tailwind CSS (styling via custom premium index.css)

---

## Struktur Folder

```text
/
├── backend/                 # Aplikasi Backend (Python FastAPI)
│   ├── app/
│   │   ├── api/             # Route endpoints API
│   │   ├── core/            # Logika perhitungan statistik (SPC)
│   │   ├── crud.py          # Logika interaksi database
│   │   ├── database.py      # Konfigurasi koneksi SQLite
│   │   ├── models.py        # Definisi tabel database
│   │   ├── schemas.py       # Skema validasi data (Pydantic)
│   │   └── main.py          # File utama & Seeding data otomatis
│   └── requirements.txt     # Daftar dependency Python
│
├── frontend/                # Aplikasi Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # Komponen visual (KPI, Control Chart, Pareto, Form)
│   │   ├── App.jsx          # Komponen utama koordinasi data
│   │   ├── index.css        # Desain system premium (Glassmorphic)
│   │   └── main.jsx         # Entry point React
│   └── package.json         # Dependency Node.js (React, Recharts, Lucide)
│
└── README.md                # Dokumentasi petunjuk penggunaan
```

---

## Petunjuk Menjalankan Aplikasi Secara Lokal

### 1. Menjalankan Backend (FastAPI)

1. Buka terminal baru dan masuk ke folder `backend`:
   ```bash
   cd backend
   ```
2. Buat Python virtual environment (opsional namun direkomendasikan):
   ```bash
   python -m venv venv
   # Aktivasi di Windows:
   .\venv\Scripts\activate
   ```
3. Instal dependencies yang dibutuhkan:
   ```bash
   pip install -r requirements.txt
   ```
4. Jalankan server backend menggunakan Uvicorn:
   ```bash
   uvicorn app.main:app --reload
   ```
   * Server backend akan berjalan di **`http://localhost:8000`**
   * Dokumentasi API interaktif (Swagger UI) dapat diakses di **`http://localhost:8000/docs`**
   * *Catatan: Saat backend pertama kali dijalankan, sistem akan otomatis melakukan seeding data dummy historis 15 hari terakhir sehingga grafik langsung terisi.*

### 2. Menjalankan Frontend (React + Vite)

1. Buka terminal baru yang terpisah dan masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Instal paket dependencies Node.js (termasuk Recharts dan Lucide React):
   ```bash
   npm install
   ```
3. Jalankan server development frontend:
   ```bash
   npm run dev
   ```
   * Aplikasi web dapat diakses di URL yang tertera di terminal, biasanya **`http://localhost:5173`**

---

## Fitur Unggulan

1. **SPC Control Chart (P-Chart)**: Menampilkan tingkat defect per batch dengan garis batas kendali (UCL dan Center Line). Titik data yang melewati batas UCL akan otomatis ditandai merah menyala dan memicu status "Alert".
2. **Defect Pareto Analysis**: Grafik peringkat jenis defect terbanyak untuk menentukan prioritas perbaikan kualitas.
3. **Form Digital Operator**: Operator dapat menginput data inspeksi lapangan langsung dengan validasi otomatis (misal: jumlah rincian cacat harus sama dengan total cacat).
4. **Desain UI Premium**: Antarmuka bertema gelap (*dark mode*) dengan efek Glassmorphism transparan dan responsive design.
