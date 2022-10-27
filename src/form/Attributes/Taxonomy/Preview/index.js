import React, {useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';

import Select from 'arena-mobile-ui/components/Select';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import {selectors as surveySelectors} from 'state/survey';

import {Preview as BasePreview} from '../../common/Base';

import styles from './styles';

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

  const _labelStractor = useCallback(
    item => getTaxonItemLabel({item, language}),
    [language],
  );
  const itemsArray = useMemo(() => Object.values(items), [items]);

  return (
    <Select
      key={node?.value?.taxonUuid}
      items={itemsArray}
      labelStractor={_labelStractor}
      onValueChange={handleSelect}
      selectedItemKey={node?.value?.taxonUuid}
      customStyles={styles.selectStyles}
    />
  );
};

const Preview = ({nodeDef}) => {
  return <BasePreview nodeDef={nodeDef} NodeValueRender={Taxonomy} />;
};

export default Preview;
