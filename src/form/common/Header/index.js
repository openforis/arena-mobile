import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {EMPTY_OBJECT} from 'infra/stateUtils';
import {selectors as surveySelectors} from 'state/survey';

import Label from '../Label';
import Validation from '../Validation';

import _styles from './styles';

export const Header = ({
  nodeDef,
  nodes,
  showValidation,
  showDescription,
  disabled,
}) => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const styles = useThemedStyles(_styles);

  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      styles.container,
      disabled ? styles.disabled : EMPTY_OBJECT,
    );
  }, [disabled, styles]);

  return (
    <View style={containerStyle}>
      <View style={styles.textsContainer}>
        <View style={styles.titleAndValidationContainer}>
          <Label nodeDef={nodeDef} />

          <Validation
            nodeDef={nodeDef}
            nodes={nodes}
            showValidation={showValidation}
          />
        </View>
        {showDescription && nodeDef?.props?.descriptions?.[language] && (
          <TextBase type="secondaryLight">
            {nodeDef.props.descriptions[language]}
          </TextBase>
        )}
      </View>
    </View>
  );
};

Header.defaultProps = {
  showValidation: true,
  showDescription: false,
};
export default React.memo(
  Header,

  (prevProps, nextProps) => {
    return (
      prevProps.nodeDef.uuid === nextProps.nodeDef.uuid &&
      prevProps.nodes.map(node => node.uuid) ===
        nextProps.nodes.map(node => node.uuid)
    );
  },
);
