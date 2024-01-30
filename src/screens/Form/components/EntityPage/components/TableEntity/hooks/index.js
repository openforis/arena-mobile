import {NodeDefs, NodeDefType} from '@openforis/arena-core';
import {useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';
import {Dimensions} from 'react-native';
import {selectors as appSelectors} from 'state/app';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

const onlyKeysFilter = nodeDef => NodeDefs.isKey(nodeDef) && !nodeDef?.analysis;
const baseFilter = nodeDef => !nodeDef?.analysis;
const {width: WIDTH} = Dimensions.get('window');

export const useEntityTableData = ({onlyKeys}) => {
  const baseModifier = useSelector(appSelectors.getBaseModifier);
  const fontBaseModifier = useSelector(appSelectors.getFontBaseModifier);

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  const cycle = useSelector(surveySelectors.getSurveyCycle);

  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, parentEntityNodeDef),
  );

  const formNodeDefs = useSelector(formSelectors.getFormAttributesNodeDefs);

  const headers = useMemo(() => {
    return formNodeDefs.filter(onlyKeys ? onlyKeysFilter : baseFilter);
  }, [formNodeDefs, onlyKeys]);

  const getWidth = useCallback(
    item => {
      if (headers.length <= 1) {
        return WIDTH;
      }
      let width =
        150 * Math.max(baseModifier, 1) * Math.max(fontBaseModifier, 1);
      if (item?.props?.layout) {
        width =
          Number(
            (
              NodeDefs.getLayoutProps(cycle)(item)?.columnWidth || '150'
            ).replace(/\D+/g, ''),
          ) * 1.25;
      }
      if (NodeDefs.getType(item) === NodeDefType.taxon) {
        width = width * 2;
      }

      return width;
    },
    [cycle, baseModifier, fontBaseModifier, headers],
  );

  return {headers, rows: nodes, getWidth};
};
