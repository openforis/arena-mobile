export default {
  cloneRecords: {
    title: "Cloner",
    confirm: {
      message:
        "Cloner les {{recordsCount}} enregistrements sélectionnés dans le cycle {{cycle}}?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "Seuls les enregistrements importés sur l'appareil ou modifiés localement peuvent être clonés dans le cycle suivant",
    completeSuccessfully:
      "Enregistrements clonés avec succès dans le cycle {{cycle}}!",
  },
  confirmImportRecordFromServer: "Importer l'enregistrement depuis le serveur?",
  dateModifiedRemotely: "Date de modification à distance",
  deleteRecordsConfirm: {
    title: "Supprimer les enregistrements",
    message: "Supprimer les enregistrements sélectionnés?",
  },
  duplicateKey: {
    title: "Clé dupliquée",
    message:
      "Un autre enregistrement avec la même clé ({{keyValues}}) existe déjà.",
  },
  exportRecords: {
    title: "Exporter",
  },
  importRecord: "Importer l'enregistrement",
  importRecords: {
    title: "Importer depuis le serveur",
  },
  importRecordsFromFile: {
    title: "Importer",
    confirmMessage:
      "Importer les enregistrements depuis le fichier sélectionné\n{{fileName}}?",
    invalidFileType: "Type de fichier non valide (attendu: .zip)",
    overwriteExistingRecords: "Remplacer les enregistrements existants",
    selectFile: "Sélectionner un fichier",
  },
  importCompleteSuccessfully:
    "Importation des enregistrements terminée avec succès!\n- {{processedRecords}} enregistrements traités\n- {{insertedRecords}} enregistrements insérés\n- {{updatedRecords}} enregistrements mis à jour",
  importFailed: "Échec de l'importation des enregistrements: {{details}}",
  loadStatus: {
    title: "Chargé",
    C: "Complet",
    P: "Partiel (sans fichiers)",
    S: "Résumé uniquement",
  },
  origin: {
    title: "Origine",
    L: "Local",
    R: "Distant",
  },
  owner: "Propriétaire",
};
