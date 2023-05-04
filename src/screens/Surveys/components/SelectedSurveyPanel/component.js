import React from 'react';
import {View} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import LocalPanel from './components/LocalPanel';
import RemotePanel from './components/RemotePanel';
import SurveySelected from './components/SurveySelected';
import _styles from './styles';

const SelectedSurveyPanel = ({survey, unSelect, surveysOrigin}) => {
  const styles = useThemedStyles({styles: _styles});
  return (
    <>
      <View style={[styles.overlay]} pointerEvents="none" />
      <View style={[styles.container]}>
        <SurveySelected survey={survey} unSelect={unSelect} />
        {surveysOrigin === 'local' ? (
          <LocalPanel survey={survey} unSelect={unSelect} />
        ) : (
          <RemotePanel survey={survey} unSelect={unSelect} />
        )}
      </View>
    </>
  );
};

export default SelectedSurveyPanel;
