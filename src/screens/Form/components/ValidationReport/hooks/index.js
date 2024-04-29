import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {selectors as validationSelectors} from 'state/validation';

export const useGetNumberOfErrors = () => {
  const _validation = useSelector(validationSelectors.getValidation);

  const numberOfErrors = useMemo(() => {
    let _numberOfErrors = 0;

    Object.entries(_validation?.fields || {}).forEach(([_, value]) => {
      if (value.valid === false) {
        _numberOfErrors++;
      }
    });

    return _numberOfErrors;
  }, [_validation]);

  return numberOfErrors;
};
