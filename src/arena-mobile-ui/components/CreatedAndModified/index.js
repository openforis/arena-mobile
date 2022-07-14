import moment from 'moment-timezone';
import React from 'react';
import {useTranslation} from 'react-i18next';

import LabelsAndValues from '../LabelsAndValues';

const CreatedAndModified = ({dateCreated, dateModified}) => {
  const {t} = useTranslation();
  return (
    <LabelsAndValues
      items={[
        {label: t('Common:created'), value: moment(dateCreated).fromNow()},
        {label: t('Common:modified'), value: moment(dateModified).fromNow()},
      ]}
    />
  );
};

export default CreatedAndModified;
