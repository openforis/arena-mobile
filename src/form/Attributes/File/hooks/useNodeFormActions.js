import {useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {selectors as formSelectors, actions as formActions} from 'state/form';
import {actions as nodesActions} from 'state/nodes';

const useNodeFormActions = ({nodeDef}) => {
  const dispatch = useDispatch();
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

  const handleClose = useCallback(() => {
    dispatch(formActions.setNode({node: false}));
  }, [dispatch]);

  const handleUpdate = useCallback(
    ({node, value = null, callback = handleClose}) => {
      dispatch(
        nodesActions.updateNode({
          updatedNode: {
            ...node,
            value,
          },
          callback,
        }),
      );
    },
    [dispatch, handleClose],
  );

  const handleCreate = useCallback(
    ({value = null}) => {
      dispatch(
        nodesActions.createNodeWithValue({
          nodeDef,
          parentNode: parentEntityNode,
          value,
        }),
      );
    },
    [dispatch, nodeDef, parentEntityNode],
  );

  const handleDelete = useCallback(
    ({node, callback = handleClose}) => {
      dispatch(
        nodesActions.removeNode({
          node,
          callback,
        }),
      );
    },
    [dispatch, handleClose],
  );

  return {handleCreate, handleClose, handleUpdate, handleDelete};
};

export default useNodeFormActions;
