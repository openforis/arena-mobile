import {useState, useCallback} from 'react';

export const getTextForSearch = item => {
  const labels = Object.entries(item?.props?.labels || {}).map(
    ([_, label]) => label,
  );
  return [item?.props?.code]
    .concat(labels)
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
