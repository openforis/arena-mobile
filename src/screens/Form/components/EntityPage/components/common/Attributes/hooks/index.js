import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';

export const useAttributesUuids = () => {
  const nodeDefChildrenUuids = useSelector(
    formSelectors.getFormAttributesNodeDefsUuids,
  );

  return useMemo(() => {
    return nodeDefChildrenUuids;
  }, [nodeDefChildrenUuids]);
};
