import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView, Pressable} from 'react-native';
import {useSelector} from 'react-redux';
import Share from 'react-native-share';

import Button from 'arena-mobile-ui/components/Button';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import {selectors as appSelectors} from 'state/app';
import {selectors as filesSelectors} from 'state/files';
import {selectors as formSelectors} from 'state/form';
import {selectors as nodesSelectors} from 'state/nodes';
import {selectors as recordsSelectors} from 'state/records';
import {useNumberRecords} from 'state/records/hooks';
import {selectors as surveySelectors} from 'state/survey';
import {selectors as surveysSelectors} from 'state/surveys';
import {selectors as userSelectors} from 'state/user';
import * as fs from 'infra/fs';

import {useDeviceUse} from '../hooks';
import {set} from 'mockdate';
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
  const [foldersAndFilesOnTempFolder, setFoldersAndFilesOnTempFolder] =
    useState([]);
  const [foldersAndFilesOnAppFolder, setFoldersAndFilesOnAppFolder] = useState(
    [],
  );
  const [
    foldersAndFilesOnAppSurveyFolder,
    setFoldersAndFilesOnAppSurveyFolder,
  ] = useState([]);

  const surveyUuid = useSelector(surveySelectors.getSelectedSurveyUuid);

  const cycle = useSelector(surveySelectors.getSurveyCycle);

  const onShare = useCallback(async item => {
    try {
      const url = `file://${item.path}`;

      const fileContent = await fs.readfile({
        filePath: item.path,
        encoding: 'base64',
      });

      const actualData = 'data:application/zip;base64,' + fileContent;

      const result = await Share.open({
        url: actualData,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('result.activityType', result.activityType);
        } else {
          // shared
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Dismissed');
      }
    } catch (error) {
      console.log('Error', error.message);
      Alert.alert(error.message);
    }
  });

  useEffect(() => {
    const getAppDir = async () => {
      const res = await fs.readDir({dirPath: fs.BASE_PATH_DATA});
      setFoldersAndFilesOnAppFolder(res);
      return [];
    };

    getAppDir();
  }, []);

  useEffect(() => {
    const getAppSurveyDir = async () => {
      const res = await fs.readDir({
        dirPath: `${fs.BASE_PATH_DATA}/${surveyUuid}/${cycle}/records`,
      });
      setFoldersAndFilesOnAppSurveyFolder(res);
      return [];
    };

    getAppSurveyDir();
  }, [surveyUuid, cycle]);

  useEffect(() => {
    const getTmpDir = async () => {
      const res = await fs.readDir({dirPath: fs.TMP_BASE_PATH});
      setFoldersAndFilesOnTempFolder(res);
      return [];
    };

    getTmpDir();
  }, []);

  return (
    <View key={new Date()}>
      <Button
        type="ghost"
        onPress={() => console.log()}
        label={t('Settings:telemetry.cta')}
      />
      <TextBase>File Explorer:</TextBase>
      <TextBase>Arena Data: {foldersAndFilesOnAppFolder?.length}</TextBase>
      {foldersAndFilesOnAppFolder
        .filter(item => item.name === surveyUuid)
        ?.map(item => (
          <TextBase key={item.name}>- {item.name}</TextBase>
        ))}

      <TextBase>
        Current Survey Directory: {foldersAndFilesOnAppFolder?.length}
      </TextBase>
      {foldersAndFilesOnAppSurveyFolder?.map(item => (
        <Pressable
          style={{
            backgroundColor: '#fafafa',
            padding: 10,
            margin: 3,
          }}
          key={item.name}
          onPress={() => onShare(item)}>
          <TextBase>- {item.name}</TextBase>
        </Pressable>
      ))}

      <TextBase>TEMP: {foldersAndFilesOnTempFolder?.length}</TextBase>
      {foldersAndFilesOnTempFolder?.map(item => (
        <Pressable
          style={{
            backgroundColor: '#fafafa',
            padding: 10,
            margin: 3,
          }}
          key={item.name}
          onPress={() => onShare(item)}>
          <TextBase>- {item.name}</TextBase>
        </Pressable>
      ))}
    </View>
  );
};
export default Telemetry;
