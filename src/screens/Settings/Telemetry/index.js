import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {selectors as appSelectors} from 'state/app';
import {selectors as filesSelectors} from 'state/files';
import {selectors as formSelectors} from 'state/form';
import {selectors as nodesSelectors} from 'state/nodes';
import {selectors as recordsSelectors} from 'state/records';
import {useNumberRecords} from 'state/records/hooks';
import {selectors as surveySelectors} from 'state/survey';
import {selectors as surveysSelectors} from 'state/surveys';
import {selectors as userSelectors} from 'state/user';

import {useDeviceUse} from '../hooks';
const telemetryKeys = {
  appSelectors,
  filesSelectors,
  formSelectors,
  nodesSelectors,
  recordsSelectors,
  userSelectors,
  surveySelectors,
  surveysSelectors,
};
const TelemetryObject = ({telemetryKey}) => {
  return Object.entries(telemetryKeys[telemetryKey]).map(([key, fn]) => (
    <Text key={key}>
      {telemetryKey}:{key}:{fn?.recomputations?.() || '_'},
      {Object.keys(fn?.cache || {}).length || '_'}
    </Text>
  ));
};

const Telemetry = () => {
  const {t} = useTranslation();

  const numSurveys = useSelector(surveysSelectors.getNumberOfLocalSurveys);
  const numRecords = useSelector(recordsSelectors.getNumRecords);
  const numRecordsFs = useNumberRecords();
  const numNodes = useSelector(nodesSelectors.getNumNodes);
  const data = useDeviceUse();

  const cleanReselectCache = () => {
    Object.values(telemetryKeys).forEach(telemetryKey => {
      Object.values(telemetryKey).forEach(fn => {
        console.log(Object.keys(fn?.cache || {}).length);
        fn?.clearCache?.();
        fn?.cache?.clearCache?.();
      });
    });
  };

  return (
    <View key={new Date()}>
      <Button
        type="ghost"
        onPress={() => console.log()}
        label={t('Settings:telemetry.cta')}
      />
      <Text>Disk Storage:</Text>
      <Text>Used:{data?.disk?.used}</Text>
      <Text>Free:{data?.disk?.free}</Text>
      <Text>Total:{data?.disk?.total}</Text>

      <Text>Memory:</Text>
      <Text>Max:{data?.memory?.max}</Text>
      <Text>Used:{data?.memory?.used}</Text>
      <Text>Total:{data?.memory?.total}</Text>
      <ScrollView>
        <Text>numSurveys: {numSurveys}</Text>
        <Text>numRecords: {numRecords}</Text>
        <Text>numRecordsFs: {numRecordsFs}</Text>
        <Text>numNodes: {numNodes}</Text>
        <Text>-----------</Text>
        <Button
          type="ghostBlack"
          onPress={cleanReselectCache}
          label={t('Settings:telemetry.cta')}></Button>
        {Object.keys(telemetryKeys).map(telemetryKey => (
          <TelemetryObject key={telemetryKey} telemetryKey={telemetryKey} />
        ))}
      </ScrollView>
    </View>
  );
};
export default Telemetry;