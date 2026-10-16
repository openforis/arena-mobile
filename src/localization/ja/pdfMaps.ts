export default {
  title: "PDFマップ",
  description:
    "このデバイスに保存されている地理空間(ジオリファレンス済み)PDFファイルからマップをインポートします。インターネットに接続していなくても、アプリのすべての地図でベースマップの上に表示されます。",
  rendererNotAvailable:
    "このバージョンのアプリはPDFマップに対応していません。最新バージョンに更新してください",
  importPdf: "PDFをインポート",
  noMaps: "インポートされたPDFマップはまだありません",
  storage: {
    used: "PDFマップの使用容量:",
  },
  opacity: "不透明度: {{value}}%",
  hideBaseMap: "PDFのみ",
  map: {
    fileName: "ファイル: {{fileName}}",
    page: "ページ: {{page}}",
    zoomLevels: "ズームレベル: {{minZoom}} - {{maxZoom}}",
    tiles: "タイル: {{count}}",
    size: "サイズ: {{size}}(PDFファイル: {{sourceSize}})",
    datumWarning:
      "マップの測地系がWGS84ではありません。マップが数メートルずれる可能性があります",
    visible: "地図に表示",
    deleteConfirm: "PDFマップ「{{name}}」を削除しますか?",
    notFound: "PDFマップが見つかりません",
    viewerTitle: "PDFマップ",
  },
  import: {
    title: "PDFマップをインポート",
    analyzing: "PDFファイルのジオリファレンスを読み込んでいます...",
    errorReading: "PDFファイルの読み込み中にエラーが発生しました: {{details}}",
    notGeoreferenced:
      "PDFファイルはジオリファレンスされていません。マップの地理座標が含まれていません",
    unsupportedGeoreference:
      "このPDFファイルのジオリファレンス(OGC GeoPDF形式)にはまだ対応していません",
    page: "ページ",
    pageItem: "ページ {{page}}",
    name: "名前",
    maxZoom: "最大ズーム: {{value}}",
    nativeZoom: "(PDFの解像度: {{value}})",
    maxZoomAboveNative: "PDFの解像度を超えるズームレベルはぼやけて表示されます",
    estimate: "{{tiles}} タイル · 約{{size}}(空き容量: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} タイル: 多すぎます(最大 {{maxTiles}})。最大ズームを下げてください",
    tooManyTiles:
      "タイルが多すぎます。生成できるのは最大 {{maxTiles}} タイルです。最大ズームを下げてください",
    notEnoughSpace: "デバイスの空き容量が不足しています",
    lowSpaceConfirm: {
      title: "空き容量が少なくなっています",
      message:
        "マップは約{{size}}を使用します。これはデバイスの空き容量({{freeSpace}})の{{percent}}%です。続行しますか?",
    },
    preview: {
      rendering: "プレビューを作成しています...",
      lowResolution:
        "低解像度のプレビュー(ズームレベル {{minZoom}} - {{maxZoom}})",
      error: "プレビューを表示できません: {{details}}",
    },
    importButton: "インポート",
    jobTitle: "PDFマップをインポートしています",
    complete: "PDFマップをインポートしました({{size}})",
    error: "PDFマップのインポート中にエラーが発生しました: {{details}}",
  },
  validation: {
    nameRequired: "名前は必須です",
    nameDuplicate: "この名前は別のPDFマップで使用されています",
  },
};
