import {NodeDefs} from '@openforis/arena-core';
import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

const AddIcon = <Icon name="plus" />;

export const useIsTable = () => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  return useMemo(
    () =>
      NodeDefs.getLayoutRenderTypePerCycle({
        nodeDef: parentEntityNodeDef,
        cycle,
      }) === 'table',
    [parentEntityNodeDef, cycle],
  );
};

const NewItemButton = ({visible, styleTheme, customContainerStyle}) => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const handleCreateNewNodeEntity = useCallback(() => {
    dispatch(
      formActions.createEntity({
        nodeDef: parentEntityNodeDef,
        node: parentEntityNode,
      }),
    );
  }, [dispatch, parentEntityNodeDef, parentEntityNode]);

  const keys = useSelector(state =>
    surveySelectors.getEntityNodeKeysAsString(state, parentEntityNode),
  );

  const isTable = useIsTable();

  if (visible && keys.length > 0) {
    return (
      <Button
        type={styleTheme || 'secondary'}
        icon={AddIcon}
        label={t(isTable ? 'Form:add_new_row' : 'Form:add_new_item')}
        customContainerStyle={[
          styles.buttonContainer,
          styles.addItem,
          customContainerStyle,
        ]}
        customTextStyle={styles.button}
        onPress={handleCreateNewNodeEntity}
        allowMultipleLines={true}
      />
    );
  }
  return <></>;
};

export default NewItemButton;
