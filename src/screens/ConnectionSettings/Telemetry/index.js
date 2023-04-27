import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
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
    <TextBase key={key}>
      {telemetryKey}:{key}:{fn?.recomputations?.() || '_'},
      {Object.keys(fn?.cache || {}).length || '_'}
    </TextBase>
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
        label={t('ConnectionSettings:telemetry.cta')}
      />
      <TextBase>Disk Storage:</TextBase>
      <TextBase>Used:{data?.disk?.used}</TextBase>
      <TextBase>Free:{data?.disk?.free}</TextBase>
      <TextBase>Total:{data?.disk?.total}</TextBase>

      <TextBase>Memory:</TextBase>
      <TextBase>Max:{data?.memory?.max}</TextBase>
      <TextBase>Used:{data?.memory?.used}</TextBase>
      <TextBase>Total:{data?.memory?.total}</TextBase>
      <ScrollView>
        <TextBase>numSurveys: {numSurveys}</TextBase>
        <TextBase>numRecords: {numRecords}</TextBase>
        <TextBase>numRecordsFs: {numRecordsFs}</TextBase>
        <TextBase>numNodes: {numNodes}</TextBase>
        <TextBase>-----------</TextBase>
        <Button
          type="ghostBlack"
          onPress={cleanReselectCache}
          label={t('ConnectionSettings:telemetry.cta')}></Button>
        {Object.keys(telemetryKeys).map(telemetryKey => (
          <TelemetryObject key={telemetryKey} telemetryKey={telemetryKey} />
        ))}
      </ScrollView>
    </View>
  );
};
export default Telemetry;
