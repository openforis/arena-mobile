export default {
  title: "インポートしたマップ",
  description:
    "このデバイスに保存されている地理空間(ジオリファレンス済み)PDFまたはGeoTIFFファイルからマップをインポートします。インターネットに接続していなくても、アプリのすべての地図でベースマップの上に表示されます。",
  rendererNotAvailable:
    "このバージョンのアプリはインポートしたマップに対応していません。最新バージョンに更新してください",
  importMap: "マップをインポート",
  supportedFormats:
    "対応ファイル：地理空間PDF（.pdf）およびGeoTIFF（.tif、.tiff）",
  noMaps: "インポートされたマップはまだありません",
  storage: {
    used: "インポートしたマップの使用容量:",
  },
  opacity: "不透明度: {{value}}%",
  hideBaseMap: "インポートしたマップのみ",
  map: {
    fileName: "ファイル: {{fileName}}",
    page: "ページ: {{page}}",
    zoomLevels: "ズームレベル: {{minZoom}} - {{maxZoom}}",
    tiles: "タイル: {{count}}",
    size: "サイズ: {{size}}(PDFファイル: {{sourceSize}})",
    sizeTilesOnly: "サイズ: {{size}}",
    datumWarning:
      "マップの測地系がWGS84ではありません。マップが数メートルずれる可能性があります",
    visible: "地図に表示",
    deleteConfirm: "マップ「{{name}}」を削除しますか?",
    notFound: "マップが見つかりません",
    viewerTitle: "インポートしたマップ",
  },
  import: {
    title: "マップをインポート",
    analyzing: "ファイルのジオリファレンスを読み込んでいます...",
    errorReading: "ファイルの読み込み中にエラーが発生しました: {{details}}",
    notGeoreferenced:
      "ファイルはジオリファレンスされていません。マップの地理座標が含まれていません",
    unsupportedGeoreference:
      "このPDFファイルのジオリファレンス(OGC GeoPDF形式)にはまだ対応していません",
    unsupportedFile: "このファイルはPDFでもGeoTIFFでもありません",
    unsupportedGeoTiffFormat:
      "このGeoTIFFファイルの画像には対応していません({{details}})。インポートできるのは、サンプルあたり8ビットの画像(RGB、RGBA、グレースケール、またはカラーパレット付き)のみです",
    page: "ページ",
    pageItem: "ページ {{page}}",
    name: "名前",
    maxZoom: "最大ズーム: {{value}}",
    nativeZoom: "(マップの解像度: {{value}})",
    maxZoomAboveNative:
      "マップの解像度を超えるズームレベルはぼやけて表示されます",
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
    jobTitle: "マップをインポートしています",
    complete: "マップをインポートしました({{size}})",
    error: "マップのインポート中にエラーが発生しました: {{details}}",
  },
  validation: {
    nameRequired: "名前は必須です",
    nameDuplicate: "この名前は別のインポートしたマップで使用されています",
  },
};
