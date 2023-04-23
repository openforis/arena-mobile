const props = {
  uuid: 'uuid',
  code: 'code',
  scientificName: 'scientificName',
  vernacularNames: 'vernacularNames',
  genus: 'genus',
  family: 'family',
};

export const taxonomyVisibleFieldsOptions = [
  {
    key: `${props.code}.${props.genus}.${props.family}.${props.scientificName}`,
    value: [props.code, props.genus, props.family, props.scientificName],
    label: '(Code), Genus, Family, ScientificName',
  },
  {
    key: `${props.code}.${props.genus}.${props.family}.${props.scientificName}.${props.vernacularNames}`,
    value: [
      props.code,
      props.genus,
      props.family,
      props.scientificName,
      props.vernacularNames,
    ],
    label: '(Code), Genus, Family, ScientificNames, VernacularNames',
  },
  {
    key: `${props.genus}.${props.scientificName}`,
    value: [props.genus, props.scientificName],
    label: 'Genus, ScientificName',
  },
  {
    key: `${props.code}.${props.scientificName}`,
    value: [props.code, props.scientificName],
    label: '(Code), scientificName',
  },
  {
    key: `${props.scientificName}`,
    value: [props.scientificName],
    label: 'ScientificName',
  },
  {
    key: `${props.code}.${props.scientificName}.${props.vernacularNames}`,
    value: [props.code, props.scientificName, props.vernacularNames],
    label: '(Code), ScientificName, vernacularNames',
  },
  {
    key: `${props.scientificName}.${props.vernacularNames}`,
    value: [props.scientificName, props.vernacularNames],
    label: 'ScientificName, vernacularNames',
  },
];

export const exampleTaxon = {
  id: '239',
  uuid: '7c0e4ed6-af1d-44d7-bf84-1ce1e484df59',
  taxonomyUuid: '98e57a17-4550-4528-8292-3cb829ca0520',
  vernacularNames: {
    eng: [
      {
        uuid: '0dca606f-35a4-4757-8977-1435813bad03',
        props: {
          lang: 'eng',
          name: 'vernacularName-1',
        },
      },
      {
        uuid: '0dca606f-35a4-4757-8977-1435813bad03',
        props: {
          lang: 'eng',
          name: 'vernacularName-2',
        },
      },
    ],
    esp: [
      {
        uuid: '0dca606f-35a4-4757-8977-1435813bad03',
        props: {
          lang: 'esp',
          name: 'vernacularName-3',
        },
      },
    ],
  },
  published: true,
  draft: false,
  props: {
    code: 'BOU',
    extra: {
      wood_density: '0.7',
    },
    genus: 'Bourreria',
    family: 'Famlily',
    scientificName: 'Bourreria sp.',
    index: 2,
  },
};

export const getTaxonItemLabel = ({
  item,
  taxonomyVisibleFields = taxonomyVisibleFieldsOptions[0].value,
}) => {
  const vernacularNamesObj = item?.vernacularNames || {};

  const vernacularNames = Object.values(vernacularNamesObj)
    .flat()
    .flatMap(vernacularName => vernacularName?.props?.name)
    .filter(value => !!value);

  return taxonomyVisibleFields
    ?.map(field => {
      if (field === props.vernacularNames) {
        if (!vernacularNames?.length) {
          return null;
        }
        return vernacularNames?.join(', ');
      }
      if (field === props.code) {
        return `(${item.props.code})`;
      }
      return item?.props?.[field];
    })
    .filter(value => !!value)
    .join(', ');
};
