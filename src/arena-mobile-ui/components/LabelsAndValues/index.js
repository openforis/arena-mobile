import React, {useMemo} from 'react';
import {View} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

export const Label = ({label, size, bolder}) => {
  return (
    <TextBase type={bolder ? 'bolder' : 'bold'} size={size} numberOfLines={1}>
      {label}
    </TextBase>
  );
};

Label.defaultProps = {
  size: 's',
  bolder: false,
};

export const Value = ({label, size, bolder, color}) => {
  const styles = useThemedStyles(_styles);
  return (
    <TextBase
      type={bolder ? 'bolder' : 'bold'}
      size={size}
      customStyle={[color ? styles.color[color] : {}]}
      numberOfLines={1}>
      {label}
    </TextBase>
  );
};

Value.defaultProps = {
  color: null,
  size: 's',
  bolder: false,
};

const Labels = ({items, size, expanded}) => {
  const styles = useThemedStyles(_styles);
  const renderLabels = useMemo(() => {
    return items.map(({label, bolder}) => (
      <Label key={label} label={label} size={size} bolder={bolder} />
    ));
  }, [items, size]);

  const containerStyles = useMemo(() => {
    return styles.labels({expanded});
  }, [expanded, styles]);

  return <View style={containerStyles}>{renderLabels}</View>;
};

Labels.defaultProps = {
  items: [],
  size: 's',
  expanded: false,
};

const Values = ({items, size, expanded}) => {
  const styles = useThemedStyles(_styles);
  const renderValues = useMemo(() => {
    return items.map(({label, value = '-', bolder, color}) => (
      <Value
        key={label}
        label={value}
        size={size}
        bolder={bolder}
        color={color}
      />
    ));
  }, [items, size]);

  const containerStyles = useMemo(() => {
    return styles.values({expanded});
  }, [expanded, styles]);

  return <View style={containerStyles}>{renderValues}</View>;
};

Values.defaultProps = {
  items: [],
  size: 's',
  expanded: false,
};

const LabelsAndValues = ({items, size, expanded, column}) => {
  const styles = useThemedStyles(_styles);
  return (
    <View style={styles.container}>
      <Labels items={items} size={size} expanded={expanded} />
      {!column && <Values items={items} size={size} expanded={expanded} />}
    </View>
  );
};

LabelsAndValues.defaultProps = {
  items: [],
  size: 's',
  expanded: false,
  column: false,
};

export default LabelsAndValues;
