import React from 'react';
import {Text, View} from 'react-native';

import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import baseStyles from 'arena-mobile-ui/styles';

const SurveyInfo = ({survey}) => {
  return (
    <View>
      <Text style={[baseStyles.textStyle.bold, baseStyles.textSize.l]}>
        {survey.props.labels?.[survey?.props?.languages?.[0]]}
      </Text>
      <Text style={[baseStyles.textStyle.secondaryText, baseStyles.textSize.s]}>
        {survey.id} - {survey?.props?.name}
      </Text>

      <CreatedAndModified
        dateCreated={survey?.dateCreated}
        dateModified={survey?.dateModified}
      />
    </View>
  );
};

export default SurveyInfo;