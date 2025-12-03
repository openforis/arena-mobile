export default {
  title: "Pengaturan",
  animationsEnabled: "Animasi diaktifkan",
  connectionToServer: "Koneksi ke server",
  fontScale: "Skala font: {{value}}",
  keepScreenAwake: "Layar tetap terjaga",
  fullScreen: "Layar penuh",
  imageSizeLimit: "Ukuran gambar terbatas hingga: {{value}}MB",
  imageSizeUnlimited: {
    label: "Ukuran gambar tidak terbatas",
    description:
      "Gambar akan disimpan dalam resolusi maksimum yang disediakan oleh perangkat, kecuali jika batas diatur dalam desainer formulir survei.",
  },
  language: {
    label: "Bahasa aplikasi",
  },
  locationAccuracyThreshold: "Ambang akurasi lokasi (meter)",
  locationAccuracyWatchTimeout:
    "Batas waktu pengawasan akurasi lokasi: {{value}} detik",
  locationAveragingEnabled: {
    label: "Rata-rata lokasi diaktifkan",
    description:
      "Jika diaktifkan, lokasi yang direkam akan menjadi rata-rata dari beberapa pembacaan lokasi, meningkatkan akurasi",
  },
  locationGpsLocked: {
    label: "GPS terkunci",
    description: `Peringatan: konsumsi baterai akan meningkat!
Sinyal GPS akan dikunci saat aplikasi berjalan.
Ini akan membantu mendapatkan akurasi yang lebih baik pada atribut koordinat.`,
    error:
      "Tidak dapat memulai penguncian GPS: penyedia lokasi tidak tersedia atau akses ke lokasi tidak diberikan",
  },
  showStatusBar: "Tampilkan status",
  theme: {
    label: "Tema",
    auto: "Otomatis",
    dark: "Gelap",
    dark2: "Gelap 2",
    light: "Terang",
    light2: "Terang 2",
  },
};
