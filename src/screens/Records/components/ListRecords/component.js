import React, {useCallback, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';

import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import CurrentItemLabel from 'arena-mobile-ui/components/CurrentItemLabel';
import List from 'arena-mobile-ui/components/List';
import Loading from 'arena-mobile-ui/components/List/Loading';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as formActions} from 'state/form';
import formSelectors from 'state/form/selectors';
import {actions as recordsActions} from 'state/records';
import {useRecordsUuidsSorted, useRecordsSummary} from 'state/records/hooks';
import recordsSelectors from 'state/records/selectors';

import Empty from './Empty';
import Error from './Error';
import _styles from './styles';
import SubPanel from './SubPanel';

const ListEmptyComponent = ({loading, error}) => {
  const dispatch = useDispatch();
  const handleInitializeRecord = useCallback(() => {
    dispatch(formActions.initializeRecord());
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return <Empty onPress={handleInitializeRecord} />;
};

const ProgressBar = () => {
  return null;
};

const RecordCard = ({record, recordUuid, isSelected, onSelect}) => {
  const styles = useThemedStyles(_styles);
  const currentRecordUuid = useSelector(formSelectors.getRecordUuid);

  const isRecordsRemoteSummaryReady = useSelector(
    recordsSelectors.isRecordsRemoteSummaryReady,
  );

  const recordRemoteSummary = useSelector(state =>
    recordsSelectors.getRemoteRecordSummary(state, recordUuid),
  );

  const handlePress = useCallback(() => {
    onSelect?.(record);
  }, [record, onSelect]);

  const {t} = useTranslation();

  const status = useMemo(() => {
    if (!recordRemoteSummary) {
      return t('Records:status_not_in_server'); // upload
    }

    if (recordRemoteSummary?.dateModified > record?.dateModified) {
      return t('Records:status_modified_download'); // download
    }

    if (recordRemoteSummary?.dateModified < record?.dateModified) {
      return t('Records:status_modified_upload'); // upload
    }

    return t('Records:status_synced');
  }, [recordRemoteSummary, record, t]);

  return (
    <TouchableCard
      onPress={handlePress}
      customStyles={[styles.container, isSelected ? styles.selected : {}]}>
      <View style={[styles.payload]}>
        <TextBase type="bold">
          {record.recordKey || t('Records:empty_key')}
        </TextBase>
        <CreatedAndModified
          dateCreated={record?.dateCreated}
          dateModified={record?.dateModified}
        />
      </View>
      {currentRecordUuid === recordUuid && (
        <CurrentItemLabel label={t('Records:current_record')} />
      )}
      {isRecordsRemoteSummaryReady && status && (
        <TextBase type="bold" style={styles.status}>
          {status}
        </TextBase>
      )}
      <ProgressBar />
    </TouchableCard>
  );
};

const ListRecords = ({selectedRecordUuid, setSelectedRecord}) => {
  const keyExtractor = useCallback(item => item, []);
  const dispatch = useDispatch();

  const recordsSummary = useRecordsSummary();
  const recordUuids = useRecordsUuidsSorted(recordsSummary);

  useEffect(() => {
    return () => {
      dispatch(recordsActions.cleanRemoteRecordsSummary());
    };
  }, [dispatch]);

  const renderItem = useCallback(
    ({item: recordUuid}) => (
      <RecordCard
        isSelected={selectedRecordUuid === recordUuid}
        recordUuid={recordUuid}
        onSelect={setSelectedRecord}
        record={recordsSummary?.[recordUuid] || {}}
      />
    ),
    [recordsSummary, selectedRecordUuid, setSelectedRecord],
  );

  if (recordUuids.length <= 0) {
    return <ListEmptyComponent />;
  }

  return (
    <>
      <List
        data={recordUuids}
        ListEmptyComponent={ListEmptyComponent}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />

      {recordUuids.length > 0 && <SubPanel />}
    </>
  );
};

export default ListRecords;
