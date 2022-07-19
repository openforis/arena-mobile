import {useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {selectors as formSelectors, actions as formActions} from 'state/form';
import {actions as nodesActions} from 'state/nodes';
import surveySelectors from 'state/survey/selectors';

const useCodeActions = ({nodeDef}) => {
  const dispatch = useDispatch();
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
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
const getCategoryItemLabel = ({categoryItem, language}) =>
  `(${categoryItem.props.code}) ${categoryItem.props.labels[language]}`;

const useCode = ({nodeDef}) => {
  const codeActions = useCodeActions({nodeDef});
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);

  const categoryItems = useSelector(state =>
    surveySelectors.getCategoryItems(state, nodeDef.uuid),
  );

  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  return {language, nodes, categoryItems, codeActions, getCategoryItemLabel};
};
export default useCode;
