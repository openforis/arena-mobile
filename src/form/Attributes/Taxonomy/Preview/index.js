import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import ChevronDown from 'form/Attributes/common/SearchableForm/ChevronDown';
import {selectors as formSelectors} from 'state/form';
import {useSelectNodeAndNodeDef} from 'state/form/hooks/useNodeFormActions';
import {selectors as surveySelectors} from 'state/survey';

import {Preview as BasePreview} from '../../common/Base';
import {useTaxonItemLabelExtractor} from '../hooks';

import styles from './styles';

const Taxonomy = ({node, nodeDef}) => {
  const items = useSelector(state =>
    surveySelectors.getTaxonomyItemsByTaxonomyUuid(
      state,
      nodeDef?.props?.taxonomyUuid,
    ),
  );
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const {t} = useTranslation();

  const _labelStractor = useTaxonItemLabelExtractor(nodeDef);
  const itemsArray = useMemo(() => Object.values(items), [items]);

  const handleSelectNodeAndNodeDef = useSelectNodeAndNodeDef({
    node,
    nodeDef,
  });

  const selectedItem = useMemo(
    () => itemsArray.find(item => item.uuid === node?.value?.taxonUuid),
    [itemsArray, node],
  );

  return (
    <Button
      onPress={handleSelectNodeAndNodeDef}
      type="secondary"
      iconPosition="right"
      label={
        selectedItem ? _labelStractor(selectedItem) : t('Form:select_empty')
      }
      icon={ChevronDown}
      customContainerStyle={[styles.container]}
      customTextStyle={[styles.text, selectedItem ? styles.selected : {}]}
      disabled={!applicable}
    />
  );
};

const Preview = ({nodeDef}) => {
  return <BasePreview nodeDef={nodeDef} NodeValueRender={Taxonomy} />;
};

export default Preview;
