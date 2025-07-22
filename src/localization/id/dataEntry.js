export default {
  confirmGoToListOfRecords: `lanjut ke daftar isian?
  
  (semua perubahan sudah disimpan)`,
  checkStatus: "Periksa status",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Cari titik sampling terdekat",
    findingClosestSamplingPoint: "Mencari titik sampling terdekat",
    minDistanceItemFound: "Item ditemukan pada jarak {{minDistance}}m",
    minDistanceItemFound_plural:
      "Item-item ditemukan pada jarak {{minDistance}}m",
    useSelectedItem: "Gunakan item yang dipilih",
  },
  confirmDeleteSelectedItems: {
    message: "Hapus item yang dipilih?",
  },
  confirmDeleteValue: {
    message: "Hapus nilai ini?",
  },
  confirmOverwriteValue: {
    message: "Timpa nilai yang sudah ada?",
  },
  confirmUpdateDependentEnumeratedEntities: {
    message:
      "Jika Anda melanjutkan, beberapa entitas terenumerasi dependen ({{entityDefs}}) akan di-enumerasi ulang, menghapus nilai-nilai yang ada yang dimasukkan ke dalamnya (jika ada).\n\nPerbarui entitas terenumerasi?",
    title: "Perbarui entitas terenumerasi",
  },
  cycle: "Siklus",
  cycleForNewRecords: "Siklus untuk data isian baru:",
  options: "Opsi",
  editNodeDef: "Edit {{nodeDef}}",
  errorFetchingRecordsSyncStatus: `Kesalahan saat mengambil data isian dari server.
  
  Periksa pengaturan koneksi.
  
  Detail: {{details}}`,
  errorGeneratingRecordsExportFile:
    "Kesalahan saat membuat berkas ekspor data isian: {{details}}",
  errorLoadingRecords: "Kesalahan saat memuat data isian: {{details}}",
  exportData: {
    title: "Ekspor data",
    confirm: {
      title: "Konfirmasi ekspor data",
      message: `Data isian yang akan diekspor:
  - {{newRecordsCount}} Data isian baru;
  - {{updatedRecordsCount}} data isian yang diperbarui
  - {{conflictingRecordsCount}} data isian yang berkonflik`,
    },
    noRecordsInDeviceToExport: "Tidak ada data di perangkat untuk diekspor",
    onlyNewOrUpdatedRecords:
      "Ekspor hanya data isian baru atau yang diperbarui",
    mergeConflictingRecords:
      "Gabungkan data isian yang berkonflik (kunci yang sama)",
    onlyRecordsInRemoteServerCanBeImported:
      "Hanya data isian yang sudah ada di server atau data isian yang telah diperbarui di server yang dapat diimpor",
  },
  exportNewOrUpdatedRecords: "Ekspor data isian baru atau yang diperbarui",
  formLanguage: "Bahasa formulir:",
  noEntitiesDefined: "Tidak ada entitas yang ditentukan",
  goToDataEntry: "Pergi ke entri data",
  goToListOfRecords: "Pergi ke daftar data isian",
  gpsLockingEnabledWarning: "Peringatan: Penguncian GPS diaktifkan!",
  listOfRecords: "Data",
  localBackup: "Cadangan lokal",
  newRecord: "Baru",
  node: {
    cannotAddMoreItems: {
      maxCountReached:
        "Tidak dapat menambahkan lebih banyak item: jumlah maksimum tercapai",
    },
  },
  noRecordsFound: "Tidak ada data yang ditemukan",
  recordEditor: "Editor data isian",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "Tampilkan nilai dari siklus sebelumnya",
      message: "Pilih siklus sebelumnya:",
      cycleItem: "Siklus {{cycleLabel}}",
    },
    foundMessage: "Data isian di siklus sebelumnya ditemukan!",
    notFoundMessage:
      "Catatan di siklus {{cycle}} dengan kunci {{keyValues}} tidak ditemukan",
    confirmFetchRecordInCycle:
      "Catatan di siklus {{cycle}} dengan kunci {{keyValues}} belum sepenuhnya dimuat; unduh dari server?",
    confirmSyncRecordsSummaryAndTryAgain:
      "$t(dataEntry:recordInPreviousCycle.notFoundMessage): ambil daftar data isian dari server dan coba lagi?",
    fetchError:
      "Kesalahan saat mengambil data di siklus sebelumnya: {{details}}",
    multipleRecordsFound:
      "Beberapa data dengan kunci {{keyValues}} ditemukan di siklus {{cycle}}",

    valuePanelHeader: "Nilai di siklus {{prevCycle}}",
  },
  sendData: "Kirim data",
  showOnlyLocalRecords: "Tampilkan hanya catatan lokal",
  syncedOn: "Disinkronkan pada",
  syncStatusHeader: "Status",
  syncStatus: {
    conflictingKeys: "Catatan dengan kunci yang sama sudah ada",
    keysNotSpecified: `Kunci tidak ditentukan`,
    new: "Baru (belum diunggah)",
    notModified: "Tidak dimodifikasi (tidak ada perubahan untuk diunggah)",
    modifiedLocally: "Dimodifikasi secara lokal",
    modifiedRemotely: "Dimodifikasi di server jarak jauh",
    notInEntryStepAnymore:
      "Tidak lagi dalam tahap entri (dalam tahap pembersihan atau analisis)",
  },

  validationReport: {
    title: "Laporan validasi",
    noErrorsFound: "Bagus, tidak ada kesalahan ditemukan!",
  },

  viewModeLabel: "Mode tampilan",
  viewMode: {
    form: "Formulir",
    oneNode: "Satu node",
  },

  code: {
    selectItem: "Pilih item",
    selectItem_plural: "Pilih item",
  },
  coordinate: {
    accuracy: "Akurasi (m)",
    altitude: "Ketinggian (m)",
    altitudeAccuracy: "Akurasi ketinggian (m)",
    angleToTargetLocation: "Sudut ke target",
    confirmConvertCoordinate:
      "Konversi koordinat dari SRS {{srsFrom}} ke SRS {{srsTo}}?",
    convert: "Konversi",
    currentLocation: "Lokasi saat ini",
    distance: "Jarak (m)",
    getLocation: "Dapatkan lokasi",
    heading: "Arah (derajat)",
    keepXAndY: "Pertahankan X dan Y",
    magnetometerNotAvailable: "Magnetometer tidak tersedia!",
    navigateToTarget: "Navigasi ke target",
    srs: "$t(common:srs)",
    useCurrentLocation: "Gunakan lokasi saat ini",
    x: "X",
    y: "Y",
  },
  taxon: {
    search: "Cari takson",
    taxonNotSelected: "--- Takson tidak dipilih ---",
  },
  fileAttribute: {
    chooseAudio: "Pilih file audio",
    chooseFile: "Pilih file",
    choosePicture: "Pilih gambar",
    chooseVideo: "Pilih video",
    deleteConfirmMessage: "Hapus file yang ada?",
  },
  fileAttributeImage: {
    imagePreview: "Pratinjau gambar",
    pictureResizedToSize: `Gambar diubah ukurannya menjadi {{size}}.
Ukuran maksimum yang diizinkan: {{maxSizeMB}}MB.
Periksa pengaturan atau minta administrator survei untuk mengubah batas ini.`,
    resolution: "Resolusi",
  },
  dataExport: {
    error: "Kesalahan saat mengekspor data. Detail: {{details}}",
    selectTarget: "Pilih target ekspor",
    selectTargetMessage: `Pilih target ekspor:`,
    target: {
      remote: "Server jarak jauh",
      local: "Folder lokal (Unduhan)",
      share: "Bagikan file",
    },
    shareExportedFile: "Bagikan file yang diekspor",
  },
  location: {
    label: "Lokasi",
    gettingCurrentLocation: "Mendapatkan lokasi saat ini",
    usingCurrentLocation: "Menggunakan lokasi saat ini",
  },
  unlock: {
    label: "Buka kunci",
    confirmMessage: "Edit catatan terkunci; buka kuncinya?",
    confirmTitle: "Edit terkunci",
  },
};
