import React, {useCallback, useState, useEffect} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';
import formSelectors from 'state/form/selectors';

import ListRecords from './components/ListRecords';
import SelectedRecordPanel from './components/SelectedRecordPanel';
import styles from './styles';

const Records = () => {
  const {t} = useTranslation();
  const currentRecord = useSelector(formSelectors.getRecord);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const resetSelectedRecord = useCallback(() => {
    setSelectedRecord(false);
  }, []);

  useEffect(() => {
    if (currentRecord?.uuid) {
      setSelectedRecord(currentRecord);
      return;
    }
    setSelectedRecord(null);
  }, [currentRecord]);

  return (
    <Layout bottomStyle={selectedRecord ? 'primary' : 'background'}>
      <>
        <Header hasBackComponent={true}>
          <TextTitle>{t('Common:records')}</TextTitle>
        </Header>

        <View style={[styles.listContainer]}>
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
