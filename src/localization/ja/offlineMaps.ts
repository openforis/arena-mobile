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
  customLayers: {
    title: "カスタム地図レイヤー",
    description:
      "他のタイルプロバイダーの地図レイヤー(XYZラスタータイル)を追加します。プロバイダーが必要とする場合はAPIキーも指定できます。設定でデフォルトの地図レイヤーとして、または地図上のレイヤーボタンで選択できます。プロバイダーの利用規約で許可されていることを確認してください。",
    add: "レイヤーを追加",
    noLayers: "カスタム地図レイヤーはまだ定義されていません",
    maxZoom: "最大ズーム: {{value}}",
    deleteConfirm:
      "カスタム地図レイヤー「{{name}}」と、このデバイスに保存されているその地図タイルを削除しますか?",
    editor: {
      title: "カスタム地図レイヤー",
      name: "名前",
      url: "URLテンプレート",
      urlHint:
        "例: https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}\n{x}、{y}、{z} は必須です。{apiKey} はAPIキーに置き換えられます。",
      apiKey: "APIキー(任意)",
      apiKeyHint:
        "デバイスのセキュアストレージに保存され、タイルプロバイダーへのリクエストにのみ使用されます。",
      attribution: "帰属表示(任意)",
      attributionHint:
        "プロバイダーが求める著作権表示です。地図上に表示されます。",
      test: {
        label: "テスト",
        success: "地図タイルを正常にダウンロードしました",
        errorStatus:
          "タイルプロバイダーが地図タイルを返しませんでした(HTTPステータス: {{status}})。URLテンプレートとAPIキーを確認してください",
        errorNotReachable:
          "タイルプロバイダーに接続できません。URLテンプレートとインターネット接続を確認してください",
      },
    },
    validation: {
      nameRequired: "名前は必須です",
      nameDuplicate: "名前は別のレイヤーで既に使用されています",
      urlRequired: "URLテンプレートは必須です",
      urlNotHttps: "URLテンプレートは https:// で始まる必要があります",
      urlPlaceholdersMissing:
        "URLテンプレートには {x}、{y}、{z} のプレースホルダーが必要です",
      urlSubdomainNotSupported:
        "プレースホルダー {s} はサポートされていません。プロバイダーのサブドメインのいずれか(例: 'a')に置き換えてください",
      apiKeyRequired:
        "URLテンプレートに {apiKey} が含まれています。APIキーは必須です",
      apiKeyPlaceholderMissing:
        "APIキーを指定する位置に、プレースホルダー {apiKey} をURLテンプレートへ追加してください",
    },
  },
  mapTypes: {
    standard: "標準",
    satellite: "衛星写真",
    hybrid: "ハイブリッド",
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
    nameRequired: "名前は必須です",
    nameDuplicate: "この名前は別のエリアで既に使用されています",
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
    lowSpaceConfirm: {
      title: "空き容量が少なくなっています",
      message:
        "ダウンロードには約{{size}}が必要で、デバイスの空き容量（{{freeSpace}}）の{{percent}}%を使用します。続行しますか？",
    },
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
