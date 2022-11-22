import {useState, useCallback} from 'react';

export const getTextForSearch = (item, language) => {
  return [item?.props?.code, item?.props?.labels?.[language] || '']
    .join('.')
    .toLowerCase()
    .normalize('NFD');
};

export const useSearch = () => {
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleStartToSearch = useCallback(() => setSearching(true), []);
  const handleStopToSearch = useCallback(() => {
    setSearching(false);
    setSearchText('');
  }, []);

  return {
    searchText,
    searching,
    setSearchText,
    handleStartToSearch,
    handleStopToSearch,
  };
};
