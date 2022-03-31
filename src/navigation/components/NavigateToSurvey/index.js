import * as React from 'react';

import {NavigateToIcon} from 'arena-mobile-ui/components/TouchableIcons';

import {ROUTES} from '../../constants';

const NavigateToSurvey = () => (
  <NavigateToIcon route={ROUTES.SURVEY} icon={'cog'} />
);

export default NavigateToSurvey;
