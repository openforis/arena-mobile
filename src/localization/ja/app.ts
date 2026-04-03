export default {
  backup: "バックアップ",
  changelog: "変更履歴",
  confirmExit: {
    title: "終了",
    message: `アプリを終了しますか？
すべての変更はすでに保存されています。`,
  },
  currentVersion: "現在のバージョン",
  fullBackup: {
    confirmMessage: `フルバックアップを生成しますか？
サイズは約{{size}}になります。`,
    confirmTitle: "バックアップを生成",
    error: "フルバックアップの生成エラー：{{details}}",
    shareTitle: "Arena Mobileフルバックアップを共有",
    title: "フルバックアップ",
  },
  initializationStep: {
    starting: "開始中",
    fetchingDeviceInfo: "デバイス情報を取得中",
    fetchingSettings: "設定を取得中",
    storingSettings: "設定を保存中",
    settingFullScreen: "全画面表示を設定中",
    settingKeepScreenAwake: "画面の点灯維持を設定中",
    startingGpsLocking: "GPSロックを開始中",
    initializingDb: "データベースを初期化中",
    startingDbMigrations: "データベースの移行を開始中",
    fetchingSurveys: "調査を取得中",
    importingDemoSurvey: "デモ調査をインポート中",
    fetchingAndSettingLocalSurveys: "ローカルの調査を取得・設定中",
    fetchingAndSettingSurvey: "調査を取得・設定中",
    checkingLoggedIn: "ログイン状態を確認中",
    complete: "完了",
  },
  logs: {
    title: "記録（ログ）",
    subtitle:
      "記録ファイルには問題の解決に役立つ診断情報が含まれています。",
    clear: {
      label: "記録（ログ）をクリア",
      confirmMessage: "すべての記録（ログ）ファイルを削除してもよいですか？",
    },
    exportLabel: "記録（ログ）をエクスポート",
  },
  pleaseWaitMessage: "お待ちください...",
  update: "更新",
  updateAvailable: "更新が利用可能",
  updateStatus: {
    error: "アプリケーションの更新状態の取得エラー：{{error}}",
    networkNotAvailable:
      "アプリケーションの更新状態を確認できません：$t(networkNotAvailable)",
    upToDate: "アプリケーションは最新です",
  },
};
