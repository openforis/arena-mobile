import throttle from 'lodash.throttle';
import React, {useCallback, useState} from 'react';
import {Keyboard, View} from 'react-native';

import Input from 'arena-mobile-ui/components/Input';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

import styles from './styles';

const SearchBar = ({handleStopToSearch, setSearchText, autoFocus}) => {
  const [clear, setClear] = useState(false);

  const _handleStopToSearch = useCallback(() => {
    setClear(Math.random());
    setSearchText('');
    Keyboard.dismiss();
    handleStopToSearch?.();
  }, [handleStopToSearch, setSearchText]);

  const deboundedSearch = useCallback(
    text => throttle(setSearchText, 500)(text),
    [setSearchText],
  );
  return (
    <View style={styles.selectBarContainer}>
      <View style={styles.selectContainer}>
        <Input
          onChangeText={deboundedSearch}
          defaultValue={String('')}
          autoFocus={autoFocus}
          horizontal={true}
          stacked={false}
          customStyle={styles.searchBox}
          hasTitle={false}
          onBlur={handleStopToSearch}
          returnKeyType="done"
          clear={clear}
        />
      </View>
      <TouchableIcon
        iconName={'close'}
        onPress={_handleStopToSearch}
        customStyle={styles.close}
      />
    </View>
  );
};

SearchBar.defaultValue = {
  autoFocus: true,
};

export default SearchBar;
