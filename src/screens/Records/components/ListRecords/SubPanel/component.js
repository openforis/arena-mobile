import React, {useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {useSelector} from 'react-redux';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as recordSelectors} from 'state/records';

import CreateNewRecord from '../../../components/CreateNewRecord';

import CheckRemoteRecordsButton from './CheckRemoteRecordsButton';
import CheckRemoteStatusBar from './CheckRemoteStatusBar';
import FiltersAndSorters from './FiltersAndSorters';
import _styles from './styles';
import UploadDataButton from './UploadDataButton';

// TODO add more actions to the CreateNewRecord button ... like a modal with options to create a new record
const SubPanel = () => {
  const styles = useThemedStyles(_styles);

  const isReady = useSelector(recordSelectors.isRecordsRemoteSummaryReady);
  const loading = useSelector(recordSelectors.getIsGettingRemoteRecordsSummary);
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <>
      {!loading && <CheckRemoteStatusBar />}

      <View style={styles.buttonsContainer}>
        <View style={styles.createNewRecordContainer}>
          <CreateNewRecord />
        </View>
        {loading && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator
              size="large"
              color={styles.colors.primaryText}
              style={styles.spinner}
            />
          </View>
        )}
        {!loading && (
          <>{isReady ? <UploadDataButton /> : <CheckRemoteRecordsButton />}</>
        )}
      </View>
    </>
  );
};

export default SubPanel;
