import React, {useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {useSelector} from 'react-redux';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as recordSelectors} from 'state/records';

import CreateNewRecord from '../../../components/CreateNewRecord';

import CheckRemoteRecordsButton from './CheckRemoteRecordsButton';
// import FiltersAndSorters from './FiltersAndSorters';
import _styles from './styles';
import UploadDataButton from './UploadDataButton';
import ShareDataButton from './ShareDataButton';

// TODO add more actions to the CreateNewRecord button ... like a modal with options to create a new record
const SubPanel = () => {
  const styles = useThemedStyles(_styles);

  const isReady = useSelector(recordSelectors.isRemoteRecordsSummaryReady);
  const loading = useSelector(recordSelectors.getIsGettingRemoteRecordsSummary);
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <>
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
          <View style={styles.bottomButtonsContainer}>
            {isReady ? <UploadDataButton /> : <CheckRemoteRecordsButton />}
            <ShareDataButton/>
          </View>
              
        
        )}
      </View>
    </>
  );
};

export default SubPanel;
