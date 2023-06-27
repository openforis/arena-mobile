import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';

import Icon from 'arena-mobile-ui/components/Icon';
import Pressable from 'arena-mobile-ui/components/Pressable';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import styles from './styles';

const ItemLabel = React.memo(
  ({label, selected}) => {
    const style = useMemo(() => {
      return StyleSheet.compose(selected ? styles.selectedItem : {});
    }, [selected]);
    return <TextBase customStyle={style}>{label}</TextBase>;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.label === nextProps.label &&
      prevProps.selected === nextProps.selected
    );
  },
);

const _Icon = React.memo(({name}) => {
  return <Icon name={name} size="s" />;
});

const ListItem = ({label, handlePress, selected, icon}) => {
  const style = useMemo(() => {
    return StyleSheet.compose(
      styles.card,
      selected ? styles.selectedItem : null,
    );
  }, [selected]);

  return (
    <Pressable onPress={handlePress} style={style}>
      <_Icon name={icon} />

      <ItemLabel label={label} selected={selected} />
    </Pressable>
  );
};

export default ListItem;
