export default {
  title: "設定",
  group: {
    appearance: "外観",
    dataEntry: "データ入力",
    location: "位置情報とGPS",
    images: "画像",
  },
  animationsEnabled: {
    label: "アニメーションを有効にする",
    description:
      "アプリ全体の画面遷移やインターフェースのアニメーションを有効にします。動作が遅い端末ではパフォーマンス向上のため無効にしてください",
  },
  connectionToServer: "サーバーへの接続",
  fontScale: {
    label: "フォントの大きさ：{{value}}",
    description: "アプリ全体で使用する文字の大きさを調整します",
  },
  keepScreenAwake: {
    label: "画面を常に表示",
    description: "アプリを開いている間、画面が自動的に消灯しないようにします",
  },
  fullScreen: {
    label: "全画面表示",
    description:
      "データ入力のためにシステムのステータスバーとナビゲーションバーを非表示にし、画面全体を使用します",
  },
  imageSizeLimit: {
    label: "画像サイズの上限：{{value}}MB",
    description:
      "調査票で特定の項目により小さい上限が設定されていない限り、画像が保存前に縮小される最大サイズです",
  },
  imageSizeUnlimited: {
    label: "画像サイズは無制限",
    description:
      "画像は、調査様式設計で上限が設定されていない限り、デバイスが提供する最大解像度で保存されます",
  },
  language: {
    label: "アプリケーション言語",
    description: "アプリのインターフェースで使用する言語を設定します",
  },
  locationAccuracyThreshold: {
    label: "位置精度の基準値（メートル）",
    description:
      "座標項目の位置情報を採用するために必要な、最低限のGPS精度（メートル単位）です",
  },
  locationAccuracyWatchTimeout: {
    label: "位置精度の監視タイムアウト：{{value}}秒",
    description:
      "精度基準を満たす位置情報が得られるまで待機する最大時間です。これを過ぎると取得を諦めます",
  },
  locationAveragingEnabled: {
    label: "位置の平均化を有効にする",
    description:
      "有効にすると、記録された位置は複数の位置読み取りの平均になり、精度が向上します",
  },
  locationGpsLocked: {
    label: "GPSロック",
    description: `警告：バッテリーの消費が増加します！
アプリケーションの実行中はGPS信号がロックされます。
座標属性のより高い精度を得るのに役立ちます。`,
    error:
      "GPSロックを開始できません：位置情報サービスが利用できないか、位置情報へのアクセスが許可されていません",
  },
  gpsDevicePairing: {
    title: "GPSデバイスをペアリング",
    scanButton: "デバイスをスキャン",
    scanningLabel: "近くのデバイスをスキャン中…",
    scanAgainButton: "再スキャン",
    emptyResult:
      "デバイスが見つかりませんでした。GPS受信機の電源が入っており、ペアリングモードになっていることを確認してください。",
    scanFailed: "スキャン中に問題が発生しました。もう一度お試しください。",
    recognizedDevicesNotice: "GPS受信機として認識されたデバイスのみが表示されます。",
    pairedDevicesTitle: "ペアリング済みデバイス",
    newDevicesTitle: "新しいデバイス",
    pairButton: "ペアリング",
    pairing: "ペアリング中…",
    pairingSucceeded: "{{name}}とペアリングしました",
    pairingFailed: "{{name}}とのペアリングに失敗しました",
    bluetoothDisabled: "Bluetoothがオフになっています。",
    enableBluetoothButton: "Bluetoothを有効にする",
    permissionDenied: "デバイスをスキャンするにはBluetoothの権限が必要です。",
    openSettingsButton: "アプリの設定を開く",
  },
  preferredGpsSourceId: {
    label: "GPSソース",
    description:
      "座標の記録に使用するGPSを選択してください：スマートフォンの内蔵GPS、またはペアリングされた外部GPS受信機（例：Bad Elf）。",
    auto: "自動（利用可能な場合は外部）",
    internal: "内蔵GPS",
    pairNewDevice: "新しいデバイスをペアリング…",
  },

  showRecordCompletion: {
    label: "レコードの入力進捗を表示",
    description: "現在のレコードの要件のうち満たされている割合を示す進捗バーを表示します",
  },
  showStatusBar: {
    label: "ステータスバーを表示",
    description: "記録の編集中にバッテリー、ストレージ、ネットワークの状態を表示します",
  },
  theme: {
    label: "テーマ",
    description: "アプリのインターフェースで使用する配色テーマを設定します",
    auto: "自動",
    dark: "ダーク",
    dark2: "ダーク2",
    light: "ライト",
    light2: "ライト2",
  },
};
