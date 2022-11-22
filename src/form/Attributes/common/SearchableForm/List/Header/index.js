import React from 'react';
import {useTranslation} from 'react-i18next';

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
}) => {
  const {t} = useTranslation();

  return (
    <>
      {!searching ? (
        <Button
          onPress={handleStartToSearch}
          type="secondary"
          iconPosition="right"
          label={
            selectedItem ? _labelStractor(selectedItem) : t('Form:select_empty')
          }
          icon={ChevronDown}
          customContainerStyle={styles.select}
          customTextStyle={[styles.text, selectedItem ? styles.selected : {}]}
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
