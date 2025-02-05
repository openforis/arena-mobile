export default {
  cloneRecords: {
    title: "Klon",
    confirm: {
      message:
        "Klon {{recordsCount}} catatan yang dipilih ke dalam siklus {{cycle}}?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "Hanya catatan yang diimpor ke perangkat atau diubah secara lokal yang dapat diklon ke siklus berikutnya",
    completeSuccessfully: "Catatan berhasil diklon ke dalam siklus {{cycle}}!",
  },
  confirmImportRecordFromServer: "Impor catatan dari server?",
  dateModifiedRemotely: "Tanggal diubah dari jarak jauh",
  deleteRecordsConfirm: {
    title: "Hapus catatan",
    message: "Hapus catatan yang dipilih?",
  },
  duplicateKey: {
    title: "Kunci duplikat",
    message: `Catatan lain dengan kunci yang sama ({{keyValues}}) sudah ada.`,
  },
  exportRecords: {
    title: "Ekspor",
  },
  importRecord: "Impor catatan",
  importRecords: {
    title: "Impor dari server",
  },
  importRecordsFromFile: {
    title: "Impor",
    confirmMessage: `Impor catatan dari file yang dipilih
  {{fileName}}?`,
    invalidFileType: "Jenis file tidak valid (diharapkan .zip)",
    overwriteExistingRecords: "Timpa catatan yang ada",
    selectFile: "Pilih file",
  },
  importCompleteSuccessfully: `Impor catatan selesai dengan sukses!
  - {{processedRecords}} catatan diproses
  - {{insertedRecords}} catatan dimasukkan
  - {{updatedRecords}} catatan diperbarui`,
  importFailed: "Impor catatan gagal: {{details}}",
  loadStatus: {
    title: "Dimuat",
    C: "Selesai",
    P: "Sebagian (tanpa file)",
    S: "Hanya ringkasan",
  },
  origin: { title: "Asal", L: "Lokal", R: "Jarak Jauh" },
  owner: "Pemilik",
};
