import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import {selectors as appSelectors} from 'state/app';

const SurveyStatus = ({survey}) => {
  const actionType = survey?.listAction;
  const currentServerUrl = useSelector(appSelectors.getServerUrl);
  const {t} = useTranslation();
  const config = useMemo(() => {
    if (actionType === 'DOWNLOAD') {
      return {
        value: t('Surveys:status_labels.not_in_device'),
        color: 'info',
        bolder: true,
      };
    }
    if (actionType === 'UPDATE') {
      return {
        value: t('Surveys:status_labels.update'),
        color: 'alert',
        bolder: true,
      };
    }

    if (survey?.serverUrl && survey?.serverUrl !== currentServerUrl) {
      return {
        value: t('Surveys:status_labels.not_this_server'),
        color: 'alert',
        bolder: true,
      };
    }
    return {
      value: t('Surveys:status_labels.ready'),
      color: 'info',
      bolder: true,
    };
  }, [t, actionType, survey, currentServerUrl]);

  return (
    <LabelsAndValues
      items={[
        {
          label: t('Surveys:status'),
          ...config,
        },
      ]}
    />
  );
};
export default SurveyStatus;
