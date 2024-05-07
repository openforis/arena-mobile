import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Icon from 'arena-mobile-ui/components/Icon';
import Pressable from 'arena-mobile-ui/components/Pressable';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {BreadCrumbAsLabel} from 'screens/Form/components/BreadCrumbs/components/BreadCrumb';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as nodesSelectors} from 'state/nodes';
import {selectors as surveySelectors} from 'state/survey';
import {selectors as validationSelectors} from 'state/validation';

import _styles from './styles';

const ValidationItem = ({field, itemPosition}) => {
  const {t} = useTranslation();

  const styles = useThemedStyles(_styles);

  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);

  const node = useSelector(state =>
    nodesSelectors.getNodeByUuid(
      state,
      field[0].includes('childrenCount') ? field[0].split('_')[1] : field[0],
    ),
  );

  const nodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, node?.nodeDefUuid),
  );

  const parentNode = useSelector(state =>
    nodesSelectors.getNodeByUuid(state, node?.parentUuid),
  );

  const nodeDefName = useNodeDefNameOrLabel({
    nodeDef: nodeDef,
  });

  const ancestors = useSelector(state =>
    formSelectors.getAncestorsOfNode(state, node?.uuid),
  );

  const dispatch = useDispatch();

  const handleSelect = useCallback(() => {
    /* Dispatch both and close the panel */
    dispatch(formActions.toggleEntitySelector());
    dispatch(
      formActions.setParentEntityNode({
        node: parentNode,
      }),
    );
    dispatch(formActions.setNode({node: node}));
  }, [parentNode, node, dispatch]);

  const ancestorsUuids = useMemo(() => {
    return ancestors.map(ancestor => ancestor.uuid);
  }, [ancestors]);

  const labels = useMemo(() => {
    return ancestors.map((ancestor, index) => {
      const isLatest = index === ancestors.length - 1;
      return (
        <TextBase key={ancestor.uuid}>
          {index === 0 && <TextBase bolder>{itemPosition + 1}. </TextBase>}

          {index !== 0 && <BreadCrumbAsLabel nodeUuid={ancestor.uuid} />}
          {index === 0 || isLatest ? '' : ' > '}
        </TextBase>
      );
    });
  }, [ancestors, itemPosition]);

  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      styles.validationItemContainer,
      StyleSheet.compose(
        field[1]?.fields?.value?.errors?.some(
          ({severity}) => severity === 'warning',
        ) && styles.validationItemContainerWarning,
        field[1]?.fields?.value?.errors?.some(
          ({severity}) => severity === 'error',
        ) && styles.validationItemContainerError,
      ),
    );
  }, [styles, field]);

  return (
    <>
      <Pressable onPress={handleSelect} style={containerStyle}>
        <View style={styles.textContainer}>
          <View style={styles.pathContainer}>{labels}</View>

          {field[1]?.fields?.value?.errors?.map(error => {
            return (
              <TextBase
                customStyle={styles.validationText}
                key={`${error?.key}-${ancestorsUuids.join(',')}`}
                type="secondaryLight">
                {error?.messages?.[language] ||
                  t(`Validation:${error?.key}`, {
                    nodeDefName: nodeDefName,
                    count: error?.params?.count,
                    maxCount: error?.params?.maxCount,
                    minCount: error?.params?.minCount,
                  })}
              </TextBase>
            );
          })}
        </View>

        <Icon name="chevron-right" customStyle={styles.validationIcon} />
      </Pressable>

      <ValidationItems
        fields={Object.entries(field[1].fields).filter(
          fieldEntry => fieldEntry[0] !== 'value',
        )}
      />
    </>
  );
};
const ValidationItems = ({fields}) => {
  if (fields.length === 0) {
    return <></>;
  }

  return (
    <>
      {fields.map((field, itemPosition) => (
        <ValidationItem
          key={field[0]}
          field={field}
          itemPosition={itemPosition}
        />
      ))}
    </>
  );
};

const ListOfErrors = () => {
  const styles = useThemedStyles(_styles);
  const validation = useSelector(validationSelectors.getValidation);

  return (
    <View style={styles.validationContainer}>
      <ValidationItems fields={Object.entries(validation?.fields)} />
    </View>
  );
};

export default ListOfErrors;
