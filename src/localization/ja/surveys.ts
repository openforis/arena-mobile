export default {
  checkUpdates: "更新を確認",
  confirmDeleteSurvey: {
    title: "調査を削除",
    message: "選択した調査を削除しますか？",
    message_other: "選択した調査を削除しますか？",
  },
  currentSurvey: "現在の調査",
  description: "説明",
  errorFetchingLocalSurvey: "内部ストレージからの調査の読み込みエラー",
  errorFetchingSurveys: "リモートサーバーからの調査の取得エラー",
  errorFetchingSurveysWithDetails:
    "$t(surveys:errorFetchingSurveys)：{{details}}",
  fieldManual: "フィールドマニュアル",
  importFromCloud: "クラウドからインポート",
  importSurvey: "調査をインポート",
  importSurveyConfirmMessage: '調査「{{surveyName}}」をインポートしますか？',
  loadStatus: {
    label: "読み込み状態",
    notInDevice: "デバイスにありません",
    updated: "更新済み",
    upToDate: "最新",
  },
  loadSurveysErrorMessage:
    "リモートサーバーからの調査の取得エラー。\n\nユーザーがログインしていないかセッションが期限切れです。\n\nサーバーにログインしますか？",
  manageSurveys: "調査を管理",
  noAvailableSurveysFound: "利用可能な調査が見つかりません",
  noSurveysMatchingYourSearch: "検索に一致する調査がありません",
  publishedOn: "公開日",
  selectSurvey: "調査を選択",
  status: {
    notInArenaServer: "Arenaサーバーにありません",
    notVisibleInMobile: "Arena Mobileに表示されません",
  },
  statusMessage: "調査の状態：{{status}}",
  surveysInTheCloud: "クラウド上の調査",
  surveysInTheDevice: "デバイス上の調査",
  title: "調査",
  updateStatus: {
    error: "調査の更新状態の取得エラー",
    networkNotAvailable:
      "調査の更新状態を確認できません：$t(networkNotAvailable)",
    notUpToDate: "調査の更新が利用可能",
    upToDate: "調査は最新です",
  },
  updateSurvey: "調査を更新",
  updateSurveyWithNewVersionConfirmMessage:
    '調査「{{surveyName}}」に新しいバージョンがあります。更新しますか？',
  updateSurveyConfirmMessage:
    '調査「{{surveyName}}」はすでにこのデバイスにあります。更新しますか？',
};
