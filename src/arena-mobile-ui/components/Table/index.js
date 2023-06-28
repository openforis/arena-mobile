import React from 'react';

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
  return (
    <TableContainer
      style={[baseStyles.container, customStyles?.container || {}]}>
      <TableHeader style={[baseStyles.header, customStyles?.header || {}]}>
        <TableRow
          key="header"
          style={[baseStyles.headerRow, customStyles?.headerRow || {}]}>
          {headers?.map(item => (
            <TableCell
              key={headerCellKeyExtractor(item)}
              style={[baseStyles.headerCell, customStyles?.headerCell || {}]}
              width={getWidth(item) || baseWidth}>
              {renderHeaderCell({item})}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody style={[baseStyles.body, customStyles?.body || {}]}>
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
