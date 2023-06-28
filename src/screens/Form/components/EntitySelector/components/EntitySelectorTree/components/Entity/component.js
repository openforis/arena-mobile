import {NodeDefs} from '@openforis/arena-core';
import React, {useMemo, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Pressable from 'arena-mobile-ui/components/Pressable';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import _styles from './styles';

const Entity = ({nodeDef, isCurrentEntity = false}) => {
  const styles = useThemedStyles(_styles);
  const {t} = useTranslation();
  const nodeDefName = useNodeDefNameOrLabel({nodeDef});
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const dispatch = useDispatch();

  const hierarchyNodeDefUuids = useSelector(
    formSelectors.getHierarchyNodeDefUuids,
  );

  const handleSelect = useCallback(() => {
    dispatch(
      formActions.selectEntity({
        nodeDef,
      }),
    );
  }, [nodeDef, dispatch]);

  const isDisabled = useMemo(
    () =>
      nodeDef.parentUuid && !hierarchyNodeDefUuids.includes(nodeDef.parentUuid),
    [nodeDef, hierarchyNodeDefUuids],
  );
  const styleContainer = useMemo(() => {
    return StyleSheet.compose(
      styles.container,
      isCurrentEntity ? styles.activeContainer : {},
    );
  }, [isCurrentEntity, styles]);

  const textStyle = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(styles.text, isDisabled ? styles.textDisabled : {}),
      isCurrentEntity ? styles.active : {},
    );
  }, [isDisabled, isCurrentEntity, styles]);
  const label = useMemo(() => {
    return `${nodeDefName} ${
      NodeDefs.getLayoutRenderType(cycle)(nodeDef) === 'table'
        ? t('Form:nodeDefEntity.layout.table')
        : ''
    }`;
  }, [nodeDefName, cycle, nodeDef, t]);

  return (
    <Pressable
      style={styleContainer}
      disabled={isDisabled}
      onPress={handleSelect}
      hitSlop={10}>
      <TextBase customStyle={textStyle}>{label}</TextBase>
    </Pressable>
  );
};

export default Entity;
