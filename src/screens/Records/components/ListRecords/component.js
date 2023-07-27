import React, {useCallback} from 'react';
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
import {useRecordsUuidsSorted, useRecordsSummary} from 'state/records/hooks';

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

const RecordCard = ({record, recordUuid, isSelected, onSelect}) => {
  const styles = useThemedStyles(_styles);
  const currentRecordUuid = useSelector(formSelectors.getRecordUuid);

  const handlePress = useCallback(() => {
    onSelect?.(record);
  }, [record, onSelect]);

  const {t} = useTranslation();

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
    </TouchableCard>
  );
};

const ListRecords = ({selectedRecordUuid, setSelectedRecord}) => {
  const keyExtractor = useCallback(item => item, []);

  const recordsSummary = useRecordsSummary();
  const recordUuids = useRecordsUuidsSorted(recordsSummary);

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
