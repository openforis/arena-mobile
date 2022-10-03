import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector, useDispatch} from 'react-redux';

import {alert} from 'arena-mobile-ui/utils';

import nodesActions from '../../nodes/actionCreators';
import formActions from '../actionCreators';
import formSelectors from '../selectors';

const useNodeFormActions = ({nodeDef}) => {
  const {t} = useTranslation();
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

  return {handleCreate, handleClose, handleUpdate, handleDelete};
};

export default useNodeFormActions;
