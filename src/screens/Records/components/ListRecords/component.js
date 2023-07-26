import React, {useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import List from 'arena-mobile-ui/components/List';
import Loading from 'arena-mobile-ui/components/List/Loading';
import {actions as formActions} from 'state/form';
import {actions as recordsActions} from 'state/records';
import {useRecordsUuidsSorted, useRecordsSummary} from 'state/records/hooks';

import Empty from './Empty';
import Error from './Error';
import RecordCard from './RecordCard';
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
