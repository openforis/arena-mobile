import React from 'react';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';
import {selectors as recordsSelectors} from 'state/records';
import {selectors as nodesSelectors} from 'state/nodes';
import {selectors as filesSelectors} from 'state/files';

import {useDeviceUse} from 'screens/Settings/hooks';

const NumberOfItems = () => {
  const records = useSelector(recordsSelectors.getRecordsByUuid);
  const numRecords = useSelector(recordsSelectors.getNumRecords);
  const numNodes = useSelector(nodesSelectors.getNumNodes);
  const numFiles = useSelector(filesSelectors.getNumFiles);

  const currentRecord = useSelector(formSelectors.getRecord);

  const data = useDeviceUse();

  return (
    <>
      <Text>RecordsSize:{JSON.stringify(records).length}</Text>
      <Text>numRecords:{numRecords}</Text>
      <Text>numNodes:{numNodes}</Text>
      <Text>numFiles:{numFiles}</Text>
      <Text>currentRecord:{JSON.stringify(currentRecord).length}</Text>
      <Text>memoryUsed:{data?.memory?.used}</Text>
      <Text>memoryCapacity:{data?.memory?.total}</Text>
    </>
  );
};

export default NumberOfItems;
