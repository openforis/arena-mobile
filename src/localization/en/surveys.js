export default {
  checkUpdates: "Check updates",
  confirmDeleteSurvey: {
    title: "Delete survey",
    message: "Delete the selected survey?",
    message_other: "Delete the selected surveys?",
  },
  currentSurvey: "Current survey",
  description: "Description",
  errorFetchingLocalSurvey: "Error loading survey from internal storage",
  errorFetchingSurveys: "Error fetching surveys from remote server",
  errorFetchingSurveysWithDetails:
    "$t(surveys:errorFetchingSurveys): {{details}}",
  fieldManual: "Field manual",
  importFromCloud: "Import from cloud",
  importSurvey: "Import survey",
  importSurveyConfirmMessage: 'Import the survey "{{surveyName}}"?',
  loadStatus: {
    label: "Load status",
    notInDevice: "not in device",
    updated: "updated",
    upToDate: "up to date",
  },
  loadSurveysErrorMessage:
    "Error fetching surveys from remote server.\n\nUser not logged in or session expired.\n\nLogin to the server?",
  manageSurveys: "Manage surveys",
  noAvailableSurveysFound: "No available surveys found",
  noSurveysMatchingYourSearch: "No surveys matching your search",
  publishedOn: "Published on",
  selectSurvey: "Select a survey",
  surveysInTheCloud: "Surveys in the cloud",
  surveysInTheDevice: "Surveys in the device",
  title: "Surveys",
  updateStatus: {
    error: "Error retrieving survey update status",
    networkNotAvailable:
      "Cannot verify survey update status: $t(networkNotAvailable)",
    upToDate: "Survey up-to-date",
  },
  updateSurvey: "Update survey",
  updateSurveyWithNewVersionConfirmMessage:
    'Survey "{{surveyName}}" has a new version; update it?',
  updateSurveyConfirmMessage:
    'Survey "{{surveyName}}" already in this device; update it?',
};
