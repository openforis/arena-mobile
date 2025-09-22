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
  continueEditing: {
    title: "Lanjutkan pengeditan",
    confirm: {
      message: "Lanjutkan pengeditan dari bagian terakhir Anda?",
    },
  },
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
    title: "$t(common:import)",
    error: {
      surveyNotVisibleInMobile:
        "Tidak dapat mengimpor catatan: survei ini seharusnya tidak terlihat di Arena Mobile",
      recordsDownloadNotAllowed:
        "Mengimpor catatan dari server Arena tidak diizinkan",
    },
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
  sendData: {
    error: {
      generic: "Tidak dapat mengirim data ke server: {{details}}",
      surveyNotVisibleInMobile:
        "Survei saat ini seharusnya tidak terlihat di Arena Mobile",
      recordsUploadNotAllowed: "Mengunggah rekaman ke server tidak diizinkan",
      recordsWithErrorsUploadNotAllowed:
        "Mengunggah rekaman dengan kesalahan validasi ke server tidak diizinkan",
    },
  },
};
