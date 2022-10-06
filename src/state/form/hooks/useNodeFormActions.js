import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector, useDispatch} from 'react-redux';

import {alert} from 'arena-mobile-ui/utils';

import nodesActions from '../../nodes/actionCreators';
import formActions from '../actionCreators';
import formSelectors from '../selectors';

export const useCloseNode = () => {
  const dispatch = useDispatch();

  const handleClose = useCallback(() => {
    dispatch(formActions.setNode({node: false}));
  }, [dispatch]);

  return handleClose;
};

export const useDeleteNode = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const handleClose = useCloseNode();

  const handleDelete = useCallback(
    ({node, label, callback = handleClose}) => {
      alert({
        title: t('Form:deleteNode.alert.title'),
        message: t('Form:deleteNode.alert.message', {
          name: label ? label : node.uuid,
        }),
        acceptText: t('Form:deleteNode.alert.accept'),
        dismissText: t('Form:deleteNode.alert.dismiss'),
        onAccept: () => {
          dispatch(
            nodesActions.removeNode({
              node,
              callback,
            }),
          );
        },
        onDismiss: () => null,
      });
    },
    [t, dispatch, handleClose],
  );

  return handleDelete;
};

export const useUpdateNode = () => {
  const dispatch = useDispatch();

  const handleClose = useCloseNode();
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

  return handleUpdate;
};

const useNodeFormActions = ({nodeDef}) => {
  const dispatch = useDispatch();
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

  const handleClose = useCloseNode();

  const handleUpdate = useUpdateNode();

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

  const handleDelete = useDeleteNode();

  return {handleCreate, handleClose, handleUpdate, handleDelete};
};

export default useNodeFormActions;
