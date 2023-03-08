import {NodeDefs} from '@openforis/arena-core';
import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import Select from 'arena-mobile-ui/components/Select';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {alert} from 'arena-mobile-ui/utils';
import {uuidv4} from 'infra/uuid';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import styles, {pickerSelectStyles, pickerSelectStylesNeutral} from './styles';

const TrashIcon = <Icon name="trash-can-outline" />;

export const EntityNodeSelector = ({theme = null} = {}) => {
  const [key, setKey] = useState(uuidv4());

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

  const siblingNodesInhierarchy = useSelector(state =>
    formSelectors.getNodeDefNodesWithKeysAsStringInHierarchy(
      state,
      parentEntityNodeDef,
    ),
  );

  useEffect(() => {
    setKey(uuidv4());
  }, [siblingNodesInhierarchy]);

  const dispatch = useDispatch();

  const handleSelectEntityNode = useCallback(
    node => {
      if (node) {
        dispatch(
          formActions.selectEntityNode({
            node,
          }),
        );
      } else {
        setKey(uuidv4());
      }
    },
    [dispatch],
  );

  const _labelStractor = useCallback(item => item?.keyString || '-', []);

  if (!parentEntityNodeDef.props.multiple) {
    return <></>;
  }

  return (
    <View style={styles.selectContainer}>
      <Select
        key={key}
        items={siblingNodesInhierarchy}
        customStyles={
          theme === 'neutral' ? pickerSelectStylesNeutral : pickerSelectStyles
        }
        onValueChange={handleSelectEntityNode}
        selectedItemKey={parentEntityNode.uuid}
        labelStractor={_labelStractor}
      />
    </View>
  );
};

const Header = () => {
  const {t} = useTranslation();

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const parentEntityKeyString = useSelector(state =>
    formSelectors.getEntityKey(state, parentEntityNode),
  );

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

  const handleDeleteEntityNode = useCallback(() => {
    alert({
      title: t('Form:deleteNode.alert.title'),
      message: t('Form:deleteNode.alert.message', {
        name: `${parentLabel} [${parentEntityKeyString}]`,
      }),
      acceptText: t('Form:deleteNode.alert.accept'),
      dismissText: t('Form:deleteNode.alert.dismiss'),
      onAccept: () => {
        dispatch(formActions.deleteNodeEntity({node: parentEntityNode}));
      },
      onDismiss: () => null,
    });
  }, [dispatch, parentEntityKeyString, parentLabel, parentEntityNode, t]);

  if (!parentEntityNodeDef.props.multiple) {
    return <></>;
  }

  return (
    <>
      <View style={styles.header}>
        <Button
          type="secondary"
          icon={TrashIcon}
          customContainerStyle={styles.buttonContainer}
          onPress={handleDeleteEntityNode}
        />
      </View>
    </>
  );
};

const MultipleEntityManager = () => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  if (!parentEntityNodeDef.props.multiple) {
    return <></>;
  }

  return <Header />;
};

export default MultipleEntityManager;
