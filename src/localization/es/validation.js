export default {
  appErrors: {
    generic: "Error inesperado: {{text}}",
  },
  record: {
    ancestorNotFound: "Nodo ancestro no encontrado en el registro",
    keyDuplicate: "Clave de registro duplicada",
    oneOrMoreInvalidValues: "Uno o más valores son inválidos",
    uniqueAttributeDuplicate: "Valor duplicado",
    attribute: {
      customValidation: "Valor inválido",
      uniqueDuplicate: "Valor duplicado",
      valueInvalid: "Valor inválido",
      valueRequired: "Valor requerido",
    },
    entity: {
      keyDuplicate: "Clave de entidad duplicada",
      keyValueNotSpecified:
        "Valor de clave para el atributo {{keyDefName}} no especificado",
    },
    nodes: {
      count: {
        invalid: "Debe tener exactamente {{count}} elemento(s)",
        maxExceeded: "Debe tener como máximo {{maxCount}} elemento(s)",
        minNotReached: "Debe tener al menos {{minCount}} elemento(s)",
      },
    },
  },
};
