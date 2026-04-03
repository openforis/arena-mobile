export default {
  confirmOpenSettingsAccessMediaLocationNotAllowed: {
    title: "メディアへのアクセスが許可されていません",
    message: `メディアまたはメディアの位置情報へのアクセスが許可されていません。アプリケーションの設定を開き、「写真と動画」へのアクセス権限を許可してください
（このメッセージを表示したくない場合は「常にすべて許可」を選択してください）`,
  },
  errorRequestingPermission: "{{permission}}の要求エラー：{{details}}",
  permissionDenied: "権限 {{permission}} が拒否されました",
  permissionRequest: {
    title: "{{permission}} の権限",
    message: "$t(common:appTitle) には {{permission}} の権限が必要です",
  },
  types: {
    accessMediaLocation: "メディアの位置情報へのアクセス",
    camera: "カメラへのアクセス",
    mediaLibrary: "メディアライブラリ",
    microphone: "マイクへのアクセス",
  },
};
