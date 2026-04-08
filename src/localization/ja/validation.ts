export default {
  appErrors: {
    generic: "予期しないエラー：{{text}}",
  },
  record: {
    ancestorNotFound: "記録に上位階層データが見つかりません",
    keyDuplicate: "記録キーの重複",
    oneOrMoreInvalidValues: "1つ以上の値が無効です",
    uniqueAttributeDuplicate: "値の重複",

    attribute: {
      customValidation: "無効な値",
      uniqueDuplicate: "値の重複",
      valueInvalid: "無効な値",
      valueRequired: "必須の値",
    },
    entity: {
      keyDuplicate: "項目の重複",
      keyValueNotSpecified:
        "「{{keyDefName}}」の識別値が入力されていません",
    },
    nodes: {
      count: {
        invalid: "正確に{{count}}件の項目が必要です",
        maxExceeded: "最大{{maxCount}}件の項目までです",
        minNotReached: "最低{{minCount}}件の項目が必要です",
      },
    },
  },
};
