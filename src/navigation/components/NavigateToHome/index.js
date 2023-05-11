import * as React from 'react';

import {NavigateToIcon} from 'arena-mobile-ui/components/TouchableIcons';

import {ROUTES} from '../../constants';

const NavigateToHome = () => (
  <NavigateToIcon route={ROUTES.HOME} icon={'chevron-left'} />
);

export default NavigateToHome;
