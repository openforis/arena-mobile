import React, {useCallback, useState, useEffect} from 'react';
import {View} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';

import useGetLocation from '../useGetLocation';

import styles from './styles';

const GetLocation = ({handleSaveLocation}) => {
  const [loading, setLoading] = useState(false);
  const {location, getLocation} = useGetLocation();

  const _handleSaveLocation = useCallback(() => {
    setLoading(true);
    handleSaveLocation(location);
  }, [location, handleSaveLocation]);

  useEffect(() => {
    setLoading(false);
  }, [location]);

  return (
    <View style={styles.container}>
      <Button
        type="ghostBlack"
        icon={<Icon name="compass-outline" />}
        onPress={getLocation}
        label="get location"
        customTextStyle={{paddingLeft: 8}}
        disabled={loading}
      />
      <LabelsAndValues
        items={Object.entries(location?.coords || {}).map(([label, value]) => ({
          label,
          value,
        }))}
        expanded
      />
      {location?.coords && (
        <Button
          type="ghost"
          label="save"
          customContainerStyle={{justifyContent: 'flex-end'}}
          onPress={_handleSaveLocation}
        />
      )}
    </View>
  );
};

export default GetLocation;
