import React, {useState, useCallback} from 'react';
import {View} from 'react-native';
import {useDispatch} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Table from 'arena-mobile-ui/components/Table';
import Label from 'form/common/Label';
import {actions as formActions} from 'state/form';

import Attributes from '../common/Attributes';
import MultipleEntityManager from '../common/MultipleEntityManager';

import {Viewtoggler, Row} from './components';
import {useEntityTableData} from './hooks';
import styles from './styles';

const TableEntity = () => {
  const {rows, headers, getWidth} = useEntityTableData();

  const [entityAsTable, setEntityAsTable] = useState(true);
  const dispatch = useDispatch();

  const handlePressRow = useCallback(
    item => () => {
      dispatch(
        formActions.selectEntityNode({
          node: item,
        }),
      );
      setEntityAsTable(false);
    },
    [setEntityAsTable, dispatch],
  );

  const renderHeaderCell = useCallback(
    ({item: nodeDef}) => (
      <Label
        nodeDef={nodeDef}
        iconColor={colors.neutralLightest}
        customStyles={{textStyle: {color: colors.neutralLightest}}}
      />
    ),
    [],
  );

  const renderRow = useCallback(
    ({item}) => (
      <Row
        item={item}
        headers={headers}
        getWidth={getWidth}
        onPress={handlePressRow(item)}
      />
    ),
    [headers, getWidth, handlePressRow],
  );

  return (
    <View style={[styles.container]}>
      <Viewtoggler
        setEntityAsTable={setEntityAsTable}
        entityAsTable={entityAsTable}
      />

      {entityAsTable ? (
        <Table
          rows={rows}
          headers={headers}
          renderHeaderCell={renderHeaderCell}
          renderRow={renderRow}
          getWidth={getWidth}
        />
      ) : (
        <>
          <MultipleEntityManager />
          <Attributes />
        </>
      )}
    </View>
  );
};

export default TableEntity;
