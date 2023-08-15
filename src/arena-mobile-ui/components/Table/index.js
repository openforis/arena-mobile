import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';

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

const Table = ({
  headers,
  rows,
  /* header */
  headerCellKeyExtractor = _basicKeyExtractor,
  renderHeaderCell = _renderCell,

  /* body */
  keyRowExtractor = _basicKeyExtractor,
  renderRow = () => undefined,

  getWidth = () => null,
  baseWidth = 150,

  customStyles = {},
}) => {
  const baseStyles = useThemedStyles(_styles);
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

  return (
    <TableContainer style={containerStyles}>
      <TableHeader style={headerStyles}>
        <TableRow key="header" style={headerRowStyles}>
          {headers?.map(item => (
            <TableCell
              key={headerCellKeyExtractor(item)}
              style={headerCellStyles}
              width={getWidth(item) || baseWidth}>
              {renderHeaderCell({item})}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody style={bodyStyles}>
        <List
          data={rows}
          keyExtractor={keyRowExtractor}
          renderItem={({item, index}) => (
            <TableRow
              style={[
                baseStyles.row,
                customStyles?.row || {},
                ...(isOdd(index)
                  ? [baseStyles.oddRow, customStyles?.oddRow || {}]
                  : []),
              ]}>
              {renderRow({item})}
            </TableRow>
          )}
        />
      </TableBody>
    </TableContainer>
  );
};

export default Table;
