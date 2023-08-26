import React from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import DropDownButton from 'arena-mobile-ui/components/Button/DropDownButton';
import {selectors as formSelectors} from 'state/form';
import {useSelectNodeAndNodeDef} from 'state/form/hooks/useNodeFormActions';

import {Preview as BasePreview} from '../../common/Base';
import {useTaxonItemLabelExtractor, useTaxonItemsWithSelected} from '../hooks';

const Taxonomy = ({node, nodeDef}) => {
  const {selectedItem} = useTaxonItemsWithSelected({node, nodeDef});

  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const {t} = useTranslation();

  const _labelExtractor = useTaxonItemLabelExtractor(nodeDef);

  const handleSelectNodeAndNodeDef = useSelectNodeAndNodeDef({
    node,
    nodeDef,
  });

  return (
    <DropDownButton
      onPress={handleSelectNodeAndNodeDef}
      label={
        selectedItem ? _labelExtractor(selectedItem) : t('Form:select_empty')
      }
      selected={selectedItem}
      disabled={!applicable}
    />
  );
};

const Preview = ({nodeDef}) => {
  return <BasePreview nodeDef={nodeDef} NodeValueRender={Taxonomy} />;
};

export default Preview;
