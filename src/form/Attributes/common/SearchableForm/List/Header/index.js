import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';

import ChevronDown from '../../ChevronDown';
import SearchBar from '../../SearchBar';

import styles from './styles';

const Header = ({
  searching,
  handleStartToSearch,
  selectedItem,
  _labelStractor,
  applicable,
  handleStopToSearch,
  setSearchText,
  placeholderButton,
}) => {
  const {t} = useTranslation();
  const buttonTextStyles = useMemo(() => {
    StyleSheet.compose(styles.text, selectedItem ? styles.selected : {});
  }, [selectedItem]);

  const label = useMemo(() => {
    return selectedItem
      ? _labelStractor(selectedItem)
      : placeholderButton || t('Form:select_empty');
  }, [selectedItem, _labelStractor, placeholderButton, t]);

  return (
    <>
      {!searching ? (
        <Button
          onPress={handleStartToSearch}
          type="secondary"
          iconPosition="right"
          label={label}
          icon={ChevronDown}
          customContainerStyle={styles.select}
          customTextStyle={buttonTextStyles}
          disabled={!applicable}
        />
      ) : (
        <SearchBar
          handleStopToSearch={handleStopToSearch}
          setSearchText={setSearchText}
        />
      )}
    </>
  );
};

export default Header;
