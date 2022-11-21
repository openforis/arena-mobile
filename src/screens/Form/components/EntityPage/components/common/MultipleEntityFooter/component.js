import {NodeDefs} from '@openforis/arena-core';
import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

const AddIcon = <Icon name="plus" />;

const Footer = () => {
  const {t} = useTranslation();

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

  const parentLabel = useNodeDefNameOrLabel({nodeDef: parentEntityNodeDef});

  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const isTable = useMemo(
    () =>
      NodeDefs.getLayoutRenderTypePerCycle({
        nodeDef: parentEntityNodeDef,
        cycle,
      }) === 'table',
    [parentEntityNodeDef, cycle],
  );

  const dispatch = useDispatch();

  const handleCreateNewNodeEntity = useCallback(() => {
    dispatch(
      formActions.createEntity({
        nodeDef: parentEntityNodeDef,
        node: parentEntityNode,
      }),
    );
  }, [dispatch, parentEntityNodeDef, parentEntityNode]);

  if (!parentEntityNodeDef.props.multiple) {
    return <></>;
  }

  if (!isTable) {
    return <></>;
  }

  return (
    <>
      <View style={styles.footer}>
        <Button
          type="secondary"
          icon={AddIcon}
          label={t('Form:add_new', {label: parentLabel})}
          customContainerStyle={[styles.buttonContainer, styles.addItem]}
          customTextStyle={styles.textStyle}
          onPress={handleCreateNewNodeEntity}
        />
      </View>
    </>
  );
};

const MultipleEntityFooter = () => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  if (!parentEntityNodeDef.props.multiple) {
    return <></>;
  }

  return <Footer />;
};

export default MultipleEntityFooter;
