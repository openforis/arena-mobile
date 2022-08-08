import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import Select from 'arena-mobile-ui/components/Select';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import {selectors as surveySelectors} from 'state/survey';

import {Preview as BasePreview} from '../../common/Base';

const getTaxonItemLabel = ({item}) =>
  `(${item.props.code}) ${item.props.genus}`;

const Taxonomy = ({node, nodeDef}) => {
  const actions = useNodeFormActions({nodeDef});

  const items = useSelector(state =>
    surveySelectors.getTaxonomyItemsByTaxonomyUuid(
      state,
      nodeDef?.props?.taxonomyUuid,
    ),
  );
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);

  const handleSelect = useCallback(
    item => {
      let newValue = {taxonUuid: item?.uuid};
      if (node?.uuid) {
        actions.handleUpdate({node, value: newValue});
      } else {
        actions.handleCreate({value: newValue});
      }
    },
    [actions, node],
  );

  return (
    <Select
      key={node?.value?.taxonUuid}
      items={Object.values(items)}
      labelStractor={item => getTaxonItemLabel({item, language})}
      onValueChange={handleSelect}
      selectedItemKey={node?.value?.taxonUuid}
      customStyles={{marginHorizontal: 0}}
    />
  );
};

const Preview = ({nodeDef}) => {
  return <BasePreview nodeDef={nodeDef} NodeValueRender={Taxonomy} />;
};

export default Preview;
