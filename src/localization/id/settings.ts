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
