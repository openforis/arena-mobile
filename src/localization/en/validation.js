export default {
  appErrors: {
    generic: "Unexpected error: {{text}}",
  },
  record: {
    ancestorNotFound: "Ancestor node not found in record",
    keyDuplicate: "Duplicate record key",
    oneOrMoreInvalidValues: "One or more values are invalid",
    uniqueAttributeDuplicate: "Duplicate value",

    attribute: {
      customValidation: "Invalid value",
      uniqueDuplicate: "Duplicate value",
      valueInvalid: "Invalid value",
      valueRequired: "Required value",
    },
    entity: {
      keyDuplicate: "Duplicate entity key",
      keyValueNotSpecified:
        "Key value for attribute {{keyDefName}} not specified",
    },
    nodes: {
      count: {
        invalid: "Must be exactly {{count}} item(s)",
        maxExceeded: "Must have max {{maxCount}} item(s)",
        minNotReached: "Must have at least {{minCount}} item(s)",
      },
    },
  },
};
