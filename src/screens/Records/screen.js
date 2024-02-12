import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import NavigateToHome from 'navigation/components/NavigateToHome';

import ListRecords from './components/ListRecords';
import SelectedRecordPanel from './components/SelectedRecordPanel';
import RemoveAllSurveyData from './components/RemoveAllSurveyData';
import _styles from './styles';

const Records = () => {
  const {t} = useTranslation();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const styles = useThemedStyles(_styles);
  const resetSelectedRecord = useCallback(() => {
    setSelectedRecord(false);
  }, []);

  return (
    <Layout bottomSafeArea={false}>
      <>
        <Header
          LeftComponent={NavigateToHome}
          RightComponent={<RemoveAllSurveyData />}>
          <TextTitle>{t('Common:records')}</TextTitle>
        </Header>

        <View style={styles.listContainer}>
          <ListRecords
            selectedRecordUuid={selectedRecord?.uuid}
            setSelectedRecord={setSelectedRecord}
          />
        </View>
        {selectedRecord && (
          <SelectedRecordPanel
            record={selectedRecord}
            unSelect={resetSelectedRecord}
          />
        )}
      </>
    </Layout>
  );
};

export default Records;
