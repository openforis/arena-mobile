export default {
  title: "Peta yang diimpor",
  description:
    "Impor peta dari file PDF atau GeoTIFF geospasial (bergeoreferensi) yang tersimpan di perangkat ini: peta ditampilkan di atas peta dasar pada semua peta aplikasi, bahkan tanpa koneksi internet.",
  rendererNotAvailable:
    "Peta yang diimpor tidak didukung oleh versi aplikasi ini: perbarui ke versi terbaru",
  importMap: "Impor peta",
  supportedFormats:
    "File yang didukung: PDF geospasial (.pdf) dan GeoTIFF (.tif, .tiff)",
  noMaps: "Belum ada peta yang diimpor",
  storage: {
    used: "Ruang yang digunakan oleh peta yang diimpor:",
  },
  opacity: "Opasitas: {{value}}%",
  hideBaseMap: "Hanya peta yang diimpor",
  map: {
    fileName: "File: {{fileName}}",
    page: "Halaman: {{page}}",
    zoomLevels: "Tingkat zoom: {{minZoom}} - {{maxZoom}}",
    tiles: "Ubin: {{count}}",
    size: "Ukuran: {{size}} (file PDF: {{sourceSize}})",
    sizeTilesOnly: "Ukuran: {{size}}",
    datumWarning: "Datum peta bukan WGS84: peta bisa bergeser beberapa meter",
    visible: "Tampilkan di peta",
    deleteConfirm: "Hapus peta '{{name}}'?",
    notFound: "Peta tidak ditemukan",
    viewerTitle: "Peta yang diimpor",
  },
  import: {
    title: "Impor peta",
    analyzing: "Membaca georeferensi file...",
    errorReading: "Kesalahan saat membaca file: {{details}}",
    notGeoreferenced:
      "File tidak bergeoreferensi: tidak berisi koordinat geografis peta",
    unsupportedGeoreference:
      "Georeferensi file PDF ini (pengodean OGC GeoPDF) belum didukung",
    unsupportedFile: "File ini bukan PDF atau GeoTIFF",
    unsupportedGeoTiffFormat:
      "Gambar dalam file GeoTIFF ini tidak didukung ({{details}}): hanya gambar dengan 8 bit per sampel (RGB, RGBA, skala abu-abu, atau dengan palet warna) yang dapat diimpor",
    page: "Halaman",
    pageItem: "Halaman {{page}}",
    name: "Nama",
    maxZoom: "Zoom maks: {{value}}",
    nativeZoom: "(resolusi peta: {{value}})",
    maxZoomAboveNative:
      "Tingkat zoom di atas resolusi peta akan terlihat buram",
    estimate: "{{tiles}} ubin · ~{{size}} (ruang kosong: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} ubin: terlalu banyak (maks {{maxTiles}}); kurangi zoom maks",
    tooManyTiles:
      "Terlalu banyak ubin: maksimal {{maxTiles}} ubin dapat dibuat; kurangi zoom maks",
    notEnoughSpace: "Ruang kosong di perangkat tidak cukup",
    lowSpaceConfirm: {
      title: "Ruang kosong sedikit",
      message:
        "Peta akan menggunakan sekitar {{size}}, {{percent}}% dari ruang kosong perangkat ({{freeSpace}}). Lanjutkan?",
    },
    preview: {
      rendering: "Membuat pratinjau...",
      lowResolution:
        "Pratinjau resolusi rendah (tingkat zoom {{minZoom}} - {{maxZoom}})",
      error: "Pratinjau tidak tersedia: {{details}}",
    },
    importButton: "Impor",
    jobTitle: "Mengimpor peta",
    complete: "Peta diimpor ({{size}})",
    error: "Kesalahan saat mengimpor peta: {{details}}",
  },
  validation: {
    nameRequired: "Nama wajib diisi",
    nameDuplicate: "Nama sudah digunakan oleh peta lain yang diimpor",
  },
};
