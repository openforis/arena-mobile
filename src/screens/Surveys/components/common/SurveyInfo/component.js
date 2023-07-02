import React from 'react';
import {View} from 'react-native';

import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import styles from './styles';

const SurveyInfo = ({survey}) => {
  return (
    <View style={styles.container}>
      <TextBase type="bold" size="l">
        {survey.props?.labels?.[survey?.props?.languages?.[0]]}
      </TextBase>
      <TextBase type="secondary" size="s">
        {survey?.props?.name}
      </TextBase>

      <CreatedAndModified
        dateCreated={survey?.dateCreated}
        dateModified={survey?.dateModified}
      />
    </View>
  );
};

export default SurveyInfo;
