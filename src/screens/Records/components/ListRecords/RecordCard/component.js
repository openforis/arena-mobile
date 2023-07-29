import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import CurrentItemLabel from 'arena-mobile-ui/components/CurrentItemLabel';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import formSelectors from 'state/form/selectors';
import recordsSelectors from 'state/records/selectors';

import RecordStatus from './RecordStatus';
import _styles from './styles';

// SORT and FILTER
// airplane-alert
const ProgressBar = () => {
  return null;
};

const RecordCard = ({record, recordUuid, isSelected, onSelect}) => {
  const styles = useThemedStyles(_styles);
  const currentRecordUuid = useSelector(formSelectors.getRecordUuid);

  const isRecordsRemoteSummaryReady = useSelector(
    recordsSelectors.isRecordsRemoteSummaryReady,
  );

  const {t} = useTranslation();

  const handlePress = useCallback(() => {
    onSelect?.(record);
  }, [record, onSelect]);

  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      styles.container,
      isSelected ? styles.selected : {},
    );
  }, [styles, isSelected]);

  return (
    <TouchableCard onPress={handlePress} customStyles={containerStyle}>
      <View style={styles.infoContainer}>
        <View style={styles.payload}>
          <View style={styles.labelCotainer}>
            <TextBase type="bold" size="l">
              {record.recordKey || t('Records:empty_key')}
            </TextBase>
          </View>
          <CreatedAndModified
            dateCreated={record?.dateCreated}
            dateModified={record?.dateModified}
          />

          {isRecordsRemoteSummaryReady && (
            <RecordStatus record={record} recordUuid={recordUuid} />
          )}
        </View>
        <View style={styles.moreInfo}>
          <View style={styles.activeSurveyContainer}>
            {currentRecordUuid === recordUuid ? (
              <CurrentItemLabel label={t('Records:current_record')} />
            ) : (
              <View />
            )}
          </View>
        </View>
      </View>

      <ProgressBar />
    </TouchableCard>
  );
};

export default RecordCard;
