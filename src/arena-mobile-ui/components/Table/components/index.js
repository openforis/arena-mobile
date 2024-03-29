import React from 'react';
import {View, ScrollView} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import styles from '../styles';

export const TableBody = ({children, style = styles.body}) => {
  return <View style={style}>{children}</View>;
};

export const TableContainer = ({children, style = styles.container}) => {
  return (
    <View style={style}>
      <ScrollView horizontal={true}>
        <TableBody>{children}</TableBody>
      </ScrollView>
    </View>
  );
};

export const TableHeader = ({children, style = styles.header}) => {
  return <View style={style}>{children}</View>;
};

export const TableRow = ({children, style = styles.row, customStyle = {}}) => {
  return <View style={[style, customStyle]}>{children}</View>;
};

export const TableCell = ({
  children,
  width,
  style = styles.cell,
  customStyle = {},
}) => {
  return <View style={[{width}, style, customStyle]}>{children}</View>;
};

export const _renderCell = ({item}) => {
  return <TextBase numberOfLines={1}>{item.label || '-'}</TextBase>;
};
