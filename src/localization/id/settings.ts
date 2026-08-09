export default {
  title: "Pengaturan",
  group: {
    appearance: "Tampilan",
    dataEntry: "Pengisian data",
    location: "Lokasi & GPS",
    images: "Gambar",
  },
  animationsEnabled: {
    label: "Animasi diaktifkan",
    description:
      "Mengaktifkan animasi transisi dan antarmuka di seluruh aplikasi. Nonaktifkan untuk meningkatkan performa pada perangkat yang lebih lambat",
  },
  connectionToServer: "Koneksi ke server",
  fontScale: {
    label: "Skala font: {{value}}",
    description: "Menyesuaikan ukuran teks yang digunakan di seluruh aplikasi",
  },
  keepScreenAwake: {
    label: "Layar tetap terjaga",
    description:
      "Mencegah layar mati secara otomatis selama aplikasi terbuka",
  },
  fullScreen: {
    label: "Layar penuh",
    description:
      "Menyembunyikan bilah status dan navigasi sistem untuk menggunakan seluruh layar saat pengisian data",
  },
  imageSizeLimit: {
    label: "Ukuran gambar terbatas hingga: {{value}}MB",
    description:
      "Ukuran maksimum gambar diubah sebelum disimpan, kecuali survei menetapkan batas yang lebih kecil untuk atribut tertentu",
  },
  imageSizeUnlimited: {
    label: "Ukuran gambar tidak terbatas",
    description:
      "Gambar akan disimpan dalam resolusi maksimum yang disediakan oleh perangkat, kecuali jika batas diatur dalam desainer formulir survei.",
  },
  language: {
    label: "Bahasa aplikasi",
    description: "Mengatur bahasa yang digunakan pada antarmuka aplikasi",
  },
  locationAccuracyThreshold: {
    label: "Ambang akurasi lokasi (meter)",
    description:
      "Akurasi GPS minimum, dalam meter, yang diperlukan sebelum pembacaan lokasi diterima untuk atribut koordinat",
  },
  locationAccuracyWatchTimeout: {
    label: "Batas waktu pengawasan akurasi lokasi: {{value}} detik",
    description:
      "Waktu maksimum untuk menunggu pembacaan lokasi yang memenuhi ambang akurasi sebelum menyerah",
  },
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
  gpsDevicePairing: {
    title: "Sambungkan perangkat GPS",
    scanButton: "Pindai perangkat",
    scanningLabel: "Memindai perangkat di sekitar…",
    scanAgainButton: "Pindai lagi",
    emptyResult:
      "Tidak ada perangkat ditemukan. Pastikan penerima GPS Anda menyala dan dalam mode pemasangan.",
    scanFailed: "Terjadi kesalahan saat memindai. Silakan coba lagi.",
    recognizedDevicesNotice:
      "Hanya perangkat yang dikenali sebagai penerima GPS yang ditampilkan.",
    pairedDevicesTitle: "Perangkat berpasangan",
    newDevicesTitle: "Perangkat baru",
    pairButton: "Sambungkan",
    pairing: "Menyambungkan…",
    pairingSucceeded: "Tersambung dengan {{name}}",
    pairingFailed: "Tidak dapat tersambung dengan {{name}}",
    bluetoothDisabled: "Bluetooth dimatikan.",
    enableBluetoothButton: "Aktifkan Bluetooth",
    permissionDenied: "Izin Bluetooth diperlukan untuk memindai perangkat.",
    openSettingsButton: "Buka pengaturan aplikasi",
  },
  preferredGpsSourceId: {
    label: "Sumber GPS",
    description:
      "Pilih GPS mana yang digunakan untuk merekam koordinat: GPS internal ponsel, atau penerima GPS eksternal yang dipasangkan (misalnya Bad Elf).",
    auto: "Otomatis (eksternal jika tersedia)",
    internal: "GPS internal",
    pairNewDevice: "Sambungkan perangkat baru…",
  },
  showRecordCompletion: {
    label: "Tampilkan progres kelengkapan data isian",
    description:
      "Menampilkan bilah progres dengan persentase persyaratan yang telah terpenuhi untuk data isian saat ini",
  },
  showStatusBar: {
    label: "Tampilkan status",
    description:
      "Menampilkan status baterai, penyimpanan, dan jaringan saat mengedit data isian",
  },
  theme: {
    label: "Tema",
    description: "Mengatur tema warna yang digunakan pada antarmuka aplikasi",
    auto: "Otomatis",
    dark: "Gelap",
    dark2: "Gelap 2",
    light: "Terang",
    light2: "Terang 2",
  },
};
