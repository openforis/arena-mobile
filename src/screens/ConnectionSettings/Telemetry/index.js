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
import {selectors as surveySelectors} from 'state/survey';
import {selectors as surveysSelectors} from 'state/surveys';
import {selectors as userSelectors} from 'state/user';

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
  const numNodes = useSelector(nodesSelectors.getNumNodes);

  return (
    <View key={new Date()}>
      <Button
        type="ghost"
        onPress={() => console.log()}
        label={t('ConnectionSettings:telemetry.cta')}
      />
      <ScrollView>
        <Text>numNodes: {numNodes}</Text>
        <Text>-----------</Text>
        {Object.keys(telemetryKeys).map(telemetryKey => (
          <TelemetryObject key={telemetryKey} telemetryKey={telemetryKey} />
        ))}
      </ScrollView>
    </View>
  );
};
export default Telemetry;
