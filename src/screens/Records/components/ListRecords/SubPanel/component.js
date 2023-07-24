import React from 'react';
import {View} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import CreateNewRecord from '../../../components/CreateNewRecord';

import _styles from './styles';
import SyncRecordsButton from './SyncRecordsButton';

const SubPanel = ({}) => {
  const styles = useThemedStyles(_styles);

  return (
    <View style={styles.buttonsContainer}>
      <View style={styles.createNewRecordContainer}>
        <CreateNewRecord />
      </View>
      <SyncRecordsButton />
    </View>
  );
};

export default SubPanel;
