export default {
  appErrors: {
    generic: "Odottamaton virhe: {{text}}",
  },
  record: {
    ancestorNotFound: "Edeltävää (avain)solmua ei löydy tietueesta",
    keyDuplicate: "Päällekkäinen tietueen avain",
    oneOrMoreInvalidValues: "Yksi tai useampi arvo on virheellinen",
    uniqueAttributeDuplicate: "Päällekkäinen arvo",

    attribute: {
      customValidation: "Virheellinen arvo",
      uniqueDuplicate: "Päällekkäinen arvo",
      valueInvalid: "Virheellinen arvo",
      valueRequired: "Pakollinen arvo",
    },
    entity: {
      keyDuplicate: "Päällekkäinen entiteetin avain",
      keyValueNotSpecified:
        "Syöttökentän {{keyDefName}} avainarvoa ei ole määritetty",
    },
    nodes: {
      count: {
        invalid: "Lukumäärä on oltava täsmälleen {{count}}",
        maxExceeded: "Oltava enintään {{maxCount}} kohde(tta)",
        minNotReached: "Oltava vähintään {{minCount}} kohde(tta)",
      },
    },
  },
};
