export default {
  title: "Peta PDF",
  description:
    "Impor peta dari file PDF geospasial (bergeoreferensi) yang tersimpan di perangkat ini: peta ditampilkan di atas peta dasar pada semua peta aplikasi, bahkan tanpa koneksi internet.",
  rendererNotAvailable:
    "Peta PDF tidak didukung oleh versi aplikasi ini: perbarui ke versi terbaru",
  importPdf: "Impor PDF",
  noMaps: "Belum ada peta PDF yang diimpor",
  storage: {
    used: "Ruang yang digunakan oleh peta PDF:",
  },
  opacity: "Opasitas: {{value}}%",
  hideBaseMap: "Hanya PDF",
  map: {
    fileName: "File: {{fileName}}",
    page: "Halaman: {{page}}",
    zoomLevels: "Tingkat zoom: {{minZoom}} - {{maxZoom}}",
    tiles: "Ubin: {{count}}",
    size: "Ukuran: {{size}} (file PDF: {{sourceSize}})",
    datumWarning: "Datum peta bukan WGS84: peta bisa bergeser beberapa meter",
    visible: "Tampilkan di peta",
    deleteConfirm: "Hapus peta PDF '{{name}}'?",
    notFound: "Peta PDF tidak ditemukan",
    viewerTitle: "Peta PDF",
  },
  import: {
    title: "Impor peta PDF",
    analyzing: "Membaca georeferensi file PDF...",
    errorReading: "Kesalahan saat membaca file PDF: {{details}}",
    notGeoreferenced:
      "File PDF tidak bergeoreferensi: tidak berisi koordinat geografis peta",
    unsupportedGeoreference:
      "Georeferensi file PDF ini (pengodean OGC GeoPDF) belum didukung",
    page: "Halaman",
    pageItem: "Halaman {{page}}",
    name: "Nama",
    maxZoom: "Zoom maks: {{value}}",
    nativeZoom: "(resolusi PDF: {{value}})",
    maxZoomAboveNative: "Tingkat zoom di atas resolusi PDF akan terlihat buram",
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
    jobTitle: "Mengimpor peta PDF",
    complete: "Peta PDF diimpor ({{size}})",
    error: "Kesalahan saat mengimpor peta PDF: {{details}}",
  },
  validation: {
    nameRequired: "Nama wajib diisi",
    nameDuplicate: "Nama sudah digunakan oleh peta PDF lain",
  },
};
