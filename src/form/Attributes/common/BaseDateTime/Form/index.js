import {NodeDefType} from '@openforis/arena-core';
import moment from 'moment-timezone';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {colors} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {actions as formActions} from 'state/form';
import formSelectors from 'state/form/selectors';
import {actions as nodesActions} from 'state/nodes';

const formats = {
  [NodeDefType.date]: 'YYYY-MM-DD',
  [NodeDefType.time]: 'HH:mm',
};

const modes = {
  [NodeDefType.date]: 'date',
  [NodeDefType.time]: 'time',
};

const DateForm = ({nodeDef}) => {
  const dispatch = useDispatch();
  const [date, setDate] = useState();

  const node = useSelector(formSelectors.getNode);

  const handleClose = useCallback(() => {
    dispatch(formActions.setNode({node: false}));
  }, [dispatch]);

  const handleSelectTime = useCallback(
    dateTime => {
      dispatch(
        nodesActions.updateNode({
          updatedNode: {
            ...node,
            value: moment(dateTime).format(formats[nodeDef.type]),
          },
          callback: handleClose,
        }),
      );
    },
    [dispatch, node, nodeDef, handleClose],
  );

  useEffect(() => {
    return () => dispatch(formActions.setNode({node: false}));
  }, []);

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
          open
          mode={modes[nodeDef.type]}
          onConfirm={handleSelectTime}
          onCancel={handleClose}
          date={date}
          textColor={colors.white}
        />
      )}
    </View>
  );
};

export default DateForm;
