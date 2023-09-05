import throttle from 'lodash.throttle';
import moment from 'moment/moment';
import React, {useCallback, useMemo, useState} from 'react';
import {Keyboard, View, StyleSheet} from 'react-native';

import Input from 'arena-mobile-ui/components/Input';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const SearchBar = ({
  handleStopToSearch,
  setSearchText,
  autoFocus,
  containerStyle,
}) => {
  const styles = useThemedStyles(_styles);
  const [clear, setClear] = useState(false);

  const _handleStopToSearch = useCallback(() => {
    setClear(moment().format('x'));
    setSearchText('');
    Keyboard.dismiss();
    handleStopToSearch?.();
  }, [handleStopToSearch, setSearchText]);

  const deboundedSearch = useCallback(
    text => throttle(setSearchText, 500)(text),
    [setSearchText],
  );
  const _containerStyle = useMemo(() => {
    return StyleSheet.compose(styles.selectBarContainer, containerStyle);
  }, [containerStyle, styles.selectBarContainer]);
  return (
    <View style={_containerStyle}>
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
          autoCorrect={false}
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
