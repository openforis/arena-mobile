import * as React from 'react';

import {NavigateToIcon} from 'arena-mobile-ui/components/TouchableIcons';

import {ROUTES} from '../../constants';

const NavigateToSurveys = () => (
  <NavigateToIcon route={ROUTES.SURVEYS} icon={'format-list-bulleted'} />
);

export default NavigateToSurveys;
