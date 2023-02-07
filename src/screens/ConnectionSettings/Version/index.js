import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {actions as appActions} from 'state/app';

import {useDeviceUse} from '../hooks';

const Version = () => {
  const dispatch = useDispatch();
  const [numTaps, setNumTaps] = useState(0);
  const {t} = useTranslation();

  const handleTap = useCallback(() => {
    if (numTaps === 4) {
      dispatch(appActions.setDevMode());
    }
    setNumTaps(numTaps + 1);
  }, [numTaps, dispatch]);

  const data = useDeviceUse();
  return (
    <Button
      type="ghostBlack"
      onPress={handleTap}
      label={`${t('Common:version')}: ${data.version} (${data.buildNumber})`}
    />
  );
};

export default Version;
