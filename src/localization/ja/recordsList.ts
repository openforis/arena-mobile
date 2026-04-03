export default {
  cloneRecords: {
    title: "複製",
    confirm: {
      message:
        "選択した{{recordsCount}}件の記録をサイクル{{cycle}}に複製しますか？",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "デバイスにインポートされた記録またはローカルで変更された記録のみ次のサイクルに複製できます",
    completeSuccessfully: "記録をサイクル{{cycle}}に複製しました！",
  },
  confirmImportRecordFromServer: "サーバーから記録をインポートしますか？",
  continueEditing: {
    title: "編集を続ける",
    confirm: {
      message: "中断したところから編集を続けますか？",
    },
  },
  dateModifiedRemotely: "リモートで変更された日付",
  deleteRecordsConfirm: {
    title: "記録を削除",
    message: "選択した記録を削除しますか？",
  },
  duplicateKey: {
    title: "キーの重複",
    message: `同じキー（{{keyValues}}）を持つ別の記録がすでに存在します。`,
  },
  exportRecords: {
    title: "エクスポート",
  },
  importRecord: "記録をインポート",
  importRecords: {
    title: "$t(common:import)",
    error: {
      surveyNotVisibleInMobile:
        "記録をインポートできません：この調査はArena Mobileに表示されるべきではありません",
      recordsDownloadNotAllowed:
        "Arenaサーバーからの記録のインポートは許可されていません",
    },
  },
  importRecordsFromFile: {
    title: "インポート",
    confirmMessage: `選択したファイルから記録をインポートしますか？
{{fileName}}`,
    invalidFileType: "無効なファイルタイプです（.zipが必要）",
    overwriteExistingRecords: "既存の記録を上書き",
    selectFile: "ファイルを選択",
  },
  importCompleteSuccessfully: `記録のインポートが完了しました！
- {{processedRecords}}件の記録を処理
- {{insertedRecords}}件の記録を挿入
- {{updatedRecords}}件の記録を更新`,
  importFailed: "記録のインポートに失敗しました：{{details}}",
  loadStatus: {
    title: "読み込み状態",
    C: "完全",
    P: "一部（ファイルなし）",
    S: "要約のみ",
  },
  origin: { title: "保存元", L: "ローカル", R: "リモート" },
  owner: "所有者",
  recordHasErrorsOrWarningsTooltip: "記録に{{count}}件の{{itemsTypeText}}があります",
  sendData: {
    error: {
      generic: "サーバーにデータを送信できません：{{details}}",
      surveyNotVisibleInMobile:
        "現在の調査はArena Mobileに表示されるべきではありません",
      recordsUploadNotAllowed: "サーバーへの記録のアップロードは許可されていません",
      recordsWithErrorsUploadNotAllowed: `検証エラーのある記録のアップロードは許可されていません`,
    },
  },
};
