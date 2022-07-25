import React, {useCallback} from 'react';
import {View} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';

import useGetLocation from '../useGetLocation';

import styles from './styles';

const GetLocation = ({handleSaveLocation}) => {
  const {location, getLocation} = useGetLocation();

  const _handleSaveLocation = useCallback(() => {
    handleSaveLocation(location);
  }, [location, handleSaveLocation]);

  return (
    <View style={styles.container}>
      <Button
        type="ghostBlack"
        icon={<Icon name="compass-outline" />}
        onPress={getLocation}
        label="get location"
        customTextStyle={{paddingLeft: 8}}
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
