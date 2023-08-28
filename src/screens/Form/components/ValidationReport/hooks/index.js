import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';

export const useGetNumberOfErrors = () => {
  const _validation = useSelector(formSelectors.getValidation);

  const numberOfErrors = useMemo(() => {
    let _numberOfErrors = 0;

    Object.entries(_validation.fields).forEach(([key, value]) => {
      if (value.valid === false) {
        _numberOfErrors++;
      }
    });

    return _numberOfErrors;
  }, [_validation]);

  return numberOfErrors;
};
