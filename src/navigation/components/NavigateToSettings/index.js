import * as React from 'react';

import {NavigateToIcon} from 'arena-mobile-ui/components/TouchableIcons';

import {ROUTES} from '../../constants';

const NavigateToSettings = () => (
  <NavigateToIcon route={ROUTES.SETTINGS} icon={'cog'} />
);

export default NavigateToSettings;
