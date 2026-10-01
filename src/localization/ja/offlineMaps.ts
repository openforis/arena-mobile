export default {
  title: "オフラインマップ",
  description:
    "現場に行く前に対象エリアの地図をダウンロードしてください。地理属性の描画や表示の際に、インターネット接続がなくても利用できます。",
  freeLayersNotInUse:
    "オフラインマップは、設定の地図プロバイダーが「Free map layers」の場合にのみ使用されます。",
  useFreeLayers: "無料の地図レイヤーを使用",
  offlineMode: "オフライン",
  addArea: "エリアを追加",
  deleteAll: "すべて削除",
  deleteAllConfirm:
    "すべてのオフラインマップエリアと、このデバイスに保存されているすべての地図タイルを削除しますか?",
  clearCache: "地図キャッシュを消去",
  clearCacheConfirm:
    "このデバイスに保存されているすべての地図タイル(地図の閲覧中にキャッシュされたタイル)を削除しますか?",
  noAreas: "ダウンロード済みのオフラインマップエリアはまだありません",
  storage: {
    used: "地図タイルの使用容量(ダウンロード済みエリアとキャッシュ):",
    free: "デバイスの空き容量:",
  },
  layers: {
    esriWorldImagery: "衛星写真 (Esri World Imagery)",
    openTopoMap: "地形図 (OpenTopoMap)",
    openStreetMap: "標準 (OpenStreetMap、オンラインのみ)",
  },
  area: {
    surface: "面積: {{area}}",
    layer: "レイヤー: {{layer}}",
    zoomLevels: "ズームレベル: {{minZoom}} - {{maxZoom}}",
    tiles: "タイル: {{downloaded}} / {{total}}",
    size: "サイズ: {{size}}",
    lastUpdate: "最終更新: {{date}}",
    missingTiles: "不足タイル: {{count}}",
    resumeDownload: "不足分をダウンロード",
    deleteConfirm: "オフラインマップエリア「{{name}}」を削除しますか?",
  },
  areaEditor: {
    title: "新しいオフラインマップエリア",
    name: "名前",
    layer: "レイヤー",
    maxZoom: "最大ズーム: {{value}}",
    currentZoom: "現在のズーム: {{value}}",
    surface: "面積: {{area}}",
    drawAreaToEstimate:
      "地図上に対象エリアを描画すると、必要な容量が表示されます",
    estimate: "{{tiles}} タイル · 約{{size}} (空き容量: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} タイル: 多すぎます (最大 {{maxTiles}})。エリアまたは最大ズームを小さくしてください",
    tooManyTiles:
      "エリアが大きすぎます。ダウンロードできるのは最大 {{maxTiles}} タイルです。エリアまたは最大ズームを小さくしてください",
    notEnoughSpace: "デバイスの空き容量が不足しています",
  },
  areaViewer: {
    title: "オフラインマップエリア",
    notFound: "オフラインマップエリアが見つかりません",
  },
  download: {
    label: "ダウンロード",
    title: "地図タイルをダウンロード中",
    complete: "オフラインマップエリアをダウンロードしました ({{size}})",
    completeWithMissingTiles:
      "オフラインマップエリアをダウンロードしました ({{size}})。{{missingTiles}} タイルはダウンロードできませんでした",
    error:
      "オフラインマップエリアのダウンロード中にエラーが発生しました: {{details}}",
  },
};
