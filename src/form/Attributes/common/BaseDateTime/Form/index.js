import {NodeDefType} from '@openforis/arena-core';
import moment from 'moment-timezone';
import React, {useCallback, useEffect, useState} from 'react';
import {View, Appearance} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import {useCloseNode, useUpdateNode} from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';

const formats = {
  [NodeDefType.date]: 'YYYY-MM-DD',
  [NodeDefType.time]: 'HH:mm',
};

const modes = {
  [NodeDefType.date]: 'date',
  [NodeDefType.time]: 'time',
};

const DateForm = ({nodeDef}) => {
  const [date, setDate] = useState();

  const node = useSelector(formSelectors.getNode);

  const handleClose = useCloseNode();
  const handleUpdate = useUpdateNode();

  const handleSelectTime = useCallback(
    dateTime => {
      handleUpdate({
        node,
        value: moment(dateTime).format(formats[nodeDef.type]),
      });
    },
    [node, nodeDef, handleUpdate],
  );

  useEffect(() => {
    return () => handleClose();
  }, [handleClose]);

  useEffect(() => {
    if (node.value) {
      setDate(new Date(moment(node.value, formats[nodeDef.type])));
    } else {
      setDate(new Date());
    }
  }, [node, nodeDef]);

  return (
    <View>
      {date && (
        <DatePicker
          modal
          open={true}
          mode={modes[nodeDef.type]}
          onConfirm={handleSelectTime}
          onCancel={handleClose}
          date={date}
          textColor={
            Appearance.getColorScheme() === 'light'
              ? colors.black
              : colors.backgroundLight
          }
        />
      )}
    </View>
  );
};

export default DateForm;
