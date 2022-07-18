import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import Select from 'arena-mobile-ui/components/Select';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {uuidv4} from 'infra/uuid';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import styles, {pickerSelectStyles} from './styles';

const Header = () => {
  const {t} = useTranslation();
  const [key, setKey] = useState(uuidv4());

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

  const siblingNodesInhierarchy = useSelector(state =>
    formSelectors.getNodeDefNodesWithKeysAsStringInHierarchy(
      state,
      parentEntityNodeDef,
    ),
  );
  const parentLabel = useNodeDefNameOrLabel({nodeDef: parentEntityNodeDef});

  useEffect(() => {
    setKey(uuidv4());
  }, [siblingNodesInhierarchy]);

  const dispatch = useDispatch();

  const handleCreateNewNodeEntity = useCallback(() => {
    dispatch(
      formActions.createEntity({
        nodeDef: parentEntityNodeDef,
        node: parentEntityNode,
      }),
    );
  }, [dispatch, parentEntityNodeDef, parentEntityNode]);

  const handleDeleteNode = useCallback(() => {
    dispatch(formActions.deleteNodeEntity({node: parentEntityNode}));
  }, [dispatch, parentEntityNode]);

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

  if (!parentEntityNodeDef.props.multiple) {
    return <></>;
  }

  return (
    <>
      <View style={styles.header}>
        <Button
          type="secondary"
          icon={<Icon name="plus" />}
          label={t('Form:add_new', {label: parentLabel})}
          customContainerStyle={[styles.buttonContainer, styles.addItem]}
          customTextStyle={{fontWeight: 'normal'}}
          onPress={handleCreateNewNodeEntity}
        />
        <View style={{flex: 1}}>
          <Select
            key={key}
            items={siblingNodesInhierarchy}
            customStyle={pickerSelectStyles}
            onValueChange={handleSelectEntityNode}
            selectedItemKey={parentEntityNode.uuid}
            labelStractor={item => `${parentLabel}: ${item.keyString}`}
          />
        </View>

        <Button
          type="secondary"
          icon={<Icon name="trash-can-outline" />}
          customContainerStyle={styles.buttonContainer}
          onPress={handleDeleteNode}
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
