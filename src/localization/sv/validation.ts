export default {
  appErrors: {
    generic: "Oväntat fel: {{text}}",
  },
  record: {
    ancestorNotFound: "Förfadersnod hittades inte i posten",
    keyDuplicate: "Duplicerad postnyckel",
    oneOrMoreInvalidValues: "Ett eller flera värden är ogiltiga",
    uniqueAttributeDuplicate: "Duplicerat värde",

    attribute: {
      customValidation: "Ogiltigt värde",
      uniqueDuplicate: "Duplicerat värde",
      valueInvalid: "Ogiltigt värde",
      valueRequired: "Värde krävs",
    },
    entity: {
      keyDuplicate: "Duplicerad entitetsnyckel",
      keyValueNotSpecified:
        "Nyckelvärde för attribut {{keyDefName}} inte angivet",
    },
    nodes: {
      count: {
        invalid: "Måste vara exakt {{count}} objekt",
        maxExceeded: "Får max vara {{maxCount}} objekt",
        minNotReached: "Måste ha minst {{minCount}} objekt",
      },
    },
  },
};
