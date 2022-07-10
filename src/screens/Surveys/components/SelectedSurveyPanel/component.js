import React from 'react';
import {View} from 'react-native';

import LocalPanel from './components/LocalPanel';
import RemotePanel from './components/RemotePanel';
import SurveySelected from './components/SurveySelected';
import styles from './styles';

const SelectedSurveyPanel = ({survey, unSelect, surveysOrigin}) => {
  return (
    <View style={[styles.container]}>
      <SurveySelected survey={survey} unSelect={unSelect} />
      {surveysOrigin === 'local' ? (
        <LocalPanel survey={survey} unSelect={unSelect} />
      ) : (
        <RemotePanel survey={survey} unSelect={unSelect} />
      )}
    </View>
  );
};

export default SelectedSurveyPanel;
