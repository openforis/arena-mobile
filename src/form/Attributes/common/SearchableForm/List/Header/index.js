import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import DropDownButton from 'arena-mobile-ui/components/Button/DropDownButton';

import SearchBar from '../../SearchBar';

const Header = ({
  searching,
  handleStartToSearch,
  selectedItem,
  _labelExtractor,
  applicable,
  handleStopToSearch,
  setSearchText,
  placeholderButton,
}) => {
  const {t} = useTranslation();

  const label = useMemo(() => {
    return selectedItem
      ? _labelExtractor(selectedItem)
      : placeholderButton || t('Form:select_empty');
  }, [selectedItem, _labelExtractor, placeholderButton, t]);

  return (
    <>
      {!searching ? (
        <DropDownButton
          onPress={handleStartToSearch}
          label={label}
          disabled={!applicable}
          selected={selectedItem}
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
