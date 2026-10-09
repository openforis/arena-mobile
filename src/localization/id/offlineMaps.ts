export default {
  title: "Peta offline",
  description:
    "Unduh peta area yang Anda minati sebelum pergi ke lapangan: peta akan tersedia bahkan tanpa koneksi internet saat menggambar atau melihat atribut geografis.",
  freeLayersNotInUse:
    "Peta offline hanya digunakan jika penyedia peta di pengaturan adalah 'Free map layers'.",
  useFreeLayers: "Gunakan lapisan peta gratis",
  offlineMode: "Offline",
  addArea: "Tambah area",
  deleteAll: "Hapus semua",
  deleteAllConfirm:
    "Hapus semua area peta offline dan semua ubin peta yang tersimpan di perangkat ini?",
  clearCache: "Bersihkan cache peta",
  clearCacheConfirm:
    "Hapus semua ubin peta yang tersimpan di perangkat ini (ubin yang di-cache saat menjelajahi peta)?",
  noAreas: "Belum ada area peta offline yang diunduh",
  storage: {
    used: "Ruang yang digunakan ubin peta (area yang diunduh dan cache):",
    free: "Ruang kosong di perangkat:",
  },
  layers: {
    esriWorldImagery: "Satelit (Esri World Imagery)",
    openTopoMap: "Topografi (OpenTopoMap)",
    openStreetMap: "Standar (OpenStreetMap, hanya online)",
  },
  mapTypes: {
    standard: "Standar",
    satellite: "Satelit",
    hybrid: "Hibrida",
  },
  area: {
    surface: "Luas: {{area}}",
    layer: "Lapisan: {{layer}}",
    zoomLevels: "Tingkat zoom: {{minZoom}} - {{maxZoom}}",
    tiles: "Ubin: {{downloaded}} / {{total}}",
    size: "Ukuran: {{size}}",
    lastUpdate: "Pembaruan terakhir: {{date}}",
    missingTiles: "Ubin yang hilang: {{count}}",
    resumeDownload: "Unduh yang hilang",
    deleteConfirm: "Hapus area peta offline '{{name}}'?",
    nameRequired: "Nama wajib diisi",
    nameDuplicate: "Nama sudah digunakan oleh area lain",
  },
  areaEditor: {
    title: "Area peta offline baru",
    name: "Nama",
    layer: "Lapisan",
    maxZoom: "Zoom maks: {{value}}",
    currentZoom: "Zoom saat ini: {{value}}",
    surface: "Luas: {{area}}",
    drawAreaToEstimate:
      "Gambar area yang diminati pada peta untuk melihat ruang yang akan digunakan",
    estimate: "{{tiles}} ubin · ~{{size}} (ruang kosong: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} ubin: terlalu banyak (maks {{maxTiles}}); perkecil area atau zoom maks",
    tooManyTiles:
      "Area terlalu besar: maksimal {{maxTiles}} ubin dapat diunduh; perkecil area atau zoom maks",
    notEnoughSpace: "Ruang kosong di perangkat tidak cukup",
    lowSpaceConfirm: {
      title: "Ruang kosong terbatas",
      message:
        "Unduhan akan menggunakan sekitar {{size}}, {{percent}}% dari ruang kosong di perangkat ({{freeSpace}}). Lanjutkan?",
    },
  },
  areaViewer: {
    title: "Area peta offline",
    notFound: "Area peta offline tidak ditemukan",
  },
  download: {
    label: "Unduh",
    title: "Mengunduh ubin peta",
    complete: "Area peta offline diunduh ({{size}})",
    completeWithMissingTiles:
      "Area peta offline diunduh ({{size}}); {{missingTiles}} ubin tidak dapat diunduh",
    error: "Kesalahan saat mengunduh area peta offline: {{details}}",
  },
};
