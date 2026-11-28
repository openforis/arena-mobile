import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  recordReadOnlyOfAnotherUserGroup:
    "Catatan ini milik grup pengguna lain: hanya dapat dilihat. Kloning untuk mengeditnya",
  autoSync: {
    checkbox: "Sinkronisasi otomatis",
    synced: "{{count}} catatan disinkronkan otomatis",
    synced_other: "{{count}} catatan disinkronkan otomatis",
    statusLabel: "Status sinkronisasi:",
    statusTitle: "Status sinkronisasi",
    syncInProgressToast:
      "Sinkronisasi otomatis sedang berlangsung. Harap tunggu hingga selesai sebelum mengirim data secara manual.",
    batteryDataWarning:
      "Dapat meningkatkan penggunaan baterai dan data saat tidak menggunakan Wi-Fi",
    syncNow: "Sinkronkan sekarang",
    recordSyncInProgress:
      "Catatan ini sedang disinkronkan dengan server. Mohon tunggu sebentar",
    status: {
      syncedTooltip: "Semua catatan telah disinkronkan dengan server",
      pendingTooltip:
        "Beberapa catatan masih perlu disinkronkan. Catatan akan dikirim secara otomatis",
      errorTooltip:
        "Beberapa catatan memiliki kesalahan sinkronisasi dan memerlukan perhatian Anda. Buka 'Kirim data' untuk menyelesaikannya",
      needsManualFixTooltip:
        "Beberapa catatan tidak dapat disinkronkan sampai Anda memperbaikinya (mis. nilai kunci kosong, kunci sama dengan catatan yang sudah ada di server saat penggabungan tidak diizinkan, atau tidak lagi dalam tahap entri). Periksa status sinkronisasinya di daftar catatan",
      mergeWithSameKeysNotAllowedNote:
        "Beberapa data isian memiliki kunci yang sama dengan data isian yang sudah ada di server, dan penggabungannya tidak diizinkan untuk survei ini. Jika merupakan data isian yang berbeda, ubah nilai kuncinya; jika merupakan data isian yang sama, hubungi administrator survei.",
      syncingTooltip: "Menyinkronkan catatan...",
      progressPercent: "{{progressPercent}}%",
      uncheckedTooltip:
        "Status sinkronisasi belum diperiksa. Gunakan 'Periksa status' untuk memeriksanya",
      offlineTooltip:
        "Tidak ada koneksi internet. Sinkronisasi otomatis akan dilanjutkan setelah kembali online",
      authErrorTooltip:
        "Sesi Anda dengan server telah berakhir. Masuk kembali untuk melanjutkan sinkronisasi otomatis",
      checkErrorTooltip:
        "Tidak dapat memeriksa status sinkronisasi karena kesalahan server. Coba lagi",
      noCandidatesMessage: "Tidak ada yang perlu dikirim saat ini",
    },
  },
  confirmUpdateNodesBecameNotApplicable: {
    title: "Node tidak akan berlaku lagi",
    message: `Node berikut tidak akan berlaku lagi:  
  
{{attributeNames}}  
  
Nilainya akan dihapus.  
Lanjutkan?`,
  },
  confirmGoToListOfRecords: `lanjut ke daftar isian?
  
  (semua perubahan sudah disimpan)`,
  checkStatus: "Periksa status",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Cari titik sampling terdekat",
    findingClosestSamplingPoint: "Mencari titik sampling terdekat",
    minDistanceItemFound: "Item ditemukan pada jarak {{minDistance}}m",
    minDistanceItemFound_other:
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
  createRecordError: "Kesalahan saat membuat catatan baru: {{error}}",
  userGroupNotReady: {
    title: "Informasi pengguna belum siap",
    message: `Informasi grup pengguna Anda belum diambil dari server. Survei ini memiliki atribut yang diisi otomatis berdasarkan grup pengguna Anda, sehingga membuat catatan sekarang dapat membuat atribut tersebut kosong atau tidak benar.

Apakah Anda ingin mengambilnya lagi dari server?`,
    fetchAgain: "Ambil lagi",
    stillNotReady:
      "Tidak dapat mengambil informasi grup pengguna Anda dari server. Catatan tidak dibuat.",
  },
  updateAttributeError: "Kesalahan saat memperbarui nilai: {{error}}",
  cycle: "Siklus",
  cycleForNewRecords: "Siklus untuk data isian baru:",
  options: "Opsi",
  editNodeDef: "Sunting {{nodeDef}}",
  viewNodeDef: "Lihat {{nodeDef}}",
  errorFetchingRecordsSyncStatus: `Kesalahan saat mengambil data isian dari server.
  
  Periksa pengaturan koneksi.
  
  Detail: {{details}}`,
  errorGeneratingRecordsExportFile:
    "Kesalahan saat membuat berkas ekspor data isian: {{details}}",
  errorLoadingRecords: "Kesalahan saat memuat data isian: {{details}}",
  exportNewOrUpdatedRecords: "Ekspor data isian baru atau yang diperbarui",
  formLanguage: "Bahasa formulir:",
  entityListColumns: {
    button: "Kolom",
    hideAll: "Sembunyikan semua",
    keys: "Atribut kunci",
    other: "Atribut lainnya",
    reset: "Bawaan",
    showAll: "Tampilkan semua",
    summary: "Atribut ringkasan",
    title: "Kolom yang terlihat",
  },
  noEntitiesDefined: "Tidak ada entitas yang ditentukan",
  goToDataEntry: "Pergi ke entri data",
  goToListOfRecords: "Pergi ke daftar data isian",
  gpsLockingEnabledWarning: "Peringatan: Penguncian GPS diaktifkan!",
  listOfRecords: "Data",
  localBackup: "Cadangan lokal",
  newRecord: "Catatan baru",
  newRecordShort: "Baru",
  node: {
    cannotAddMoreItems: {
      maxCountReached:
        "Tidak dapat menambahkan lebih banyak item: jumlah maksimum tercapai",
    },
    cannotDeleteNode: {
      noNodeFound: "Tidak dapat menghapus node: node tidak ditemukan",
    },
    cannotUpdateSingleAttributeValue: {
      noNodeFound: "Tidak dapat memperbarui nilai: node tidak ditemukan",
    },
  },
  noRecordsFound: "Tidak ada data yang ditemukan",
  recordEditor: "Editor data isian",
  recordCompletion: {
    shortDescription: "{{percent}}% selesai",
  },
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
  recordStatus: {
    new: "baru",
    updated: "diperbarui",
    conflicting: "bertentangan",
    conflictingModifiedRemotely: "diubah di perangkat dan di server",
    withValidationErrors: "dengan kesalahan validasi",
  },
  sendData: "Kirim data",
  showOnlyLocalRecords: "Tampilkan hanya catatan lokal",
  syncedOn: "Disinkronkan pada",
  syncStatusHeader: "Status",
  syncStatus: {
    conflictingKeys: "Catatan dengan kunci yang sama sudah ada",
    deviceDateBehindServer:
      "Tidak diunggah: tanggal perangkat lebih awal dari tanggal server (atur tanggal dan waktu yang benar, lalu edit catatan lagi)",
    keysNotSpecified: `Kunci tidak ditentukan`,
    new: "Baru (belum diunggah)",
    notModified: "Tidak dimodifikasi (tidak ada perubahan untuk diunggah)",
    modifiedLocally: "Dimodifikasi secara lokal",
    modifiedLocallyAndRemotely:
      "Dimodifikasi secara lokal dan di server jarak jauh (konflik)",
    modifiedRemotely: "Dimodifikasi di server jarak jauh",
    notInEntryStepAnymore:
      "Tidak lagi dalam tahap entri (dalam tahap pembersihan atau analisis)",
  },
  processingData: {
    title: "Memproses data",
  },
  uploadingData: {
    title: "Mengunggah data",
    size: "Ukuran file: {{size}}",
    speed: "Kecepatan unggah: {{speed}}/dtk",
    eta: "Perkiraan sisa waktu: {{eta}}",
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
    selectItem_other: "Pilih item",
  },
  coordinate: {
    longPressMarkerToMove: "Tekan lama penanda untuk memindahkannya",
    saveNewPosition: "Simpan posisi baru",
    accuracy: "Akurasi (m)",
    altitude: "Ketinggian (m)",
    altitudeAccuracy: "Akurasi ketinggian (m)",
    angleToTargetLocation: "Sudut ke target",
    confirmConvertCoordinate:
      "Konversi koordinat dari SRS {{srsFrom}} ke SRS {{srsTo}}?",
    connectingToSource: "Menghubungkan ke {{label}}...",
    convert: "Konversi",
    currentLocation: "Lokasi saat ini",
    distance: "Jarak (m)",
    externalGpsGenericLabel: "perangkat GPS eksternal",
    getLocation: "Dapatkan lokasi",
    heading: "Arah (derajat)",
    map: {
      attributeViewerTitle: 'Lokasi "{{attributeLabel}}"',
      chooserTitle: "Tampilkan di peta",
      inApp: "Arena Mobile",
      inAppDescription: "Berfungsi secara offline dengan peta yang diunduh",
      inAppDescriptionRelocatable:
        "Berfungsi secara offline dengan peta yang diunduh.\nPosisi dapat dipindahkan",
      otherApp: "Aplikasi lain…",
      otherAppDescription:
        "Pilih di antara semua aplikasi terpasang yang dapat menampilkan lokasi",
      show: "Tampilkan",
      targetViewerTitle: 'Lokasi target "{{attributeLabel}}"',
      viewerTitle: "Lokasi",
    },
    headingOffset: "Penyimpangan arah",
    headingSource: "Sumber arah",
    headingSourceMagnetometer: "Sensor",
    headingSourceLocation: "GPS",
    keepXAndY: "Pertahankan X dan Y",
    locationCannotBeConvertedToSrs:
      "Lokasi GPS tidak dapat dikonversi ke sistem koordinat {{srs}}",
    locationHeadingNotAvailable: "Arah GPS tidak tersedia!",
    magnetometerNotAvailable: "Magnetometer tidak tersedia!",
    navigateToTarget: "Navigasi ke target",
    srs: "$t(common:srs)",
    targetLocation: "Lokasi target",
    useCurrentLocation: "Gunakan lokasi saat ini",
    usingInternalFallback:
      "Menggunakan GPS internal ({{label}} tidak tersedia)",
    usingSource: "Menggunakan {{label}}",
    x: "X",
    y: "Y",
    viewModeCompass: "Kompas",
    viewModeRadar: "Radar",
    locationNavigatorInfo: {
      title: "Navigator Lokasi",
      description:
        "Memandu Anda menuju koordinat target menggunakan GPS dan sensor perangkat Anda. Menampilkan lokasi target relatif terhadap posisi Anda saat ini dan memungkinkan Anda bernavigasi ke sana di lapangan.",
      viewModesTitle: "Mode Tampilan",
      compassTitle: "Kompas",
      compassDesc:
        "Menampilkan mawar kompas berputar yang sejajar dengan Utara. Sebuah panah menunjuk ke arah target. Saat sangat dekat dengan target (mode kedekatan), panah diganti dengan titik pada lingkaran akurasi yang menunjukkan posisi relatif target.",
      radarTitle: "Radar",
      radarDesc:
        "Menampilkan tampilan radar dari atas dengan posisi Anda tetap di tengah. Titik target bergerak di sekitar Anda secara real time untuk mencerminkan arah dan jarak sebenarnya.",
      headingSourcesTitle: "Sumber Arah",
      sensorTitle: "Sensor (Magnetometer)",
      sensorDesc:
        "Menggunakan magnetometer bawaan perangkat (chip kompas). Berfungsi saat diam, tetapi dapat terpengaruh oleh benda logam di dekatnya atau gangguan magnetik.",
      gpsTitle: "GPS",
      gpsDesc:
        "Menentukan arah dari pergerakan GPS. Lebih akurat di ruang terbuka, tetapi mengharuskan Anda berjalan dan mungkin tidak tersedia di semua perangkat.",
    },
  },
  geo: {
    drawPolygon: "Gambar poligon",
    editPolygon: "Edit poligon",
    selectPolygonInstruction: "Tekan pada poligon untuk memilihnya",
    selectPointInstructions: `- Ketuk sebuah titik untuk memilihnya.  
- Ketuk titik tengah untuk menambahkan titik baru.`,
    editPolygonInstructions:
      "Tekan lama titik yang dipilih, lalu seret untuk memindahkannya.",
    tapToAddPoints: `Ketuk peta untuk menambahkan titik.  
Tekan '$t(common:stop)' ketika selesai.`,
    deleteSelectedPoint: "Hapus titik yang dipilih",
    addCurrentLocationPoint: "Tambah lokasi saat ini",
    addCurrentLocationPointInstructions:
      "Tekan '$t(dataEntry:geo.addCurrentLocationPoint)' untuk menambahkan lokasi saat ini ke poligon",
  },
  positionTracking: {
    title: "Pelacakan posisi",
    start: "Mulai pelacakan",
    resume: "Lanjutkan",
    restart: "Mulai ulang",
    restartConfirm: {
      title: "Hapus jejak yang direkam?",
      message:
        "Semua titik yang telah direkam sejauh ini pada atribut ini akan dihapus dan pelacakan akan dimulai dari awal. Tindakan ini tidak dapat dibatalkan.",
    },
    delete: "Hapus jejak",
    deleteConfirm: {
      title: "Hapus jejak yang direkam?",
      message:
        "Semua titik yang direkam pada atribut ini akan dihapus dan atribut akan dibiarkan kosong. Tindakan ini tidak dapat dibatalkan.",
    },
    stop: "Berhenti",
    showTrack: "Tampilkan jejak",
    retry: "Coba lagi",
    status: {
      idle: "Tidak melacak",
      stopped: "Pelacakan dihentikan",
      starting: "Memulai pelacakan…",
      tracking: "Melacak",
      paused: "Pelacakan dijeda",
    },
    waitingForFix: "Menunggu GPS…",
    accuracy: "±{{accuracy}} m",
    pointsCount: "{{count}} titik",
    trackSummary: "{{length}} · {{pointsCount}} titik · {{duration}}",
    attributeNotEditable: "Nilai atribut ini direkam oleh pelacakan posisi",
    stopConfirm:
      "Hentikan pelacakan? Jejak yang direkam disimpan dalam atribut dan dapat dilanjutkan nanti.",
    stopCurrentConfirm:
      "Atribut lain sedang dilacak: hentikan pelacakannya dan mulai melacak atribut ini?",
    interrupted:
      "Pelacakan posisi terhenti: jejak yang direkam telah disimpan. Lanjutkan pelacakan untuk meneruskan.",
    error: {
      generic: "Tidak dapat memulai pelacakan posisi",
      permissionDenied:
        "Tidak dapat melacak posisi: akses ke lokasi tidak diberikan",
      locationServicesOff:
        "Tidak dapat melacak posisi: layanan lokasi dimatikan",
      notSaved:
        "Jejak belum dapat disimpan dalam atribut: jejak akan disimpan nanti",
    },
  },
  taxon: {
    search: "Cari takson",
    taxonNotSelected: "--- Takson tidak dipilih ---",
  },
  fileAttribute: {
    selectAudio: "Pilih audio",
    selectFile: "Pilih file",
    selectPicture: "Pilih gambar",
    selectVideo: "Pilih video",
    deleteConfirmMessage: "Hapus file yang ada?",
    fileMissing: "File tidak ditemukan di penyimpanan lokal",
    fileSelectError: "Kesalahan saat memilih file: {{error}}",
  },
  fileAttributeAudio: {
    error: {
      startingRecording: "Kesalahan saat memulai perekaman audio: {{error}}",
      pausingRecording: "Kesalahan saat menjeda perekaman audio: {{error}}",
      resumingRecording:
        "Kesalahan saat melanjutkan perekaman audio: {{error}}",
      savingRecording: "Kesalahan saat menyimpan rekaman audio",
      stoppingRecording:
        "Kesalahan saat menghentikan perekaman audio: {{error}}",
    },
  },
  fileAttributeImage: {
    imagePreview: "Pratinjau gambar",
    pictureResizedToSize: `Gambar diubah ukurannya menjadi {{size}}.
Ukuran maksimum yang diizinkan: {{maxSizeMB}}MB.
Periksa pengaturan atau minta administrator survei untuk mengubah batas ini.`,
    resolution: "Resolusi",
    rotate: "Putar",
    cameraOpenError: "Kesalahan saat membuka kamera: {{error}}",
    rotationError: "Kesalahan saat memutar gambar: {{error}}",
  },
  dataExport: {
    confirm: {
      title: "Konfirmasi ekspor data",
      message: `Data isian yang akan diekspor:
{{recordsCountSummary}}`,
      selectOptions: `Pilih opsi ekspor:`,
    },

    error: "Kesalahan saat mengekspor data. Detail: {{details}}",
    exportedSuccessfullyButFilesMissing:
      "Data berhasil diekspor tetapi {{missingFiles}} file/gambar hilang atau rusak. Silakan periksa catatan Anda dan juga catatan di server.",
    exportingData: "Mengekspor data...",
    uploadBatch: "Bagian {{batch}} dari {{batchCount}}",
    exportToCsv: "Ekspor ke CSV",
    mergeConflictingRecords: "Gabungkan data isian yang berkonflik",
    mergeWithSameKeysNotAllowed:
      "Penggabungan data isian dengan kunci yang sama tidak diizinkan untuk survei ini, sehingga data isian dengan kunci yang berkonflik tidak akan dikirim. Jika merupakan data isian yang berbeda, ubah nilai kuncinya; jika merupakan data isian yang sama, hubungi administrator survei.",
    mergeSameRecordConflictConfirm: {
      title: "Gabungkan data isian yang diedit di kedua perangkat",
      message: `{{count}} data isian juga telah diperbarui di server sejak perangkat ini terakhir menyinkronkannya.

Menggabungkan akan menyatukan perubahan Anda dengan perubahan di server: untuk setiap kolom, nilai yang paling terakhir diedit akan disimpan, dan setiap bagian baru yang ditambahkan di salah satu perangkat akan disimpan.

Ini tidak dapat dilihat pratinjaunya terlebih dahulu. Geser untuk mengonfirmasi dan melanjutkan.`,
    },
    noRecordsInDeviceToExport: "Tidak ada data di perangkat untuk diekspor",
    onlyNewOrUpdatedRecords:
      "Ekspor hanya data isian baru atau yang diperbarui",
    recordsMergedMessage: `Data isian berikut telah digabungkan dengan versi yang lebih baru yang sudah ada di server:
{{recordsList}}

Versi gabungan dari data isian tersebut telah diambil secara otomatis.`,
    onlyRecordsInRemoteServerCanBeImported:
      "Hanya data isian yang sudah ada di server atau data isian yang telah diperbarui di server yang dapat diimpor",
    option: {
      [FlatDataExportOption.addCycle]: "Tambahkan siklus",
      [FlatDataExportOption.includeAncestorAttributes]: "Atribut leluhur",
      [FlatDataExportOption.includeCategoryItemsLabels]: "Label item kategori",
      [FlatDataExportOption.includeFiles]: "Atribut file",
      [FlatDataExportOption.includeTaxonScientificName]: "Nama ilmiah takson",
    },
    selectTarget: "Pilih target ekspor",
    selectTargetMessage: `Pilih target ekspor:`,
    shareExportedFile: "Bagikan file yang diekspor",
    target: {
      remote: "Server jarak jauh",
      local: "Folder lokal (Unduhan)",
      share: "$t(common:shareFile)",
    },
    recordsWithMissingFilesConfirm: {
      confirmButton: "Ekspor tanpa file yang hilang",
      title: "File yang hilang",
      message: `Data isian berikut memiliki file yang hilang dan akan diekspor tanpanya:\n{{recordsList}}\n\nApakah Anda ingin melanjutkan?`,
    },
    title: "Ekspor data",
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
