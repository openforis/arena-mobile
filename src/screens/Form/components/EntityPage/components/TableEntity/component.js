import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import TableComponent from 'arena-mobile-ui/components/Table';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import Label from 'form/common/Label';
import {actions as formActions, selectors as formSelectors} from 'state/form';

import Attributes from '../common/Attributes';
import EntityPanel from '../common/EntityPanel';

import {Row} from './components';
import {useEntityTableData} from './hooks';
import _styles from './styles';

import MultipleEntityHome from '../common/MultipleEntityHome';

export const Table = ({onlyKeys}) => {
  const styles = useThemedStyles(_styles);
  const {rows, headers, getWidth} = useEntityTableData({onlyKeys});

  const dispatch = useDispatch();

  const handlePressRow = useCallback(
    item => () => {
      dispatch(
        formActions.selectEntityNode({
          node: item,
        }),
      );
    },
    [dispatch],
  );

  const renderHeaderCell = useCallback(
    ({item: nodeDef}) => (
      <Label
        nodeDef={nodeDef}
        iconColor={colors.neutralLightest}
        customStyles={styles.header}
        numberOfLines={1}
      />
    ),
    [styles.header],
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
    <TableComponent
      rows={rows}
      headers={headers}
      renderHeaderCell={renderHeaderCell}
      renderRow={renderRow}
      getWidth={getWidth}
    />
  );
};

Table.defaultProps = {
  onlyKeys: false,
};

const TableEntity = () => {
  const styles = useThemedStyles(_styles);
  const isEntityShowAsTable = useSelector(formSelectors.isEntityShowAsTable);
  const showMultipleEntityHome = useSelector(
    formSelectors.showMultipleEntityHome,
  );

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  if (showMultipleEntityHome && parentEntityNodeDef) {
    return (
      <View style={styles.container}>
        <MultipleEntityHome />
        <EntityPanel />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {isEntityShowAsTable ? <Table /> : <Attributes />}
      <EntityPanel />
    </View>
  );
};

export default TableEntity;
