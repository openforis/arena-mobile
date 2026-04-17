import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  confirmUpdateNodesBecameNotApplicable: {
    title: "ノードは適用されなくなります",
    message: `以下のノードは適用されなくなります：  
  
{{attributeNames}}  
  
それらの値は削除されます。  
続行しますか？`,
  },
  confirmGoToListOfRecords: `記録一覧に移動しますか？

（すべての変更はすでに保存されています）`,
  checkStatus: "状態を確認",
  closestSamplingPoint: {
    findClosestSamplingPoint: "最寄りの抽出地点を探す",
    findingClosestSamplingPoint: "最寄りの抽出地点を探しています",
    minDistanceItemFound: "距離{{minDistance}}mの地点に項目が見つかりました",
    minDistanceItemFound_plural:
      "距離{{minDistance}}mの地点に項目が見つかりました",
    useSelectedItem: "選択した項目を使用",
  },
  confirmDeleteSelectedItems: {
    message: "選択した項目を削除しますか？",
  },
  confirmDeleteValue: {
    message: "この値を削除しますか？",
  },
  confirmOverwriteValue: {
    message: "既存の値を上書きしますか？",
  },
  confirmUpdateDependentEnumeratedEntities: {
    message: `続行すると、{{entityDefs}} のデータが再作成され、既存の入力内容はすべて消去されます。

項目の更新を続けますか？`,
    title: "項目の構成を更新",
  },
  cycle: "サイクル",
  cycleForNewRecords: "新規記録のサイクル：",
  dataExport: {
    confirm: {
      title: "データエクスポートの確認",
      message: `エクスポートする記録：
{{recordsCountSummary}}`,
      selectOptions: `エクスポートのオプションを選択：`,
    },

    error: "データのエクスポートエラー。詳細：{{details}}",
    exportedSuccessfullyButFilesMissing: `データは正常にエクスポートされましたが、{{missingFiles}}件のファイル/画像が見つからないか壊れています。
記録とサーバー上の記録を確認してください`,
    exportingData: "データをエクスポート中...",
    exportToCsv: "CSVにエクスポート",
    mergeConflictingRecords: "重複する記録を統合（同じ地点）",
    noRecordsInDeviceToExport: "エクスポートする記録がデバイスにありません",
    onlyNewOrUpdatedRecords: "新規または更新された記録のみエクスポート",
    onlyRecordsInRemoteServerCanBeImported:
      "リモートサーバーにある記録またはリモートで更新された記録のみインポートできます",
    option: {
      [FlatDataExportOption.addCycle]: "サイクルを追加",
      [FlatDataExportOption.includeAncestorAttributes]: "上位階層の属性",
      [FlatDataExportOption.includeCategoryItemsLabels]: "カテゴリ項目のラベル",
      [FlatDataExportOption.includeFiles]: "ファイル属性",
      [FlatDataExportOption.includeTaxonScientificName]: "分類群の学名",
    },
    selectTarget: "エクスポート先を選択",
    selectTargetMessage: `エクスポート先を選択：`,
    shareExportedFile: "エクスポートしたファイルを共有",
    target: {
      remote: "リモートサーバー",
      local: "ローカルフォルダ（ダウンロード）",
      share: "$t(common:shareFile)",
    },
    title: "データをエクスポート",
  },
  editNodeDef: "{{nodeDef}}を編集",
  errorFetchingRecordsSyncStatus: `サーバーからの記録取得エラー。

接続設定を確認してください。

詳細：{{details}}`,
  errorGeneratingRecordsExportFile:
    "記録エクスポートファイルの生成エラー：{{details}}",
  errorLoadingRecords: "記録の読み込みエラー：{{details}}",
  exportNewOrUpdatedRecords: "新規または更新された記録をエクスポート",
  formLanguage: "調査票の言語：",
  node: {
    cannotAddMoreItems: {
      maxCountReached: `これ以上項目を追加できません：
最大数に達しました`,
    },
    cannotDeleteNode: {
      noNodeFound: "項目を削除できません：項目が見つかりません",
    },
    cannotUpdateSingleAttributeValue: {
      noNodeFound: "値を更新できません：項目が見つかりません",
    },
  },
  noEntitiesDefined: "項目が定義されていません",
  goToDataEntry: "データ入力に移動",
  goToListOfRecords: "記録一覧に移動",
  gpsLockingEnabledWarning: "警告：GPSロックが有効です！",
  listOfRecords: "記録",
  localBackup: "ローカルバックアップ",
  newRecord: "新規",
  noRecordsFound: "記録が見つかりません",
  options: "オプション",
  recordEditor: "記録エディタ",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "前のサイクルの値を表示",
      message: "前のサイクルを選択：",
      cycleItem: "サイクル{{cycleLabel}}",
    },
    foundMessage: "前のサイクルの記録が見つかりました！",
    notFoundMessage:
      "サイクル{{cycle}}にキー{{keyValues}}の記録が見つかりません",
    confirmFetchRecordInCycle: `サイクル{{cycle}}のキー{{keyValues}}の記録が完全には読み込まれていません。
サーバーからダウンロードしますか？`,
    confirmSyncRecordsSummaryAndTryAgain: `$t(dataEntry:recordInPreviousCycle.notFoundMessage)。
サーバーから記録一覧を取得して再試行しますか？`,
    fetchError: "前のサイクルの記録の取得エラー：{{details}}",
    multipleRecordsFound:
      "サイクル{{cycle}}にキー{{keyValues}}の複数の記録が見つかりました",
    valuePanelHeader: "サイクル{{prevCycle}}の値",
  },
  recordStatus: {
    new: "新規",
    updated: "更新済み",
    conflicting: "重複",
    withValidationErrors: "検証エラーあり",
  },
  sendData: "データを送信",
  showOnlyLocalRecords: "ローカル記録のみ表示",
  syncedOn: "同期日時",
  syncStatusHeader: "状態",
  syncStatus: {
    conflictingKeys: "同じキーの記録がすでに存在します",
    keysNotSpecified: `キーが指定されていません`,
    new: "新規（まだアップロードされていません）",
    notModified: "変更なし（アップロードする変更がありません）",
    modifiedLocally: "ローカルで変更済み",
    modifiedRemotely: "リモートサーバーで変更済み",
    notInEntryStepAnymore:
      "入力段階ではなくなりました（修正または分析ステップ）",
  },
  uploadingData: {
    title: "データをアップロード中",
  },
  validationReport: {
    title: "検証レポート",
    noErrorsFound: "エラーは見つかりませんでした！",
  },

  viewModeLabel: "表示モード",
  viewMode: {
    form: "フォーム",
    oneNode: "1項目ずつ",
  },

  code: {
    selectItem: "項目を選択",
    selectItem_plural: "項目を選択",
  },
  coordinate: {
    accuracy: "精度 (m)",
    altitude: "高度 (m)",
    altitudeAccuracy: "高度の精度 (m)",
    angleToTargetLocation: "目標への角度",
    confirmConvertCoordinate:
      "座標をSRS {{srsFrom}}からSRS {{srsTo}}に変換しますか？",
    convert: "変換",
    currentLocation: "現在地",
    distance: "距離 (m)",
    getLocation: "位置を取得",
    heading: "方位 (度)",
    keepXAndY: "XとYを保持",
    magnetometerNotAvailable: "方位センサーが利用できません！",
    navigateToTarget: "目標に向かってナビゲート",
    srs: "$t(common:srs)",
    useCurrentLocation: "現在地を使用",
    x: "X",
    y: "Y",
  },
  geo: {
    drawPolygon: "多角形を描く",
    editPolygon: "多角形を編集",
    selectPolygonInstruction: "多角形をタップして選択",
    editPolygonInstructions: `頂点または中間点をタップして選択し、次に:
- 長押ししてドラッグすると頂点を移動できます。  
- '$t(dataEntry:geo.deleteSelectedPoint)' を押すと削除できます。`,
    tapToAddPoints: `地図をタップして点を追加します。  
完了したら '$t(dataEntry:geo.stopAddingPoints)' を押してください。`,
    deleteSelectedPoint: "選択した点を削除",
    addCurrentLocationPoint: "現在地を追加",
    addCurrentLocationPointInstructions:
      "現在地を多角形に追加するには '$t(dataEntry:geo.addCurrentLocationPoint)' を押してください",
  },
  taxon: {
    search: "分類群を検索",
    taxonNotSelected: "--- 分類群が選択されていません ---",
  },
  fileAttribute: {
    selectAudio: "音声を選択",
    selectFile: "ファイルを選択",
    selectPicture: "写真を選択",
    selectVideo: "動画を選択",
    deleteConfirmMessage: "既存のファイルを削除しますか？",
  },
  fileAttributeAudio: {
    error: {
      startingRecording: "音声録音の開始エラー：{{error}}",
      pausingRecording: "音声録音の一時停止エラー：{{error}}",
      resumingRecording: "音声録音の再開エラー：{{error}}",
      savingRecording: "音声録音の保存エラー",
      stoppingRecording: "音声録音の停止エラー：{{error}}",
    },
  },
  fileAttributeImage: {
    imagePreview: "画像プレビュー",
    pictureResizedToSize: `画像を{{size}}にリサイズしました。
最大サイズ：{{maxSizeMB}}MB。
設定を確認するか、調査管理者にこの制限の変更を依頼してください。`,
    resolution: "解像度",
    rotate: "回転",
    rotationError: "画像の回転エラー：{{error}}",
  },
  location: {
    label: "位置",
    gettingCurrentLocation: "現在地を取得中",
    usingCurrentLocation: "現在地を使用中",
  },
  unlock: {
    label: "ロック解除",
    confirmMessage: "記録の編集がロックされています。ロックを解除しますか？",
    confirmTitle: "編集がロックされています",
  },
};
