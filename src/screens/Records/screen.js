import React, {useCallback, useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import baseStyles from 'arena-mobile-ui/styles';
import formSelectors from 'state/form/selectors';

import ListRecords from './components/ListRecords';
import SelectedRecordPanel from './components/SelectedRecordPanel';
import styles from './styles';

const Records = () => {
  const currentRecord = useSelector(formSelectors.getRecord);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const resetSelectedRecord = useCallback(() => {
    setSelectedRecord(null);
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
          <Text style={[baseStyles.textStyle.title]}>Records</Text>
        </Header>

        <View style={[styles.listContainer]}>
          <ListRecords
            selectedRecord={selectedRecord}
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
