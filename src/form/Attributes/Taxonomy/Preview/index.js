import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import ChevronDown from 'form/Attributes/Code/Form/common/components/ChevronDown';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import {Preview as BasePreview} from '../../common/Base';

import styles from './styles';

const getTaxonItemLabel = ({item}) =>
  `(${item.props.code}) ${item.props.genus}`;

const Taxonomy = ({node, nodeDef}) => {
  const items = useSelector(state =>
    surveySelectors.getTaxonomyItemsByTaxonomyUuid(
      state,
      nodeDef?.props?.taxonomyUuid,
    ),
  );
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const {t} = useTranslation();
  const dispatch = useDispatch();
  const _labelStractor = useCallback(
    item => getTaxonItemLabel({item, language}),
    [language],
  );
  const itemsArray = useMemo(() => Object.values(items), [items]);

  const handleSelectNodeAndNodeDef = useCallback(() => {
    dispatch(formActions.setNode({node: node}));
  }, [dispatch, node]);

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
