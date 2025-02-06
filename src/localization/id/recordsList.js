export default {
  cloneRecords: {
    title: "Klon",
    confirm: {
      message:
        "Klon {{recordsCount}} data isian yang dipilih ke dalam siklus {{cycle}}?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "Hanya data isian yang diimpor ke perangkat atau diubah secara lokal yang dapat diklon ke siklus berikutnya",
    completeSuccessfully:
      "Data isian telah berhasil diklon ke dalam siklus {{cycle}}!",
  },
  confirmImportRecordFromServer: "Impor data dari server?",
  dateModifiedRemotely: "Tanggal diubah dari jarak jauh",
  deleteRecordsConfirm: {
    title: "Hapus data",
    message: "Hapus data isian yang dipilih?",
  },
  duplicateKey: {
    title: "Kunci duplikat",
    message: `Data isian lain dengan kunci yang sama ({{keyValues}}) sudah ada.`,
  },
  exportRecords: {
    title: "Ekspor",
  },
  importRecord: "Impor data isian",
  importRecords: {
    title: "Impor dari server",
  },
  importRecordsFromFile: {
    title: "Impor",
    confirmMessage: `Impor data isan dari berkas yang dipilih
  {{fileName}}?`,
    invalidFileType: "Jenis berkas tidak valid (diharapkan .zip)",
    overwriteExistingRecords: "Timpa data yang ada",
    selectFile: "Pilih berkas",
  },
  importCompleteSuccessfully: `Impor data isian telah selesai dengan sukses!
  - {{processedRecords}} data isan diproses
  - {{insertedRecords}} data isian dimasukkan
  - {{updatedRecords}} data isian diperbarui`,
  importFailed: "Impor data isian gagal: {{details}}",
  loadStatus: {
    title: "Dimuat",
    C: "Selesai",
    P: "Sebagian (tanpa berkas)",
    S: "Hanya ringkasan",
  },
  origin: { title: "Asal", L: "Lokal", R: "Jarak Jauh" },
  owner: "Pemilik",
};
