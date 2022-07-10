import React, {useCallback, useMemo, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {uuidv4} from 'infra/uuid';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import styles, {pickerSelectStyles} from './styles';

const ChevRonIcon = () => <Icon name="chevron-down-outline" />;
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

  const items = useMemo(
    () =>
      siblingNodesInhierarchy.map(node => ({
        ...node,
        key: node.uuid,
        label: `${parentLabel}: ${node.keyString}`,
        name: node.keyString,
        value: node,
      })),

    [siblingNodesInhierarchy, parentLabel],
  );

  useEffect(() => {
    setKey(uuidv4());
  }, [items]);

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
          icon={<Icon name="add-outline" />}
          label={t('Form:add_new', {label: parentLabel})}
          customContainerStyle={styles.buttonContainer}
          customTextStyle={{fontWeight: 'normal'}}
          onPress={handleCreateNewNodeEntity}
        />
        <View style={{flex: 1}}>
          <RNPickerSelect
            key={key}
            style={{
              ...pickerSelectStyles,
            }}
            onValueChange={handleSelectEntityNode}
            items={items}
            itemKey={parentEntityNode.uuid}
            Icon={ChevRonIcon}
          />
        </View>

        <Button
          type="secondary"
          icon={<Icon name="trash-outline" />}
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
