import {NodeDefs} from '@openforis/arena-core';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector, useDispatch} from 'react-redux';

import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {alert} from 'arena-mobile-ui/utils';
import {Objects} from 'infra/objectUtils';

import nodesActions from '../../nodes/actionCreators';
import surveySelectors from '../../survey/selectors';
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
    ({node, label, requestConfirm = true, callback = handleClose}) => {
      if (requestConfirm) {
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
      } else {
        dispatch(
          nodesActions.removeNode({
            node,
            callback,
          }),
        );
      }
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
    ({value = null, callback = null}) => {
      dispatch(
        nodesActions.createNodeWithValue({
          nodeDef,
          parentNode: parentEntityNode,
          value,
          callback,
        }),
      );
    },
    [dispatch, nodeDef, parentEntityNode],
  );

  const handleDelete = useDeleteNode();

  return {handleCreate, handleClose, handleUpdate, handleDelete};
};

export const useSelectNodeAndNodeDef = ({
  node,
  nodeDef,
  parentNodeDef = false,
  parentNode = false,
}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  const _parentEntityNodeDef = parentNodeDef || parentEntityNodeDef;

  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const _parentEntityNode = parentNode || parentEntityNode;

  const keys = useSelector(state =>
    surveySelectors.getEntityNodeKeysAsString(state, _parentEntityNode),
  );

  const nodeDefName = useNodeDefNameOrLabel({
    nodeDef: _parentEntityNodeDef,
  });

  const handleCreateNewNodeEntity = useCallback(() => {
    dispatch(
      formActions.createEntity({
        nodeDef: _parentEntityNodeDef,
        node: _parentEntityNode,
      }),
    );
  }, [dispatch, _parentEntityNodeDef, _parentEntityNode]);

  const handleSelectNodeAndNodeDef = useCallback(() => {
    if (
      NodeDefs.isMultiple(_parentEntityNodeDef) &&
      nodeDef.props.key &&
      !Objects.isEmpty(node.value)
    ) {
      alert({
        title: t('Form:avoidOverWrite.alert.title'),
        message: t('Form:avoidOverWrite.alert.message', {
          name: `${nodeDefName} [${keys}]`,
        }),
        acceptText: t('Form:avoidOverWrite.alert.accept'),
        dismissText: t('Form:avoidOverWrite.alert.dismiss'),
        onAccept: handleCreateNewNodeEntity,
        onDismiss: () => null,
      });
    } else {
      dispatch(formActions.setNode({node: node}));
    }
  }, [
    dispatch,
    node,
    _parentEntityNodeDef,
    nodeDef,
    t,
    nodeDefName,
    keys,
    handleCreateNewNodeEntity,
  ]);

  return handleSelectNodeAndNodeDef;
};

export default useNodeFormActions;
