import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import {selectors as surveySelectors} from 'state/survey';

import Label from '../Label';
import Validation from '../Validation';

import styles from './styles';

export const Header = ({nodeDef, nodes, showValidation, showDescription}) => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);

  return (
    <View style={styles.container}>
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
          <TextBase type="secondary">
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
