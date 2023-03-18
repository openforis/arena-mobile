import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import {actions as appActions, selectors as appSelectors} from 'state/app';

import Button from '../Button';

const ToggleShowNames = () => {
  const {t} = useTranslation();
  const showNames = useSelector(appSelectors.getShowNames);
  const dispatch = useDispatch();

  const handlePress = useCallback(() => {
    dispatch(appActions.setShowNames({showNames: !showNames}));
  }, [showNames]);

  return (
    <Button
      label={t(`Common:show_${showNames ? 'labels' : 'names'}`)}
      type="ghostBlack"
      onPress={handlePress}
    />
  );
};

export default ToggleShowNames;
