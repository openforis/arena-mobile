import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Icon from 'arena-mobile-ui/components/Icon';
import Pressable from 'arena-mobile-ui/components/Pressable';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import {selectors as formSelectors} from 'state/form';
import {useUpdateNode} from 'state/form/hooks/useNodeFormActions';

import {Preview as BasePreview} from '../../common/Base';

import styles, {booleanOptionStyles} from './styles';

const hitSlop = {top: 20, bottom: 20, left: 20, right: 20};

const TrueIcon = () => {
  return (
    <Icon
      name={'radiobox-marked'}
      size="s"
      color={colors.primaryContrastText}
    />
  );
};

const FalseIcon = () => {
  return <Icon name={'radiobox-blank'} size="s" color={colors.secondary} />;
};

const BooleanOption = ({value, active, onPress, nodeDef}) => {
  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );
  const {t} = useTranslation();

  const componentStyles = useMemo(
    () => booleanOptionStyles({active}),
    [active],
  );

  const pressableContent = useMemo(() => {
    return (
      <>
        {active ? <TrueIcon /> : <FalseIcon />}
        <TextBase>
          {t(
            `Form:nodeDefBoolean.labelValue.${
              nodeDef?.props.labelValue || 'trueFalse'
            }.${value}`,
          )}
        </TextBase>
      </>
    );
  }, [active, value, nodeDef, t]);

  const handlePress = useCallback(
    event => {
      onPress(value)(event);
    },
    [onPress, value],
  );

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={hitSlop}
      disabled={disabled}
      style={componentStyles.touchableContainer}>
      {pressableContent}
    </Pressable>
  );
};

BooleanOption.defaultProps = {
  onPress: () => {},
  active: false,
};

export const BooleanAttribute = React.memo(
  ({node, nodeDef}) => {
    const updateNode = useUpdateNode();

    const handlePress = useCallback(
      value => event => {
        event.stopPropagation();
        event.preventDefault();

        updateNode({node, value: String(value)});
      },
      [updateNode, node],
    );

    return (
      <View style={styles.container}>
        <BooleanOption
          active={node.value === String(true)}
          onPress={handlePress}
          nodeDef={nodeDef}
          value={true}
        />
        <BooleanOption
          active={node.value === String(false)}
          onPress={handlePress}
          nodeDef={nodeDef}
          value={false}
        />
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.node.uuid === nextProps.node.uuid &&
      String(prevProps.node?.value) === String(nextProps.node?.value) &&
      prevProps.nodeDef.uuid === nextProps.nodeDef.uuid
    );
  },
);

const Preview = ({nodeDef}) => {
  return <BasePreview nodeDef={nodeDef} NodeValueRender={BooleanAttribute} />;
};

export default React.memo(
  Preview,

  (prevProps, nextProps) => {
    return prevProps.nodeDef.uuid === nextProps.nodeDef.uuid;
  },
);
