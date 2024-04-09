import {NodeDefs} from '@openforis/arena-core';
import {useCallback, useMemo} from 'react';
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
    ({
      node,
      label,
      requestConfirm = true,
      callback = handleClose,
      isImage = false,
    }) => {
      if (requestConfirm) {
        alert({
          title: t('Form:deleteNode.alert.title'),
          message: t(
            `Form:deleteNode.alert.message${isImage ? '_image' : ''}`,
            {
              name: label || node.uuid,
            },
          ),
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
    ({node, value = null, callback = handleClose, shouldJump = true}) => {
      dispatch(
        nodesActions.updateNode({
          updatedNode: {
            ...node,
            value,
          },
          callback,
          shouldJump,
        }),
      );
    },
    [dispatch, handleClose],
  );

  return handleUpdate;
};

export const useCleanNode = () => {
  const dispatch = useDispatch();

  const handleClean = useCallback(
    ({node, callback = false, shouldJump = false, value = false}) => {
      dispatch(
        nodesActions.updateNode({
          updatedNode: {
            ...node,
            value,
          },
          callback,
          shouldJump,
        }),
      );
    },
    [dispatch],
  );

  return handleClean;
};

const useNodeFormActions = ({nodeDef}) => {
  const dispatch = useDispatch();
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

  const handleClose = useCloseNode();

  const handleUpdate = useUpdateNode();
  const handleClean = useCleanNode();

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

  return {handleCreate, handleClose, handleUpdate, handleDelete, handleClean};
};

const DEFAULT_PARENT_NODE_DEF = false;
const DEFAULT_PARENT_NODE = false;

const useSelectNodeAndNodeDefKeyAttributes = ({
  node,
  nodeDef,
  parentNodeDef = DEFAULT_PARENT_NODE_DEF,
  parentNode = DEFAULT_PARENT_NODE,
}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const isRecordLocked = useSelector(formSelectors.isRecordLocked);

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  const _parentEntityNodeDef = useMemo(() => {
    return parentNodeDef || parentEntityNodeDef;
  }, [parentNodeDef, parentEntityNodeDef]);

  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const _parentEntityNode = useMemo(
    () => parentNode || parentEntityNode,
    [parentNode, parentEntityNode],
  );

  const keys = useSelector(state =>
    surveySelectors.getEntityNodeKeysAsString(state, _parentEntityNode),
  );

  const nodeDefName = useNodeDefNameOrLabel({
    nodeDef: _parentEntityNodeDef,
  });

  const handleCreateNewNodeEntity = useCallback(() => {
    if (!NodeDefs.isMultiple(_parentEntityNodeDef)) {
      return;
    }
    if (NodeDefs.isEnumerate(_parentEntityNodeDef)) {
      return;
    }

    dispatch(
      formActions.createEntity({
        nodeDef: _parentEntityNodeDef,
        node: _parentEntityNode,
      }),
    );
  }, [dispatch, _parentEntityNodeDef, _parentEntityNode]);

  const handleSelectNodeAndNodeDef = useCallback(() => {
    if (isRecordLocked) {
      return;
    }
    if (
      NodeDefs.isMultiple(_parentEntityNodeDef) &&
      nodeDef?.props?.key &&
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
        onDismiss: () => dispatch(formActions.setNode({node: node})),
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
    isRecordLocked,
  ]);

  return handleSelectNodeAndNodeDef;
};

const _useSelectNodeAndNodeDef = ({node}) => {
  const dispatch = useDispatch();

  const handleSelectNodeAndNodeDef = useCallback(() => {
    dispatch(formActions.setNode({node}));
  }, [dispatch, node]);

  return handleSelectNodeAndNodeDef;
};
export const useSelectNodeAndNodeDef = ({
  node,
  nodeDef,
  parentNodeDef,
  parentNode,
}) => {
  const _useSelectNodeAndNodeDefKeyAttributes =
    useSelectNodeAndNodeDefKeyAttributes({
      node,
      nodeDef,
      parentNodeDef,
      parentNode,
    });

  const __useSelectNodeAndNodeDef = _useSelectNodeAndNodeDef({
    node,
  });

  if (nodeDef?.props?.key) {
    return _useSelectNodeAndNodeDefKeyAttributes;
  }

  return __useSelectNodeAndNodeDef;
};

export default useNodeFormActions;
