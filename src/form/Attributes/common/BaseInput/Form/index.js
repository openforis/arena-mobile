import {NodeDefType} from '@openforis/arena-core';
import React, {useState, useCallback} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Input from 'arena-mobile-ui/components/Input';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import AttributeHeader from 'form/common/Header';
import {actions as formActions} from 'state/form';
import formSelectors from 'state/form/selectors';
import {actions as nodesActions} from 'state/nodes';

import styles from './styles';

// text default
// float numeric  ios: decimal-pad
// integer numeric, ios: number-pad
const Form = ({nodeDef, keyboardType = 'default'}) => {
  const [newValue, setValue] = useState(null);
  const node = useSelector(formSelectors.getNode);
  const dispatch = useDispatch();

  const handleSubmit = useCallback(
    ({callback = null} = {}) => {
      dispatch(
        nodesActions.updateNode({
          updatedNode: {
            ...node,
            value:
              nodeDef.type === NodeDefType.text
                ? newValue
                : Number(newValue.replace(',', '.')),
          },
          callback,
        }),
      );
    },
    [nodeDef, node, newValue, dispatch],
  );

  const handleSubmitAndClose = useCallback(() => {
    handleSubmit({callback: handleClose});
  }, [handleSubmit, handleClose]);

  const handleClose = useCallback(() => {
    dispatch(formActions.setNode({node: false}));
  }, [dispatch]);

  return (
    <View>
      <View style={styles.closeHeader}>
        <TouchableIcon
          iconName="close"
          customStyle={styles.closeIcon}
          onPress={handleClose}
        />
      </View>
      <AttributeHeader nodeDef={nodeDef} showValidation={false} />
      <Input
        onChangeText={setValue}
        defaultValue={node?.value}
        autoFocus={true}
        keyboardType={keyboardType}
        textAlign={nodeDef.type === NodeDefType.text ? 'left' : 'right'}
      />

      <View style={styles.divider} />
      <View>
        <Button label="save" onPress={handleSubmit} />
        <Button label="save and close" onPress={handleSubmitAndClose} />
      </View>
    </View>
  );
};

export default Form;
