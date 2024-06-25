import {createClient} from '@segment/analytics-react-native';
import {segmentKey} from './segment-config';
import {Objects} from 'infra/objectUtils';

const ANALYTICS_FEATURE_ENABLED = true; //!__DEV__;

const analytics = createClient({
  writeKey: segmentKey,
  recordScreenViews: true,
  trackAppLifecycleEvents: true,
  android: {
    collectDeviceId: true,
  },
  ios: {
    trackAdvertising: true,
    trackDeepLinks: true,
  },
  debug: __DEV__,
});

const track = ({type, properties}) => {
  console.log(process.env.SEGMENT_API_KEY, process.env);
  try {
    if (type && ANALYTICS_FEATURE_ENABLED) {
      if (
        !Objects.isEmpty(properties) &&
        Object.keys(properties).includes('password')
      ) {
        const _properties = Object.assign({}, properties);
        _properties.password =
          '*********' +
          properties.password[properties.password.length - 2] +
          properties.password[properties.password.length - 1];

        analytics.track(type, _properties);
      } else {
        analytics.track(type, properties);
      }
    }
  } catch (err) {
    console.log('Error::track', err);
  }
};

const identify = async (userId, traits = {}) => {
  try {
    analytics.identify(userId, traits);
    analytics.flush();
  } catch (err) {
    console.log(err);
  }
};

const methods = {
  track,
  identify,
};

export default methods;
