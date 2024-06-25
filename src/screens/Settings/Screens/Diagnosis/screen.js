import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import {useRecordsUuidsSorted, useRecordsSummary} from 'state/records/hooks';
import {useSelector, useDispatch} from 'react-redux';
import {selectors as appSelectors, actions as appActions} from 'state/app';
import _styles from './styles';
import CopyToClipboard from 'form/Attributes/common/CopyToClipboard';
import ShareDataButton from 'screens/Records/components/ListRecords/SubPanel/ShareDataButton';

const RecordsScreen = () => {
  const [recordsSummary, debugLog] = useRecordsSummary();
  const recordUuids = useRecordsUuidsSorted(recordsSummary);

  const fullText = useMemo(() => {
    return `
    ******RECORDS SCREEN *********
    _cycle ${debugLog.includes('_cycle') ? '1' : '0'}
    _surveyUuid ${debugLog.includes('_surveyUuid') ? '1' : '0'}
    01.Summary ${debugLog.includes('01.Summary') ? '1' : '0'}
    02.recordsUuids ${debugLog.includes('02.recordsUuids') ? '1' : '0'}
    03.recordsInSurvey ${debugLog.includes('03.recordsInSurvey') ? '1' : '0'}
    04.recordSummary ${debugLog.includes('04.recordSummary') ? '1' : '0'}
    05.recordsUuidsToDelete ${debugLog.includes('05.recordsUuidsToDelete') ? '1' : '0'}
    06.newSummaryToPersist ${debugLog.includes('06.newSummaryToPersist') ? '1' : '0'}
    *******************************
    ${JSON.stringify(recordsSummary, null, 2)}
    ------------
    ${debugLog}
    ****************
    ${JSON.stringify(recordUuids, null, 2)}
    `;
  }, [recordsSummary, recordUuids]);

  return (
    <View>
      <CopyToClipboard value={fullText} />
      <TextBase>{fullText}</TextBase>
    </View>
  );
};

const CheckExportSurvey = () => {
  const shareDataLog = useSelector(appSelectors.getShareDataLog);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      appActions.diagnosisSetShareDataLog({
        shareDataLog: 'press the share button',
      }),
    );
  }, []);

  return (
    <View>
      <ShareDataButton />
      <CopyToClipboard value={JSON.stringify(shareDataLog)} />
      <TextBase>{shareDataLog}</TextBase>
    </View>
  );
};

const CheckFiles = () => {
  return (
    <View>
      <TextBase>''</TextBase>
    </View>
  );
};

const SettingsDiagnosis = () => {
  const styles = useThemedStyles(_styles);
  const [visibleDiagnosis, setVisibleDiagnosis] = useState(false);

  const {t} = useTranslation();

  return (
    <Layout bottomStyle="background" topStyle="primary">
      <>
        <Header hasBackComponent>
          <TextBase type="title">{t('Settings:diagnosis.title')}</TextBase>
        </Header>
        <ScrollView>
          <View style={styles.container}>
            {visibleDiagnosis ? (
              <Button
                type="primary"
                onPress={() => setVisibleDiagnosis('')}
                label={'Close'}
              />
            ) : (
              <>
                <Button
                  type="primary"
                  onPress={() => setVisibleDiagnosis('RECORDS_SCREEN')}
                  label={t('records list screen')}
                />
                <Button
                  type="primary"
                  onPress={() => setVisibleDiagnosis('EXPORT_SURVEY')}
                  label={t('export survey')}
                />
                {false && (
                  <Button
                    type="primary"
                    onPress={() => setVisibleDiagnosis('FILES')}
                    label={t('Check files')}
                  />
                )}
                {false && (
                  <Button
                    type="primary"
                    onPress={() => setVisibleDiagnosis('RECORDS')}
                    label={t('Check records')}
                  />
                )}
              </>
            )}
            {visibleDiagnosis === 'RECORDS_SCREEN' && <RecordsScreen />}
            {visibleDiagnosis === 'EXPORT_SURVEY' && <CheckExportSurvey />}
            {visibleDiagnosis === 'FILES' && <CheckFiles />}
            {visibleDiagnosis === 'RECORDS' && <CheckRecords />}
          </View>

          <View style={styles.buttonsContainer}></View>
        </ScrollView>
      </>
    </Layout>
  );
};

export default SettingsDiagnosis;
