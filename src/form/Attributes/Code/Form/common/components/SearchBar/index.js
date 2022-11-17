import React from 'react';
import {View} from 'react-native';

import Input from 'arena-mobile-ui/components/Input';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

import styles from './styles';

const SearchBar = ({handleStopToSearch, setSearchText}) => {
  return (
    <View style={styles.selectBarContainer}>
      <View style={styles.selectContainer}>
        <Input
          onChangeText={setSearchText}
          defaultValue={String('')}
          autoFocus={true}
          horizontal={true}
          stacked={false}
          customStyle={styles.searchBox}
          hasTitle={false}
          onBlur={handleStopToSearch}
          returnKeyType="done"
        />
      </View>
      <TouchableIcon
        iconName={'close'}
        onPress={handleStopToSearch}
        customStyle={styles.close}
      />
    </View>
  );
};

export default SearchBar;
