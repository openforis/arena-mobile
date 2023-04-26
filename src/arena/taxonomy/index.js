const props = {
  uuid: 'uuid',
  code: 'code',
  scientificName: 'scientificName',
  vernacularNames: 'vernacularNames',
  genus: 'genus',
  family: 'family',
};

export const DEFAULT_TAXONOMY_FIELDS = 'code.scientificName';

export const taxonomyVisibleFieldsOptions = {
  ['scientificName']: [props.scientificName],
  ['code.scientificName']: [props.code, props.scientificName],
  ['scientificName.vernacularNames']: [
    props.scientificName,
    props.vernacularNames,
  ],
  ['code.scientificName.vernacularNames']: [
    props.code,
    props.scientificName,
    props.vernacularNames,
  ],
};

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
  taxonomyVisibleFields = taxonomyVisibleFieldsOptions[DEFAULT_TAXONOMY_FIELDS],
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
