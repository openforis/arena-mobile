import React from 'react';
import {View} from 'react-native';

import Sorter from '../../../components/Sorter';

import ServerConnectionBar from './ServerConnectionBar';
import styles from './styles';
import SurveysOriginSelector from './SurveysOriginSelector';

const SubPanel = ({
  surveysOrigin,
  setSurveysOrigin,
  setSortCriteriaIndex,
  sortCriteriaIndex,
  errorRemoteServer,
}) => {
  return (
    <>
      {surveysOrigin === 'remote' && (
        <ServerConnectionBar errorRemoteServer={errorRemoteServer} />
      )}
      <View style={styles.buttonsContainer}>
        <SurveysOriginSelector
          surveysOrigin={surveysOrigin}
          setSurveysOrigin={setSurveysOrigin}
        />
        <Sorter
          setSortCriteriaIndex={setSortCriteriaIndex}
          sortCriteriaIndex={sortCriteriaIndex}
        />
      </View>
    </>
  );
};

export default SubPanel;
