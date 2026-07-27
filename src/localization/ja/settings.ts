export default {
  title: "設定",
  animationsEnabled: "アニメーションを有効にする",
  connectionToServer: "サーバーへの接続",
  fontScale: "フォントの大きさ：{{value}}",
  keepScreenAwake: "画面を常に表示",
  fullScreen: "全画面表示",
  imageSizeLimit: "画像サイズの上限：{{value}}MB",
  imageSizeUnlimited: {
    label: "画像サイズは無制限",
    description:
      "画像は、調査様式設計で上限が設定されていない限り、デバイスが提供する最大解像度で保存されます",
  },
  language: {
    label: "アプリケーション言語",
  },
  locationAccuracyThreshold: "位置精度の基準値（メートル）",
  locationAccuracyWatchTimeout:
    "位置精度の監視タイムアウト：{{value}}秒",
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

  showStatusBar: "ステータスバーを表示",
  theme: {
    label: "テーマ",
    auto: "自動",
    dark: "ダーク",
    dark2: "ダーク2",
    light: "ライト",
    light2: "ライト2",
  },
};
