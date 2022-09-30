import React, {useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {selectors as formSelectors, actions as formActions} from 'state/form';

const Preview = ({nodeDef}) => {
  const label = useNodeDefNameOrLabel({nodeDef});
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const dispatch = useDispatch();
  const handleSelect = useCallback(() => {
    dispatch(
      formActions.selectEntity({
        nodeDef,
      }),
    );
  }, [nodeDef, dispatch]);

  return (
    <Button
      onPress={handleSelect}
      type="secondary"
      iconPosition="right"
      label={`${label} (${nodes.length})`}
      icon={<Icon name="table-large" />}
    />
  );
};

export default Preview;
