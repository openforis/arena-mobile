import {t} from 'i18next';
import React, {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import List from 'arena-mobile-ui/components/List';
import Loading from 'arena-mobile-ui/components/List/Loading';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as formActions} from 'state/form';
import {
  actions as recordsActions,
  selectors as recordSelectors,
} from 'state/records';
import {useRecordsUuidsSorted, useRecordsSummary} from 'state/records/hooks';

import CheckRemoteStatusBar from './CheckRemoteStatusBar';
import Empty from './Empty';
import Error from './Error';
import RecordCard from './RecordCard';
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

const FooterComponent = () => {
  const styles = useThemedStyles(_styles);

  const {t} = useTranslation();
  return (
    <View style={styles.footer}>
      <TextBase type="secondary" size="xs">
        {t('Records:pull_to_refresh')}
      </TextBase>
    </View>
  );
};
const keyExtractor = item => item;

const ListRecords = ({selectedRecordUuid, setSelectedRecord}) => {
  const dispatch = useDispatch();

  const recordsSummary = useRecordsSummary();
  const recordUuids = useRecordsUuidsSorted(recordsSummary);

  const handleGetRemoteRecordsSummary = useCallback(() => {
    dispatch(recordsActions.getRemoteRecordsSummary());
  }, [dispatch]);

  useEffect(() => {
    //dispatch(recordsActions.getRemoteRecordsSummary());
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

  const loading = useSelector(recordSelectors.getIsGettingRemoteRecordsSummary);
  if (recordUuids?.length === 0) {
    return <ListEmptyComponent />;
  }

  return (
    <>
      {!loading && <CheckRemoteStatusBar />}
      <List
        data={recordUuids}
        ListEmptyComponent={ListEmptyComponent}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onRefresh={handleGetRemoteRecordsSummary}
        refreshing={false}
        ListFooterComponent={FooterComponent}
      />

      {recordUuids?.length > 0 && <SubPanel />}
    </>
  );
};

export default ListRecords;
