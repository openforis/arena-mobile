import React, {useEffect} from 'react';
import {View} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import CreateNewRecord from '../../../components/CreateNewRecord';

import FiltersAndSorters from './FiltersAndSorters';
import ServerConnectionBar from './ServerConnectionBar';
import _styles from './styles';
import SyncRecordsButton from './SyncRecordsButton';

const SubPanel = ({surveysOrigin, errorRemoteServer}) => {
  const styles = useThemedStyles(_styles);

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <>
      <ServerConnectionBar
        errorRemoteServer={errorRemoteServer}
        info={surveysOrigin !== 'remote'}
      />

      <View style={styles.buttonsContainer}>
        <View style={styles.createNewRecordContainer}>
          <CreateNewRecord />
        </View>
        <SyncRecordsButton />
        <FiltersAndSorters />
      </View>
    </>
  );
};

export default SubPanel;
