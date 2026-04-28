# Agenda Harian

Aplikasi web catatan agenda harian modern, lengkap, dan privat. Semua data tersimpan di
browser kamu (`localStorage`) — tidak ada backend, tidak ada akun, tidak ada tracking.

> 100% client-side. Cocok di-host di Netlify, Vercel, GitHub Pages, atau dibuka langsung
> dari disk setelah `npm run build`.

## ✨ Fitur

- **CRUD agenda** — tambah, edit, hapus, duplikasi, tandai selesai.
- **Kategori & tag** — kelola, beri warna, multi-tag per agenda.
- **Prioritas** — rendah, sedang, tinggi (dengan indikator warna).
- **Status** — belum, dikerjakan, selesai.
- **Kalender view** — tampilan bulanan & mingguan; klik tanggal untuk detail.
- **Pencarian & filter** — by teks, kategori, tag, prioritas, status, rentang tanggal.
- **Pengingat (reminder)** — notifikasi browser 5 menit / 15 menit / 1 jam sebelumnya, dst.
- **Recurring agenda** — harian, mingguan, bulanan, tahunan, dengan interval & end date.
- **Markdown** di isi catatan (heading, list, checkbox, kode, tabel via GFM).
- **Drag & drop** — urutkan agenda manual di tampilan daftar.
- **Dark mode** — terang / gelap / mengikuti sistem.
- **Export / import** — JSON (backup penuh), CSV, PDF.
- **Reset data** — satu klik kembali ke kondisi awal (dengan konfirmasi).
- **Cross-tab sync** — buka di dua tab, data sinkron otomatis.
- **Responsive** — nyaman di desktop maupun mobile.

## 🛠 Tech Stack

- [Vite](https://vitejs.dev) + [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [lucide-react](https://lucide.dev) untuk ikon
- [date-fns](https://date-fns.org) untuk utilitas tanggal (locale Indonesia)
- [@dnd-kit](https://dndkit.com) untuk drag & drop
- [react-markdown](https://github.com/remarkjs/react-markdown) + `remark-gfm`
- [jsPDF](https://github.com/parallax/jsPDF) untuk ekspor PDF

## 🚀 Menjalankan lokal

Prasyarat: Node.js 20+.

```bash
npm install
npm run dev       # server dev di http://localhost:5173
npm run build     # production build ke folder dist/
npm run preview   # preview production build
npm run lint
```

## 📦 Deploy ke Netlify

Repo ini sudah menyertakan `netlify.toml`. Dua cara termudah:

1. **Via UI Netlify:**
   - Login ke [app.netlify.com](https://app.netlify.com).
   - _Add new site → Import an existing project_ → pilih repo `agenda-harian`.
   - Build command & publish directory akan otomatis terdeteksi dari `netlify.toml`.
   - Klik _Deploy_.

2. **Via CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   npm run build
   netlify deploy --prod --dir=dist
   ```

Tidak ada environment variable yang perlu di-set.

## 💾 Tentang penyimpanan data

- Semua data (agenda, kategori, tag, tema) disimpan di
  `localStorage` browser dengan key `agenda-harian:v1`.
- Tidak ada data yang dikirim ke server manapun.
- **Backup secara berkala** dengan _Export → JSON_ supaya tidak kehilangan data jika
  browser di-clear.
- Impor kembali dengan _Export → Impor JSON_.

## 🧑‍💻 Struktur

```
src/
  types.ts              # tipe domain (Agenda, Category, Tag, dst.)
  lib/
    storage.ts          # load/save localStorage
    recurrence.ts       # ekspansi agenda berulang
    reminder.ts         # notifikasi browser
    date.ts             # helper tanggal
    export.ts           # JSON / CSV / PDF
    utils.ts            # cn, uid, color picker, dll.
  hooks/
    useAppState.ts      # store aplikasi (state + actions)
    useTheme.ts         # apply dark mode
  components/
    ui/                 # primitive (Button, Input, Modal, Badge, …)
    AgendaCard.tsx
    AgendaList.tsx      # list + drag & drop
    AgendaForm.tsx      # modal form CRUD
    CalendarView.tsx    # kalender bulanan & mingguan
    FilterBar.tsx
    StatsPanel.tsx
    TagCategoryManager.tsx
    Topbar.tsx
    EmptyState.tsx
  App.tsx
  main.tsx
  index.css
```

## Lisensi

MIT — bebas dipakai, diubah, dan didistribusikan.
