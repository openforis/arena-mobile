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
  customLayers: {
    title: "Lapisan peta kustom",
    description:
      "Tambahkan lapisan peta dari penyedia ubin lain (ubin raster XYZ), dengan kunci API jika penyedia memerlukannya. Lapisan ini dapat dipilih sebagai lapisan peta default di pengaturan dan dengan tombol lapisan pada peta. Pastikan ketentuan penggunaan penyedia mengizinkannya.",
    add: "Tambah lapisan",
    noLayers: "Belum ada lapisan peta kustom",
    maxZoom: "Zoom maks: {{value}}",
    deleteConfirm:
      "Hapus lapisan peta kustom '{{name}}' dan ubin petanya yang tersimpan di perangkat ini?",
    editor: {
      title: "Lapisan peta kustom",
      name: "Nama",
      url: "Templat URL",
      urlHint:
        "Contoh: https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}\n{x}, {y} dan {z} wajib ada; {apiKey} diganti dengan kunci API.",
      apiKey: "Kunci API (opsional)",
      apiKeyHint:
        "Disimpan di penyimpanan aman perangkat dan hanya digunakan dalam permintaan ke penyedia ubin.",
      attribution: "Atribusi (opsional)",
      attributionHint:
        "Pemberitahuan hak cipta yang diwajibkan penyedia; ditampilkan pada peta.",
      test: {
        label: "Uji",
        success: "Ubin peta berhasil diunduh",
        errorStatus:
          "Penyedia ubin tidak mengembalikan ubin peta (status HTTP: {{status}}); periksa templat URL dan kunci API",
        errorNotReachable:
          "Penyedia ubin tidak dapat dijangkau; periksa templat URL dan koneksi internet",
      },
    },
    validation: {
      nameRequired: "Nama wajib diisi",
      nameDuplicate: "Nama sudah digunakan oleh lapisan lain",
      urlRequired: "Templat URL wajib diisi",
      urlNotHttps: "Templat URL harus diawali dengan https://",
      urlPlaceholdersMissing:
        "Templat URL harus berisi placeholder {x}, {y} dan {z}",
      urlSubdomainNotSupported:
        "Placeholder {s} tidak didukung: ganti dengan salah satu subdomain penyedia (mis. 'a')",
      apiKeyRequired: "Templat URL berisi {apiKey}: kunci API wajib diisi",
      apiKeyPlaceholderMissing:
        "Tambahkan placeholder {apiKey} ke templat URL, di tempat kunci API diharapkan",
    },
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
