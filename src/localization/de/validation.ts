export default {
  appErrors: {
    generic: "Unerwarteter Fehler: {{text}}",
  },
  record: {
    ancestorNotFound: "Übergeordneter Knoten im Datensatz nicht gefunden",
    keyDuplicate: "Doppelter Datensatzschlüssel",
    oneOrMoreInvalidValues: "Ein oder mehrere Werte sind ungültig",
    uniqueAttributeDuplicate: "Doppelter Wert",

    attribute: {
      customValidation: "Ungültiger Wert",
      uniqueDuplicate: "Doppelter Wert",
      valueInvalid: "Ungültiger Wert",
      valueRequired: "Erforderlicher Wert",
    },
    entity: {
      keyDuplicate: "Doppelter Entitätsschlüssel",
      keyValueNotSpecified:
        "Schlüsselwert für Attribut {{keyDefName}} nicht angegeben",
    },
    nodes: {
      count: {
        invalid: "Muss genau {{count}} Element(e) sein",
        maxExceeded: "Darf maximal {{maxCount}} Element(e) haben",
        minNotReached: "Muss mindestens {{minCount}} Element(e) haben",
      },
    },
  },
};
