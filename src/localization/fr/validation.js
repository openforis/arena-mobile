export default {
  appErrors: {
    generic: "Erreur inattendue : {{text}}",
  },
  record: {
    ancestorNotFound: "Nœud ancêtre introuvable dans l'enregistrement",
    keyDuplicate: "Clé d'enregistrement dupliquée",
    oneOrMoreInvalidValues: "Une ou plusieurs valeurs sont invalides",
    uniqueAttributeDuplicate: "Valeur dupliquée",
    attribute: {
      customValidation: "Valeur invalide",
      uniqueDuplicate: "Valeur dupliquée",
      valueInvalid: "Valeur invalide",
      valueRequired: "Valeur requise",
    },
    entity: {
      keyDuplicate: "Clé d'entité dupliquée",
      keyValueNotSpecified:
        "Valeur de clé pour l'attribut {{keyDefName}} non spécifiée",
    },
    nodes: {
      count: {
        invalid: "Doit contenir exactement {{count}} élément(s)",
        maxExceeded: "Doit contenir au maximum {{maxCount}} élément(s)",
        minNotReached: "Doit contenir au moins {{minCount}} élément(s)",
      },
    },
  },
};
