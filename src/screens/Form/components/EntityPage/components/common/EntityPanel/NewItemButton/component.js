import {NodeDefs} from '@openforis/arena-core';
import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import _styles from './styles';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
const AddIcon = <Icon name="plus" />;

export const useIsTable = ({parentNodeDef} = {}) => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  return useMemo(
    () =>
      NodeDefs.getLayoutRenderType(cycle)(
        parentNodeDef || parentEntityNodeDef,
      ) === 'table',
    [parentNodeDef, parentEntityNodeDef, cycle],
  );
};

const NewItemButton = ({
  visible,
  styleTheme,
  customContainerStyle,
  parentNodeDef = false,
  parentNode = false,
  checkKeys = true,
  showNodeDefLabel = false,
}) => {
  const styles = useThemedStyles(_styles);
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const _parentEntityNodeDef = parentNodeDef || parentEntityNodeDef;
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const _parentEntityNode = parentNode || parentEntityNode;
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const handleCreateNewNodeEntity = useCallback(() => {
    dispatch(
      formActions.createEntity({
        nodeDef: _parentEntityNodeDef,
        node: _parentEntityNode,
      }),
    );
  }, [dispatch, _parentEntityNodeDef, _parentEntityNode]);

  const keys = useSelector(state =>
    surveySelectors.getEntityNodeKeysAsString(state, _parentEntityNode),
  );

  const isTable = useIsTable({parentNodeDef: _parentEntityNodeDef});
  const label = useNodeDefNameOrLabel({nodeDef: _parentEntityNodeDef});

  const isRecordLocked = useSelector(formSelectors.isRecordLocked);
  if (visible && (!checkKeys || keys.length > 0)) {
    return (
      <Button
        type={styleTheme || 'secondary'}
        icon={AddIcon}
        label={
          showNodeDefLabel
            ? t('Form:add_new', {label})
            : t(isTable ? 'Form:add_new_row' : 'Form:add_new_item')
        }
        customContainerStyle={[
          styles.buttonContainer,
          styles.addItem,
          customContainerStyle,
        ]}
        customTextStyle={styles.button}
        onPress={handleCreateNewNodeEntity}
        allowMultipleLines={true}
        disabled={isRecordLocked}
      />
    );
  }
};

export default NewItemButton;
