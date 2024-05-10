import React, {useMemo} from 'react';

import {View, StyleSheet} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import _styles from './styles';

const _extractInitials = surveyLabel =>
  String(surveyLabel)
    .toUpperCase()
    .replace(/[^a-zA-Z ]/g, '')
    .split(/\s+/)
    .slice(0, 3)
    .map(part => part[0])
    .join('');

const Band = ({backgroundColor, color, text, position = 'bottom'}) => {
  const styles = useThemedStyles(_styles);

  return (
    <View
      style={{
        position: 'absolute',
        backgroundColor,
        ...(position === 'top'
          ? {
              top: 0,
              borderTopRightRadius: 8,
              borderTopLeftRadius: 8,
            }
          : {bottom: 0, borderBottomRightRadius: 8, borderBottomLeftRadius: 8}),
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
      }}>
      <TextBase type="secondary" size="xs">
        {text}
      </TextBase>
    </View>
  );
};

const SHOW_BANDS = false;

const VisualDescription = ({surveyLabel, visualDescription}) => {
  const styles = useThemedStyles(_styles);

  const _visualDescription = useMemo(() => {
    return {
      initialsBox: StyleSheet.compose(styles.initialsBox, {
        ...(visualDescription?.backgroundColor
          ? {backgroundColor: visualDescription.backgroundColor}
          : {}),
        ...(visualDescription?.color ? {color: visualDescription.color} : {}),
      }),
      text: visualDescription?.text || _extractInitials(surveyLabel),
    };
  }, [visualDescription, styles]);

  return (
    <View style={styles.initialsContainer}>
      <View style={_visualDescription.initialsBox}>
        <TextBase type="secondary" customStyle={styles.initialsText}>
          {_visualDescription.text}
        </TextBase>
        {SHOW_BANDS && (
          <Band backgroundColor="green" text="Training" position="bottom" />
        )}
        {SHOW_BANDS && (
          <Band backgroundColor="yellow" text="Training" position="top" />
        )}
      </View>
    </View>
  );
};

export default VisualDescription;
