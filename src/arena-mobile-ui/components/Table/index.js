import React, {useMemo, useCallback} from 'react';
import {StyleSheet, Dimensions} from 'react-native';

import List from 'arena-mobile-ui/components/List';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import {
  TableContainer,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  _renderCell,
} from './components';
import _styles from './styles';
import {_basicKeyExtractor, isOdd} from './utils';

const {width: WIDTH} = Dimensions.get('window');

const Table = ({
  headers,
  rows,
  /* header */
  headerCellKeyExtractor = _basicKeyExtractor,
  renderHeaderCell = _renderCell,

  /* body */
  keyRowExtractor = _basicKeyExtractor,
  renderRow,
  getWidth,
  baseWidth,
  customStyles,
}) => {
  const baseStyles = useThemedStyles(_styles);

  const minWidth = useMemo(() => {
    if (headers.length <= 1) return WIDTH;
    return false;
  }, [baseStyles, customStyles]);

  const containerStyles = useMemo(() => {
    return StyleSheet.compose(baseStyles.container, customStyles?.container);
  }, [baseStyles, customStyles]);

  const headerStyles = useMemo(() => {
    return StyleSheet.compose(baseStyles.header, customStyles?.header);
  }, [baseStyles, customStyles]);

  const headerRowStyles = useMemo(() => {
    return StyleSheet.compose(baseStyles.headerRow, customStyles?.headerRow);
  }, [baseStyles, customStyles]);

  const headerCellStyles = useMemo(() => {
    return StyleSheet.compose(baseStyles.headerCell, customStyles?.headerCell);
  }, [baseStyles, customStyles]);

  const bodyStyles = useMemo(() => {
    return StyleSheet.compose(baseStyles.body, customStyles?.body);
  }, [baseStyles, customStyles]);

  const rowStyles = useMemo(() => {
    return StyleSheet.compose(baseStyles.row, customStyles?.row);
  }, [baseStyles, customStyles]);

  const oddRowStyles = useMemo(() => {
    return StyleSheet.compose(
      rowStyles,
      StyleSheet.compose(baseStyles.oddRow, customStyles?.oddRow),
    );
  }, [rowStyles, baseStyles, customStyles]);

  const renderRowContainer = useCallback(
    ({item, index}) => (
      <TableRow style={isOdd(index) ? oddRowStyles : rowStyles}>
        {renderRow({item})}
      </TableRow>
    ),
    [baseStyles, customStyles, renderRow, oddRowStyles, rowStyles],
  );

  return (
    <TableContainer style={containerStyles}>
      <TableHeader style={headerStyles}>
        <TableRow key="header" style={headerRowStyles}>
          {headers?.map(item => (
            <TableCell
              key={headerCellKeyExtractor(item)}
              style={headerCellStyles}
              width={minWidth || getWidth(item) || baseWidth}>
              {renderHeaderCell({item})}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody style={bodyStyles}>
        <List
          data={rows}
          keyExtractor={keyRowExtractor}
          renderItem={renderRowContainer}
        />
      </TableBody>
    </TableContainer>
  );
};
Table.defaultProps = {
  headers: [],
  rows: [],
  /* body */
  renderRow: () => undefined,
  getWidth: () => null,
  baseWidth: 150,
  customStyles: {},
};
export default Table;
